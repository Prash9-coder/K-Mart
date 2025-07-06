import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    default: null
  },
  wholesalePrice: {
    type: Number,
    default: null,
    min: 0
  },
  wholesaleMinQuantity: {
    type: Number,
    default: 10,
    min: 1
  },
  bulkPricing: [{
    minQuantity: { type: Number, required: true },
    maxQuantity: { type: Number, default: null },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 }
  }],
  category: {
    type: String,
    required: true,
    enum: ['groceries', 'household', 'personal-care', 'beverages', 'snacks', 'dairy', 'frozen', 'bakery', 'meat', 'vegetables', 'fruits', 'spices', 'oil-ghee', 'cleaning', 'baby-care', 'health-wellness']
  },
  subcategory: {
    type: String,
    default: null
  },
  brand: {
    type: String,
    default: null
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: null
    }
  }],
  countInStock: {
    type: Number,
    required: true,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 10
  },
  maxStockLevel: {
    type: Number,
    default: 1000
  },
  unit: {
    type: String,
    default: 'piece',
    enum: ['piece', 'kg', 'gram', 'liter', 'ml', 'packet', 'box', 'bottle', 'can', 'jar']
  },
  weight: {
    value: { type: Number, default: null },
    unit: { type: String, default: 'gram' }
  },
  dimensions: {
    length: { type: Number, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    unit: { type: String, default: 'cm' }
  },
  sku: {
    type: String,
    unique: true,
    required: true
  },
  barcode: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  tags: [{
    type: String,
    trim: true
  }],
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: null
    },
    value: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date,
    default: null
  },
  manufacturingDate: {
    type: Date,
    default: null
  },
  manufacturer: {
    type: String,
    default: null
  },
  nutritionalInfo: {
    calories: { type: Number, default: null },
    protein: { type: Number, default: null },
    carbs: { type: Number, default: null },
    fat: { type: Number, default: null },
    fiber: { type: Number, default: null },
    sugar: { type: Number, default: null }
  },
  salesCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  
  // Kirana Market specific fields
  localName: {
    type: String,
    default: null
  },
  hindiName: {
    type: String,
    default: null
  },
  regionalName: {
    type: String,
    default: null
  },
  
  // Seasonal availability
  seasonal: {
    isSeasonalProduct: { type: Boolean, default: false },
    availableMonths: [{ type: Number, min: 1, max: 12 }],
    peakSeason: { type: String, default: null }
  },
  
  // Local sourcing
  sourcing: {
    isLocallySourced: { type: Boolean, default: false },
    localSupplier: { type: String, default: null },
    farmLocation: { type: String, default: null },
    harvestDate: { type: Date, default: null }
  },
  
  // Storage requirements
  storage: {
    temperature: { type: String, enum: ['room', 'cold', 'frozen'], default: 'room' },
    humidity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    specialRequirements: { type: String, default: null }
  }
}, {
  timestamps: true
});

// Index for search optimization
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ salesCount: -1 });

// Calculate discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount && this.discount.type && this.discount.value > 0) {
    const now = new Date();
    const discountStart = this.discount.startDate;
    const discountEnd = this.discount.endDate;
    
    if ((!discountStart || now >= discountStart) && (!discountEnd || now <= discountEnd)) {
      if (this.discount.type === 'percentage') {
        return this.price * (1 - this.discount.value / 100);
      } else if (this.discount.type === 'fixed') {
        return Math.max(0, this.price - this.discount.value);
      }
    }
  }
  return this.price;
});

// Check if product is on sale
productSchema.virtual('isOnSale').get(function() {
  const now = new Date();
  return this.discount && 
         this.discount.type && 
         this.discount.value > 0 &&
         (!this.discount.startDate || now >= this.discount.startDate) &&
         (!this.discount.endDate || now <= this.discount.endDate);
});

// Update rating when reviews change
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRating / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

// Check if product is low in stock
productSchema.methods.isLowStock = function() {
  return this.countInStock <= this.minStockLevel;
};

// Check if product is out of stock
productSchema.methods.isOutOfStock = function() {
  return this.countInStock === 0;
};

const Product = mongoose.model('Product', productSchema);

export default Product;