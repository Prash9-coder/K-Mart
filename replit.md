# Kirana Market - E-commerce Application

## Overview
Kirana Market is a full-stack MERN (MongoDB, Express, React, Node.js) e-commerce application designed for grocery and kirana store operations. The application features customer and admin portals, AI-powered product descriptions, payment integrations (Stripe and Razorpay), inventory management, and order tracking.

## Project Structure
```
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── slices/      # Redux slices
│   │   ├── store/       # Redux store configuration
│   │   ├── api/         # API service layer
│   │   ├── config/      # Configuration files
│   │   └── utils/       # Utility functions
│   └── package.json
│
├── server/              # Express backend
│   ├── controllers/     # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── package.json
│
└── start-dev.sh        # Development startup script
```

## Recent Changes (Migration to Replit)
### Date: October 3, 2025

**Key Configuration Changes:**
1. **Vite Configuration** (`client/vite.config.js`):
   - Configured to bind to `0.0.0.0:5000` for Replit compatibility
   - Added HMR (Hot Module Replacement) settings for Replit's proxy
   - Updated API proxy to target backend on port 3000

2. **Server Configuration** (`server/server.js`):
   - Updated to bind on `0.0.0.0:3000`
   - Added `trust proxy` setting for rate limiting behind Replit's proxy
   - Extended CORS to allow Replit domains (*.replit.dev, *.replit.app)

3. **Database Configuration** (`server/db.js`):
   - Removed deprecated MongoDB connection options

4. **Startup Script** (`start-dev.sh`):
   - Created to run both backend and frontend servers concurrently
   - Backend runs on port 3000, frontend on port 5000

5. **Missing Files**:
   - Created `client/src/utils/testAuth.js` (was referenced but missing)

## Environment Variables
The following secrets are configured in Replit Secrets:

**Required:**
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation

**Optional (for specific features):**
- `GEMINI_API_KEY` - Google Gemini AI for product descriptions and chatbot
- `STRIPE_SECRET_KEY` - Stripe payment processing
- `RAZORPAY_KEY_ID` - Razorpay payment key ID
- `RAZORPAY_SECRET` - Razorpay secret key

**Auto-configured:**
- `PORT` - Set by Replit (defaults to 3000 for backend)
- `NODE_ENV` - Environment mode

## Architecture

### Frontend (Port 5000)
- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Features**:
  - Customer shopping interface
  - Admin dashboard for product/order management
  - Real-time notifications
  - Payment integration (Stripe/Razorpay)
  - AI chatbot assistance

### Backend (Port 3000)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth with bcrypt
- **File Upload**: Multer with Sharp for image processing
- **Rate Limiting**: Express rate limit (100 requests per 15 minutes)
- **Payment Gateways**: Stripe and Razorpay integration
- **AI Services**: Google Gemini for product descriptions and chatbot

### Key Features
1. **Multi-role Authentication**: Admin, Customer, and Delivery Boy roles
2. **Product Management**: CRUD operations, inventory tracking, barcode generation
3. **Order Management**: Order placement, tracking, and status updates
4. **Payment Processing**: Support for both Stripe and Razorpay
5. **AI Integration**: Product description generation and customer support chatbot
6. **Coupon System**: Discount code management
7. **Credit System**: Store credit for customers
8. **Notifications**: Email and push notification support
9. **WhatsApp Integration**: Order notifications via WhatsApp
10. **Analytics**: Sales and inventory analytics dashboard

## Running the Application

The application starts automatically via the configured workflow:
```bash
bash start-dev.sh
```

This script:
1. Starts the Express backend server on port 3000
2. Starts the Vite dev server on port 5000 (user-facing)
3. Frontend proxies API requests to backend

## Development Notes

### Known Warnings (Non-critical)
- Mongoose duplicate schema index warnings - These are cosmetic and don't affect functionality
- Some npm package vulnerabilities - Consider running `npm audit fix` for security updates

### Security Considerations
- Rate limiting is configured for API protection
- CORS is properly configured for Replit domains
- JWT tokens for authentication
- Secrets are managed through Replit's secure environment variables
- Trust proxy is enabled for accurate IP tracking behind Replit's proxy

## User Preferences
None documented yet.

## Next Steps / TODO
1. Consider running `npm audit fix` in both client and server directories to address security vulnerabilities
2. Clean up Mongoose model definitions to remove duplicate index warnings
3. Add production deployment configuration if needed
4. Set up database seeding for initial product data
5. Configure email service (SMTP) for order notifications
6. Set up WhatsApp Business API for order notifications

## Deployment
The application is currently configured for development. For production deployment on Replit, consider:
- Setting `NODE_ENV=production` in secrets
- Building the client: `cd client && npm run build`
- The server will automatically serve the built client from `client/dist` in production mode
- Configure a proper domain through Replit
