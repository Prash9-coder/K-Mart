import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch products
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        keyword = '',
        category = '',
        minPrice = 0,
        maxPrice = 999999,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        pageNumber = 1,
        pageSize = 12
      } = params;

      const queryParams = new URLSearchParams({
        keyword,
        category,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        pageNumber,
        pageSize
      });

      const { data } = await axios.get(`${API_URL}/products?${queryParams}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch products'
      );
    }
  }
);

// Fetch single product
export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/products/${productId}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch product'
      );
    }
  }
);

// Create product review
export const createProductReview = createAsyncThunk(
  'product/createProductReview',
  async ({ productId, rating, comment }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token || auth.user?.token}`,
        },
      };

      const { data } = await axios.post(
        `${API_URL}/products/${productId}/reviews`,
        { rating, comment },
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create review'
      );
    }
  }
);

// Fetch top products
export const fetchTopProducts = createAsyncThunk(
  'product/fetchTopProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/products/top`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch top products'
      );
    }
  }
);

// Fetch featured products
export const fetchFeaturedProducts = createAsyncThunk(
  'product/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/products/featured`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch featured products'
      );
    }
  }
);

// Sample product data (fallback for development)
const sampleProducts = [
  {
    _id: '1',
    name: 'Rice - Premium Basmati',
    description: 'Premium quality basmati rice, perfect for everyday meals.',
    price: 25.99,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    category: 'groceries',
    countInStock: 50,
    rating: 4.8,
    numReviews: 12,
  },
  {
    _id: '2',
    name: 'Cooking Oil - Sunflower',
    description: 'Pure sunflower oil for healthy cooking.',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    category: 'groceries',
    countInStock: 30,
    rating: 4.5,
    numReviews: 8,
  },
  {
    _id: '3',
    name: 'Dish Soap',
    description: 'Effective dish soap that cuts through grease and leaves dishes sparkling clean.',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1622456362581-1b9c1e0daa95?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    category: 'household',
    countInStock: 45,
    rating: 4.2,
    numReviews: 15,
  },
  {
    _id: '4',
    name: 'Toothpaste - Mint Fresh',
    description: 'Refreshing mint toothpaste for complete oral care.',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    category: 'personal-care',
    countInStock: 60,
    rating: 4.6,
    numReviews: 20,
  },
  {
    _id: '5',
    name: 'Coffee - Premium Blend',
    description: 'Rich and aromatic premium coffee blend.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    category: 'beverages',
    countInStock: 25,
    rating: 4.9,
    numReviews: 18,
  },
  {
    _id: '6',
    name: 'Laundry Detergent',
    description: 'Powerful laundry detergent that removes tough stains.',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1a7f1c62?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    category: 'household',
    countInStock: 40,
    rating: 4.3,
    numReviews: 10,
  },
  {
    _id: '7',
    name: 'Shampoo - Herbal',
    description: 'Nourishing herbal shampoo for healthy hair.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    category: 'personal-care',
    countInStock: 35,
    rating: 4.4,
    numReviews: 14,
  },
  {
    _id: '8',
    name: 'Tea - Green Tea',
    description: 'Refreshing green tea with antioxidant properties.',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    category: 'beverages',
    countInStock: 55,
    rating: 4.7,
    numReviews: 16,
  }
];

// Initial state
const initialState = {
  products: [],
  product: null,
  topProducts: [],
  featuredProducts: [],
  loading: false,
  error: null,
  success: false,
  // Pagination
  page: 1,
  pages: 1,
  totalProducts: 0,
  hasMore: false,
};

// Product slice
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProduct: (state, action) => {
      state.product = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || action.payload;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
        state.totalProducts = action.payload.totalProducts || action.payload.length;
        state.hasMore = action.payload.hasMore || false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Fallback to sample data in case of error
        state.products = sampleProducts;
      })
      // Handle fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Fallback to sample data
        const productId = action.meta.arg;
        state.product = sampleProducts.find(p => p._id === productId) || null;
      })
      // Handle fetchTopProducts
      .addCase(fetchTopProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.topProducts = action.payload;
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Fallback to sample data
        state.topProducts = sampleProducts.slice(0, 5);
      })
      // Handle fetchFeaturedProducts
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Fallback to sample data
        state.featuredProducts = sampleProducts.slice(0, 8);
      })
      // Handle createProductReview
      .addCase(createProductReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setProducts, setProduct, setLoading, setError, clearError } = productSlice.actions;
export default productSlice.reducer;