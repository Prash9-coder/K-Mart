import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  name: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  landmark: {
    type: String,
    default: null
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'India'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const creditAccountSchema = new mongoose.Schema({
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  lastPaymentDate: {
    type: Date,
    default: null
  },
  creditScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  }
});

const loyaltyPointsSchema = new mongoose.Schema({
  totalEarned: {
    type: Number,
    default: 0
  },
  totalRedeemed: {
    type: Number,
    default: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  nextTierPoints: {
    type: Number,
    default: 500
  }
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null
  },
  addresses: [addressSchema],
  
  // Credit/Udhar System
  creditAccount: creditAccountSchema,
  
  // Loyalty Points System
  loyaltyPoints: loyaltyPointsSchema,
  
  // Customer Preferences
  preferences: {
    language: {
      type: String,
      default: 'english',
      enum: ['english', 'hindi', 'regional']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    deliveryPreferences: {
      preferredTimeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'anytime'],
        default: 'anytime'
      },
      specialInstructions: {
        type: String,
        default: null
      }
    }
  },
  
  // Customer Status
  customerType: {
    type: String,
    enum: ['regular', 'premium', 'wholesale', 'vip'],
    default: 'regular'
  },
  
  // Purchase History Analytics
  analytics: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    lastOrderDate: {
      type: Date,
      default: null
    },
    favoriteCategories: [{
      category: String,
      orderCount: Number
    }],
    frequentlyBoughtProducts: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      count: Number
    }]
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  
  // WhatsApp Integration
  whatsappNumber: {
    type: String,
    default: null
  },
  whatsappVerified: {
    type: Boolean,
    default: false
  },
  
  // Referral System
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  referrals: [{
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    date: {
      type: Date,
      default: Date.now
    },
    rewardEarned: {
      type: Number,
      default: 0
    }
  }],
  
  // Notes from admin/staff
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Last activity tracking
  lastLogin: {
    type: Date,
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate referral code before saving
customerSchema.pre('save', function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = this.name.substring(0, 3).toUpperCase() + 
                       Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Compare password method
customerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add loyalty points
customerSchema.methods.addLoyaltyPoints = function(points) {
  this.loyaltyPoints.totalEarned += points;
  this.loyaltyPoints.currentBalance += points;
  
  // Update tier based on total earned points
  if (this.loyaltyPoints.totalEarned >= 5000) {
    this.loyaltyPoints.tier = 'platinum';
    this.loyaltyPoints.nextTierPoints = 0;
  } else if (this.loyaltyPoints.totalEarned >= 2000) {
    this.loyaltyPoints.tier = 'gold';
    this.loyaltyPoints.nextTierPoints = 5000 - this.loyaltyPoints.totalEarned;
  } else if (this.loyaltyPoints.totalEarned >= 500) {
    this.loyaltyPoints.tier = 'silver';
    this.loyaltyPoints.nextTierPoints = 2000 - this.loyaltyPoints.totalEarned;
  } else {
    this.loyaltyPoints.tier = 'bronze';
    this.loyaltyPoints.nextTierPoints = 500 - this.loyaltyPoints.totalEarned;
  }
};

// Redeem loyalty points
customerSchema.methods.redeemLoyaltyPoints = function(points) {
  if (this.loyaltyPoints.currentBalance >= points) {
    this.loyaltyPoints.currentBalance -= points;
    this.loyaltyPoints.totalRedeemed += points;
    return true;
  }
  return false;
};

// Update credit balance
customerSchema.methods.updateCreditBalance = function(amount) {
  this.creditAccount.currentBalance += amount;
  if (amount < 0) { // Payment made
    this.creditAccount.lastPaymentDate = new Date();
  }
};

// Check credit availability
customerSchema.methods.canUseCreditAmount = function(amount) {
  if (!this.creditAccount.isActive) return false;
  const availableCredit = this.creditAccount.creditLimit - this.creditAccount.currentBalance;
  return availableCredit >= amount;
};

// Get default address
customerSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

// Update analytics after order
customerSchema.methods.updateAnalytics = function(orderData) {
  this.analytics.totalOrders += 1;
  this.analytics.totalSpent += orderData.totalPrice;
  this.analytics.averageOrderValue = this.analytics.totalSpent / this.analytics.totalOrders;
  this.analytics.lastOrderDate = new Date();
  
  // Update favorite categories
  orderData.orderItems.forEach(item => {
    const existingCategory = this.analytics.favoriteCategories.find(
      cat => cat.category === item.category
    );
    if (existingCategory) {
      existingCategory.orderCount += 1;
    } else {
      this.analytics.favoriteCategories.push({
        category: item.category,
        orderCount: 1
      });
    }
  });
  
  // Sort favorite categories by order count
  this.analytics.favoriteCategories.sort((a, b) => b.orderCount - a.orderCount);
};

// Remove password from JSON output
customerSchema.methods.toJSON = function() {
  const customerObject = this.toObject();
  delete customerObject.password;
  delete customerObject.verificationToken;
  return customerObject;
};

// Indexes for performance
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ referralCode: 1 });
customerSchema.index({ 'creditAccount.isActive': 1 });
customerSchema.index({ customerType: 1 });
customerSchema.index({ isActive: 1 });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;