import asyncHandler from 'express-async-handler';
import Customer from '../models/Customer.js';
import generateToken from '../utils/generateToken.js';

// @desc    Customer registration
// @route   POST /api/customer/auth/register
// @access  Public
const registerCustomer = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  // Check if customer already exists
  const existingCustomer = await Customer.findOne({
    $or: [
      { email: email.toLowerCase() },
      { phone: phone }
    ]
  });

  if (existingCustomer) {
    res.status(400);
    throw new Error('Customer with this email or phone already exists');
  }

  const customer = await Customer.create({
    name,
    email: email.toLowerCase(),
    password,
    phone
  });

  const token = generateToken(customer._id, 'customer');

  res.status(201).json({
    _id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    customerType: customer.customerType,
    loyaltyPoints: customer.loyaltyPoints,
    referralCode: customer.referralCode,
    token,
    userType: 'customer'
  });
});

// @desc    Customer login
// @route   POST /api/customer/auth/login
// @access  Public
const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const customer = await Customer.findOne({ email: email.toLowerCase() });

  if (!customer) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!customer.isActive) {
    res.status(401);
    throw new Error('Account is deactivated. Please contact support.');
  }

  const isPasswordValid = await customer.comparePassword(password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Update last login and activity
  customer.lastLogin = new Date();
  customer.lastActivity = new Date();
  await customer.save();

  const token = generateToken(customer._id, 'customer');

  res.json({
    _id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    customerType: customer.customerType,
    loyaltyPoints: customer.loyaltyPoints,
    creditAccount: customer.creditAccount,
    addresses: customer.addresses,
    preferences: customer.preferences,
    referralCode: customer.referralCode,
    token,
    userType: 'customer'
  });
});

// @desc    Get customer profile
// @route   GET /api/customer/auth/profile
// @access  Private (Customer)
const getCustomerProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user._id)
    .select('-password')
    .populate('analytics.frequentlyBoughtProducts.product', 'name price images');

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.json(customer);
});

// @desc    Update customer profile
// @route   PUT /api/customer/auth/profile
// @access  Private (Customer)
const updateCustomerProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user._id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  customer.name = req.body.name || customer.name;
  customer.phone = req.body.phone || customer.phone;
  customer.avatar = req.body.avatar || customer.avatar;
  customer.dateOfBirth = req.body.dateOfBirth || customer.dateOfBirth;
  customer.gender = req.body.gender || customer.gender;
  customer.whatsappNumber = req.body.whatsappNumber || customer.whatsappNumber;

  if (req.body.preferences) {
    customer.preferences = { ...customer.preferences, ...req.body.preferences };
  }

  customer.lastActivity = new Date();
  const updatedCustomer = await customer.save();

  res.json({
    _id: updatedCustomer._id,
    name: updatedCustomer.name,
    email: updatedCustomer.email,
    phone: updatedCustomer.phone,
    avatar: updatedCustomer.avatar,
    dateOfBirth: updatedCustomer.dateOfBirth,
    gender: updatedCustomer.gender,
    customerType: updatedCustomer.customerType,
    loyaltyPoints: updatedCustomer.loyaltyPoints,
    preferences: updatedCustomer.preferences,
    userType: 'customer'
  });
});

// @desc    Change customer password
// @route   PUT /api/customer/auth/change-password
// @access  Private (Customer)
const changeCustomerPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current password and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters long');
  }

  const customer = await Customer.findById(req.user._id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const isCurrentPasswordValid = await customer.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  customer.password = newPassword;
  customer.lastActivity = new Date();
  await customer.save();

  res.json({ message: 'Password changed successfully' });
});

// @desc    Add customer address
// @route   POST /api/customer/auth/address
// @access  Private (Customer)
const addCustomerAddress = asyncHandler(async (req, res) => {
  const { type, name, street, landmark, city, state, zipCode, isDefault } = req.body;

  if (!name || !street || !city || !state || !zipCode) {
    res.status(400);
    throw new Error('Please provide all required address fields');
  }

  const customer = await Customer.findById(req.user._id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  // If this is set as default, remove default from other addresses
  if (isDefault) {
    customer.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  // If this is the first address, make it default
  const isFirstAddress = customer.addresses.length === 0;

  const newAddress = {
    type: type || 'home',
    name,
    street,
    landmark,
    city,
    state,
    zipCode,
    isDefault: isDefault || isFirstAddress
  };

  customer.addresses.push(newAddress);
  customer.lastActivity = new Date();
  await customer.save();

  res.status(201).json({
    message: 'Address added successfully',
    address: customer.addresses[customer.addresses.length - 1]
  });
});

// @desc    Update customer address
// @route   PUT /api/customer/auth/address/:addressId
// @access  Private (Customer)
const updateCustomerAddress = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user._id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const address = customer.addresses.id(req.params.addressId);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  address.type = req.body.type || address.type;
  address.name = req.body.name || address.name;
  address.street = req.body.street || address.street;
  address.landmark = req.body.landmark || address.landmark;
  address.city = req.body.city || address.city;
  address.state = req.body.state || address.state;
  address.zipCode = req.body.zipCode || address.zipCode;

  if (req.body.isDefault && !address.isDefault) {
    // Remove default from other addresses
    customer.addresses.forEach(addr => {
      addr.isDefault = false;
    });
    address.isDefault = true;
  }

  customer.lastActivity = new Date();
  await customer.save();

  res.json({
    message: 'Address updated successfully',
    address
  });
});

// @desc    Delete customer address
// @route   DELETE /api/customer/auth/address/:addressId
// @access  Private (Customer)
const deleteCustomerAddress = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user._id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const address = customer.addresses.id(req.params.addressId);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  const wasDefault = address.isDefault;
  customer.addresses.pull(req.params.addressId);

  // If deleted address was default, make first remaining address default
  if (wasDefault && customer.addresses.length > 0) {
    customer.addresses[0].isDefault = true;
  }

  customer.lastActivity = new Date();
  await customer.save();

  res.json({ message: 'Address deleted successfully' });
});

// @desc    Customer logout
// @route   POST /api/customer/auth/logout
// @access  Private (Customer)
const logoutCustomer = asyncHandler(async (req, res) => {
  // Update last activity
  await Customer.findByIdAndUpdate(req.user._id, {
    lastActivity: new Date()
  });

  res.json({ message: 'Customer logged out successfully' });
});

// @desc    Get customer loyalty points
// @route   GET /api/customer/auth/loyalty-points
// @access  Private (Customer)
const getLoyaltyPoints = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user._id).select('loyaltyPoints');

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.json(customer.loyaltyPoints);
});

// @desc    Get customer credit account
// @route   GET /api/customer/auth/credit-account
// @access  Private (Customer)
const getCreditAccount = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user._id).select('creditAccount');

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.json(customer.creditAccount);
});

export {
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
};