import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['purchase', 'sale', 'return', 'damage', 'expired', 'adjustment', 'transfer'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    default: null // Order ID, Purchase ID, etc.
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  cost: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  gstNumber: {
    type: String,
    default: null
  }
});

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  
  // Stock Information
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: 0
  },
  availableStock: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Stock Levels
  minStockLevel: {
    type: Number,
    required: true,
    default: 10
  },
  maxStockLevel: {
    type: Number,
    required: true,
    default: 1000
  },
  reorderLevel: {
    type: Number,
    required: true,
    default: 20
  },
  reorderQuantity: {
    type: Number,
    required: true,
    default: 100
  },
  
  // Cost Information
  averageCost: {
    type: Number,
    default: 0
  },
  lastPurchaseCost: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  
  // Location in Store
  location: {
    aisle: { type: String, default: null },
    shelf: { type: String, default: null },
    position: { type: String, default: null }
  },
  
  // Supplier Information
  primarySupplier: supplierSchema,
  alternateSuppliers: [supplierSchema],
  
  // Stock Movements History
  stockMovements: [stockMovementSchema],
  
  // Batch/Lot Information
  batches: [{
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true },
    purchaseDate: { type: Date, required: true },
    expiryDate: { type: Date, default: null },
    cost: { type: Number, required: true },
    supplier: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  }],
  
  // Alerts and Notifications
  alerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'out_of_stock', 'expiry_warning', 'overstock'],
      required: true
    },
    message: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    acknowledgedAt: { type: Date, default: null }
  }],
  
  // Auto-reorder settings
  autoReorder: {
    enabled: { type: Boolean, default: false },
    supplier: { type: String, default: null },
    lastOrderDate: { type: Date, default: null },
    nextOrderDate: { type: Date, default: null }
  },
  
  // Analytics
  analytics: {
    totalSold: { type: Number, default: 0 },
    totalPurchased: { type: Number, default: 0 },
    totalWasted: { type: Number, default: 0 },
    averageDailySales: { type: Number, default: 0 },
    stockTurnoverRate: { type: Number, default: 0 },
    lastSaleDate: { type: Date, default: null },
    fastMoving: { type: Boolean, default: false },
    slowMoving: { type: Boolean, default: false }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Last updated information
  lastStockUpdate: {
    type: Date,
    default: Date.now
  },
  lastCountDate: {
    type: Date,
    default: null
  },
  lastCountBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true
});

// Calculate available stock before saving
inventorySchema.pre('save', function(next) {
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  this.totalValue = this.currentStock * this.averageCost;
  this.lastStockUpdate = new Date();
  next();
});

// Add stock movement
inventorySchema.methods.addStockMovement = function(type, quantity, reason, performedBy, options = {}) {
  const movement = {
    type,
    quantity,
    reason,
    performedBy,
    reference: options.reference || null,
    cost: options.cost || 0,
    notes: options.notes || null
  };
  
  this.stockMovements.push(movement);
  
  // Update current stock based on movement type
  if (['purchase', 'return', 'adjustment'].includes(type) && quantity > 0) {
    this.currentStock += quantity;
    this.analytics.totalPurchased += quantity;
  } else if (['sale', 'damage', 'expired', 'transfer'].includes(type)) {
    this.currentStock = Math.max(0, this.currentStock - Math.abs(quantity));
    if (type === 'sale') {
      this.analytics.totalSold += Math.abs(quantity);
      this.analytics.lastSaleDate = new Date();
    } else if (['damage', 'expired'].includes(type)) {
      this.analytics.totalWasted += Math.abs(quantity);
    }
  }
  
  // Update average cost for purchases
  if (type === 'purchase' && options.cost) {
    const totalCost = (this.averageCost * (this.currentStock - quantity)) + (options.cost * quantity);
    this.averageCost = totalCost / this.currentStock;
    this.lastPurchaseCost = options.cost;
  }
  
  this.checkAndCreateAlerts();
};

// Reserve stock for orders
inventorySchema.methods.reserveStock = function(quantity) {
  if (this.availableStock >= quantity) {
    this.reservedStock += quantity;
    return true;
  }
  return false;
};

// Release reserved stock
inventorySchema.methods.releaseReservedStock = function(quantity) {
  this.reservedStock = Math.max(0, this.reservedStock - quantity);
};

// Check and create alerts
inventorySchema.methods.checkAndCreateAlerts = function() {
  // Clear existing alerts
  this.alerts = this.alerts.filter(alert => alert.acknowledgedBy);
  
  // Low stock alert
  if (this.currentStock <= this.minStockLevel && this.currentStock > 0) {
    this.alerts.push({
      type: 'low_stock',
      message: `Stock is running low. Current: ${this.currentStock}, Minimum: ${this.minStockLevel}`
    });
  }
  
  // Out of stock alert
  if (this.currentStock === 0) {
    this.alerts.push({
      type: 'out_of_stock',
      message: 'Product is out of stock'
    });
  }
  
  // Overstock alert
  if (this.currentStock > this.maxStockLevel) {
    this.alerts.push({
      type: 'overstock',
      message: `Stock exceeds maximum level. Current: ${this.currentStock}, Maximum: ${this.maxStockLevel}`
    });
  }
  
  // Expiry warning for batches
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  this.batches.forEach(batch => {
    if (batch.isActive && batch.expiryDate && batch.expiryDate <= thirtyDaysFromNow) {
      this.alerts.push({
        type: 'expiry_warning',
        message: `Batch ${batch.batchNumber} expires on ${batch.expiryDate.toDateString()}`
      });
    }
  });
};

// Calculate stock turnover rate
inventorySchema.methods.calculateTurnoverRate = function(days = 30) {
  const averageStock = (this.currentStock + this.minStockLevel) / 2;
  if (averageStock === 0) return 0;
  
  const salesInPeriod = this.stockMovements
    .filter(movement => 
      movement.type === 'sale' && 
      movement.createdAt >= new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    )
    .reduce((total, movement) => total + movement.quantity, 0);
  
  this.analytics.stockTurnoverRate = salesInPeriod / averageStock;
  return this.analytics.stockTurnoverRate;
};

// Check if reorder is needed
inventorySchema.methods.needsReorder = function() {
  return this.currentStock <= this.reorderLevel;
};

// Get active alerts
inventorySchema.methods.getActiveAlerts = function() {
  return this.alerts.filter(alert => alert.isActive && !alert.acknowledgedBy);
};

// Acknowledge alert
inventorySchema.methods.acknowledgeAlert = function(alertId, adminId) {
  const alert = this.alerts.id(alertId);
  if (alert) {
    alert.acknowledgedBy = adminId;
    alert.acknowledgedAt = new Date();
    alert.isActive = false;
  }
};

// Indexes for performance
inventorySchema.index({ product: 1 });
inventorySchema.index({ currentStock: 1 });
inventorySchema.index({ 'alerts.isActive': 1 });
inventorySchema.index({ 'analytics.fastMoving': 1 });
inventorySchema.index({ 'analytics.slowMoving': 1 });
inventorySchema.index({ lastStockUpdate: -1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;