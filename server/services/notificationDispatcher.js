import emailService from './emailService.js';
import smsService from './smsService.js';
import whatsappService from './whatsappService.js';
import pushNotificationService from './pushNotificationService.js';
import Notification from '../models/Notification.js';

class NotificationDispatcher {
  constructor() {
    this.services = {
      email: emailService,
      sms: smsService,
      whatsapp: whatsappService,
      push: pushNotificationService
    };
  }

  async dispatchNotification(notificationData) {
    const {
      recipient,
      recipientType,
      type,
      title,
      message,
      data,
      channels,
      priority,
      category,
      scheduledFor,
      expiresAt,
      actionRequired,
      actionUrl,
      actionText,
      createdBy
    } = notificationData;

    try {
      // Create notification record
      const notification = await Notification.create({
        recipient,
        recipientType,
        type,
        title,
        message,
        data: data || {},
        channels,
        priority: priority || 'medium',
        category,
        scheduledFor,
        expiresAt,
        actionRequired: actionRequired || false,
        actionUrl,
        actionText,
        createdBy,
        status: this.initializeChannelStatus(channels)
      });

      // If scheduled for future, don't send now
      if (scheduledFor && new Date(scheduledFor) > new Date()) {
        console.log('Notification scheduled for future delivery:', scheduledFor);
        return { success: true, notification, scheduled: true };
      }

      // Get recipient details
      const recipientDetails = await this.getRecipientDetails(recipient, recipientType);
      
      if (!recipientDetails) {
        throw new Error('Recipient not found');
      }

      // Dispatch to each channel
      const results = {};
      for (const channel of channels) {
        try {
          results[channel] = await this.sendToChannel(
            channel,
            recipientDetails,
            notification,
            type
          );
          
          // Update notification status
          await this.updateChannelStatus(notification._id, channel, results[channel]);
        } catch (error) {
          console.error(`Failed to send ${channel} notification:`, error);
          results[channel] = { success: false, error: error.message };
          await this.updateChannelStatus(notification._id, channel, results[channel]);
        }
      }

      return {
        success: true,
        notification,
        results,
        scheduled: false
      };
    } catch (error) {
      console.error('Notification dispatch failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendToChannel(channel, recipientDetails, notification, type) {
    switch (channel) {
      case 'email':
        return await this.sendEmailNotification(recipientDetails, notification, type);
      
      case 'sms':
        return await this.sendSMSNotification(recipientDetails, notification, type);
      
      case 'whatsapp':
        return await this.sendWhatsAppNotification(recipientDetails, notification, type);
      
      case 'push':
        return await this.sendPushNotification(recipientDetails, notification, type);
      
      case 'in_app':
        // In-app notifications are handled by the database record itself
        return { success: true, messageId: 'in_app_' + notification._id };
      
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  async sendEmailNotification(recipientDetails, notification, type) {
    const { email } = recipientDetails;
    
    if (!email) {
      throw new Error('Recipient email not available');
    }

    // Use specific email templates based on notification type
    switch (type) {
      case 'order_confirmation':
        return await this.services.email.sendOrderConfirmation(email, notification.data);
      
      case 'credit_approval':
        return await this.services.email.sendCreditApproval(email, notification.data);
      
      case 'payment_reminder':
        return await this.services.email.sendPaymentReminder(email, notification.data);
      
      case 'low_stock_alert':
        return await this.services.email.sendLowStockAlert(email, notification.data.items);
      
      default:
        // Generic email
        return await this.services.email.sendEmail(
          email,
          notification.title,
          this.generateEmailHTML(notification)
        );
    }
  }

  async sendSMSNotification(recipientDetails, notification, type) {
    const { phone } = recipientDetails;
    
    if (!phone) {
      throw new Error('Recipient phone not available');
    }

    // Use specific SMS templates based on notification type
    switch (type) {
      case 'order_confirmation':
        return await this.services.sms.sendOrderConfirmation(phone, notification.data);
      
      case 'order_status_update':
        return await this.services.sms.sendOrderStatusUpdate(phone, notification.data, notification.data.status);
      
      case 'credit_approval':
        return await this.services.sms.sendCreditApproval(phone, notification.data);
      
      case 'payment_reminder':
        return await this.services.sms.sendPaymentReminder(phone, notification.data);
      
      case 'otp':
        return await this.services.sms.sendOTP(phone, notification.data.otp);
      
      default:
        // Generic SMS
        return await this.services.sms.sendSMS(phone, notification.message);
    }
  }

  async sendWhatsAppNotification(recipientDetails, notification, type) {
    const { phone, whatsappNumber } = recipientDetails;
    const targetPhone = whatsappNumber || phone;
    
    if (!targetPhone) {
      throw new Error('Recipient WhatsApp number not available');
    }

    // Use specific WhatsApp templates based on notification type
    switch (type) {
      case 'order_confirmation':
        return await this.services.whatsapp.sendOrderConfirmation(targetPhone, notification.data);
      
      case 'order_status_update':
        return await this.services.whatsapp.sendOrderStatusUpdate(targetPhone, notification.data, notification.data.status);
      
      case 'credit_approval':
        return await this.services.whatsapp.sendCreditApproval(targetPhone, notification.data);
      
      case 'payment_reminder':
        return await this.services.whatsapp.sendPaymentReminder(targetPhone, notification.data);
      
      case 'whatsapp_quote':
        return await this.services.whatsapp.sendOrderQuote(targetPhone, notification.data);
      
      case 'welcome':
        return await this.services.whatsapp.sendWelcome(targetPhone, notification.data.customerName);
      
      case 'promotion':
        return await this.services.whatsapp.sendPromotion(targetPhone, notification.data);
      
      default:
        // Generic WhatsApp message
        return await this.services.whatsapp.sendMessage(targetPhone, notification.message);
    }
  }

  async sendPushNotification(recipientDetails, notification, type) {
    const { deviceTokens } = recipientDetails;
    
    if (!deviceTokens || deviceTokens.length === 0) {
      throw new Error('Recipient device tokens not available');
    }

    const pushNotification = {
      title: notification.title,
      body: notification.message,
      imageUrl: notification.data.imageUrl
    };

    const pushData = {
      type,
      ...notification.data,
      notificationId: notification._id.toString()
    };

    // Use specific push notification methods based on type
    switch (type) {
      case 'order_confirmation':
        return await this.services.push.sendOrderConfirmation(deviceTokens[0], notification.data);
      
      case 'order_status_update':
        return await this.services.push.sendOrderStatusUpdate(deviceTokens[0], notification.data, notification.data.status);
      
      case 'credit_approval':
        return await this.services.push.sendCreditApproval(deviceTokens[0], notification.data);
      
      case 'payment_reminder':
        return await this.services.push.sendPaymentReminder(deviceTokens[0], notification.data);
      
      case 'promotion':
        return await this.services.push.sendPromotion(deviceTokens, notification.data);
      
      case 'welcome':
        return await this.services.push.sendWelcome(deviceTokens[0], notification.data.customerName);
      
      default:
        // Generic push notification
        if (deviceTokens.length === 1) {
          return await this.services.push.sendToDevice(deviceTokens[0], pushNotification, pushData);
        } else {
          return await this.services.push.sendToMultipleDevices(deviceTokens, pushNotification, pushData);
        }
    }
  }

  async getRecipientDetails(recipientId, recipientType) {
    try {
      let Model;
      
      switch (recipientType) {
        case 'Customer':
          Model = (await import('../models/Customer.js')).default;
          break;
        case 'Admin':
          Model = (await import('../models/Admin.js')).default;
          break;
        case 'DeliveryBoy':
          Model = (await import('../models/DeliveryBoy.js')).default;
          break;
        default:
          throw new Error(`Unknown recipient type: ${recipientType}`);
      }

      const recipient = await Model.findById(recipientId).select('name email phone whatsappNumber deviceTokens');
      return recipient;
    } catch (error) {
      console.error('Failed to get recipient details:', error);
      return null;
    }
  }

  initializeChannelStatus(channels) {
    const status = {};
    channels.forEach(channel => {
      status[channel] = {
        sent: false,
        delivered: false,
        read: false,
        failed: false,
        error: null,
        sentAt: null,
        deliveredAt: null,
        readAt: null
      };
    });
    return status;
  }

  async updateChannelStatus(notificationId, channel, result) {
    try {
      const updateData = {};
      
      if (result.success) {
        updateData[`status.${channel}.sent`] = true;
        updateData[`status.${channel}.sentAt`] = new Date();
        updateData[`status.${channel}.messageId`] = result.messageId;
        
        // For some channels, we can assume immediate delivery
        if (['sms', 'push', 'in_app'].includes(channel)) {
          updateData[`status.${channel}.delivered`] = true;
          updateData[`status.${channel}.deliveredAt`] = new Date();
        }
      } else {
        updateData[`status.${channel}.failed`] = true;
        updateData[`status.${channel}.error`] = result.error;
      }

      await Notification.findByIdAndUpdate(notificationId, updateData);
    } catch (error) {
      console.error('Failed to update channel status:', error);
    }
  }

  generateEmailHTML(notification) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏪 Kirana Market</h1>
            <h2>${notification.title}</h2>
          </div>
          <div class="content">
            <p>${notification.message}</p>
            ${notification.actionRequired && notification.actionUrl ? 
              `<p><a href="${notification.actionUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${notification.actionText || 'Take Action'}</a></p>` 
              : ''
            }
          </div>
          <div class="footer">
            <p>Thank you for choosing Kirana Market!</p>
            <p>Your neighborhood store, now digital 🛒</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Bulk notification dispatch
  async dispatchBulkNotifications(notifications) {
    const results = [];
    
    for (const notificationData of notifications) {
      try {
        const result = await this.dispatchNotification(notificationData);
        results.push({ ...result, recipient: notificationData.recipient });
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          recipient: notificationData.recipient
        });
      }
    }

    return results;
  }

  // Process scheduled notifications
  async processScheduledNotifications() {
    try {
      const now = new Date();
      const scheduledNotifications = await Notification.find({
        scheduledFor: { $lte: now },
        'status.processed': { $ne: true }
      }).populate('recipient');

      console.log(`Processing ${scheduledNotifications.length} scheduled notifications`);

      for (const notification of scheduledNotifications) {
        try {
          const recipientDetails = await this.getRecipientDetails(
            notification.recipient._id,
            notification.recipientType
          );

          if (recipientDetails) {
            const results = {};
            for (const channel of notification.channels) {
              results[channel] = await this.sendToChannel(
                channel,
                recipientDetails,
                notification,
                notification.type
              );
              await this.updateChannelStatus(notification._id, channel, results[channel]);
            }

            // Mark as processed
            await Notification.findByIdAndUpdate(notification._id, {
              'status.processed': true,
              'status.processedAt': new Date()
            });
          }
        } catch (error) {
          console.error('Failed to process scheduled notification:', error);
        }
      }
    } catch (error) {
      console.error('Failed to process scheduled notifications:', error);
    }
  }
}

export default new NotificationDispatcher();