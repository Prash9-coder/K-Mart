const {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getPaymentDetails,
  refundPayment,
  processPayment,
  calculatePaymentFees,
  generatePaymentLink
} = require('../utils/payment');
const Order = require('../models/Order');

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Order ID, amount, and payment method are required' 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Calculate payment fees
    const fees = calculatePaymentFees(amount, paymentMethod);
    
    const paymentData = {
      paymentMethod,
      orderData: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: amount + fees // Include fees in total amount
      },
      additionalInfo: req.body.additionalInfo || {}
    };

    const result = await processPayment(paymentData);

    if (result.success) {
      res.json({
        success: true,
        ...result,
        fees,
        totalAmount: amount + fees
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Payment processing failed'
      });
    }
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId 
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({ 
        message: 'Missing required payment verification data' 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Get payment details from Razorpay
    const paymentResult = await getPaymentDetails(razorpayPaymentId);
    
    if (!paymentResult.success) {
      return res.status(400).json({ message: 'Failed to verify payment details' });
    }

    // Update order with payment details
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: razorpayPaymentId,
      status: paymentResult.payment.status,
      updateTime: new Date().toISOString(),
      emailAddress: paymentResult.payment.email || req.user.email,
      paymentMethod: paymentResult.payment.method,
      transactionId: razorpayPaymentId,
      amount: paymentResult.payment.amount / 100, // Convert from paise
      currency: paymentResult.payment.currency
    };

    // Update order status to confirmed
    await order.updateStatus('confirmed', 'Payment confirmed');

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order,
      payment: paymentResult.payment
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Handle payment failure
// @route   POST /api/payments/failure
// @access  Private
const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, reason, paymentId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Log payment failure
    order.paymentResult = {
      id: paymentId || 'failed',
      status: 'failed',
      updateTime: new Date().toISOString(),
      emailAddress: req.user.email,
      failureReason: reason
    };

    await order.save();

    res.json({
      success: true,
      message: 'Payment failure recorded',
      order
    });
  } catch (error) {
    console.error('Handle payment failure error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private/Admin
const processRefund = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.isPaid) {
      return res.status(400).json({ message: 'Order is not paid' });
    }

    if (!order.paymentResult?.id) {
      return res.status(400).json({ message: 'No payment ID found for refund' });
    }

    // Process refund through payment gateway
    const refundResult = await refundPayment(
      order.paymentResult.id,
      amount,
      'normal'
    );

    if (!refundResult.success) {
      return res.status(400).json({ 
        message: 'Refund processing failed',
        error: refundResult.error 
      });
    }

    // Update order with refund details
    order.refundAmount = amount || order.totalPrice;
    order.refundStatus = 'processed';
    order.refundDate = new Date();
    
    await order.updateStatus('returned', `Refund processed: ${reason}`);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: refundResult.refund,
      order
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Public
const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when your order is delivered',
        fees: 25,
        icon: '💵',
        enabled: true
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay using UPI apps like GPay, PhonePe, Paytm',
        fees: 0,
        icon: '📱',
        enabled: true
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay securely using your card',
        fees: 'Starting from ₹5',
        icon: '💳',
        enabled: true
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'Pay using your bank account',
        fees: 'Starting from ₹3',
        icon: '🏦',
        enabled: true
      },
      {
        id: 'wallet',
        name: 'Digital Wallets',
        description: 'Pay using Paytm, PhonePe, Amazon Pay',
        fees: 0,
        icon: '👛',
        enabled: true
      }
    ];

    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Calculate payment fees
// @route   POST /api/payments/calculate-fees
// @access  Public
const calculateFees = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Amount and payment method are required' 
      });
    }

    const fees = calculatePaymentFees(amount, paymentMethod);
    const totalAmount = amount + fees;

    res.json({
      success: true,
      amount,
      fees,
      totalAmount,
      paymentMethod
    });
  } catch (error) {
    console.error('Calculate fees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate payment link
// @route   POST /api/payments/generate-link
// @access  Private
const generatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    const orderData = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: order.totalPrice
    };

    const customerInfo = {
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone || order.shippingAddress.phone
    };

    const result = await generatePaymentLink(orderData, customerInfo);

    if (result.success) {
      res.json({
        success: true,
        paymentLink: result.paymentLink,
        message: 'Payment link generated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to generate payment link'
      });
    }
  } catch (error) {
    console.error('Generate payment link error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Admin
const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Payment method distribution
    const paymentMethodStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          isPaid: true
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' },
          averageAmount: { $avg: '$totalPrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Payment status overview
    const paymentStatusStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$isPaid',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Daily payment trends
    const dailyPaymentTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          isPaid: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      paymentMethodStats,
      paymentStatusStats,
      dailyPaymentTrends,
      period: { startDate: start, endDate: end }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  processRefund,
  getPaymentMethods,
  calculateFees,
  generatePayment,
  getPaymentStats
};