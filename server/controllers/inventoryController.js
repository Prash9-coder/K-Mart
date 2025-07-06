import asyncHandler from 'express-async-handler';
import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (Admin)
const getInventoryItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  
  // Filter by stock status
  if (req.query.stockStatus === 'low') {
    filter.$expr = { $lte: ['$currentStock', '$minStockLevel'] };
  } else if (req.query.stockStatus === 'out') {
    filter.currentStock = 0;
  } else if (req.query.stockStatus === 'overstock') {
    filter.$expr = { $gt: ['$currentStock', '$maxStockLevel'] };
  }

  // Filter by active alerts
  if (req.query.hasAlerts === 'true') {
    filter['alerts.isActive'] = true;
  }

  const inventoryItems = await Inventory.find(filter)
    .populate('product', 'name sku category price images')
    .sort({ lastStockUpdate: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Inventory.countDocuments(filter);

  // Get summary statistics
  const stats = await Inventory.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalValue: { $sum: '$totalValue' },
        lowStockItems: {
          $sum: {
            $cond: [{ $lte: ['$currentStock', '$minStockLevel'] }, 1, 0]
          }
        },
        outOfStockItems: {
          $sum: {
            $cond: [{ $eq: ['$currentStock', 0] }, 1, 0]
          }
        },
        activeAlerts: {
          $sum: {
            $size: {
              $filter: {
                input: '$alerts',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      }
    }
  ]);

  res.json({
    inventoryItems,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    stats: stats[0] || {
      totalProducts: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      activeAlerts: 0
    }
  });
});

// @desc    Get inventory item by product ID
// @route   GET /api/inventory/product/:productId
// @access  Private (Admin)
const getInventoryByProduct = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findOne({ product: req.params.productId })
    .populate('product', 'name sku category price images')
    .populate('stockMovements.performedBy', 'name');

  if (!inventory) {
    res.status(404);
    throw new Error('Inventory not found for this product');
  }

  res.json(inventory);
});

// @desc    Create inventory for product
// @route   POST /api/inventory
// @access  Private (Admin)
const createInventory = asyncHandler(async (req, res) => {
  const {
    productId,
    currentStock,
    minStockLevel,
    maxStockLevel,
    reorderLevel,
    reorderQuantity,
    averageCost,
    location,
    primarySupplier
  } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const existingInventory = await Inventory.findOne({ product: productId });
  if (existingInventory) {
    res.status(400);
    throw new Error('Inventory already exists for this product');
  }

  const inventory = await Inventory.create({
    product: productId,
    currentStock: currentStock || 0,
    minStockLevel: minStockLevel || 10,
    maxStockLevel: maxStockLevel || 1000,
    reorderLevel: reorderLevel || 20,
    reorderQuantity: reorderQuantity || 100,
    averageCost: averageCost || 0,
    location: location || {},
    primarySupplier: primarySupplier || {}
  });

  // Add initial stock movement if stock > 0
  if (currentStock > 0) {
    inventory.addStockMovement(
      'adjustment',
      currentStock,
      'Initial stock setup',
      req.user._id,
      { cost: averageCost }
    );
    await inventory.save();
  }

  const populatedInventory = await Inventory.findById(inventory._id)
    .populate('product', 'name sku category price images');

  res.status(201).json(populatedInventory);
});

// @desc    Update inventory
// @route   PUT /api/inventory/:id
// @access  Private (Admin)
const updateInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findById(req.params.id);

  if (!inventory) {
    res.status(404);
    throw new Error('Inventory not found');
  }

  const updatedFields = { ...req.body };
  delete updatedFields.currentStock; // Don't allow direct stock updates
  delete updatedFields.stockMovements; // Don't allow direct movement updates

  Object.keys(updatedFields).forEach(key => {
    if (updatedFields[key] !== undefined) {
      inventory[key] = updatedFields[key];
    }
  });

  const updatedInventory = await inventory.save();

  res.json(updatedInventory);
});

// @desc    Add stock movement
// @route   POST /api/inventory/:id/movement
// @access  Private (Admin)
const addStockMovement = asyncHandler(async (req, res) => {
  const { type, quantity, reason, reference, cost, notes } = req.body;

  if (!type || !quantity || !reason) {
    res.status(400);
    throw new Error('Type, quantity, and reason are required');
  }

  const inventory = await Inventory.findById(req.params.id);

  if (!inventory) {
    res.status(404);
    throw new Error('Inventory not found');
  }

  inventory.addStockMovement(type, quantity, reason, req.user._id, {
    reference,
    cost,
    notes
  });

  await inventory.save();

  res.json({
    message: 'Stock movement added successfully',
    currentStock: inventory.currentStock,
    availableStock: inventory.availableStock
  });
});

// @desc    Reserve stock
// @route   POST /api/inventory/:id/reserve
// @access  Private (Admin)
const reserveStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    res.status(400);
    throw new Error('Valid quantity is required');
  }

  const inventory = await Inventory.findById(req.params.id);

  if (!inventory) {
    res.status(404);
    throw new Error('Inventory not found');
  }

  const success = inventory.reserveStock(quantity);

  if (!success) {
    res.status(400);
    throw new Error('Insufficient stock available for reservation');
  }

  await inventory.save();

  res.json({
    message: 'Stock reserved successfully',
    reservedStock: inventory.reservedStock,
    availableStock: inventory.availableStock
  });
});

