import asyncHandler from 'express-async-handler';
import Admin from '../models/Admin.js';
import generateToken from '../utils/generateToken.js';

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!admin.isActive) {
    res.status(401);
    throw new Error('Account is deactivated. Please contact super admin.');
  }

  if (admin.isLocked()) {
    res.status(423);
    throw new Error('Account is temporarily locked due to multiple failed login attempts. Please try again later.');
  }

  const isPasswordValid = await admin.comparePassword(password);

  if (!isPasswordValid) {
    await admin.incLoginAttempts();
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Reset login attempts on successful login
  if (admin.loginAttempts > 0) {
    await admin.resetLoginAttempts();
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  const token = generateToken(admin._id, 'admin');

  res.json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions,
    phone: admin.phone,
    avatar: admin.avatar,
    lastLogin: admin.lastLogin,
    token,
    userType: 'admin'
  });
});

// @desc    Get admin profile
// @route   GET /api/admin/auth/profile
// @access  Private (Admin)
const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id).select('-password');

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  res.json(admin);
});

// @desc    Update admin profile
// @route   PUT /api/admin/auth/profile
// @access  Private (Admin)
const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  admin.name = req.body.name || admin.name;
  admin.phone = req.body.phone || admin.phone;
  admin.avatar = req.body.avatar || admin.avatar;

  if (req.body.password) {
    admin.password = req.body.password;
  }

  const updatedAdmin = await admin.save();

  res.json({
    _id: updatedAdmin._id,
    name: updatedAdmin.name,
    email: updatedAdmin.email,
    role: updatedAdmin.role,
    permissions: updatedAdmin.permissions,
    phone: updatedAdmin.phone,
    avatar: updatedAdmin.avatar,
    userType: 'admin'
  });
});

// @desc    Change admin password
// @route   PUT /api/admin/auth/change-password
// @access  Private (Admin)
const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current password and new password');
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error('New password must be at least 8 characters long');
  }

  const admin = await Admin.findById(req.user._id);

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  const isCurrentPasswordValid = await admin.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  admin.password = newPassword;
  await admin.save();

  res.json({ message: 'Password changed successfully' });
});

// @desc    Admin logout
// @route   POST /api/admin/auth/logout
// @access  Private (Admin)
const logoutAdmin = asyncHandler(async (req, res) => {
  res.json({ message: 'Admin logged out successfully' });
});

// @desc    Get all admins (Super Admin only)
// @route   GET /api/admin/auth/admins
// @access  Private (Super Admin)
const getAllAdmins = asyncHandler(async (req, res) => {
  if (req.user.role !== 'super-admin') {
    res.status(403);
    throw new Error('Access denied. Super admin privileges required.');
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const admins = await Admin.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name email');

  const total = await Admin.countDocuments(filter);

  res.json({
    admins,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Create new admin (Super Admin only)
// @route   POST /api/admin/auth/create
// @access  Private (Super Admin)
const createAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== 'super-admin') {
    res.status(403);
    throw new Error('Access denied. Super admin privileges required.');
  }

  const { name, email, password, role, phone, permissions } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long');
  }

  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

  if (existingAdmin) {
    res.status(400);
    throw new Error('Admin with this email already exists');
  }

  const admin = await Admin.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'admin',
    phone,
    permissions: permissions || [],
    createdBy: req.user._id
  });

  res.status(201).json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions,
    phone: admin.phone,
    isActive: admin.isActive,
    createdBy: admin.createdBy
  });
});

// @desc    Update admin (Super Admin only)
// @route   PUT /api/admin/auth/admin/:id
// @access  Private (Super Admin)
const updateAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== 'super-admin') {
    res.status(403);
    throw new Error('Access denied. Super admin privileges required.');
  }

  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  admin.name = req.body.name || admin.name;
  admin.phone = req.body.phone || admin.phone;
  admin.role = req.body.role || admin.role;
  admin.permissions = req.body.permissions || admin.permissions;
  admin.isActive = req.body.isActive !== undefined ? req.body.isActive : admin.isActive;

  const updatedAdmin = await admin.save();

  res.json({
    _id: updatedAdmin._id,
    name: updatedAdmin.name,
    email: updatedAdmin.email,
    role: updatedAdmin.role,
    permissions: updatedAdmin.permissions,
    phone: updatedAdmin.phone,
    isActive: updatedAdmin.isActive
  });
});

// @desc    Delete admin (Super Admin only)
// @route   DELETE /api/admin/auth/admin/:id
// @access  Private (Super Admin)
const deleteAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== 'super-admin') {
    res.status(403);
    throw new Error('Access denied. Super admin privileges required.');
  }

  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  if (admin._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  await Admin.findByIdAndDelete(req.params.id);

  res.json({ message: 'Admin deleted successfully' });
});

export {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  logoutAdmin,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
};