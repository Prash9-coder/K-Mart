import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount, orderId, metadata } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: 'inr',
      metadata: {
        orderId: orderId,
        userId: req.user._id.toString(),
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
});

// @desc    Confirm payment
// @route   POST /api/payments/confirm-payment
// @access  Private
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert back to rupees
        currency: paymentIntent.currency,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ 
      message: 'Failed to confirm payment',
      error: error.message 
    });
  }
});

// @desc    Get payment methods
// @route   GET /api/payments/payment-methods
// @access  Private
router.get('/payment-methods', protect, async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay securely with your card',
        icon: 'credit-card',
        enabled: true
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay using UPI apps',
        icon: 'smartphone',
        enabled: true
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'Pay through your bank account',
        icon: 'bank',
        enabled: true
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: 'cash',
        enabled: true
      }
    ];

    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ 
      message: 'Failed to fetch payment methods',
      error: error.message 
    });
  }
});

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private/Admin
router.post('/refund', protect, async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
      reason: reason || 'requested_by_customer'
    });

    res.status(200).json({
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        reason: refund.reason,
        created: refund.created
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ 
      message: 'Failed to process refund',
      error: error.message 
    });
  }
});

export default router;