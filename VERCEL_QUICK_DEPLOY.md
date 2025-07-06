# Kirana Market - Vercel Quick Deploy Guide

This guide provides the fastest way to deploy your Kirana Market frontend to Vercel.

## Prerequisites

- Vercel account
- GitHub account with your code pushed
- Backend already deployed to Render

## Step 1: Log in to Vercel (1 minute)

Go to [Vercel](https://vercel.com/) and log in to your account.

## Step 2: Create New Project (1 minute)

Click "Add New" > "Project" and select your GitHub repository.

## Step 3: Configure Project (2 minutes)

- **Framework Preset**: Vite
- **Root Directory**: client
- **Build Command**: npm run build
- **Output Directory**: dist

## Step 4: Add Environment Variables (1 minute)

Add these environment variables:
- `VITE_API_URL`: Your Render backend URL + `/api`
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe Publishable Key

## Step 5: Deploy (2 minutes)

Click "Deploy" and wait for the build to complete.

## Step 6: Test Your Deployment (3 minutes)

Visit your Vercel URL and test the main functionality:
- User login
- Product browsing
- Cart functionality
- Checkout process

## Total Time: ~10 minutes

Congratulations! Your Kirana Market frontend is now deployed to Vercel.