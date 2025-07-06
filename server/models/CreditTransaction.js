import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  type: {
    type: String,
    enum: ['credit_used', 'payment_received', 'credit_adjustment', 'interest_charged', 'late_fee'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank_transfer', 'adjustment'],
    default: null
  },
  paymentReference: {
    type: String,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  paidDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  notes: {
    type: String,
    default: null
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate receipt number for payments
creditTransactionSchema.pre('save', function(next) {
  if (this.isNew && this.type === 'payment_received' && !this.receiptNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.receiptNumber = `RCP-${timestamp}-${random}`;
  }
  next();
});

// Indexes for performance
creditTransactionSchema.index({ customer: 1, createdAt: -1 });
creditTransactionSchema.index({ type: 1 });
creditTransactionSchema.index({ status: 1 });
creditTransactionSchema.index({ dueDate: 1 });
creditTransactionSchema.index({ receiptNumber: 1 });

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);

export default CreditTransaction;