import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
  sendBulkNotification,
  getNotificationAnalytics,
  getAllNotifications
} from '../controllers/notificationController.js';
import { protectAdmin, checkPermission } from '../middleware/adminAuthMiddleware.js';
import { protectCustomer } from '../middleware/customerAuthMiddleware.js';
import { protect } from '../middleware/authMiddleware.js'; // Generic protection

const router = express.Router();

// Routes accessible by all authenticated users
router.use(protect); // Generic protection for customers, admins, delivery boys

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin only routes
router.post('/send', protectAdmin, checkPermission('manage-customers'), sendNotification);
router.post('/send-bulk', protectAdmin, checkPermission('manage-customers'), sendBulkNotification);
router.get('/analytics', protectAdmin, checkPermission('view-analytics'), getNotificationAnalytics);
router.get('/admin/all', protectAdmin, checkPermission('manage-customers'), getAllNotifications);

export default router;