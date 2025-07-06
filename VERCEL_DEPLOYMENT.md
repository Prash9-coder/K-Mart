# Deploying Kirana Market Frontend to Vercel

This guide will walk you through deploying the Kirana Market frontend to Vercel while using Render for the backend.

## Prerequisites

- A [Vercel account](https://vercel.com/)
- A [GitHub account](https://github.com/)
- Your Kirana Market code pushed to a GitHub repository

## Step 1: Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```bash
git init
git add .
git commit -m "Prepare for Vercel deployment"
git branch -M main
git remote add origin https://github.com/yourusername/kirana-market.git
git push -u origin main
```

## Step 2: Deploy Backend to Render

Before deploying the frontend, make sure your backend is deployed to Render:

1. Follow the instructions in the DEPLOYMENT_GUIDE.md to deploy the backend to Render
2. Note the URL of your deployed backend (e.g., `https://kirana-market-api.onrender.com`)

## Step 3: Deploy Frontend to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Log in to your [Vercel account](https://vercel.com/)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g., `https://kirana-market-api.onrender.com/api`)
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe Publishable Key
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to the client directory:
   ```bash
   cd client
   ```

3. Log in to Vercel:
   ```bash
   vercel login
   ```

4. Deploy to Vercel:
   ```bash
   vercel
   ```

5. Follow the prompts:
   - Set up and deploy: Yes
   - Link to existing project: No
   - Project name: kirana-market
   - Root directory: ./
   - Override settings: Yes
   - Build Command: npm run build
   - Output Directory: dist
   - Development Command: npm run dev

6. Configure environment variables:
   ```bash
   vercel env add VITE_API_URL
   # Enter your Render backend URL + /api
   
   vercel env add VITE_STRIPE_PUBLISHABLE_KEY
   # Enter your Stripe Publishable Key
   ```

7. Redeploy with environment variables:
   ```bash
   vercel --prod
   ```

## Step 4: Configure Custom Domain (Optional)

1. In your Vercel dashboard, go to your project
2. Click on "Settings" > "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure your DNS settings

## Step 5: Test Your Deployment

1. Visit your Vercel deployment URL
2. Test user registration and login
3. Test product browsing and cart functionality
4. Test the checkout process with Stripe's test cards
5. Verify that the frontend can communicate with the backend API

## Step 6: Set Up Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository. Whenever you push changes to your main branch, Vercel will automatically rebuild and deploy your frontend.

To customize this behavior:
1. Go to your project in the Vercel dashboard
2. Click on "Settings" > "Git"
3. Configure your production branch and deployment settings

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