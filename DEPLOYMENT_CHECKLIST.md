# Kirana Market Deployment Checklist

Use this checklist to ensure your application is properly prepared for production deployment.

## Pre-Deployment Tasks

### Backend (Server)

- [ ] Update all environment variables in `.env` file with production values
- [ ] Remove any test or mock data
- [ ] Ensure MongoDB connection string points to production database
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS settings to allow only your production domain
- [ ] Set up proper error logging
- [ ] Run `node deploy.js` to verify deployment readiness

### Frontend (Client)

- [ ] Update API URL in `.env` file to point to production backend
- [ ] Update Stripe publishable key to production key
- [ ] Remove any test or mock components
- [ ] Optimize images and assets
- [ ] Run `node deploy.js` to verify deployment readiness
- [ ] Build the application with `npm run build`

## Deployment Tasks

### Backend Deployment

- [ ] Set up a production-ready server (AWS, DigitalOcean, Heroku, etc.)
- [ ] Install Node.js and npm
- [ ] Set up process manager (PM2, Forever, etc.)
- [ ] Configure firewall to allow only necessary ports
- [ ] Set up SSL certificate for HTTPS
- [ ] Configure reverse proxy (Nginx, Apache, etc.)
- [ ] Set up database backups
- [ ] Configure monitoring and alerts

### Frontend Deployment

- [ ] Choose a hosting provider (Netlify, Vercel, AWS S3, etc.)
- [ ] Upload the built files from the `dist` directory
- [ ] Configure custom domain
- [ ] Set up SSL certificate for HTTPS
- [ ] Configure caching headers
- [ ] Set up CDN (if applicable)

## Post-Deployment Tasks

- [ ] Test all features in the production environment
- [ ] Verify payment processing works correctly
- [ ] Check mobile responsiveness
- [ ] Test admin dashboard functionality
- [ ] Monitor server logs for errors
- [ ] Set up uptime monitoring
- [ ] Create backup and recovery plan
- [ ] Document deployment process for future reference

## Security Checklist

- [ ] Ensure all API keys and secrets are properly secured
- [ ] Implement rate limiting for API endpoints
- [ ] Set up proper authentication and authorization
- [ ] Configure secure HTTP headers
- [ ] Implement input validation
- [ ] Set up regular security audits
- [ ] Keep dependencies up to date