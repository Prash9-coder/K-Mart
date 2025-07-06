# Kirana Market - Quick Deployment Guide

This guide provides the fastest way to deploy your Kirana Market application to production.

## Prerequisites

- GitHub account
- [Render](https://render.com/) account
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Stripe](https://stripe.com/) account
- [Google AI Studio](https://aistudio.google.com/) account

## Step 1: Set Up MongoDB Atlas (10 minutes)

1. Create a MongoDB Atlas account or log in
2. Create a new project named "Kirana Market"
3. Create a free tier cluster
4. Create a database user with a strong password
5. Set network access to allow connections from anywhere (0.0.0.0/0)
6. Get your connection string from "Connect" > "Connect your application"

## Step 2: Get API Keys (5 minutes)

1. **Stripe:**
   - Create a Stripe account or log in
   - Go to Developers > API keys
   - Note your Publishable Key and Secret Key

2. **Gemini AI:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key

## Step 3: Push to GitHub (5 minutes)

1. Create a new GitHub repository
2. Push your Kirana Market code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/kirana-market.git
   git push -u origin main
   ```

## Step 4: Deploy to Render (10 minutes)

1. Log in to Render
2. Click "New" > "Blueprint"
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file and set up your services
5. Configure the environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `GEMINI_API_KEY`: Your Gemini API key
   - `STRIPE_SECRET_KEY`: Your Stripe Secret Key
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe Publishable Key
6. Click "Apply" to start the deployment

## Step 5: Configure Stripe Webhook (5 minutes)

1. After deployment, go to your Stripe Dashboard
2. Navigate to Developers > Webhooks
3. Click "Add endpoint"
4. Set the endpoint URL to your backend URL + `/api/payments/webhook`
5. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
6. Copy the Webhook Signing Secret
7. Update your Render environment variables with the Webhook Secret

## Step 6: Test Your Deployment (5 minutes)

1. Visit your Render frontend URL
2. Test user registration and login
3. Test product browsing and cart functionality
4. Test the checkout process with Stripe's test cards:
   - Success: 4242 4242 4242 4242
   - Failure: 4000 0000 0000 0002

## Step 7: Set Up Custom Domain (Optional, 10 minutes)

1. Purchase a domain from a registrar like Namecheap or GoDaddy
2. In Render, go to your web service > Settings > Custom Domain
3. Add your domain and follow the DNS configuration instructions

## Troubleshooting

- **CORS Errors**: Ensure your backend CORS configuration allows requests from your frontend domain
- **Environment Variables**: Double-check all environment variables are correctly set
- **Build Failures**: Check the build logs for errors
- **API Connection Issues**: Verify the `VITE_API_URL` is correct and includes `/api`

## Next Steps

- Set up monitoring with Sentry or LogRocket
- Configure uptime monitoring with UptimeRobot
- Set up regular database backups in MongoDB Atlas
- Implement a CI/CD pipeline for smooth updates

Congratulations! Your Kirana Market application is now deployed to production.