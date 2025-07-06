import axios from 'axios';

const API_BASE_URL = '/api/ai';

// Create axios instance with default config
const aiApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests when available
aiApi.interceptors.request.use((config) => {
  const isDevelopment = import.meta.env.MODE === 'development';
  
  if (isDevelopment) {
    // Development-only code
    // For development testing - use test tokens
    if (config.url.includes('/generate-barcode') || 
        config.url.includes('/generate-description') || 
        config.url.includes('/validate-barcode')) {
      config.headers.Authorization = 'Bearer test_admin_token_for_development';
      return config;
    }
    
    // Try to get user from localStorage (used in the mock auth system)
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.isAdmin) {
          // Use the test token for admin users
          config.headers.Authorization = 'Bearer test_admin_token_for_development';
        } else {
          // For the mock auth system, create a simple token
          const mockToken = `mock_token_${userData.id}`;
          config.headers.Authorization = `Bearer ${mockToken}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }
  
  // Production code - get real token
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo && !config.headers.Authorization) {
    try {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error parsing userInfo:', error);
    }
  }
  
  // Also try to get token from user object (for compatibility)
  if (!config.headers.Authorization) {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }
  
  return config;
});

// AI Chat Service
export const chatWithAI = async (message, conversationHistory = []) => {
  try {
    const response = await aiApi.post('/chat', {
      message,
      conversationHistory
    });
    return response.data;
  } catch (error) {
    console.error('Chat API Error:', error);
    throw error;
  }
};

// Product Description Generation
export const generateProductDescription = async (productData) => {
  try {
    const response = await aiApi.post('/generate-description', productData);
    return response.data;
  } catch (error) {
    console.error('Description Generation Error:', error);
    throw error;
  }
};

// Product Recommendations
export const getProductRecommendations = async (criteria) => {
  try {
    const response = await aiApi.post('/recommendations', criteria);
    return response.data;
  } catch (error) {
    console.error('Recommendations Error:', error);
    throw error;
  }
};

// Barcode Generation
export const generateBarcode = async (productId, productName, type = 'CODE128') => {
  try {
    const response = await aiApi.post('/generate-barcode', {
      productId,
      productName,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Barcode Generation Error:', error);
    throw error;
  }
};

// Barcode Validation
export const validateBarcode = async (barcode) => {
  try {
    const response = await aiApi.post('/validate-barcode', { barcode });
    return response.data;
  } catch (error) {
    console.error('Barcode Validation Error:', error);
    throw error;
  }
};

export default {
  chatWithAI,
  generateProductDescription,
  getProductRecommendations,
  generateBarcode,
  validateBarcode
};