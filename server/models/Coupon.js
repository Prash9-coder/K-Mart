import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed']
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    min: 0,
    default: null
  },
  usageLimit: {
    type: Number,
    min: 1,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  userUsageLimit: {
    type: Number,
    min: 1,
    default: 1
  },
  applicableCategories: [{
    type: String,
    enum: ['groceries', 'household', 'personal-care', 'beverages', 'snacks', 'dairy', 'frozen', 'bakery', 'meat', 'vegetables', 'fruits', 'spices', 'oil-ghee', 'cleaning', 'baby-care', 'health-wellness']
  }],
  excludedCategories: [{
    type: String,
    enum: ['groceries', 'household', 'personal-care', 'beverages', 'snacks', 'dairy', 'frozen', 'bakery', 'meat', 'vegetables', 'fruits', 'spices', 'oil-ghee', 'cleaning', 'baby-care', 'health-wellness']
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    orderAmount: {
      type: Number,
      required: true
    },
    discountAmount: {
      type: Number,
      required: true
    }
  }],
  terms: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
couponSchema.index({ code: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ isActive: 1 });

// Check if coupon is currently valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         now >= this.startDate && 
         now <= this.endDate &&
         (!this.usageLimit || this.usageCount < this.usageLimit);
};

// Check if user can use this coupon
couponSchema.methods.canUserUse = function(userId) {
  if (!this.isValid()) return false;
  
  const userUsages = this.usedBy.filter(usage => usage.user.toString() === userId.toString());
  return userUsages.length < this.userUsageLimit;
};

// Calculate discount amount for an order
couponSchema.methods.calculateDiscount = function(orderAmount, items = []) {
  if (!this.isValid()) return 0;
  
  // Check minimum order amount
  if (orderAmount < this.minOrderAmount) return 0;
  
  // Calculate applicable amount (if category/product restrictions apply)
  let applicableAmount = orderAmount;
  
  if (this.applicableCategories.length > 0 || this.excludedCategories.length > 0 || 
      this.applicableProducts.length > 0 || this.excludedProducts.length > 0) {
    
    applicableAmount = items.reduce((sum, item) => {
      let itemApplicable = true;
      
      // Check category restrictions
      if (this.applicableCategories.length > 0) {
        itemApplicable = this.applicableCategories.includes(item.category);
      }
      
      if (this.excludedCategories.length > 0) {
        itemApplicable = itemApplicable && !this.excludedCategories.includes(item.category);
      }
      
      // Check product restrictions
      if (this.applicableProducts.length > 0) {
        itemApplicable = itemApplicable && this.applicableProducts.includes(item.product);
      }
      
      if (this.excludedProducts.length > 0) {
        itemApplicable = itemApplicable && !this.excludedProducts.includes(item.product);
      }
      
      return sum + (itemApplicable ? item.price * item.quantity : 0);
    }, 0);
  }
  
  // Calculate discount
  let discountAmount = 0;
  
  if (this.discountType === 'percentage') {
    discountAmount = (applicableAmount * this.discountValue) / 100;
  } else if (this.discountType === 'fixed') {
    discountAmount = this.discountValue;
  }
  
  // Apply maximum discount limit
  if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
    discountAmount = this.maxDiscountAmount;
  }
  
  // Don't exceed the applicable amount
  if (discountAmount > applicableAmount) {
    discountAmount = applicableAmount;
  }
  
  return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

// Mark coupon as used by a user
couponSchema.methods.markAsUsed = function(userId, orderAmount, discountAmount) {
  this.usedBy.push({
    user: userId,
    usedAt: new Date(),
    orderAmount,
    discountAmount
  });
  this.usageCount += 1;
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;