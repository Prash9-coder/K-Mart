import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Validate coupon
export const validateCoupon = createAsyncThunk(
  'coupon/validateCoupon',
  async ({ code, orderAmount, orderItems }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token || auth.user?.token}`,
        },
      };

      const { data } = await axios.post(
        `${API_URL}/coupons/validate`,
        { code, orderAmount, orderItems },
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Invalid coupon'
      );
    }
  }
);

// Get active coupons
export const getActiveCoupons = createAsyncThunk(
  'coupon/getActiveCoupons',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token || auth.user?.token}`,
        },
      };

      const { data } = await axios.get(`${API_URL}/coupons/active`, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch coupons'
      );
    }
  }
);

// Get all coupons (admin)
export const getAllCoupons = createAsyncThunk(
  'coupon/getAllCoupons',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token || auth.user?.token}`,
        },
      };

      const { data } = await axios.get(`${API_URL}/coupons`, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch coupons'
      );
    }
  }
);

// Get coupon by ID
export const getCouponById = createAsyncThunk(
  'coupon/getCouponById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token || auth.user?.token}`,
        },
      };

      const { data } = await axios.get(`${API_URL}/coupons/${id}`, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch coupon'
      );
    }
  }
);

// Create coupon (admin)
export const createCoupon = createAsyncThunk(
  'coupon/createCoupon',
  async (couponData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token || auth.user?.token}`,
        },
      };

      const { data } = await axios.post(`${API_URL}/coupons`, couponData, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create coupon'
      );
    }
  }
);

// Update coupon (admin)
export const updateCoupon = createAsyncThunk(
  'coupon/updateCoupon',
  async ({ id, couponData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token || auth.user?.token}`,
        },
      };

      const { data } = await axios.put(`${API_URL}/coupons/${id}`, couponData, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update coupon'
      );
    }
  }
);

// Delete coupon (admin)
export const deleteCoupon = createAsyncThunk(
  'coupon/deleteCoupon',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token || auth.user?.token}`,
        },
      };

      await axios.delete(`${API_URL}/coupons/${id}`, config);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete coupon'
      );
    }
  }
);

const initialState = {
  coupons: [],
  coupon: null,
  appliedCoupon: null,
  discountAmount: 0,
  loading: false,
  error: null,
  success: false,
};

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearCoupon: (state) => {
      state.appliedCoupon = null;
      state.discountAmount = 0;
      state.error = null;
      state.success = false;
    },
    clearCouponError: (state) => {
      state.error = null;
    },
    clearCouponSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Validate coupon
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedCoupon = action.payload.coupon;
        state.discountAmount = action.payload.discountAmount;
        state.success = true;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.appliedCoupon = null;
        state.discountAmount = 0;
      })
      // Get active coupons
      .addCase(getActiveCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(getActiveCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all coupons
      .addCase(getAllCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(getAllCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get coupon by ID
      .addCase(getCouponById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCouponById.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload;
      })
      .addCase(getCouponById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload;
        state.success = true;
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload;
        state.success = true;
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = state.coupons.filter(coupon => coupon._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCoupon, clearCouponError, clearCouponSuccess } = couponSlice.actions;
export default couponSlice.reducer;