import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User } from '../models/index.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Check for mock tokens in development mode only
      if (process.env.NODE_ENV === 'development' && 
          (token.startsWith('mock_token_') || token === 'test_admin_token_for_development')) {
        
        console.log('Using mock authentication token in development mode');
        
        // Create a mock user for development
        let userId = 'default_user';
        
        if (token.startsWith('mock_token_')) {
          // Extract user ID from token
          const parts = token.split('_');
          // Handle both formats: mock_token_userId and mock_token_userId_user
          userId = parts.length >= 3 ? parts[2] : 'default_user';
        }
        
        req.user = {
          _id: token.startsWith('mock_token_') ? userId : 'admin_user',
          name: token.startsWith('mock_token_') ? 'Test User' : 'Admin User',
          email: token.startsWith('mock_token_') ? 'user@example.com' : 'admin@example.com',
          isAdmin: token === 'test_admin_token_for_development'
        };
        
        return next();
      }
      
      // In production, we should never accept mock tokens
      if (process.env.NODE_ENV === 'production' && 
          (token.startsWith('mock_token_') || token === 'test_admin_token_for_development')) {
        console.error('Attempted to use a mock token in production');
        res.status(401);
        throw new Error('Not authorized, invalid token');
      }

      // Normal JWT verification for production
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin };