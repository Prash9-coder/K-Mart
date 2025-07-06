import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class SMSService {
  constructor() {
    // Configure your SMS provider (Twilio, TextLocal, MSG91, etc.)
    this.apiKey = process.env.SMS_API_KEY;
    this.senderId = process.env.SMS_SENDER_ID || 'KIRANA';
    this.baseURL = process.env.SMS_API_URL || 'https://api.textlocal.in/send/';
  }

  async sendSMS(phoneNumber, message) {
    try {
      // Remove +91 if present and ensure 10 digits
      const cleanPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
      
      if (cleanPhone.length !== 10) {
        throw new Error('Invalid phone number format');
      }

      // Using TextLocal API format (adjust based on your SMS provider)
      const data = {
        apikey: this.apiKey,
        numbers: cleanPhone,
        message: message,
        sender: this.senderId
      };

      const response = await axios.post(this.baseURL, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.status === 'success') {
        console.log('SMS sent successfully:', response.data);
        return { success: true, messageId: response.data.message_id };
      } else {
        throw new Error(response.data.errors?.[0]?.message || 'SMS sending failed');
      }
    } catch (error) {
      console.error('SMS sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Order confirmation SMS
  async sendOrderConfirmation(phoneNumber, orderData) {
    const message = `🏪 Kirana Market
Order Confirmed! 
Order #${orderData.orderNumber}
Amount: ₹${orderData.totalPrice}
Delivery in 2-4 hours
Track: kiranamarket.com/track/${orderData.orderNumber}
Call: +91-9876543210`;

    return await this.sendSMS(phoneNumber, message);
  }

  // Order status update SMS
  async sendOrderStatusUpdate(phoneNumber, orderData, status) {
    let message = '';
    
    switch (status) {
      case 'confirmed':
        message = `🏪 Order #${orderData.orderNumber} confirmed! Preparing your items. Delivery in 2-4 hours.`;
        break;
      case 'shipped':
        message = `🚚 Order #${orderData.orderNumber} is out for delivery! Your delivery boy ${orderData.deliveryBoy?.name} will reach you soon.`;
        break;
      case 'delivered':
        message = `✅ Order #${orderData.orderNumber} delivered successfully! Thank you for shopping with Kirana Market. Rate us: kiranamarket.com/rate`;
        break;
      case 'cancelled':
        message = `❌ Order #${orderData.orderNumber} has been cancelled. Amount will be refunded if paid online. Call +91-9876543210 for queries.`;
        break;
      default:
        message = `📦 Order #${orderData.orderNumber} status updated to: ${status}`;
    }

    return await this.sendSMS(phoneNumber, message);
  }

  // Credit account approved SMS
  async sendCreditApproval(phoneNumber, customerData) {
    const message = `🎉 Kirana Market
Credit Account Approved!
Limit: ₹${customerData.creditLimit.toLocaleString()}
Start shopping with "Pay Later" option
Welcome to our credit family!`;

    return await this.sendSMS(phoneNumber, message);
  }

  // Payment reminder SMS
  async sendPaymentReminder(phoneNumber, customerData) {
    const message = `💳 Kirana Market
Payment Reminder
Outstanding: ₹${customerData.currentBalance.toLocaleString()}
Pay at store or UPI: kiranamarket@upi
Call: +91-9876543210`;

    return await this.sendSMS(phoneNumber, message);
  }

  // Payment received SMS
  async sendPaymentReceived(phoneNumber, paymentData) {
    const message = `✅ Kirana Market
Payment Received: ₹${paymentData.amount.toLocaleString()}
New Balance: ₹${paymentData.newBalance.toLocaleString()}
Thank you for your payment!
Receipt: kiranamarket.com/receipt/${paymentData.transactionId}`;

    return await this.sendSMS(phoneNumber, message);
  }

  // Low stock alert for admin
  async sendLowStockAlert(phoneNumber, itemCount) {
    const message = `⚠️ Kirana Market
Low Stock Alert!
${itemCount} items need restocking
Check admin panel: kiranamarket.com/admin
Immediate action required`;

    return await this.sendSMS(phoneNumber, message);
  }

  // Delivery boy assignment SMS
  async sendDeliveryAssignment(phoneNumber, orderData) {
    const message = `🚚 Kirana Market
New Delivery Assignment
Order #${orderData.orderNumber}
Customer: ${orderData.customerName}
Address: ${orderData.shippingAddress.address}
Amount: ₹${orderData.totalPrice}
Accept in app`;

    return await this.sendSMS(phoneNumber, message);
  }

  // OTP SMS
  async sendOTP(phoneNumber, otp) {
    const message = `🏪 Kirana Market
Your OTP: ${otp}
Valid for 10 minutes
Do not share with anyone
Call +91-9876543210 for help`;

    return await this.sendSMS(phoneNumber, message);
  }

  // Welcome SMS for new customers
  async sendWelcome(phoneNumber, customerName) {
    const message = `🏪 Welcome to Kirana Market, ${customerName}!
Your neighborhood store is now digital
Download app: kiranamarket.com/app
First order discount: WELCOME10
Happy shopping! 🛒`;

    return await this.sendSMS(phoneNumber, message);
  }

  // Bulk SMS for promotions
  async sendBulkPromotion(phoneNumbers, promotionData) {
    const message = `🏪 Kirana Market
${promotionData.title}
${promotionData.description}
Valid till: ${promotionData.validTill}
Code: ${promotionData.code}
Shop now: kiranamarket.com`;

    const results = [];
    for (const phoneNumber of phoneNumbers) {
      const result = await this.sendSMS(phoneNumber, message);
      results.push({ phoneNumber, ...result });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }
}

export default new SMSService();