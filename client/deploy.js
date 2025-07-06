/**
 * Kirana Market Client Deployment Script
 * 
 * This script helps prepare the client for production deployment.
 * It checks for required environment variables and builds the application.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Kirana Market client deployment checks...');

// Check if .env file exists
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.error('❌ .env file not found. Create one based on .env.example before deploying.');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const envVars = {};

// Parse environment variables
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

// Required environment variables
const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_STRIPE_PUBLISHABLE_KEY'
];

// Check for required environment variables
const missingVars = requiredEnvVars.filter(varName => !envVars[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease update your .env file with these variables before deploying.');
  process.exit(1);
}

// Check if API URL is properly formatted
try {
  new URL(envVars.VITE_API_URL);
} catch (error) {
  console.error(`❌ Invalid VITE_API_URL: ${envVars.VITE_API_URL}`);
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
console.log('✅ All deployment checks passed. Ready to build!');

// Ask for confirmation before building
console.log('\nWould you like to build the application now? (y/n)');
process.stdin.once('data', input => {
  const answer = input.toString().trim().toLowerCase();
  
  if (answer === 'y' || answer === 'yes') {
    console.log('\n🔨 Building application for production...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('\n✅ Build completed successfully!');
      console.log('\nThe production build is in the "dist" directory.');
      console.log('Deploy these files to your web server or hosting service.');
    } catch (error) {
      console.error('\n❌ Build failed. See error details above.');
      process.exit(1);
    }
  } else {
    console.log('\nBuild cancelled. Run "npm run build" manually when ready.');
  }
  
  process.exit(0);
});