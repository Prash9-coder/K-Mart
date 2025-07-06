import Razorpay from 'razorpay';
import Stripe from 'stripe';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

class PaymentService {
  constructor() {
    // Initialize Razorpay
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    });

    // Initialize Stripe
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  // Razorpay Methods
  async createRazorpayOrder(amount, currency = 'INR', receipt) {
    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt,
        payment_capture: 1
      };

      const order = await this.razorpay.orders.create(options);
      console.log('Razorpay order created:', order);
      
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      };
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyRazorpayPayment(paymentId, orderId, signature) {
    try {
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === signature;
      
      if (isAuthentic) {
        // Fetch payment details
        const payment = await this.razorpay.payments.fetch(paymentId);
        
        return {
          success: true,
          verified: true,
          payment: {
            id: payment.id,
            amount: payment.amount / 100, // Convert back to rupees
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            createdAt: new Date(payment.created_at * 1000)
          }
        };
      } else {
        return {
          success: false,
          verified: false,
          error: 'Payment signature verification failed'
        };
      }
    } catch (error) {
      console.error('Razorpay payment verification failed:', error);
      return { success: false, error: error.message };
    }
  }

  async captureRazorpayPayment(paymentId, amount) {
    try {
      const payment = await this.razorpay.payments.capture(paymentId, amount * 100);
      
      return {
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount / 100,
          status: payment.status
        }
      };
    } catch (error) {
      console.error('Razorpay payment capture failed:', error);
      return { success: false, error: error.message };
    }
  }

  async refundRazorpayPayment(paymentId, amount, reason = 'Customer request') {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount * 100,
        notes: { reason }
      });

      return {
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          createdAt: new Date(refund.created_at * 1000)
        }
      };
    } catch (error) {
      console.error('Razorpay refund failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Stripe Methods
  async createStripePaymentIntent(amount, currency = 'inr', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Stripe expects amount in smallest currency unit
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async confirmStripePayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        payment: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          paymentMethod: paymentIntent.payment_method
        }
      };
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async refundStripePayment(paymentIntentId, amount, reason = 'requested_by_customer') {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount * 100,
        reason
      });

      return {
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          reason: refund.reason
        }
      };
    } catch (error) {
      console.error('Stripe refund failed:', error);
      return { success: false, error: error.message };
    }
  }

  // UPI Payment Methods (for Indian market)
  async generateUPIQRCode(amount, merchantId, merchantName, transactionRef) {
    try {
      // Generate UPI payment string
      const upiString = `upi://pay?pa=${merchantId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tr=${transactionRef}&tn=${encodeURIComponent('Kirana Market Payment')}`;
      
      return {
        success: true,
        upiString,
        qrCodeData: upiString,
        amount,
        transactionRef
      };
    } catch (error) {
      console.error('UPI QR code generation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Cash on Delivery
  async processCODPayment(orderId, amount, collectedBy) {
    try {
      // Record COD payment
      const codPayment = {
        orderId,
        amount,
        paymentMethod: 'cod',
        status: 'collected',
        collectedBy,
        collectedAt: new Date(),
        transactionId: `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      return {
        success: true,
        payment: codPayment
      };
    } catch (error) {
      console.error('COD payment processing failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Credit Payment (Udhar)
  async processCreditPayment(customerId, orderId, amount) {
    try {
      // This would integrate with your credit system
      const creditPayment = {
        customerId,
        orderId,
        amount,
        paymentMethod: 'credit',
        status: 'pending',
        createdAt: new Date(),
        transactionId: `CREDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      return {
        success: true,
        payment: creditPayment
      };
    } catch (error) {
      console.error('Credit payment processing failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Payment status check
  async getPaymentStatus(paymentId, provider = 'razorpay') {
    try {
      let payment;
      
      if (provider === 'razorpay') {
        payment = await this.razorpay.payments.fetch(paymentId);
        return {
          success: true,
          payment: {
            id: payment.id,
            amount: payment.amount / 100,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            createdAt: new Date(payment.created_at * 1000)
          }
        };
      } else if (provider === 'stripe') {
        payment = await this.stripe.paymentIntents.retrieve(paymentId);
        return {
          success: true,
          payment: {
            id: payment.id,
            amount: payment.amount / 100,
            currency: payment.currency,
            status: payment.status,
            paymentMethod: payment.payment_method
          }
        };
      }
    } catch (error) {
      console.error('Payment status check failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Webhook verification
  async verifyRazorpayWebhook(body, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Razorpay webhook verification failed:', error);
      return false;
    }
  }

  async verifyStripeWebhook(body, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return { success: true, event };
    } catch (error) {
      console.error('Stripe webhook verification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Payment analytics
  async getPaymentAnalytics(startDate, endDate) {
    try {
      // This would typically query your database for payment analytics
      // For now, returning mock data structure
      
      const analytics = {
        totalTransactions: 0,
        totalAmount: 0,
        successfulPayments: 0,
        failedPayments: 0,
        paymentMethods: {
          upi: 0,
          card: 0,
          netbanking: 0,
          wallet: 0,
          cod: 0,
          credit: 0
        },
        refunds: {
          count: 0,
          amount: 0
        }
      };

      return {
        success: true,
        analytics,
        period: { startDate, endDate }
      };
    } catch (error) {
      console.error('Payment analytics failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PaymentService();