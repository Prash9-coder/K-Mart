import express from 'express';
import {
  receiveWhatsAppMessage,
  getWhatsAppOrders,
  getWhatsAppOrderById,
  assignWhatsAppOrder,
  updateParsedItems,
  generateQuote,
  confirmWhatsAppOrder,
  sendMessage
} from '../controllers/whatsappController.js';
import { protectAdmin, checkPermission } from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

// Public webhook for WhatsApp
router.post('/webhook', receiveWhatsAppMessage);

// Admin routes
router.use(protectAdmin);
router.use(checkPermission('manage-orders'));

router.get('/orders', getWhatsAppOrders);
router.get('/orders/:id', getWhatsAppOrderById);
router.put('/orders/:id/assign', assignWhatsAppOrder);
router.put('/orders/:id/items', updateParsedItems);
router.post('/orders/:id/quote', generateQuote);
router.post('/orders/:id/confirm', confirmWhatsAppOrder);
router.post('/send-message', sendMessage);

export default router;