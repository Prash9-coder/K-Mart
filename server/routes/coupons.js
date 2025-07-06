const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
  getCouponStats
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/auth');

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
router.post('/', protect, admin, createCoupon);

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
router.get('/', protect, admin, getCoupons);

// @desc    Get active coupons
// @route   GET /api/coupons/active
// @access  Private
router.get('/active', protect, getActiveCoupons);

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
router.post('/validate', protect, validateCoupon);

// @desc    Get coupon statistics
// @route   GET /api/coupons/stats
// @access  Private/Admin
router.get('/stats', protect, admin, getCouponStats);

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
router.get('/:id', protect, admin, getCouponById);

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateCoupon);

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;