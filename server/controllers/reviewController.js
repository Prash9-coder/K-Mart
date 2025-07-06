const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const alreadyReviewed = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      status: { $in: ['delivered', 'completed'] }
    });

    if (!hasPurchased) {
      return res.status(400).json({ 
        message: 'You can only review products you have purchased' 
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
      isVerified: true // Since we verified purchase
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const rating = req.query.rating;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let reviews = product.reviews;

    // Filter by rating if specified
    if (rating) {
      reviews = reviews.filter(review => review.rating === parseInt(rating));
    }

    // Sort reviews
    reviews.sort((a, b) => {
      if (sortBy === 'rating') {
        return sortOrder === 1 ? a.rating - b.rating : b.rating - a.rating;
      } else if (sortBy === 'helpful') {
        return sortOrder === 1 ? a.helpfulCount - b.helpfulCount : b.helpfulCount - a.helpfulCount;
      } else {
        return sortOrder === 1 ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    // Calculate rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(review => review.rating === rating).length
    }));

    res.json({
      reviews: paginatedReviews,
      totalReviews: reviews.length,
      page,
      pages: Math.ceil(reviews.length / limit),
      averageRating: product.rating,
      ratingDistribution
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const product = await Product.findOne({ 'reviews._id': reviewId });
    
    if (!product) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = product.reviews.id(reviewId);
    
    res.json({
      review,
      product: {
        _id: product._id,
        name: product.name,
        images: product.images
      }
    });
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const reviewId = req.params.id;

    const product = await Product.findOne({ 'reviews._id': reviewId });

    if (!product) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = product.reviews.id(reviewId);

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = Number(rating);
    review.comment = comment.trim();

    await product.save();

    res.json({ message: 'Review updated successfully', review });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const product = await Product.findOne({ 'reviews._id': reviewId });

    if (!product) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = product.reviews.id(reviewId);

    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    product.reviews.pull(reviewId);
    await product.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Report review
// @route   POST /api/reviews/:id/report
// @access  Private
const reportReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { reason } = req.body;

    const product = await Product.findOne({ 'reviews._id': reviewId });

    if (!product) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = product.reviews.id(reviewId);

    if (review.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot report your own review' });
    }

    review.reportedCount += 1;
    await product.save();

    // Here you could implement additional logic to handle reported reviews
    // For example, hide reviews with too many reports, notify admins, etc.

    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
const markReviewHelpful = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const product = await Product.findOne({ 'reviews._id': reviewId });

    if (!product) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = product.reviews.id(reviewId);

    if (review.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot mark your own review as helpful' });
    }

    review.helpfulCount += 1;
    await product.save();

    res.json({ message: 'Review marked as helpful', helpfulCount: review.helpfulCount });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createProductReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getReviewById,
  reportReview,
  markReviewHelpful
};