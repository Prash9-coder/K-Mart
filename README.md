# K-Store Cart: Kirana & General Store E-Commerce Platform

A comprehensive e-commerce solution for kirana and general stores with AI-powered features.

## 🚀 New AI Features Added!

### 🤖 AI Chatbot
- **Smart Customer Support**: 24/7 AI assistant for customer queries
- **Product Recommendations**: AI-powered product suggestions
- **Order Assistance**: Help with cart, checkout, and order tracking
- **Store Information**: Instant answers about store policies and services

### 📝 AI Product Description Generator
- **Auto-Generated Descriptions**: Create compelling product descriptions instantly
- **SEO Optimized**: Descriptions optimized for search engines
- **Indian Market Focus**: Tailored for Indian grocery shopping context
- **Multi-Parameter Input**: Uses product name, category, brand, weight, and more

### 📊 Barcode Generator
- **Multiple Formats**: Support for CODE128, EAN-13, CODE39
- **Visual Preview**: Real-time barcode preview
- **Download & Copy**: Export barcodes as images or copy values
- **Auto-Generation**: Smart barcode creation based on product data

## Tech Stack
- Frontend: Vite + React + TailwindCSS
- Backend: Node.js + Express.js
- Database: MongoDB
- AI: Google Gemini AI
- Barcode: JsBarcode

## Project Structure
- client/ - Frontend application
- server/ - Backend API

## Deployment Instructions

### Prerequisites

- Node.js (v16+)
- MongoDB
- Stripe account (for payments)
- Gemini API key (for AI features)

### Backend Deployment

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install --production
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update all environment variables with your production values

4. Start the server:
   ```
   npm start
   ```

For production deployment, consider using PM2 or a similar process manager:
```
npm install -g pm2
pm2 start server.js --name kirana-api
```

### Frontend Deployment

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update `VITE_API_URL` with your production API URL
   - Update `VITE_STRIPE_PUBLISHABLE_KEY` with your Stripe publishable key

4. Build for production:
   ```
   npm run build
   ```

5. Deploy the contents of the `dist` directory to your web server or hosting service.

## Security Considerations

- Ensure all API keys and secrets are kept secure
- Use HTTPS for all production traffic
- Set up proper CORS configuration in the backend
- Implement rate limiting for API endpoints
- Regularly update dependencies to patch security vulnerabilities

## Maintenance

- Regularly backup your database
- Monitor server logs for errors
- Set up alerts for critical system events
- Implement a CI/CD pipeline for smooth updates