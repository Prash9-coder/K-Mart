import express from 'express';
import {
  getCreditCustomers,
  getCustomerCreditDetails,
  approveCreditAccount,
  updateCreditLimit,
  recordPayment,
  addCreditAdjustment,
  getCreditTransactions,
  getCreditAnalytics,
  deactivateCreditAccount,
  getMyCredits
} from '../controllers/creditController.js';
import { protectAdmin, checkPermission } from '../middleware/adminAuthMiddleware.js';
import { protectCustomer } from '../middleware/customerAuthMiddleware.js';

const router = express.Router();

// Customer routes
router.get('/my-account', protectCustomer, getMyCredits);

// Admin routes
router.use(protectAdmin);
router.use(checkPermission('manage-credit'));

router.get('/customers', getCreditCustomers);
router.get('/transactions', getCreditTransactions);
router.get('/analytics', getCreditAnalytics);

router.get('/customer/:customerId', getCustomerCreditDetails);
router.put('/customer/:customerId/approve', approveCreditAccount);
router.put('/customer/:customerId/limit', updateCreditLimit);
router.post('/customer/:customerId/payment', recordPayment);
router.post('/customer/:customerId/adjustment', addCreditAdjustment);
router.put('/customer/:customerId/deactivate', deactivateCreditAccount);

export default router;