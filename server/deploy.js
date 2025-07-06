/**
 * Kirana Market Server Deployment Script
 * 
 * This script helps prepare the server for production deployment.
 * It checks for required environment variables and performs basic validation.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🚀 Starting Kirana Market server deployment checks...');

// Required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY'
];

// Check for required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease update your .env file with these variables before deploying.');
  process.exit(1);
}

// Check MongoDB connection string
if (!process.env.MONGO_URI.startsWith('mongodb+srv://') && !process.env.MONGO_URI.startsWith('mongodb://')) {
  console.error('❌ Invalid MongoDB connection string. It should start with mongodb:// or mongodb+srv://');
  process.exit(1);
}

// Check JWT secret length
if (process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️ Warning: JWT_SECRET is less than 32 characters. Consider using a longer secret for better security.');
}

// Check if we're actually in production mode
if (process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ Warning: NODE_ENV is not set to "production". Set to production for optimal performance.');
}

// Check if frontend URL is properly formatted
try {
  new URL(process.env.FRONTEND_URL);
} catch (error) {
  console.error(`❌ Invalid FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  process.exit(1);
}

console.log('✅ Environment variable checks passed');

// Check for node_modules
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.error('❌ node_modules directory not found. Run "npm install" before deploying.');
  process.exit(1);
}

console.log('✅ Dependencies check passed');

// All checks passed
console.log('✅ All deployment checks passed. Ready to deploy!');
console.log('\nTo start the server in production mode, run:');
console.log('  npm start');
console.log('\nFor better reliability, consider using PM2:');
console.log('  pm2 start server.js --name kirana-api');