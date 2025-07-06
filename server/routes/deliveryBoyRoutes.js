import express from 'express';
import {
  getDeliveryBoys,
  getDeliveryBoyById,
  createDeliveryBoy,
  updateDeliveryBoy,
  verifyDeliveryBoy,
  deleteDeliveryBoy,
  assignOrder,
  getAvailableDeliveryBoys,
  loginDeliveryBoy,
  updateStatus,
  updateLocation,
  getAssignedOrders,
  updateOrderStatus
} from '../controllers/deliveryBoyController.js';
import { protectAdmin, checkPermission } from '../middleware/adminAuthMiddleware.js';
import { protect } from '../middleware/authMiddleware.js'; // For delivery boy authentication

const router = express.Router();

// Public routes
router.post('/auth/login', loginDeliveryBoy);

// Admin routes
router.route('/')
  .get(protectAdmin, checkPermission('manage-delivery-boys'), getDeliveryBoys)
  .post(protectAdmin, checkPermission('manage-delivery-boys'), createDeliveryBoy);

router.get('/available/:zipCode', protectAdmin, checkPermission('manage-delivery-boys'), getAvailableDeliveryBoys);

router.route('/:id')
  .get(protectAdmin, checkPermission('manage-delivery-boys'), getDeliveryBoyById)
  .put(protectAdmin, checkPermission('manage-delivery-boys'), updateDeliveryBoy)
  .delete(protectAdmin, checkPermission('manage-delivery-boys'), deleteDeliveryBoy);

router.put('/:id/verify', protectAdmin, checkPermission('manage-delivery-boys'), verifyDeliveryBoy);
router.post('/:id/assign-order', protectAdmin, checkPermission('manage-delivery-boys'), assignOrder);

// Delivery boy app routes (protected with delivery boy authentication)
router.put('/status', protect, updateStatus);
router.put('/location', protect, updateLocation);
router.get('/orders', protect, getAssignedOrders);
router.put('/orders/:orderId/status', protect, updateOrderStatus);

export default router;