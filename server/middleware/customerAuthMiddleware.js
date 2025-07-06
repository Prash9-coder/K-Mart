import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Customer from '../models/Customer.js';

// Protect customer routes
const protectCustomer = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token is for customer
      if (decoded.userType !== 'customer') {
        res.status(401);
        throw new Error('Not authorized as customer');
      }

      const customer = await Customer.findById(decoded.id).select('-password');

      if (!customer) {
        res.status(401);
        throw new Error('Customer not found');
      }

      if (!customer.isActive) {
        res.status(401);
        throw new Error('Customer account is deactivated');
      }

      // Update last activity
      customer.lastActivity = new Date();
      await customer.save();

      req.user = customer;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Check customer type
const checkCustomerType = (types) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const allowedTypes = Array.isArray(types) ? types : [types];

    if (!allowedTypes.includes(req.user.customerType)) {
      res.status(403);
      throw new Error(`Access denied. Required customer type: ${allowedTypes.join(' or ')}`);
    }

    next();
  });
};

// Check if customer is verified
const requireVerification = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (!req.user.isVerified) {
    res.status(403);
    throw new Error('Account verification required. Please verify your account to continue.');
  }

  next();
});

// Check credit account status
const requireActiveCreditAccount = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (!req.user.creditAccount.isActive) {
    res.status(403);
    throw new Error('Credit account is not active. Please contact support.');
  }

  next();
});

// Premium customer only
const premiumCustomerOnly = checkCustomerType(['premium', 'vip']);

// Wholesale customer only
const wholesaleCustomerOnly = checkCustomerType(['wholesale', 'vip']);

// VIP customer only
const vipCustomerOnly = checkCustomerType('vip');

export {
  protectCustomer,
  checkCustomerType,
  requireVerification,
  requireActiveCreditAccount,
  premiumCustomerOnly,
  wholesaleCustomerOnly,
  vipCustomerOnly
};