import asyncHandler from 'express-async-handler';
import Customer from '../models/Customer.js';
import CreditTransaction from '../models/CreditTransaction.js';
import Order from '../models/Order.js';

// @desc    Get all customers with credit accounts
// @route   GET /api/credit/customers
// @access  Private (Admin)
const getCreditCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  
  if (req.query.isActive !== undefined) {
    filter['creditAccount.isActive'] = req.query.isActive === 'true';
  }
  
  if (req.query.hasBalance === 'true') {
    filter['creditAccount.currentBalance'] = { $gt: 0 };
  }

  const customers = await Customer.find(filter)
    .select('name email phone creditAccount analytics customerType')
    .sort({ 'creditAccount.currentBalance': -1 })
    .skip(skip)
    .limit(limit);

  const total = await Customer.countDocuments(filter);

  // Get summary statistics
  const stats = await Customer.aggregate([
    {
      $match: { 'creditAccount.isActive': true }
    },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        totalCreditLimit: { $sum: '$creditAccount.creditLimit' },
        totalOutstanding: { $sum: '$creditAccount.currentBalance' },
        averageCreditScore: { $avg: '$creditAccount.creditScore' }
      }
    }
  ]);

  res.json({
    customers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    stats: stats[0] || {
      totalCustomers: 0,
      totalCreditLimit: 0,
      totalOutstanding: 0,
      averageCreditScore: 0
    }
  });
});

// @desc    Get customer credit details
// @route   GET /api/credit/customer/:customerId
// @access  Private (Admin)
const getCustomerCreditDetails = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.customerId)
    .select('name email phone creditAccount analytics');

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  // Get recent credit transactions
  const transactions = await CreditTransaction.find({ customer: req.params.customerId })
    .populate('processedBy', 'name')
    .populate('order', 'orderNumber totalPrice')
    .sort({ createdAt: -1 })
    .limit(20);

  // Get pending payments
  const pendingPayments = await CreditTransaction.find({
    customer: req.params.customerId,
    type: 'credit_used',
    status: 'pending'
  }).sort({ dueDate: 1 });

  res.json({
    customer,
    transactions,
    pendingPayments
  });
});

// @desc    Approve credit account
// @route   PUT /api/credit/customer/:customerId/approve
// @access  Private (Admin)
const approveCreditAccount = asyncHandler(async (req, res) => {
  const { creditLimit } = req.body;

  if (!creditLimit || creditLimit <= 0) {
    res.status(400);
    throw new Error('Valid credit limit is required');
  }

  const customer = await Customer.findById(req.params.customerId);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  customer.creditAccount.isActive = true;
  customer.creditAccount.creditLimit = creditLimit;
  customer.creditAccount.approvedBy = req.user._id;
  customer.creditAccount.approvedAt = new Date();

  await customer.save();

  // Create transaction record
  await CreditTransaction.create({
    customer: customer._id,
    type: 'credit_adjustment',
    amount: 0,
    description: `Credit account approved with limit ₹${creditLimit}`,
    balanceBefore: 0,
    balanceAfter: 0,
    processedBy: req.user._id
  });

  res.json({ message: 'Credit account approved successfully' });
});

// @desc    Update credit limit
// @route   PUT /api/credit/customer/:customerId/limit
// @access  Private (Admin)
const updateCreditLimit = asyncHandler(async (req, res) => {
  const { creditLimit } = req.body;

  if (!creditLimit || creditLimit < 0) {
    res.status(400);
    throw new Error('Valid credit limit is required');
  }

  const customer = await Customer.findById(req.params.customerId);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const oldLimit = customer.creditAccount.creditLimit;
  customer.creditAccount.creditLimit = creditLimit;

  await customer.save();

  // Create transaction record
  await CreditTransaction.create({
    customer: customer._id,
    type: 'credit_adjustment',
    amount: 0,
    description: `Credit limit updated from ₹${oldLimit} to ₹${creditLimit}`,
    balanceBefore: customer.creditAccount.currentBalance,
    balanceAfter: customer.creditAccount.currentBalance,
    processedBy: req.user._id
  });

  res.json({ message: 'Credit limit updated successfully' });
});

// @desc    Record payment
// @route   POST /api/credit/customer/:customerId/payment
// @access  Private (Admin)
const recordPayment = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, paymentReference, notes } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Valid payment amount is required');
  }

  if (!paymentMethod) {
    res.status(400);
    throw new Error('Payment method is required');
  }

  const customer = await Customer.findById(req.params.customerId);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  if (!customer.creditAccount.isActive) {
    res.status(400);
    throw new Error('Credit account is not active');
  }

  const balanceBefore = customer.creditAccount.currentBalance;
  const paymentAmount = Math.min(amount, balanceBefore); // Can't pay more than owed

  // Update customer balance
  customer.updateCreditBalance(-paymentAmount);

  // Update credit score based on payment
  if (customer.creditAccount.creditScore < 100) {
    customer.creditAccount.creditScore = Math.min(100, customer.creditAccount.creditScore + 2);
  }

  await customer.save();

  // Create transaction record
  const transaction = await CreditTransaction.create({
    customer: customer._id,
    type: 'payment_received',
    amount: paymentAmount,
    description: `Payment received via ${paymentMethod}`,
    balanceBefore,
    balanceAfter: customer.creditAccount.currentBalance,
    paymentMethod,
    paymentReference,
    paidDate: new Date(),
    processedBy: req.user._id,
    notes
  });

  res.json({
    message: 'Payment recorded successfully',
    transaction,
    newBalance: customer.creditAccount.currentBalance
  });
});

