import express from 'express';
import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  logoutCustomer,
  getLoyaltyPoints,
  getCreditAccount
} from '../controllers/customerAuthController.js';
import {
  protectCustomer,
  requireVerification,
  requireActiveCreditAccount
} from '../middleware/customerAuthMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected routes
router.use(protectCustomer); // All routes below require customer authentication

router.route('/profile')
  .get(getCustomerProfile)
  .put(updateCustomerProfile);

router.put('/change-password', changeCustomerPassword);
router.post('/logout', logoutCustomer);

// Address management
router.route('/address')
  .post(addCustomerAddress);

router.route('/address/:addressId')
  .put(updateCustomerAddress)
  .delete(deleteCustomerAddress);

// Loyalty points
router.get('/loyalty-points', getLoyaltyPoints);

// Credit account
router.get('/credit-account', requireActiveCreditAccount, getCreditAccount);

export default router;