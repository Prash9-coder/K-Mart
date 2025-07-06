import asyncHandler from 'express-async-handler';
import { Coupon } from '../models/index.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Coupon.countDocuments();
  const coupons = await Coupon.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    coupons,
    page,
    pages: Math.ceil(count / pageSize),
    totalCoupons: count
  });
});

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('applicableProducts', 'name price')
    .populate('excludedProducts', 'name price');

  if (coupon) {
    res.json(coupon);
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    userUsageLimit,
    applicableCategories,
    excludedCategories,
    applicableProducts,
    excludedProducts,
    startDate,
    endDate,
    terms
  } = req.body;

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = new Coupon({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    userUsageLimit,
    applicableCategories,
    excludedCategories,
    applicableProducts,
    excludedProducts,
    startDate,
    endDate,
    terms,
    createdBy: req.user._id
  });

  const createdCoupon = await coupon.save();
  res.status(201).json(createdCoupon);
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      userUsageLimit,
      applicableCategories,
      excludedCategories,
      applicableProducts,
      excludedProducts,
      startDate,
      endDate,
      isActive,
      terms
    } = req.body;

    // Check if new code already exists (if code is being changed)
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        res.status(400);
        throw new Error('Coupon code already exists');
      }
    }

    coupon.code = code ? code.toUpperCase() : coupon.code;
    coupon.description = description || coupon.description;
    coupon.discountType = discountType || coupon.discountType;
    coupon.discountValue = discountValue !== undefined ? discountValue : coupon.discountValue;
    coupon.minOrderAmount = minOrderAmount !== undefined ? minOrderAmount : coupon.minOrderAmount;
    coupon.maxDiscountAmount = maxDiscountAmount !== undefined ? maxDiscountAmount : coupon.maxDiscountAmount;
    coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;
    coupon.userUsageLimit = userUsageLimit !== undefined ? userUsageLimit : coupon.userUsageLimit;
    coupon.applicableCategories = applicableCategories || coupon.applicableCategories;
    coupon.excludedCategories = excludedCategories || coupon.excludedCategories;
    coupon.applicableProducts = applicableProducts || coupon.applicableProducts;
    coupon.excludedProducts = excludedProducts || coupon.excludedProducts;
    coupon.startDate = startDate || coupon.startDate;
    coupon.endDate = endDate || coupon.endDate;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;
    coupon.terms = terms || coupon.terms;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon removed' });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount, orderItems } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isValid()) {
    res.status(400);
    throw new Error('Coupon has expired or is not active');
  }

  if (!coupon.canUserUse(req.user._id)) {
    res.status(400);
    throw new Error('You have already used this coupon maximum times');
  }

  if (orderAmount < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`);
  }

  const discountAmount = coupon.calculateDiscount(orderAmount, orderItems);

  if (discountAmount === 0) {
    res.status(400);
    throw new Error('This coupon is not applicable to your order');
  }

  res.json({
    valid: true,
    discountAmount,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount
    }
  });
});

// @desc    Get active coupons for user
// @route   GET /api/coupons/active
// @access  Private
const getActiveCoupons = asyncHandler(async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
    ]
  }).select('code description discountType discountValue minOrderAmount maxDiscountAmount terms');

  // Filter out coupons that user has already used maximum times
  const availableCoupons = coupons.filter(coupon => coupon.canUserUse(req.user._id));

  res.json(availableCoupons);
});

// @desc    Get coupon usage statistics
// @route   GET /api/coupons/stats
// @access  Private/Admin
const getCouponStats = asyncHandler(async (req, res) => {
  const totalCoupons = await Coupon.countDocuments();
  const activeCoupons = await Coupon.countDocuments({ isActive: true });
  const expiredCoupons = await Coupon.countDocuments({ endDate: { $lt: new Date() } });

  const usageStats = await Coupon.aggregate([
    {
      $group: {
        _id: null,
        totalUsage: { $sum: '$usageCount' },
        totalDiscount: { $sum: { $sum: '$usedBy.discountAmount' } }
      }
    }
  ]);

  const topCoupons = await Coupon.find()
    .sort({ usageCount: -1 })
    .limit(5)
    .select('code description usageCount');

  res.json({
    totalCoupons,
    activeCoupons,
    expiredCoupons,
    totalUsage: usageStats[0]?.totalUsage || 0,
    totalDiscount: usageStats[0]?.totalDiscount || 0,
    topCoupons
  });
});

export {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
  getCouponStats
};