import express from 'express';
import {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
  getCouponStats
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.route('/active').get(protect, getActiveCoupons);
router.route('/validate').post(protect, validateCoupon);
router.route('/stats').get(protect, admin, getCouponStats);
router.route('/:id').get(protect, admin, getCouponById).put(protect, admin, updateCoupon).delete(protect, admin, deleteCoupon);

export default router;