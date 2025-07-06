import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class WhatsAppService {
  constructor() {
    // WhatsApp Business API configuration
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  }

  async sendMessage(to, message, type = 'text') {
    try {
      // Remove +91 if present and add country code
      const cleanPhone = to.replace(/^\+/, '').replace(/^91/, '');
      const phoneNumber = `91${cleanPhone}`;

      const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: type,
        text: {
          body: message
        }
      };

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('WhatsApp message sent:', response.data);
      return { 
        success: true, 
        messageId: response.data.messages[0].id,
        whatsappId: response.data.messages[0].wamid 
      };
    } catch (error) {
      console.error('WhatsApp message failed:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  async sendTemplate(to, templateName, templateParams = []) {
    try {
      const cleanPhone = to.replace(/^\+/, '').replace(/^91/, '');
      const phoneNumber = `91${cleanPhone}`;

      const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en'
          },
          components: [
            {
              type: 'body',
              parameters: templateParams.map(param => ({
                type: 'text',
                text: param
              }))
            }
          ]
        }
      };

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { 
        success: true, 
        messageId: response.data.messages[0].id 
      };
    } catch (error) {
      console.error('WhatsApp template failed:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  // Order confirmation via WhatsApp
  async sendOrderConfirmation(phoneNumber, orderData) {
    const message = `🏪 *Kirana Market*

✅ *Order Confirmed!*

*Order Details:*
📋 Order #: ${orderData.orderNumber}
💰 Amount: ₹${orderData.totalPrice}
📅 Date: ${new Date(orderData.createdAt).toLocaleDateString()}

*Items Ordered:*
${orderData.orderItems.map(item => 
  `• ${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

*Delivery Address:*
📍 ${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.zipCode}

⏰ *Estimated Delivery:* 2-4 hours
📞 *Contact:* +91-9876543210

Thank you for choosing Kirana Market! 🛒`;

    return await this.sendMessage(phoneNumber, message);
  }

  // Order status update via WhatsApp
  async sendOrderStatusUpdate(phoneNumber, orderData, status) {
    let message = '';
    
    switch (status) {
      case 'confirmed':
        message = `🏪 *Kirana Market*

✅ Order #${orderData.orderNumber} confirmed!

We're preparing your items for delivery.
⏰ Expected delivery: 2-4 hours

Track your order: kiranamarket.com/track/${orderData.orderNumber}`;
        break;
        
      case 'shipped':
        message = `🏪 *Kirana Market*

🚚 *Order Out for Delivery!*

Order #${orderData.orderNumber} is on the way!
🏃‍♂️ Delivery Boy: ${orderData.deliveryBoy?.name || 'Our team'}
📞 Contact: ${orderData.deliveryBoy?.phone || '+91-9876543210'}

Please be available to receive your order.`;
        break;
        
      case 'delivered':
        message = `🏪 *Kirana Market*

✅ *Order Delivered Successfully!*

Order #${orderData.orderNumber} has been delivered.
💰 Amount: ₹${orderData.totalPrice}

Thank you for shopping with us! 🙏
Rate your experience: kiranamarket.com/rate/${orderData.orderNumber}`;
        break;
        
      case 'cancelled':
        message = `🏪 *Kirana Market*

❌ *Order Cancelled*

Order #${orderData.orderNumber} has been cancelled.
💰 Refund will be processed if payment was made online.

For queries, contact: +91-9876543210
We apologize for any inconvenience.`;
        break;
    }

    return await this.sendMessage(phoneNumber, message);
  }

  // WhatsApp order quote
  async sendOrderQuote(phoneNumber, quoteData) {
    const message = `🏪 *Kirana Market*

🛒 *Your Order Quote*

${quoteData.items.map((item, index) => 
  `${index + 1}. *${item.name}*\n   Qty: ${item.quantity} × ₹${item.price} = ₹${item.total}`
).join('\n\n')}

💰 *Subtotal:* ₹${quoteData.subtotal}
🚚 *Delivery:* ₹${quoteData.deliveryCharge}
*Total: ₹${quoteData.total}*

⏰ *Quote valid until:* ${new Date(quoteData.validUntil).toLocaleString()}

Reply with:
✅ *YES* to confirm order
❌ *NO* to cancel
📝 *MODIFY* to make changes

Thank you! 🙏`;

    return await this.sendMessage(phoneNumber, message);
  }

  // Credit account approved
  async sendCreditApproval(phoneNumber, customerData) {
    const message = `🏪 *Kirana Market*

🎉 *Credit Account Approved!*

Congratulations ${customerData.name}! Your credit account is now active.

💳 *Credit Details:*
• Credit Limit: ₹${customerData.creditLimit.toLocaleString()}
• Current Balance: ₹0
• Available Credit: ₹${customerData.creditLimit.toLocaleString()}

*How to use:*
1. Shop normally on our app/website
2. Choose "Pay Later" at checkout
3. Pay your balance anytime at store

Welcome to our credit family! 🤝`;

    return await this.sendMessage(phoneNumber, message);
  }

  // Payment reminder
  async sendPaymentReminder(phoneNumber, customerData) {
    const message = `🏪 *Kirana Market*

💳 *Payment Reminder*

Dear ${customerData.name},

Your current outstanding balance:
💰 *₹${customerData.currentBalance.toLocaleString()}*

*Payment Options:*
🏪 Visit our store
💳 UPI: kiranamarket@upi
📞 Call: +91-9876543210

Thank you for your prompt payment! 🙏`;

    return await this.sendMessage(phoneNumber, message);
  }

  // Payment received confirmation
  async sendPaymentReceived(phoneNumber, paymentData) {
    const message = `🏪 *Kirana Market*

✅ *Payment Received*

Thank you for your payment!

💰 *Amount Paid:* ₹${paymentData.amount.toLocaleString()}
💳 *New Balance:* ₹${paymentData.newBalance.toLocaleString()}
📅 *Date:* ${new Date().toLocaleDateString()}

Receipt: kiranamarket.com/receipt/${paymentData.transactionId}

Thank you for being a valued customer! 🙏`;

    return await this.sendMessage(phoneNumber, message);
  }

  // Welcome message for new customers
  async sendWelcome(phoneNumber, customerName) {
    const message = `🏪 *Welcome to Kirana Market!*

Hello ${customerName}! 👋

Your neighborhood store is now digital! 📱

🎁 *Special Welcome Offer:*
Get 10% off on your first order
Code: *WELCOME10*

📱 Download our app: kiranamarket.com/app
🛒 Start shopping: kiranamarket.com

Need help? Just reply to this message!
📞 Call: +91-9876543210

Happy shopping! 🛒✨`;

    return await this.sendMessage(phoneNumber, message);
  }

  // Promotional messages
  async sendPromotion(phoneNumber, promotionData) {
    const message = `🏪 *Kirana Market*

🎉 *${promotionData.title}*

${promotionData.description}

💰 *Offer:* ${promotionData.discount}
🏷️ *Code:* ${promotionData.code}
⏰ *Valid till:* ${promotionData.validTill}

Shop now: kiranamarket.com
📞 Call: +91-9876543210

Don't miss out! 🏃‍♂️💨`;

    return await this.sendMessage(phoneNumber, message);
  }

  // Bulk WhatsApp messages
  async sendBulkMessage(phoneNumbers, message) {
    const results = [];
    
    for (const phoneNumber of phoneNumbers) {
      const result = await this.sendMessage(phoneNumber, message);
      results.push({ phoneNumber, ...result });
      
      // Add delay to avoid rate limiting (WhatsApp has strict limits)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  // Handle incoming WhatsApp messages (webhook)
  async handleIncomingMessage(messageData) {
    try {
      const { from, text, timestamp, id } = messageData;
      
      // Process the incoming message
      // This would typically trigger order processing, customer service, etc.
      
      console.log('Incoming WhatsApp message:', {
        from,
        text: text.body,
        timestamp,
        messageId: id
      });

      return {
        success: true,
        processed: true,
        messageId: id
      };
    } catch (error) {
      console.error('Error processing incoming WhatsApp message:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new WhatsAppService();