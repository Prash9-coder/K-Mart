import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

class PushNotificationService {
  constructor() {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      try {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });

        console.log('Firebase Admin initialized successfully');
      } catch (error) {
        console.error('Firebase Admin initialization failed:', error.message);
      }
    }
  }

  async sendToDevice(deviceToken, notification, data = {}) {
    try {
      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#4F46E5',
            sound: 'default',
            channelId: 'kirana_market'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log('Push notification sent successfully:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Push notification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendToMultipleDevices(deviceTokens, notification, data = {}) {
    try {
      const message = {
        tokens: deviceTokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#4F46E5',
            sound: 'default',
            channelId: 'kirana_market'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await admin.messaging().sendMulticast(message);
      console.log('Bulk push notifications sent:', response);
      return { 
        success: true, 
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses 
      };
    } catch (error) {
      console.error('Bulk push notification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendToTopic(topic, notification, data = {}) {
    try {
      const message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#4F46E5',
            sound: 'default',
            channelId: 'kirana_market'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log('Topic notification sent successfully:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Topic notification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Order confirmation push notification
  async sendOrderConfirmation(deviceToken, orderData) {
    const notification = {
      title: '🛒 Order Confirmed!',
      body: `Order #${orderData.orderNumber} for ₹${orderData.totalPrice} confirmed. Delivery in 2-4 hours.`,
      imageUrl: 'https://kiranamarket.com/images/order-confirmed.png'
    };

    const data = {
      type: 'order_confirmation',
      orderId: orderData._id,
      orderNumber: orderData.orderNumber,
      screen: 'order_details'
    };

    return await this.sendToDevice(deviceToken, notification, data);
  }

  // Order status update push notification
  async sendOrderStatusUpdate(deviceToken, orderData, status) {
    let notification = {};
    
    switch (status) {
      case 'confirmed':
        notification = {
          title: '✅ Order Confirmed',
          body: `Order #${orderData.orderNumber} is being prepared for delivery.`,
          imageUrl: 'https://kiranamarket.com/images/order-confirmed.png'
        };
        break;
      case 'shipped':
        notification = {
          title: '🚚 Order Shipped',
          body: `Order #${orderData.orderNumber} is out for delivery!`,
          imageUrl: 'https://kiranamarket.com/images/order-shipped.png'
        };
        break;
      case 'delivered':
        notification = {
          title: '🎉 Order Delivered',
          body: `Order #${orderData.orderNumber} delivered successfully!`,
          imageUrl: 'https://kiranamarket.com/images/order-delivered.png'
        };
        break;
      case 'cancelled':
        notification = {
          title: '❌ Order Cancelled',
          body: `Order #${orderData.orderNumber} has been cancelled.`,
          imageUrl: 'https://kiranamarket.com/images/order-cancelled.png'
        };
        break;
    }

    const data = {
      type: 'order_status_update',
      orderId: orderData._id,
      orderNumber: orderData.orderNumber,
      status: status,
      screen: 'order_details'
    };

    return await this.sendToDevice(deviceToken, notification, data);
  }

  // Credit account approved push notification
  async sendCreditApproval(deviceToken, customerData) {
    const notification = {
      title: '🎉 Credit Approved!',
      body: `Your credit account with ₹${customerData.creditLimit.toLocaleString()} limit is now active!`,
      imageUrl: 'https://kiranamarket.com/images/credit-approved.png'
    };

    const data = {
      type: 'credit_approval',
      creditLimit: customerData.creditLimit.toString(),
      screen: 'credit_account'
    };

    return await this.sendToDevice(deviceToken, notification, data);
  }

  // Payment reminder push notification
  async sendPaymentReminder(deviceToken, customerData) {
    const notification = {
      title: '💳 Payment Reminder',
      body: `You have ₹${customerData.currentBalance.toLocaleString()} outstanding. Pay now to continue shopping.`,
      imageUrl: 'https://kiranamarket.com/images/payment-reminder.png'
    };

    const data = {
      type: 'payment_reminder',
      outstandingAmount: customerData.currentBalance.toString(),
      screen: 'payment'
    };

    return await this.sendToDevice(deviceToken, notification, data);
  }

  // New offer/promotion push notification
  async sendPromotion(deviceTokens, promotionData) {
    const notification = {
      title: `🎁 ${promotionData.title}`,
      body: `${promotionData.description} Use code: ${promotionData.code}`,
      imageUrl: promotionData.imageUrl || 'https://kiranamarket.com/images/promotion.png'
    };

    const data = {
      type: 'promotion',
      promotionId: promotionData._id,
      code: promotionData.code,
      screen: 'promotions'
    };

    return await this.sendToMultipleDevices(deviceTokens, notification, data);
  }

  // Low stock alert for admin
  async sendLowStockAlert(deviceToken, itemCount) {
    const notification = {
      title: '⚠️ Low Stock Alert',
      body: `${itemCount} items are running low. Check inventory now.`,
      imageUrl: 'https://kiranamarket.com/images/low-stock.png'
    };

    const data = {
      type: 'low_stock_alert',
      itemCount: itemCount.toString(),
      screen: 'inventory'
    };

    return await this.sendToDevice(deviceToken, notification, data);
  }

  // New order alert for admin
  async sendNewOrderAlert(deviceToken, orderData) {
    const notification = {
      title: '🔔 New Order Received',
      body: `Order #${orderData.orderNumber} for ₹${orderData.totalPrice} from ${orderData.customerName}`,
      imageUrl: 'https://kiranamarket.com/images/new-order.png'
    };

    const data = {
      type: 'new_order',
      orderId: orderData._id,
      orderNumber: orderData.orderNumber,
      screen: 'order_management'
    };

    return await this.sendToDevice(deviceToken, notification, data);
  }

  // Delivery assignment for delivery boy
  async sendDeliveryAssignment(deviceToken, orderData) {
    const notification = {
      title: '🚚 New Delivery Assignment',
      body: `Order #${orderData.orderNumber} assigned to you. Amount: ₹${orderData.totalPrice}`,
      imageUrl: 'https://kiranamarket.com/images/delivery-assignment.png'
    };

    const data = {
      type: 'delivery_assignment',
      orderId: orderData._id,
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      screen: 'delivery_details'
    };

    return await this.sendToDevice(deviceToken, notification, data);
  }

  // Welcome notification for new users
  async sendWelcome(deviceToken, customerName) {
    const notification = {
      title: '🏪 Welcome to Kirana Market!',
      body: `Hello ${customerName}! Get 10% off on your first order with code WELCOME10`,
      imageUrl: 'https://kiranamarket.com/images/welcome.png'
    };

    const data = {
      type: 'welcome',
      screen: 'home',
      offerCode: 'WELCOME10'
    };

    return await this.sendToDevice(deviceToken, notification, data);
  }

  // Subscribe user to topic
  async subscribeToTopic(deviceTokens, topic) {
    try {
      const response = await admin.messaging().subscribeToTopic(deviceTokens, topic);
      console.log('Successfully subscribed to topic:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
      return { success: false, error: error.message };
    }
  }

  // Unsubscribe user from topic
  async unsubscribeFromTopic(deviceTokens, topic) {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(deviceTokens, topic);
      console.log('Successfully unsubscribed from topic:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Failed to unsubscribe from topic:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PushNotificationService();