// @desc    Release reserved stock
// @route   POST /api/inventory/:id/release
// @access  Private (Admin)
const releaseReservedStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    res.status(400);
    throw new Error('Valid quantity is required');
  }

  const inventory = await Inventory.findById(req.params.id);

  if (!inventory) {
    res.status(404);
    throw new Error('Inventory not found');
  }

  inventory.releaseReservedStock(quantity);
  await inventory.save();

  res.json({
    message: 'Reserved stock released successfully',
    reservedStock: inventory.reservedStock,
    availableStock: inventory.availableStock
  });
});

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts/low-stock
// @access  Private (Admin)
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const lowStockItems = await Inventory.find({
    $expr: { $lte: ['$currentStock', '$minStockLevel'] }
  })
  .populate('product', 'name sku category price images')
  .sort({ currentStock: 1 });

  res.json(lowStockItems);
});

// @desc    Get all active alerts
// @route   GET /api/inventory/alerts
// @access  Private (Admin)
const getActiveAlerts = asyncHandler(async (req, res) => {
  const inventoryWithAlerts = await Inventory.find({
    'alerts.isActive': true
  })
  .populate('product', 'name sku category price images')
  .sort({ 'alerts.createdAt': -1 });

  const alerts = [];
  inventoryWithAlerts.forEach(inventory => {
    const activeAlerts = inventory.getActiveAlerts();
    activeAlerts.forEach(alert => {
      alerts.push({
        _id: alert._id,
        type: alert.type,
        message: alert.message,
        createdAt: alert.createdAt,
        product: inventory.product,
        inventory: {
          _id: inventory._id,
          currentStock: inventory.currentStock,
          minStockLevel: inventory.minStockLevel
        }
      });
    });
  });

  res.json(alerts);
});

// @desc    Acknowledge alert
// @route   PUT /api/inventory/alerts/:alertId/acknowledge
// @access  Private (Admin)
const acknowledgeAlert = asyncHandler(async (req, res) => {
  const { inventoryId } = req.body;

  if (!inventoryId) {
    res.status(400);
    throw new Error('Inventory ID is required');
  }

  const inventory = await Inventory.findById(inventoryId);

  if (!inventory) {
    res.status(404);
    throw new Error('Inventory not found');
  }

  inventory.acknowledgeAlert(req.params.alertId, req.user._id);
  await inventory.save();

  res.json({ message: 'Alert acknowledged successfully' });
});

// @desc    Get products needing reorder
// @route   GET /api/inventory/reorder
// @access  Private (Admin)
const getReorderList = asyncHandler(async (req, res) => {
  const reorderItems = await Inventory.find({
    $expr: { $lte: ['$currentStock', '$reorderLevel'] }
  })
  .populate('product', 'name sku category price images')
  .sort({ currentStock: 1 });

  res.json(reorderItems);
});

// @desc    Add batch
// @route   POST /api/inventory/:id/batch
// @access  Private (Admin)
const addBatch = asyncHandler(async (req, res) => {
  const { batchNumber, quantity, purchaseDate, expiryDate, cost, supplier } = req.body;

  if (!batchNumber || !quantity || !purchaseDate || !cost || !supplier) {
    res.status(400);
    throw new Error('All batch fields are required');
  }

  const inventory = await Inventory.findById(req.params.id);

  if (!inventory) {
    res.status(404);
    throw new Error('Inventory not found');
  }

  inventory.batches.push({
    batchNumber,
    quantity,
    purchaseDate,
    expiryDate,
    cost,
    supplier
  });

  // Add stock movement for the batch
  inventory.addStockMovement(
    'purchase',
    quantity,
    `Batch ${batchNumber} received`,
    req.user._id,
    { cost, reference: batchNumber }
  );

  await inventory.save();

  res.json({
    message: 'Batch added successfully',
    currentStock: inventory.currentStock
  });
});

// @desc    Get inventory analytics
// @route   GET /api/inventory/analytics
// @access  Private (Admin)
const getInventoryAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Inventory.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $group: {
        _id: '$productInfo.category',
        totalProducts: { $sum: 1 },
        totalValue: { $sum: '$totalValue' },
        totalStock: { $sum: '$currentStock' },
        lowStockCount: {
          $sum: {
            $cond: [{ $lte: ['$currentStock', '$minStockLevel'] }, 1, 0]
          }
        },
        averageTurnover: { $avg: '$analytics.stockTurnoverRate' }
      }
    },
    {
      $sort: { totalValue: -1 }
    }
  ]);

  // Get top performing products
  const topProducts = await Inventory.find({})
    .populate('product', 'name sku category price images')
    .sort({ 'analytics.totalSold': -1 })
    .limit(10);

  // Get slow moving products
  const slowMovingProducts = await Inventory.find({
    'analytics.slowMoving': true
  })
    .populate('product', 'name sku category price images')
    .limit(10);

  res.json({
    categoryAnalytics: analytics,
    topProducts,
    slowMovingProducts
  });
});

export {
  getInventoryItems,
  getInventoryByProduct,
  createInventory,
  updateInventory,
  addStockMovement,
  reserveStock,
  releaseReservedStock,
  getLowStockAlerts,
  getActiveAlerts,
  acknowledgeAlert,
  getReorderList,
  addBatch,
  getInventoryAnalytics
};