// @desc    Add credit adjustment
// @route   POST /api/credit/customer/:customerId/adjustment
// @access  Private (Admin)
const addCreditAdjustment = asyncHandler(async (req, res) => {
  const { amount, reason, type } = req.body;

  if (!amount || amount === 0) {
    res.status(400);
    throw new Error('Valid adjustment amount is required');
  }

  if (!reason) {
    res.status(400);
    throw new Error('Reason for adjustment is required');
  }

  const customer = await Customer.findById(req.params.customerId);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const balanceBefore = customer.creditAccount.currentBalance;
  
  // Update customer balance
  customer.updateCreditBalance(amount);

  // Adjust credit score if negative adjustment
  if (amount > 0 && customer.creditAccount.creditScore > 0) {
    customer.creditAccount.creditScore = Math.max(0, customer.creditAccount.creditScore - 5);
  }

  await customer.save();

  // Create transaction record
  const transaction = await CreditTransaction.create({
    customer: customer._id,
    type: type || 'credit_adjustment',
    amount: Math.abs(amount),
    description: reason,
    balanceBefore,
    balanceAfter: customer.creditAccount.currentBalance,
    processedBy: req.user._id
  });

  res.json({
    message: 'Credit adjustment added successfully',
    transaction,
    newBalance: customer.creditAccount.currentBalance
  });
});

// @desc    Get credit transactions
// @route   GET /api/credit/transactions
// @access  Private (Admin)
const getCreditTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  
  if (req.query.customerId) {
    filter.customer = req.query.customerId;
  }
  
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const transactions = await CreditTransaction.find(filter)
    .populate('customer', 'name email phone')
    .populate('processedBy', 'name')
    .populate('order', 'orderNumber totalPrice')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await CreditTransaction.countDocuments(filter);

  res.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get credit analytics
// @route   GET /api/credit/analytics
// @access  Private (Admin)
const getCreditAnalytics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Overall credit statistics
  const overallStats = await Customer.aggregate([
    {
      $match: { 'creditAccount.isActive': true }
    },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        totalCreditLimit: { $sum: '$creditAccount.creditLimit' },
        totalOutstanding: { $sum: '$creditAccount.currentBalance' },
        averageCreditScore: { $avg: '$creditAccount.creditScore' },
        utilizationRate: {
          $avg: {
            $divide: ['$creditAccount.currentBalance', '$creditAccount.creditLimit']
          }
        }
      }
    }
  ]);

  // Payment trends
  const paymentTrends = await CreditTransaction.aggregate([
    {
      $match: {
        type: 'payment_received',
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        totalPayments: { $sum: '$amount' },
        paymentCount: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Top customers by outstanding balance
  const topOutstandingCustomers = await Customer.find({
    'creditAccount.isActive': true,
    'creditAccount.currentBalance': { $gt: 0 }
  })
    .select('name email phone creditAccount')
    .sort({ 'creditAccount.currentBalance': -1 })
    .limit(10);

  // Credit score distribution
  const creditScoreDistribution = await Customer.aggregate([
    {
      $match: { 'creditAccount.isActive': true }
    },
    {
      $bucket: {
        groupBy: '$creditAccount.creditScore',
        boundaries: [0, 25, 50, 75, 90, 100],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          averageBalance: { $avg: '$creditAccount.currentBalance' }
        }
      }
    }
  ]);

  res.json({
    overallStats: overallStats[0] || {},
    paymentTrends,
    topOutstandingCustomers,
    creditScoreDistribution
  });
});

// @desc    Deactivate credit account
// @route   PUT /api/credit/customer/:customerId/deactivate
// @access  Private (Admin)
const deactivateCreditAccount = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const customer = await Customer.findById(req.params.customerId);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  if (customer.creditAccount.currentBalance > 0) {
    res.status(400);
    throw new Error('Cannot deactivate account with outstanding balance');
  }

  customer.creditAccount.isActive = false;
  await customer.save();

  // Create transaction record
  await CreditTransaction.create({
    customer: customer._id,
    type: 'credit_adjustment',
    amount: 0,
    description: `Credit account deactivated. Reason: ${reason || 'Not specified'}`,
    balanceBefore: 0,
    balanceAfter: 0,
    processedBy: req.user._id
  });

  res.json({ message: 'Credit account deactivated successfully' });
});

// CUSTOMER ROUTES

// @desc    Get customer's own credit details
// @route   GET /api/credit/my-account
// @access  Private (Customer)
const getMyCredits = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user._id)
    .select('creditAccount');

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  // Get recent transactions
  const transactions = await CreditTransaction.find({ customer: req.user._id })
    .populate('order', 'orderNumber totalPrice createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    creditAccount: customer.creditAccount,
    recentTransactions: transactions
  });
});

export {
  getCreditCustomers,
  getCustomerCreditDetails,
  approveCreditAccount,
  updateCreditLimit,
  recordPayment,
  addCreditAdjustment,
  getCreditTransactions,
  getCreditAnalytics,
  deactivateCreditAccount,
  getMyCredits
};