import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll just simulate a successful registration
      const userData = {
        id: Date.now().toString(),
        name,
        email,
        isAdmin: false,
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // In production, this should make a real API call to your backend
      // The code below is for development/demo purposes only
      
      const isDevelopment = import.meta.env.MODE === 'development';
      
      if (isDevelopment) {
        // Development mode - use mock users
        
        // Predefined admin users
        const adminUsers = [
          { email: 'admin@kstore.com', password: 'admin123', name: 'Admin User' },
          { email: 'admin@example.com', password: 'admin123', name: 'Store Admin' },
          { email: 'superadmin@kstore.com', password: 'super123', name: 'Super Admin' }
        ];
        
        // Check if it's an admin user
        const adminUser = adminUsers.find(user => user.email === email);
        
        if (adminUser) {
          const userId = 'admin_' + Date.now().toString();
          const userData = {
            id: userId,
            name: adminUser.name,
            email: adminUser.email,
            isAdmin: true,
            token: 'test_admin_token_for_development'
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          return userData;
        }
        
        // Regular user login
        const userId = Date.now().toString();
        const userData = {
          id: userId,
          name: 'Test User',
          email,
          isAdmin: false,
          token: `mock_token_${userId}`
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        // Production mode - should make a real API call
        // This is a placeholder for the actual API call
        throw new Error('Please implement the actual API call for production');
        
        // Example of how the real API call would look:
        /*
        const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }
        
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
        */
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Admin Registration
export const adminRegister = createAsyncThunk(
  'auth/adminRegister',
  async ({ name, email, password, adminCode }, { rejectWithValue }) => {
    try {
      // Verify admin code
      const validAdminCodes = ['ADMIN2024', 'SUPERADMIN2024', 'KSTORE_ADMIN'];
      
      if (!validAdminCodes.includes(adminCode)) {
        throw new Error('Invalid admin access code');
      }
      
      // Create admin user
      const userId = 'admin_' + Date.now().toString();
      const userData = {
        id: userId,
        name,
        email,
        isAdmin: true,
        // Add a mock token for admin
        token: 'test_admin_token_for_development'
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      return rejectWithValue(error.message || 'Admin registration failed');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Try to load user from localStorage if it exists
try {
  const userFromStorage = localStorage.getItem('user');
  if (userFromStorage) {
    const parsedUser = JSON.parse(userFromStorage);
    // Only set as authenticated if we have a valid user object with id
    if (parsedUser && parsedUser.id) {
      initialState.user = parsedUser;
      initialState.isAuthenticated = true;
    } else {
      // Clear invalid user data
      localStorage.removeItem('user');
    }
  }
} catch (error) {
  console.error('Error parsing user from localStorage:', error);
  // Clear potentially corrupted data
  localStorage.removeItem('user');
}

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('user');
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin Register
      .addCase(adminRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(adminRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;