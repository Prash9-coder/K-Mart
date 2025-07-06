// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

// Base URL for API requests
export const API_BASE_URL = isDevelopment 
  ? '/api' // Proxy will handle this in development
  : '/api'; // In production, the server serves both API and static files

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Auth token handling
export const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      if (userData.token) {
        return userData.token;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  return null;
};

// Add auth token to request headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  if (token) {
    return {
      ...DEFAULT_HEADERS,
      Authorization: `Bearer ${token}`,
    };
  }
  return DEFAULT_HEADERS;
};

// API timeout in milliseconds
export const API_TIMEOUT = 30000; // 30 seconds

export default {
  API_BASE_URL,
  DEFAULT_HEADERS,
  getAuthToken,
  getAuthHeaders,
  API_TIMEOUT,
};