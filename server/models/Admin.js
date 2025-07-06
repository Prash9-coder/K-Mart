import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
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
    minlength: 8
  },
  role: {
    type: String,
    required: true,
    enum: ['super-admin', 'admin', 'manager', 'staff'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'manage-products',
      'manage-orders',
      'manage-customers',
      'manage-delivery-boys',
      'manage-inventory',
      'view-analytics',
      'manage-coupons',
      'manage-credit',
      'manage-payments',
      'manage-staff'
    ]
  }],
  phone: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12); // Higher salt rounds for admin
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
adminSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Remove password from JSON output
adminSchema.methods.toJSON = function() {
  const adminObject = this.toObject();
  delete adminObject.password;
  delete adminObject.twoFactorSecret;
  return adminObject;
};

// Set default permissions based on role
adminSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'super-admin':
        this.permissions = [
          'manage-products', 'manage-orders', 'manage-customers',
          'manage-delivery-boys', 'manage-inventory', 'view-analytics',
          'manage-coupons', 'manage-credit', 'manage-payments', 'manage-staff'
        ];
        break;
      case 'admin':
        this.permissions = [
          'manage-products', 'manage-orders', 'manage-customers',
          'manage-delivery-boys', 'manage-inventory', 'view-analytics',
          'manage-coupons', 'manage-credit', 'manage-payments'
        ];
        break;
      case 'manager':
        this.permissions = [
          'manage-products', 'manage-orders', 'manage-customers',
          'manage-delivery-boys', 'manage-inventory', 'view-analytics'
        ];
        break;
      case 'staff':
        this.permissions = ['manage-orders', 'manage-inventory'];
        break;
    }
  }
  next();
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;