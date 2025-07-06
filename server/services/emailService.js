import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use app password for Gmail
      },
    });
  }

  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: `"Kirana Market" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Order confirmation email
  async sendOrderConfirmation(customerEmail, orderData) {
    const subject = `Order Confirmation - ${orderData.orderNumber}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #4F46E5; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏪 Kirana Market</h1>
            <h2>Order Confirmation</h2>
          </div>
          <div class="content">
            <p>Dear ${orderData.customerName},</p>
            <p>Thank you for your order! We're preparing your items for delivery.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
              <p><strong>Delivery Address:</strong> ${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}</p>
              
              <h4>Items Ordered:</h4>
              ${orderData.orderItems.map(item => `
                <div class="item">
                  <span>${item.name} x ${item.quantity}</span>
                  <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              
              <div class="item total">
                <span>Total Amount</span>
                <span>₹${orderData.totalPrice}</span>
              </div>
            </div>
            
            <p>Your order will be delivered within 2-4 hours. You'll receive updates via SMS and WhatsApp.</p>
            <p>For any queries, call us at: <strong>+91-9876543210</strong></p>
          </div>
          <div class="footer">
            <p>Thank you for choosing Kirana Market!</p>
            <p>Your neighborhood store, now digital 🛒</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(customerEmail, subject, html);
  }

  // Credit account approved email
  async sendCreditApproval(customerEmail, customerData) {
    const subject = 'Credit Account Approved - Kirana Market';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .credit-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #10B981; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏪 Kirana Market</h1>
            <h2>Credit Account Approved! 🎉</h2>
          </div>
          <div class="content">
            <p>Dear ${customerData.name},</p>
            <p>Great news! Your credit account has been approved.</p>
            
            <div class="credit-info">
              <h3>Credit Account Details</h3>
              <p><strong>Credit Limit:</strong> ₹${customerData.creditLimit.toLocaleString()}</p>
              <p><strong>Current Balance:</strong> ₹0</p>
              <p><strong>Available Credit:</strong> ₹${customerData.creditLimit.toLocaleString()}</p>
            </div>
            
            <p><strong>How to use your credit:</strong></p>
            <ul>
              <li>Shop normally and choose "Pay Later" at checkout</li>
              <li>Your purchases will be added to your credit balance</li>
              <li>Pay your balance anytime at the store or online</li>
              <li>Maintain good payment history to increase your limit</li>
            </ul>
            
            <p>Thank you for being a valued customer!</p>
          </div>
          <div class="footer">
            <p>Questions? Call us at: <strong>+91-9876543210</strong></p>
            <p>Kirana Market - Your trusted neighborhood store</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(customerEmail, subject, html);
  }

  // Low stock alert email
  async sendLowStockAlert(adminEmail, lowStockItems) {
    const subject = `Low Stock Alert - ${lowStockItems.length} items need attention`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .alert-item { background: white; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #F59E0B; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Stock Alert</h1>
            <h2>Kirana Market Inventory</h2>
          </div>
          <div class="content">
            <p>The following items are running low and need restocking:</p>
            
            ${lowStockItems.map(item => `
              <div class="alert-item">
                <h4>${item.product.name}</h4>
                <p><strong>Current Stock:</strong> ${item.currentStock} ${item.product.unit}</p>
                <p><strong>Minimum Level:</strong> ${item.minStockLevel} ${item.product.unit}</p>
                <p><strong>Suggested Reorder:</strong> ${item.reorderQuantity} ${item.product.unit}</p>
              </div>
            `).join('')}
            
            <p>Please restock these items to avoid stockouts.</p>
          </div>
          <div class="footer">
            <p>Kirana Market Inventory Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(adminEmail, subject, html);
  }

  // Payment reminder email
  async sendPaymentReminder(customerEmail, customerData) {
    const subject = 'Payment Reminder - Kirana Market';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .payment-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #EF4444; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Reminder</h1>
            <h2>Kirana Market</h2>
          </div>
          <div class="content">
            <p>Dear ${customerData.name},</p>
            <p>This is a friendly reminder about your outstanding balance.</p>
            
            <div class="payment-info">
              <h3>Account Summary</h3>
              <p><strong>Outstanding Balance:</strong> ₹${customerData.currentBalance.toLocaleString()}</p>
              <p><strong>Credit Limit:</strong> ₹${customerData.creditLimit.toLocaleString()}</p>
              <p><strong>Available Credit:</strong> ₹${(customerData.creditLimit - customerData.currentBalance).toLocaleString()}</p>
            </div>
            
            <p><strong>Payment Options:</strong></p>
            <ul>
              <li>Visit our store and pay in cash</li>
              <li>Pay via UPI: <strong>kiranamarket@upi</strong></li>
              <li>Bank transfer (contact us for details)</li>
            </ul>
            
            <p>Thank you for your prompt attention to this matter.</p>
          </div>
          <div class="footer">
            <p>Questions? Call us at: <strong>+91-9876543210</strong></p>
            <p>Kirana Market - Your trusted neighborhood store</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(customerEmail, subject, html);
  }
}

export default new EmailService();