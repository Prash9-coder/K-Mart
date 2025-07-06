import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';
import Customer from '../models/Customer.js';
import Admin from '../models/Admin.js';
import DeliveryBoy from '../models/DeliveryBoy.js';

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {
    recipient: req.user._id,
    recipientType: req.user.userType === 'admin' ? 'Admin' : 
                   req.user.userType === 'delivery-boy' ? 'DeliveryBoy' : 'Customer'
  };

  if (req.query.isRead !== undefined) {
    filter.isRead = req.query.isRead === 'true';
  }

  if (req.query.type) {
    filter.type = req.query.type;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({
    ...filter,
    isRead: false
  });

  res.json({
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    unreadCount
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.markAsRead();
  await notification.save();

  res.json({ message: 'Notification marked as read' });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  const userType = req.user.userType === 'admin' ? 'Admin' : 
                   req.user.userType === 'delivery-boy' ? 'DeliveryBoy' : 'Customer';

  await Notification.updateMany(
    {
      recipient: req.user._id,
      recipientType: userType,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
        'status.in_app.read': true,
        'status.in_app.readAt': new Date()
      }
    }
  );

  res.json({ message: 'All notifications marked as read' });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.json({ message: 'Notification deleted successfully' });
});

// ADMIN ROUTES

// @desc    Send notification to users
// @route   POST /api/notifications/send
// @access  Private (Admin)
const sendNotification = asyncHandler(async (req, res) => {
  const {
    recipients,
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
    actionText
  } = req.body;

  if (!recipients || !recipientType || !type || !title || !message || !channels || !category) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  const notifications = [];

  // Create notifications for each recipient
  for (const recipientId of recipients) {
    const notification = Notification.createNotification({
      recipient: recipientId,
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
      createdBy: req.user._id
    });

    notifications.push(notification);
  }

  await Notification.insertMany(notifications);

  // TODO: Implement actual sending logic for different channels
  // - Push notifications
  // - Email
  // - SMS
  // - WhatsApp

  res.json({
    message: `Notifications sent to ${recipients.length} recipients`,
    count: recipients.length
  });
});

// @desc    Send bulk notification
// @route   POST /api/notifications/send-bulk
// @access  Private (Admin)
const sendBulkNotification = asyncHandler(async (req, res) => {
  const {
    recipientType,
    filters,
    type,
    title,
    message,
    data,
    channels,
    priority,
    category,
    scheduledFor,
    expiresAt
  } = req.body;

  if (!recipientType || !type || !title || !message || !channels || !category) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  let recipients = [];

  // Get recipients based on type and filters
  if (recipientType === 'Customer') {
    const query = { isActive: true };
    
    if (filters?.customerType) {
      query.customerType = filters.customerType;
    }
    
    if (filters?.hasActiveCredit) {
      query['creditAccount.isActive'] = true;
    }
    
    if (filters?.loyaltyTier) {
      query['loyaltyPoints.tier'] = filters.loyaltyTier;
    }

    recipients = await Customer.find(query).select('_id');
  } else if (recipientType === 'Admin') {
    const query = { isActive: true };
    
    if (filters?.role) {
      query.role = filters.role;
    }

    recipients = await Admin.find(query).select('_id');
  } else if (recipientType === 'DeliveryBoy') {
    const query = { isActive: true, isVerified: true };
    
    if (filters?.status) {
      query.status = filters.status;
    }

    recipients = await DeliveryBoy.find(query).select('_id');
  }

  if (recipients.length === 0) {
    res.status(400);
    throw new Error('No recipients found matching the criteria');
  }

  const notifications = recipients.map(recipient => 
    Notification.createNotification({
      recipient: recipient._id,
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
      createdBy: req.user._id
    })
  );

  await Notification.insertMany(notifications);

  res.json({
    message: `Bulk notifications sent to ${recipients.length} ${recipientType.toLowerCase()}s`,
    count: recipients.length
  });
});

// @desc    Get notification analytics
// @route   GET /api/notifications/analytics
// @access  Private (Admin)
const getNotificationAnalytics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Overall statistics
  const overallStats = await Notification.aggregate([
    {
      $match: { createdAt: { $gte: thirtyDaysAgo } }
    },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        totalRead: {
          $sum: { $cond: ['$isRead', 1, 0] }
        },
        byType: {
          $push: '$type'
        },
        byCategory: {
          $push: '$category'
        },
        byPriority: {
          $push: '$priority'
        }
      }
    }
  ]);

  // Delivery statistics by channel
  const deliveryStats = await Notification.aggregate([
    {
      $match: { createdAt: { $gte: thirtyDaysAgo } }
    },
    {
      $unwind: '$channels'
    },
    {
      $group: {
        _id: '$channels',
        total: { $sum: 1 },
        sent: {
          $sum: {
            $cond: [
              { $eq: [`$status.${this._id}.sent`, true] },
              1,
              0
            ]
          }
        },
        delivered: {
          $sum: {
            $cond: [
              { $eq: [`$status.${this._id}.delivered`, true] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  // Daily notification trends
  const dailyTrends = await Notification.aggregate([
    {
      $match: { createdAt: { $gte: thirtyDaysAgo } }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 },
        readCount: {
          $sum: { $cond: ['$isRead', 1, 0] }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.json({
    overallStats: overallStats[0] || {},
    deliveryStats,
    dailyTrends
  });
});

// @desc    Get all notifications (Admin)
// @route   GET /api/notifications/admin/all
// @access  Private (Admin)
const getAllNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.recipientType) {
    filter.recipientType = req.query.recipientType;
  }

  if (req.query.type) {
    filter.type = req.query.type;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  const notifications = await Notification.find(filter)
    .populate('recipient', 'name email phone')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(filter);

  res.json({
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
  sendBulkNotification,
  getNotificationAnalytics,
  getAllNotifications
};