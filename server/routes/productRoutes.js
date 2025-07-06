import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  createProductReview, 
  getTopProducts, 
  getFeaturedProducts, 
  getProductsByCategory, 
  getLowStockProducts 
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/top').get(getTopProducts);
router.route('/featured').get(getFeaturedProducts);
router.route('/low-stock').get(protect, admin, getLowStockProducts);
router.route('/category/:category').get(getProductsByCategory);
router.route('/:id').get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);
router.route('/:id/reviews').post(protect, createProductReview);

export default router;