import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: null
  },
  sku: {
    type: String,
    required: true
  }
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
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
    required: true,
    default: 'India'
  },
  phone: {
    type: String,
    required: true
  }
});

const paymentResultSchema = new mongoose.Schema({
  id: { type: String },
  status: { type: String },
  updateTime: { type: String },
  emailAddress: { type: String }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'razorpay', 'cod', 'upi', 'netbanking', 'credit', 'wallet', 'loyalty_points']
  },
  creditUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  loyaltyPointsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentResult: paymentResultSchema,
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  itemsPrice: {
    type: Number,
    required: true,
    min: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discountAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  couponCode: {
    type: String,
    default: null
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  estimatedDeliveryDate: {
    type: Date,
    default: null
  },
  actualDeliveryDate: {
    type: Date,
    default: null
  },
  trackingNumber: {
    type: String,
    default: null
  },
  deliveryPartner: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: null
    }
  }],
  returnReason: {
    type: String,
    default: null
  },
  returnStatus: {
    type: String,
    enum: ['not-requested', 'requested', 'approved', 'rejected', 'completed'],
    default: 'not-requested'
  },
  refundAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  refundStatus: {
    type: String,
    enum: ['not-requested', 'requested', 'processing', 'completed', 'failed'],
    default: 'not-requested'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Delivery Information
  deliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryBoy',
    default: null
  },
  deliveryAssignedAt: {
    type: Date,
    default: null
  },
  deliveryPickedUpAt: {
    type: Date,
    default: null
  },
  deliveryInTransitAt: {
    type: Date,
    default: null
  },
  
  // Delivery preferences
  deliveryPreferences: {
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime'],
      default: 'anytime'
    },
    specialInstructions: {
      type: String,
      default: null
    },
    contactlessDelivery: {
      type: Boolean,
      default: false
    }
  },
  
  // Customer feedback
  customerFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      default: null
    },
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    deliveryComment: {
      type: String,
      default: null
    },
    submittedAt: {
      type: Date,
      default: null
    }
  },
  
  // Order source
  orderSource: {
    type: String,
    enum: ['website', 'mobile_app', 'whatsapp', 'phone', 'in_store'],
    default: 'website'
  },
  
  // WhatsApp order details
  whatsappDetails: {
    phoneNumber: { type: String, default: null },
    messageId: { type: String, default: null },
    conversationId: { type: String, default: null }
  },
  
  // Recurring order
  isRecurringOrder: {
    type: Boolean,
    default: false
  },
  recurringOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringOrder',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
    
    // Initialize status history
    this.statusHistory = [{
      status: this.orderStatus,
      date: new Date(),
      note: 'Order created'
    }];
  }
  next();
});

// Update status history when order status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus') && !this.isNew) {
    this.statusHistory.push({
      status: this.orderStatus,
      date: new Date(),
      note: `Order status updated to ${this.orderStatus}`
    });
  }
  next();
});

// Calculate estimated delivery date
orderSchema.methods.calculateEstimatedDelivery = function() {
  const now = new Date();
  const deliveryDays = 3; // Default 3 days
  this.estimatedDeliveryDate = new Date(now.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));
};

// Check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.orderStatus);
};

// Check if order can be returned
orderSchema.methods.canBeReturned = function() {
  if (this.orderStatus !== 'delivered') return false;
  
  const deliveredDate = this.deliveredAt || this.actualDeliveryDate;
  if (!deliveredDate) return false;
  
  const now = new Date();
  const daysSinceDelivery = (now - deliveredDate) / (1000 * 60 * 60 * 24);
  
  return daysSinceDelivery <= 7; // 7 days return policy
};

const Order = mongoose.model('Order', orderSchema);

export default Order;