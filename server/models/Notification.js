import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientType'
  },
  recipientType: {
    type: String,
    required: true,
    enum: ['Customer', 'Admin', 'DeliveryBoy']
  },
  type: {
    type: String,
    required: true,
    enum: [
      'order_placed',
      'order_confirmed',
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'payment_received',
      'credit_limit_exceeded',
      'low_stock_alert',
      'new_product_arrival',
      'offer_announcement',
      'delivery_assigned',
      'delivery_completed',
      'customer_feedback',
      'system_maintenance',
      'account_update',
      'loyalty_points_earned',
      'birthday_wishes',
      'festival_greetings'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  channels: [{
    type: String,
    enum: ['push', 'email', 'sms', 'whatsapp', 'in_app'],
    required: true
  }],
  status: {
    push: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date, default: null },
      error: { type: String, default: null }
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date, default: null },
      opened: { type: Boolean, default: false },
      openedAt: { type: Date, default: null },
      error: { type: String, default: null }
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date, default: null },
      error: { type: String, default: null }
    },
    whatsapp: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date, default: null },
      read: { type: Boolean, default: false },
      readAt: { type: Date, default: null },
      error: { type: String, default: null }
    },
    in_app: {
      sent: { type: Boolean, default: true },
      sentAt: { type: Date, default: Date.now },
      read: { type: Boolean, default: false },
      readAt: { type: Date, default: null }
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['order', 'payment', 'inventory', 'marketing', 'system', 'delivery', 'customer_service'],
    required: true
  },
  scheduledFor: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  metadata: {
    orderId: { type: String, default: null },
    productId: { type: String, default: null },
    customerId: { type: String, default: null },
    deliveryBoyId: { type: String, default: null },
    campaignId: { type: String, default: null }
  }
}, {
  timestamps: true
});

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  this.status.in_app.read = true;
  this.status.in_app.readAt = new Date();
};

// Check if notification is expired
notificationSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Update delivery status for specific channel
notificationSchema.methods.updateDeliveryStatus = function(channel, status, error = null) {
  if (this.status[channel]) {
    if (status === 'sent') {
      this.status[channel].sent = true;
      this.status[channel].sentAt = new Date();
    } else if (status === 'delivered') {
      this.status[channel].delivered = true;
      this.status[channel].deliveredAt = new Date();
    } else if (status === 'opened' && channel === 'email') {
      this.status[channel].opened = true;
      this.status[channel].openedAt = new Date();
    } else if (status === 'read' && channel === 'whatsapp') {
      this.status[channel].read = true;
      this.status[channel].readAt = new Date();
    } else if (status === 'error') {
      this.status[channel].error = error;
    }
  }
};

// Get overall delivery status
notificationSchema.methods.getOverallStatus = function() {
  const channels = this.channels;
  let allSent = true;
  let anyDelivered = false;
  let hasErrors = false;

  channels.forEach(channel => {
    if (this.status[channel]) {
      if (!this.status[channel].sent) allSent = false;
      if (this.status[channel].delivered) anyDelivered = true;
      if (this.status[channel].error) hasErrors = true;
    }
  });

  if (hasErrors) return 'failed';
  if (anyDelivered) return 'delivered';
  if (allSent) return 'sent';
  return 'pending';
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  const notification = new this(data);
  
  // Set default expiry if not provided
  if (!notification.expiresAt) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days default
    notification.expiresAt = expiryDate;
  }
  
  return notification;
};

// Indexes for performance
notificationSchema.index({ recipient: 1, recipientType: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'metadata.orderId': 1 });
notificationSchema.index({ 'metadata.customerId': 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;