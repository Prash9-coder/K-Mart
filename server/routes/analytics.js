const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesReport,
  getProductStats,
  getUserStats,
  getInventoryReport,
  getRevenueChart,
  getTopSellingProducts,
  getCategoryStats,
  getCustomerInsights
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/auth');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, admin, getDashboardStats);

// @desc    Get sales report
// @route   GET /api/analytics/sales
// @access  Private/Admin
router.get('/sales', protect, admin, getSalesReport);

// @desc    Get product statistics
// @route   GET /api/analytics/products
// @access  Private/Admin
router.get('/products', protect, admin, getProductStats);

// @desc    Get user statistics
// @route   GET /api/analytics/users
// @access  Private/Admin
router.get('/users', protect, admin, getUserStats);

// @desc    Get inventory report
// @route   GET /api/analytics/inventory
// @access  Private/Admin
router.get('/inventory', protect, admin, getInventoryReport);

// @desc    Get revenue chart data
// @route   GET /api/analytics/revenue-chart
// @access  Private/Admin
router.get('/revenue-chart', protect, admin, getRevenueChart);

// @desc    Get top selling products
// @route   GET /api/analytics/top-products
// @access  Private/Admin
router.get('/top-products', protect, admin, getTopSellingProducts);

// @desc    Get category statistics
// @route   GET /api/analytics/categories
// @access  Private/Admin
router.get('/categories', protect, admin, getCategoryStats);

// @desc    Get customer insights
// @route   GET /api/analytics/customers
// @access  Private/Admin
router.get('/customers', protect, admin, getCustomerInsights);

module.exports = router;