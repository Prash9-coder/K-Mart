import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment variable or use the one from .env
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                       process.env.STRIPE_PUBLISHABLE_KEY || 
                       'pk_test_51YOUR_STRIPE_PUBLISHABLE_KEY';

// Initialize Stripe
const stripePromise = loadStripe(publishableKey);

export default stripePromise;