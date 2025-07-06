const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total counts
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Today's stats
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const todayRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfToday },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // This week's stats
    const weekOrders = await Order.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    const weekRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfWeek },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // This month's stats
    const monthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const monthRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfMonth },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Order status distribution
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$countInStock', '$lowStockThreshold'] },
      isActive: true
    }).limit(10);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.json({
      totals: {
        orders: totalOrders,
        products: totalProducts,
        users: totalUsers,
        revenue: totalRevenue[0]?.total || 0
      },
      today: {
        orders: todayOrders,
        revenue: todayRevenue[0]?.total || 0
      },
      week: {
        orders: weekOrders,
        revenue: weekRevenue[0]?.total || 0
      },
      month: {
        orders: monthOrders,
        revenue: monthRevenue[0]?.total || 0
      },
      orderStatusStats,
      lowStockProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get sales report
// @route   GET /api/analytics/sales
// @access  Private/Admin
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'day':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        groupFormat = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: groupFormat,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' },
          totalItems: { $sum: { $sum: '$orderItems.quantity' } }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Overall summary
    const summary = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' },
          totalItems: { $sum: { $sum: '$orderItems.quantity' } }
        }
      }
    ]);

    res.json({
      summary: summary[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalItems: 0
      },
      salesData,
      period: { startDate: start, endDate: end, groupBy }
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get product statistics
// @route   GET /api/analytics/products
// @access  Private/Admin
const getProductStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Total product counts
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const outOfStockProducts = await Product.countDocuments({ countInStock: 0 });
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$countInStock', '$lowStockThreshold'] }
    });

    // Top selling products in the period
    const topSellingProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          totalQuantity: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } },
          averagePrice: { $avg: '$orderItems.price' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // Category performance
    const categoryStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalQuantity: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } },
          uniqueProducts: { $addToSet: '$orderItems.product' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalQuantity: 1,
          totalRevenue: 1,
          uniqueProductCount: { $size: '$uniqueProducts' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Products with highest ratings
    const topRatedProducts = await Product.find({ rating: { $gt: 0 } })
      .sort({ rating: -1, numReviews: -1 })
      .limit(10)
      .select('name rating numReviews images price');

    res.json({
      overview: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        lowStockProducts
      },
      topSellingProducts,
      categoryStats,
      topRatedProducts,
      period: { startDate: start, endDate: end }
    });
  } catch (error) {
    console.error('Product stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user statistics
// @route   GET /api/analytics/users
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Total users
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    // User registration trend
    const userRegistrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Top customers by orders
    const topCustomersByOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: 1
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 }
    ]);

    // Top customers by revenue
    const topCustomersByRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: {
        totalUsers,
        newUsers
      },
      userRegistrationTrend,
      topCustomersByOrders,
      topCustomersByRevenue,
      period: { startDate: start, endDate: end }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get inventory report
// @route   GET /api/analytics/inventory
// @access  Private/Admin
const getInventoryReport = async (req, res) => {
  try {
    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$countInStock', '$lowStockThreshold'] },
      isActive: true
    }).select('name sku countInStock lowStockThreshold category price');

    // Out of stock products
    const outOfStockProducts = await Product.find({
      countInStock: 0,
      isActive: true
    }).select('name sku category price');

    // Overstocked products (high stock with low sales)
    const overstockedProducts = await Product.find({
      countInStock: { $gt: 100 },
      totalSales: { $lt: 10 },
      isActive: true
    }).select('name sku countInStock totalSales category price');

    // Category inventory summary
    const categoryInventory = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$countInStock' },
          averageStock: { $avg: '$countInStock' },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$countInStock', '$lowStockThreshold'] }, 1, 0]
            }
          },
          outOfStockCount: {
            $sum: {
              $cond: [{ $eq: ['$countInStock', 0] }, 1, 0]
            }
          }
        }
      },
      { $sort: { totalStock: -1 } }
    ]);

    // Inventory value by category
    const inventoryValue = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalValue: { $sum: { $multiply: ['$countInStock', '$price'] } },
          totalProducts: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    res.json({
      lowStockProducts,
      outOfStockProducts,
      overstockedProducts,
      categoryInventory,
      inventoryValue,
      summary: {
        totalLowStock: lowStockProducts.length,
        totalOutOfStock: outOfStockProducts.length,
        totalOverstocked: overstockedProducts.length
      }
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get revenue chart data
// @route   GET /api/analytics/revenue-chart
// @access  Private/Admin
const getRevenueChart = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let matchCondition, groupBy;
    const now = new Date();
    
    switch (period) {
      case 'week':
        matchCondition = {
          createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        };
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'year':
        matchCondition = {
          createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) }
        };
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default: // month
        matchCondition = {
          createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        };
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          ...matchCondition,
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      period,
      data: revenueData
    });
  } catch (error) {
    console.error('Revenue chart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get top selling products
// @route   GET /api/analytics/top-products
// @access  Private/Admin
const getTopSellingProducts = async (req, res) => {
  try {
    const { limit = 10, period = 30 } = req.query;
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          image: { $first: '$orderItems.image' },
          totalQuantity: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json(topProducts);
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get category statistics
// @route   GET /api/analytics/categories
// @access  Private/Admin
const getCategoryStats = async (req, res) => {
  try {
    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalStock: { $sum: '$countInStock' },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { totalProducts: -1 } }
    ]);

    res.json(categoryStats);
  } catch (error) {
    console.error('Category stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get customer insights
// @route   GET /api/analytics/customers
// @access  Private/Admin
const getCustomerInsights = async (req, res) => {
  try {
    // Customer lifetime value
    const customerLTV = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: { $divide: ['$totalSpent', '$totalOrders'] },
          customerAge: {
            $divide: [
              { $subtract: ['$lastOrder', '$firstOrder'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 50 }
    ]);

    // Customer segments
    const customerSegments = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $bucket: {
          groupBy: '$totalSpent',
          boundaries: [0, 1000, 5000, 10000, 50000],
          default: '50000+',
          output: {
            count: { $sum: 1 },
            averageOrders: { $avg: '$totalOrders' }
          }
        }
      }
    ]);

    res.json({
      customerLTV,
      customerSegments
    });
  } catch (error) {
    console.error('Customer insights error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getSalesReport,
  getProductStats,
  getUserStats,
  getInventoryReport,
  getRevenueChart,
  getTopSellingProducts,
  getCategoryStats,
  getCustomerInsights
};