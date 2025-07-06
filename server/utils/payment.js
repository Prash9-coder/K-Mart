const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
const createRazorpayOrder = async (amount, currency = 'INR', receipt = null) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency,
      receipt: receipt || `order_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    return {
      success: true,
      order
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify Razorpay payment signature
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment
    };
  } catch (error) {
    console.error('Get payment details error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Capture payment
const capturePayment = async (paymentId, amount) => {
  try {
    const payment = await razorpay.payments.capture(paymentId, Math.round(amount * 100));
    return {
      success: true,
      payment
    };
  } catch (error) {
    console.error('Payment capture error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Refund payment
const refundPayment = async (paymentId, amount = null, speed = 'normal') => {
  try {
    const refundData = {
      speed,
      receipt: `refund_${Date.now()}`
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    return {
      success: true,
      refund
    };
  } catch (error) {
    console.error('Payment refund error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get refund details
const getRefundDetails = async (refundId) => {
  try {
    const refund = await razorpay.refunds.fetch(refundId);
    return {
      success: true,
      refund
    };
  } catch (error) {
    console.error('Get refund details error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create customer
const createCustomer = async (name, email, phone) => {
  try {
    const customer = await razorpay.customers.create({
      name,
      email,
      contact: phone
    });
    return {
      success: true,
      customer
    };
  } catch (error) {
    console.error('Customer creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Process COD payment (Cash on Delivery)
const processCODPayment = (orderData) => {
  return {
    success: true,
    paymentMethod: 'COD',
    transactionId: `cod_${Date.now()}`,
    status: 'pending',
    amount: orderData.amount,
    currency: 'INR',
    message: 'Cash on Delivery order placed successfully'
  };
};

// Process UPI payment simulation
const processUPIPayment = async (orderData, upiId) => {
  try {
    // This is a simulation - in real implementation, integrate with UPI payment gateway
    const transactionId = `upi_${Date.now()}`;
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success/failure (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      return {
        success: true,
        paymentMethod: 'UPI',
        transactionId,
        status: 'completed',
        amount: orderData.amount,
        currency: 'INR',
        upiId,
        message: 'UPI payment completed successfully'
      };
    } else {
      return {
        success: false,
        paymentMethod: 'UPI',
        transactionId,
        status: 'failed',
        amount: orderData.amount,
        currency: 'INR',
        upiId,
        message: 'UPI payment failed'
      };
    }
  } catch (error) {
    console.error('UPI payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Process wallet payment simulation
const processWalletPayment = async (orderData, walletType) => {
  try {
    // This is a simulation - in real implementation, integrate with wallet APIs
    const transactionId = `wallet_${Date.now()}`;
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success/failure (95% success rate for demo)
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      return {
        success: true,
        paymentMethod: `Wallet (${walletType})`,
        transactionId,
        status: 'completed',
        amount: orderData.amount,
        currency: 'INR',
        walletType,
        message: `${walletType} wallet payment completed successfully`
      };
    } else {
      return {
        success: false,
        paymentMethod: `Wallet (${walletType})`,
        transactionId,
        status: 'failed',
        amount: orderData.amount,
        currency: 'INR',
        walletType,
        message: `${walletType} wallet payment failed`
      };
    }
  } catch (error) {
    console.error('Wallet payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Validate payment method
const validatePaymentMethod = (paymentMethod) => {
  const validMethods = ['COD', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet'];
  return validMethods.includes(paymentMethod);
};

// Calculate payment fees
const calculatePaymentFees = (amount, paymentMethod) => {
  let fees = 0;
  
  switch (paymentMethod) {
    case 'Credit Card':
    case 'Debit Card':
      fees = Math.max(amount * 0.02, 5); // 2% or ₹5 minimum
      break;
    case 'UPI':
      fees = 0; // UPI is free for customers
      break;
    case 'Net Banking':
      fees = Math.max(amount * 0.015, 3); // 1.5% or ₹3 minimum
      break;
    case 'Wallet':
      fees = 0; // Wallet payments are usually free
      break;
    case 'COD':
      fees = 25; // Fixed COD charges
      break;
    default:
      fees = 0;
  }
  
  return Math.round(fees * 100) / 100; // Round to 2 decimal places
};

// Generate payment link
const generatePaymentLink = async (orderData, customerInfo) => {
  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(orderData.amount * 100),
      currency: 'INR',
      accept_partial: false,
      description: `Payment for Order #${orderData.orderId}`,
      customer: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
      callback_method: 'get',
      expire_by: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    });

    return {
      success: true,
      paymentLink
    };
  } catch (error) {
    console.error('Payment link generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Process payment based on method
const processPayment = async (paymentData) => {
  try {
    const { paymentMethod, orderData, additionalInfo = {} } = paymentData;

    if (!validatePaymentMethod(paymentMethod)) {
      return {
        success: false,
        message: 'Invalid payment method'
      };
    }

    switch (paymentMethod) {
      case 'COD':
        return processCODPayment(orderData);
      
      case 'UPI':
        return await processUPIPayment(orderData, additionalInfo.upiId);
      
      case 'Wallet':
        return await processWalletPayment(orderData, additionalInfo.walletType);
      
      case 'Credit Card':
      case 'Debit Card':
      case 'Net Banking':
        // For card and net banking, create Razorpay order
        const razorpayOrder = await createRazorpayOrder(
          orderData.amount,
          'INR',
          `order_${orderData.orderId}`
        );
        
        if (razorpayOrder.success) {
          return {
            success: true,
            paymentMethod,
            razorpayOrderId: razorpayOrder.order.id,
            amount: orderData.amount,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID,
            message: 'Razorpay order created successfully'
          };
        } else {
          return {
            success: false,
            message: 'Failed to create payment order'
          };
        }
      
      default:
        return {
          success: false,
          message: 'Payment method not supported'
        };
    }
  } catch (error) {
    console.error('Process payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getPaymentDetails,
  capturePayment,
  refundPayment,
  getRefundDetails,
  createCustomer,
  processCODPayment,
  processUPIPayment,
  processWalletPayment,
  validatePaymentMethod,
  calculatePaymentFees,
  generatePaymentLink,
  processPayment
};