const nodemailer = require('nodemailer');
const User = require('../models/User');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Email templates
const emailTemplates = {
  orderConfirmation: (order, user) => {
    const itemsList = order.orderItems.map(item => 
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
          ${item.name}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Kirana Project</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h1 style="color: #28a745; margin-bottom: 30px;">Order Confirmed!</h1>
          
          <p>Dear ${user.name},</p>
          <p>Thank you for your order! We're excited to get your items to you.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber || order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            ${order.estimatedDeliveryDate ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>` : ''}
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Summary</h3>
            <table style="width: 100%;">
              <tr>
                <td>Subtotal:</td>
                <td style="text-align: right;">₹${order.itemsPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td style="text-align: right;">₹${order.shippingPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tax:</td>
                <td style="text-align: right;">₹${order.taxPrice.toFixed(2)}</td>
              </tr>
              ${order.couponDiscount > 0 ? `
              <tr style="color: #28a745;">
                <td>Discount (${order.couponCode}):</td>
                <td style="text-align: right;">-₹${order.couponDiscount.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr style="font-weight: bold; font-size: 1.2em; border-top: 2px solid #dee2e6;">
                <td>Total:</td>
                <td style="text-align: right;">₹${order.totalPrice.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Shipping Address</h3>
            <p>
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}<br>
              Phone: ${order.shippingAddress.phone}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p>You can track your order status in your account dashboard.</p>
            <a href="${process.env.CLIENT_URL}/order/${order._id}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Order</a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">
            <p>Thanks for shopping with Kirana Project!</p>
            <p>If you have any questions, contact us at ${process.env.SUPPORT_EMAIL || 'support@kiranaproject.com'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  statusUpdate: (order, user, message) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Update - Kirana Project</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h1 style="color: #28a745; margin-bottom: 30px;">Order Update</h1>
          
          <p>Dear ${user.name},</p>
          <p>We have an update on your order:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Order #${order.orderNumber || order._id}</h2>
            <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            <p><strong>Update:</strong> ${message}</p>
            ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
            ${order.deliveryPartner ? `<p><strong>Delivery Partner:</strong> ${order.deliveryPartner}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/order/${order._id}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order Details</a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">
            <p>Thanks for shopping with Kirana Project!</p>
            <p>If you have any questions, contact us at ${process.env.SUPPORT_EMAIL || 'support@kiranaproject.com'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  welcomeEmail: (user) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Kirana Project</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h1 style="color: #28a745; margin-bottom: 30px;">Welcome to Kirana Project!</h1>
          
          <p>Dear ${user.name},</p>
          <p>Welcome to Kirana Project! We're excited to have you as part of our community.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Get Started</h3>
            <ul>
              <li>Browse our wide selection of groceries and household items</li>
              <li>Enjoy free delivery on orders above ₹500</li>
              <li>Track your orders in real-time</li>
              <li>Save your favorite items for quick reordering</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/products" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Shopping</a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">
            <p>Happy shopping!</p>
            <p>The Kirana Project Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  passwordReset: (user, resetToken) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Kirana Project</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h1 style="color: #28a745; margin-bottom: 30px;">Password Reset Request</h1>
          
          <p>Dear ${user.name},</p>
          <p>You requested a password reset for your Kirana Project account.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404;">
            <p><strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">
            <p>The Kirana Project Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (userEmail, order) => {
  try {
    const transporter = createTransporter();
    
    const user = await User.findById(order.user);
    
    const mailOptions = {
      from: `"Kirana Project" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: `Order Confirmation - #${order.orderNumber || order._id}`,
      html: emailTemplates.orderConfirmation(order, user)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (userEmail, order, message) => {
  try {
    const transporter = createTransporter();
    
    const user = await User.findById(order.user);
    
    const mailOptions = {
      from: `"Kirana Project" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: `Order Update - #${order.orderNumber || order._id}`,
      html: emailTemplates.statusUpdate(order, user, message)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Kirana Project" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: 'Welcome to Kirana Project!',
      html: emailTemplates.welcomeEmail(user)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, user, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Kirana Project" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: 'Password Reset Request - Kirana Project',
      html: emailTemplates.passwordReset(user, resetToken)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send bulk promotional email
const sendBulkEmail = async (recipients, subject, template, data) => {
  try {
    const transporter = createTransporter();
    
    const promises = recipients.map(async (recipient) => {
      const mailOptions = {
        from: `"Kirana Project" <${process.env.SMTP_EMAIL}>`,
        to: recipient.email,
        subject,
        html: template({ ...data, user: recipient })
      };

      return transporter.sendMail(mailOptions);
    });

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    console.log(`Bulk email sent: ${successful} successful, ${failed} failed`);
    return { successful, failed, results };
  } catch (error) {
    console.error('Error sending bulk email:', error);
    throw error;
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBulkEmail,
  testEmailConfig,
  emailTemplates
};