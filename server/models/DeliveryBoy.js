import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vehicleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['bicycle', 'motorcycle', 'scooter', 'car', 'van'],
    required: true
  },
  registrationNumber: {
    type: String,
    required: true
  },
  model: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: null
  },
  insuranceExpiry: {
    type: Date,
    default: null
  },
  licenseExpiry: {
    type: Date,
    default: null
  }
});

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const deliveryBoySchema = new mongoose.Schema({
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
  alternatePhone: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Personal Information
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  
  // Employment Details
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  commissionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // Percentage
  },
  
  // Documents
  documents: {
    aadharCard: {
      number: { type: String, default: null },
      imageUrl: { type: String, default: null }
    },
    panCard: {
      number: { type: String, default: null },
      imageUrl: { type: String, default: null }
    },
    drivingLicense: {
      number: { type: String, default: null },
      imageUrl: { type: String, default: null },
      expiryDate: { type: Date, default: null }
    },
    bankAccount: {
      accountNumber: { type: String, default: null },
      ifscCode: { type: String, default: null },
      bankName: { type: String, default: null },
      accountHolderName: { type: String, default: null }
    }
  },
  
  // Vehicle Information
  vehicle: vehicleSchema,
  
  // Work Status
  status: {
    type: String,
    enum: ['available', 'busy', 'offline', 'on-break'],
    default: 'offline'
  },
  
  // Current Location
  currentLocation: locationSchema,
  
  // Service Areas
  serviceAreas: [{
    area: { type: String, required: true },
    zipCodes: [String],
    isActive: { type: Boolean, default: true }
  }],
  
  // Performance Metrics
  performance: {
    totalDeliveries: {
      type: Number,
      default: 0
    },
    successfulDeliveries: {
      type: Number,
      default: 0
    },
    cancelledDeliveries: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageDeliveryTime: {
      type: Number,
      default: 0 // in minutes
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    thisMonthEarnings: {
      type: Number,
      default: 0
    }
  },
  
  // Current Assignments
  currentOrders: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['assigned', 'picked-up', 'in-transit', 'delivered'],
      default: 'assigned'
    }
  }],
  
  // Shift Information
  shift: {
    startTime: {
      type: String,
      default: '09:00'
    },
    endTime: {
      type: String,
      default: '21:00'
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    isFlexible: {
      type: Boolean,
      default: true
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
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
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  
  // App Access
  appVersion: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  fcmToken: {
    type: String,
    default: null
  },
  
  // Notes from admin
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
  }]
}, {
  timestamps: true
});

// Hash password before saving
deliveryBoySchema.pre('save', async function(next) {
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

// Generate employee ID before saving
deliveryBoySchema.pre('save', function(next) {
  if (this.isNew && !this.employeeId) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.employeeId = `DB${year}${random}`;
  }
  next();
});

// Compare password method
deliveryBoySchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update location
deliveryBoySchema.methods.updateLocation = function(latitude, longitude, address = null) {
  this.currentLocation = {
    latitude,
    longitude,
    address,
    lastUpdated: new Date()
  };
};

// Calculate success rate
deliveryBoySchema.methods.getSuccessRate = function() {
  if (this.performance.totalDeliveries === 0) return 0;
  return (this.performance.successfulDeliveries / this.performance.totalDeliveries) * 100;
};

// Add rating
deliveryBoySchema.methods.addRating = function(rating) {
  const totalRatingPoints = this.performance.averageRating * this.performance.totalRatings;
  this.performance.totalRatings += 1;
  this.performance.averageRating = (totalRatingPoints + rating) / this.performance.totalRatings;
};

// Check if available for delivery
deliveryBoySchema.methods.isAvailableForDelivery = function() {
  return this.isActive && 
         this.isVerified && 
         this.status === 'available' && 
         this.currentOrders.length < 5; // Max 5 concurrent orders
};

// Get current workload
deliveryBoySchema.methods.getCurrentWorkload = function() {
  return this.currentOrders.filter(order => 
    ['assigned', 'picked-up', 'in-transit'].includes(order.status)
  ).length;
};

// Check if in service area
deliveryBoySchema.methods.canDeliverToArea = function(zipCode) {
  return this.serviceAreas.some(area => 
    area.isActive && area.zipCodes.includes(zipCode)
  );
};

// Remove password from JSON output
deliveryBoySchema.methods.toJSON = function() {
  const deliveryBoyObject = this.toObject();
  delete deliveryBoyObject.password;
  return deliveryBoyObject;
};

// Indexes for performance
deliveryBoySchema.index({ employeeId: 1 });
deliveryBoySchema.index({ email: 1 });
deliveryBoySchema.index({ phone: 1 });
deliveryBoySchema.index({ status: 1 });
deliveryBoySchema.index({ isActive: 1, isVerified: 1 });
deliveryBoySchema.index({ 'serviceAreas.zipCodes': 1 });
deliveryBoySchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });

const DeliveryBoy = mongoose.model('DeliveryBoy', deliveryBoySchema);

export default DeliveryBoy;