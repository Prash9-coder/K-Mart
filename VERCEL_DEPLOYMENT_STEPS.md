# Vercel Deployment Step-by-Step Guide

This guide provides detailed steps with visual references for deploying your Kirana Market frontend to Vercel.

## Step 1: Push Your Code to GitHub

Make sure your code is pushed to GitHub before proceeding.

## Step 2: Log in to Vercel

1. Go to [Vercel](https://vercel.com/) and log in to your account
2. You'll see your dashboard with your projects

## Step 3: Create a New Project

1. Click on "Add New" button
2. Select "Project" from the dropdown menu

![Add New Project](https://i.imgur.com/JQpZJWZ.png)

## Step 4: Import Your GitHub Repository

1. Connect your GitHub account if you haven't already
2. Find and select your Kirana Market repository
3. Click "Import"

![Import Repository](https://i.imgur.com/8JZWJGZ.png)

## Step 5: Configure Project Settings

1. Configure the project settings:
   - **Framework Preset**: Select "Vite" from the dropdown
   - **Root Directory**: Enter `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

![Configure Project](https://i.imgur.com/QZpZJWZ.png)

## Step 6: Add Environment Variables

1. Expand the "Environment Variables" section
2. Add the following variables:
   - Name: `VITE_API_URL`
   - Value: Your Render backend URL + `/api` (e.g., `https://kirana-market-api.onrender.com/api`)
   
   - Name: `VITE_STRIPE_PUBLISHABLE_KEY`
   - Value: Your Stripe Publishable Key

![Environment Variables](https://i.imgur.com/RZpZJWZ.png)

## Step 7: Deploy Your Project

1. Click the "Deploy" button
2. Vercel will start building and deploying your project
3. You can watch the build logs in real-time

![Deployment in Progress](https://i.imgur.com/TZpZJWZ.png)

## Step 8: View Your Deployed Site

1. Once the deployment is complete, you'll see a success message
2. Click on the deployment URL to view your site
3. Your site will be available at a URL like `https://kirana-market.vercel.app`

![Deployment Complete](https://i.imgur.com/UZpZJWZ.png)

## Step 9: Configure Custom Domain (Optional)

1. In your project dashboard, click on "Settings"
2. Go to the "Domains" section
3. Click "Add" to add your custom domain
4. Follow the instructions to configure your DNS settings

![Custom Domain](https://i.imgur.com/VZpZJWZ.png)

## Step 10: Set Up Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository. Whenever you push changes to your main branch, Vercel will automatically rebuild and deploy your frontend.

To customize this behavior:
1. Go to your project settings
2. Click on "Git"
3. Configure your production branch and deployment settings

![Continuous Deployment](https://i.imgur.com/WZpZJWZ.png)

## Step 11: Test Your Deployment

1. Visit your Vercel deployment URL
2. Test user registration and login
3. Test product browsing and cart functionality
4. Test the checkout process with Stripe's test cards
5. Verify that the frontend can communicate with the backend API

## Troubleshooting

### CORS Issues

If you encounter CORS errors:
1. Make sure your backend CORS configuration allows requests from your Vercel domain
2. Update the server's CORS configuration in `server/server.js`
3. Redeploy your backend to Render

### API Connection Issues

If the frontend can't connect to the backend:
1. Verify the `VITE_API_URL` environment variable is set correctly
2. Make sure it includes `/api` at the end
3. Check that your backend is running and accessible

### Build Failures

If your build fails:
1. Check the build logs in the Vercel dashboard
2. Verify that all dependencies are correctly installed
3. Make sure your code doesn't have any syntax errors

## Next Steps

After successful deployment:
1. Set up monitoring with Vercel Analytics
2. Configure error tracking with Sentry
3. Set up uptime monitoring with UptimeRobot
4. Implement a CI/CD pipeline for testing before deployment

Congratulations! Your Kirana Market frontend is now deployed to Vercel.