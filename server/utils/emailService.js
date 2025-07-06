import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Dear ${user.name},</p>
          <p>Thank you for your order! We've received your order and it's being processed.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333;">Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
          </div>

          <h3 style="color: #333;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantity</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems.map(item => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333;">Shipping Address</h3>
            <p>
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}<br>
              Phone: ${order.shippingAddress.phone}
            </p>
          </div>

          <p>We'll send you another email with tracking information once your order ships.</p>
          <p>If you have any questions about your order, please contact us at support@kstore.com</p>
          
          <p>Thank you for shopping with K-Store Cart!</p>
          <p>Best regards,<br>The K-Store Cart Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

// Send order status update email
export const sendOrderStatusUpdateEmail = async (order, user, oldStatus, newStatus) => {
  try {
    const transporter = createTransporter();

    const getStatusMessage = (status) => {
      switch (status) {
        case 'confirmed':
          return 'Your order has been confirmed and is being prepared.';
        case 'processing':
          return 'Your order is being processed and will be shipped soon.';
        case 'shipped':
          return 'Your order has been shipped and is on its way to you.';
        case 'delivered':
          return 'Your order has been delivered successfully.';
        case 'cancelled':
          return 'Your order has been cancelled.';
        default:
          return 'Your order status has been updated.';
      }
    };

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: `Order Status Update - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Status Update</h2>
          <p>Dear ${user.name},</p>
          <p>${getStatusMessage(newStatus)}</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333;">Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Current Status:</strong> <span style="color: #28a745; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
            ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
            ${order.deliveryPartner ? `<p><strong>Delivery Partner:</strong> ${order.deliveryPartner}</p>` : ''}
          </div>

          ${newStatus === 'delivered' ? `
            <p>We hope you're satisfied with your purchase. Please consider leaving a review for the products you bought.</p>
          ` : ''}

          <p>You can track your order status anytime by logging into your account.</p>
          <p>If you have any questions, please contact us at support@kstore.com</p>
          
          <p>Thank you for choosing K-Store Cart!</p>
          <p>Best regards,<br>The K-Store Cart Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order status update email sent successfully');
  } catch (error) {
    console.error('Error sending order status update email:', error);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Dear ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          
          <p>Best regards,<br>The K-Store Cart Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: 'Welcome to K-Store Cart!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to K-Store Cart!</h2>
          <p>Dear ${user.name},</p>
          <p>Welcome to K-Store Cart! We're excited to have you as part of our community.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333;">What's Next?</h3>
            <ul>
              <li>Browse our wide selection of products</li>
              <li>Add items to your cart and checkout securely</li>
              <li>Track your orders in real-time</li>
              <li>Enjoy fast delivery to your doorstep</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Shopping
            </a>
          </div>

          <p>If you have any questions, feel free to contact us at support@kstore.com</p>
          
          <p>Happy Shopping!</p>
          <p>Best regards,<br>The K-Store Cart Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};