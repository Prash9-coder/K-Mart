import express from 'express';
import {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  logoutAdmin,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} from '../controllers/adminAuthController.js';
import {
  protectAdmin,
  superAdminOnly,
  checkPermission
} from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginAdmin);

// Protected routes
router.use(protectAdmin); // All routes below require admin authentication

router.route('/profile')
  .get(getAdminProfile)
  .put(updateAdminProfile);

router.put('/change-password', changeAdminPassword);
router.post('/logout', logoutAdmin);

// Super admin only routes
router.route('/admins')
  .get(superAdminOnly, getAllAdmins)
  .post(superAdminOnly, createAdmin);

router.route('/admin/:id')
  .put(superAdminOnly, updateAdmin)
  .delete(superAdminOnly, deleteAdmin);

export default router;