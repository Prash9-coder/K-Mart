const express = require('express');
const router = express.Router();
const {
  createProductReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getReviewById,
  reportReview,
  markReviewHelpful
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, createProductReview);

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
router.get('/:id/reviews', getProductReviews);

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
router.get('/:id', getReviewById);

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, updateReview);

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, deleteReview);

// @desc    Report review
// @route   POST /api/reviews/:id/report
// @access  Private
router.post('/:id/report', protect, reportReview);

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
router.post('/:id/helpful', protect, markReviewHelpful);

module.exports = router;