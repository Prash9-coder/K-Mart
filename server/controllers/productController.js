import asyncHandler from 'express-async-handler';
import { Product } from '../models/index.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;
  const category = req.query.category || '';
  const minPrice = Number(req.query.minPrice) || 0;
  const maxPrice = Number(req.query.maxPrice) || 999999;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(req.query.keyword, 'i')] } }
        ]
      }
    : {};

  const categoryFilter = category ? { category } : {};
  const priceFilter = { price: { $gte: minPrice, $lte: maxPrice } };

  const filters = {
    ...keyword,
    ...categoryFilter,
    ...priceFilter,
    isActive: true
  };

  const count = await Product.countDocuments(filters);
  const products = await Product.find(filters)
    .sort({ [sortBy]: sortOrder })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count,
    hasMore: page < Math.ceil(count / pageSize)
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name');

  if (product) {
    // Increment view count
    product.views += 1;
    await product.save();
    
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample Product',
    description: 'Sample Description',
    price: 0,
    category: 'groceries',
    countInStock: 0,
    sku: `SKU-${Date.now()}`,
    images: [{ url: '/images/sample.jpg' }],
    user: req.user._id,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    countInStock,
    images,
    brand,
    unit,
    weight,
    dimensions,
    tags,
    discount,
    isFeatured,
    isOrganic,
    minStockLevel,
    maxStockLevel
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.images = images || product.images;
    product.brand = brand || product.brand;
    product.unit = unit || product.unit;
    product.weight = weight || product.weight;
    product.dimensions = dimensions || product.dimensions;
    product.tags = tags || product.tags;
    product.discount = discount || product.discount;
    product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.isOrganic = isOrganic !== undefined ? isOrganic : product.isOrganic;
    product.minStockLevel = minStockLevel || product.minStockLevel;
    product.maxStockLevel = maxStockLevel || product.maxStockLevel;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.updateRating();

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .sort({ rating: -1 })
    .limit(5);

  res.json(products);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ 
    isActive: true, 
    isFeatured: true 
  }).limit(8);

  res.json(products);
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Product.countDocuments({ 
    category, 
    isActive: true 
  });

  const products = await Product.find({ 
    category, 
    isActive: true 
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count
  });
});

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private/Admin
const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ['$countInStock', '$minStockLevel'] }
  });

  res.json(products);
});

export { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  createProductReview, 
  getTopProducts, 
  getFeaturedProducts, 
  getProductsByCategory, 
  getLowStockProducts 
};