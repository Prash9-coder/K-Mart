import asyncHandler from 'express-async-handler';
import { Order, Product, User, Coupon } from '../models/index.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    couponCode
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Validate product availability and prices
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.name}`);
    }
    if (product.countInStock < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${item.name}`);
    }
  }

  // Apply coupon if provided
  let discountAmount = 0;
  let validCoupon = null;
  
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon && coupon.isValid() && coupon.canUserUse(req.user._id)) {
      discountAmount = coupon.calculateDiscount(itemsPrice, orderItems);
      validCoupon = coupon;
    }
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount,
    couponCode: validCoupon ? validCoupon.code : null,
    totalPrice: totalPrice - discountAmount,
  });

  // Calculate estimated delivery
  order.calculateEstimatedDelivery();

  const createdOrder = await order.save();

  // Update product stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    product.countInStock -= item.quantity;
    product.salesCount += item.quantity;
    await product.save();
  }

  // Mark coupon as used
  if (validCoupon) {
    validCoupon.markAsUsed(req.user._id, itemsPrice, discountAmount);
    await validCoupon.save();
  }

  res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  if (order) {
    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Access denied');
    }
    
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.update_time,
      emailAddress: req.body.payer.email_address,
    };

    // Update order status
    order.orderStatus = 'confirmed';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.actualDeliveryDate = Date.now();
    order.orderStatus = 'delivered';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('orderItems.product', 'name images')
    .sort({ createdAt: -1 });
  
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20;
  const page = Number(req.query.pageNumber) || 1;
  const status = req.query.status || '';

  const statusFilter = status ? { orderStatus: status } : {};

  const count = await Order.countDocuments(statusFilter);
  const orders = await Order.find(statusFilter)
    .populate('user', 'id name email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    totalOrders: count
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    
    if (note) {
      order.statusHistory.push({
        status,
        date: new Date(),
        note
      });
    }

    // Handle status-specific updates
    if (status === 'shipped' && req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
      order.deliveryPartner = req.body.deliveryPartner;
    }

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.actualDeliveryDate = Date.now();
    }

    if (status === 'cancelled') {
      // Restore product stock
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.countInStock += item.quantity;
          product.salesCount -= item.quantity;
          await product.save();
        }
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Access denied');
    }

    if (!order.canBeCancelled()) {
      res.status(400);
      throw new Error('Order cannot be cancelled');
    }

    order.orderStatus = 'cancelled';
    order.notes = req.body.reason || 'Cancelled by user';

    // Restore product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock += item.quantity;
        product.salesCount -= item.quantity;
        await product.save();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Request return
// @route   PUT /api/orders/:id/return
// @access  Private
const requestReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied');
    }

    if (!order.canBeReturned()) {
      res.status(400);
      throw new Error('Order cannot be returned');
    }

    order.returnStatus = 'requested';
    order.returnReason = req.body.reason;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ]);

  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  const monthlyStats = await Order.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        orderCount: { $sum: 1 },
        revenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    ordersByStatus,
    recentOrders,
    monthlyStats
  });
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  requestReturn,
  getOrderStats
};