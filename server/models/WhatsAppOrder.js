import mongoose from 'mongoose';

const whatsappOrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  
  // WhatsApp conversation details
  conversationId: {
    type: String,
    required: true,
    unique: true
  },
  messageId: {
    type: String,
    required: true
  },
  
  // Order content
  orderText: {
    type: String,
    required: true
  },
  parsedItems: [{
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'piece' },
    estimatedPrice: { type: Number, default: 0 },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    matched: { type: Boolean, default: false },
    confidence: { type: Number, default: 0 }
  }],
  
  // Order processing status
  status: {
    type: String,
    enum: [
      'received',
      'processing',
      'items_matched',
      'quote_sent',
      'confirmed',
      'order_created',
      'cancelled',
      'failed'
    ],
    default: 'received'
  },
  
  // AI/ML processing
  processingDetails: {
    languageDetected: { type: String, default: 'english' },
    confidence: { type: Number, default: 0 },
    needsHumanReview: { type: Boolean, default: false },
    reviewReason: { type: String, default: null },
    processedBy: { type: String, enum: ['ai', 'human'], default: 'ai' }
  },
  
  // Quote and pricing
  quote: {
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true }
    }],
    subtotal: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    sentAt: { type: Date, default: null },
    validUntil: { type: Date, default: null }
  },
  
  // Customer response
  customerResponse: {
    confirmed: { type: Boolean, default: null },
    responseText: { type: String, default: null },
    responseTime: { type: Date, default: null },
    modifications: { type: String, default: null }
  },
  
  // Delivery details
  deliveryAddress: {
    address: { type: String, default: null },
    landmark: { type: String, default: null },
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    }
  },
  
  // Created order reference
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  
  // Staff handling
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  
  // Communication log
  messages: [{
    type: { type: String, enum: ['incoming', 'outgoing'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    messageId: { type: String, required: true },
    status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'], default: 'sent' },
    mediaUrl: { type: String, default: null },
    mediaType: { type: String, default: null }
  }],
  
  // Priority and urgency
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Notes from staff
  notes: [{
    note: { type: String, required: true },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Metrics
  metrics: {
    responseTime: { type: Number, default: null }, // in minutes
    processingTime: { type: Number, default: null }, // in minutes
    customerSatisfaction: { type: Number, min: 1, max: 5, default: null }
  }
}, {
  timestamps: true
});

// Add message to conversation
whatsappOrderSchema.methods.addMessage = function(type, content, messageId, options = {}) {
  this.messages.push({
    type,
    content,
    messageId,
    mediaUrl: options.mediaUrl || null,
    mediaType: options.mediaType || null,
    status: options.status || 'sent'
  });
};

// Update message status
whatsappOrderSchema.methods.updateMessageStatus = function(messageId, status) {
  const message = this.messages.find(msg => msg.messageId === messageId);
  if (message) {
    message.status = status;
  }
};

// Calculate response time
whatsappOrderSchema.methods.calculateResponseTime = function() {
  const firstMessage = this.messages.find(msg => msg.type === 'incoming');
  const firstResponse = this.messages.find(msg => msg.type === 'outgoing');
  
  if (firstMessage && firstResponse) {
    const responseTime = (firstResponse.timestamp - firstMessage.timestamp) / (1000 * 60); // in minutes
    this.metrics.responseTime = responseTime;
    return responseTime;
  }
  return null;
};

// Generate quote from parsed items
whatsappOrderSchema.methods.generateQuote = function() {
  let subtotal = 0;
  const quoteItems = [];
  
  this.parsedItems.forEach(item => {
    if (item.matched && item.product) {
      const total = item.quantity * item.estimatedPrice;
      quoteItems.push({
        product: item.product,
        name: item.productName,
        quantity: item.quantity,
        price: item.estimatedPrice,
        total: total
      });
      subtotal += total;
    }
  });
  
  const deliveryCharge = subtotal < 500 ? 30 : 0; // Free delivery above ₹500
  const total = subtotal + deliveryCharge;
  
  this.quote = {
    items: quoteItems,
    subtotal,
    deliveryCharge,
    total,
    sentAt: new Date(),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // Valid for 24 hours
  };
  
  return this.quote;
};

// Check if quote is valid
whatsappOrderSchema.methods.isQuoteValid = function() {
  return this.quote && this.quote.validUntil && this.quote.validUntil > new Date();
};

// Indexes for performance
whatsappOrderSchema.index({ conversationId: 1 });
whatsappOrderSchema.index({ phoneNumber: 1 });
whatsappOrderSchema.index({ customer: 1, createdAt: -1 });
whatsappOrderSchema.index({ status: 1 });
whatsappOrderSchema.index({ assignedTo: 1 });
whatsappOrderSchema.index({ 'processingDetails.needsHumanReview': 1 });

const WhatsAppOrder = mongoose.model('WhatsAppOrder', whatsappOrderSchema);

export default WhatsAppOrder;