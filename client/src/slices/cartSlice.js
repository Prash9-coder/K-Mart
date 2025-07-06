import { createSlice } from '@reduxjs/toolkit';

// Calculate totals
const calculateTotals = (items) => {
  let totalQuantity = 0;
  let totalAmount = 0;
  
  items.forEach(item => {
    totalQuantity += item.quantity;
    totalAmount += item.price * item.quantity;
  });
  
  return { totalQuantity, totalAmount };
};

// Initial state
const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  shippingAddress: {},
  paymentMethod: '',
};

// Try to load cart items from localStorage if they exist
try {
  const cartItemsFromStorage = localStorage.getItem('cartItems');
  if (cartItemsFromStorage) {
    initialState.items = JSON.parse(cartItemsFromStorage);
    // Calculate initial totals
    const { totalQuantity, totalAmount } = calculateTotals(initialState.items);
    initialState.totalQuantity = totalQuantity;
    initialState.totalAmount = totalAmount;
  }
  
  const shippingAddressFromStorage = localStorage.getItem('shippingAddress');
  if (shippingAddressFromStorage) {
    initialState.shippingAddress = JSON.parse(shippingAddressFromStorage);
  }
  
  const paymentMethodFromStorage = localStorage.getItem('paymentMethod');
  if (paymentMethodFromStorage) {
    initialState.paymentMethod = paymentMethodFromStorage;
  }
} catch (error) {
  console.error('Error parsing cart data from localStorage:', error);
}

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      if (existingItem) {
        existingItem.quantity += newItem.quantity || 1;
      } else {
        state.items.push({ ...newItem, quantity: newItem.quantity || 1 });
      }
      
      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;
      
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      
      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;
      
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        item.quantity = quantity;
      }
      
      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;
      
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      
      localStorage.removeItem('cartItems');
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', action.payload);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, saveShippingAddress, savePaymentMethod } = cartSlice.actions;
export default cartSlice.reducer;