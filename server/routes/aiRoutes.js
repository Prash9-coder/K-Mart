import express from 'express';
import {
  generateProductDescription,
  chatWithAI,
  getProductRecommendations,
  generateBarcode,
  validateBarcode
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

// Public routes
router.post('/chat', chatWithAI);
router.post('/recommendations', getProductRecommendations);

// Admin only routes
router.post('/generate-description', protectAdmin, generateProductDescription);
router.post('/generate-barcode', protectAdmin, generateBarcode);
router.post('/validate-barcode', protectAdmin, validateBarcode);

export default router;