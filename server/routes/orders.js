const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  cancelOrder,
  requestReturn,
  updateOrderStatus,
  getOrderStats
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, createOrder);

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, getMyOrders);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, getOrderById);

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, updateOrderToPaid);

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, cancelOrder);

// @desc    Request return
// @route   PUT /api/orders/:id/return
// @access  Private
router.put('/:id/return', protect, requestReturn);

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, getOrders);

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, updateOrderStatus);

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
router.get('/stats', protect, admin, getOrderStats);

module.exports = router;