import asyncHandler from 'express-async-handler';
import DeliveryBoy from '../models/DeliveryBoy.js';
import Order from '../models/Order.js';
import generateToken from '../utils/generateToken.js';

// @desc    Get all delivery boys
// @route   GET /api/delivery-boys
// @access  Private (Admin)
const getDeliveryBoys = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';

  const deliveryBoys = await DeliveryBoy.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await DeliveryBoy.countDocuments(filter);

  res.json({
    deliveryBoys,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get delivery boy by ID
// @route   GET /api/delivery-boys/:id
// @access  Private (Admin)
const getDeliveryBoyById = asyncHandler(async (req, res) => {
  const deliveryBoy = await DeliveryBoy.findById(req.params.id)
    .select('-password')
    .populate('currentOrders.order', 'orderNumber totalPrice orderStatus');

  if (!deliveryBoy) {
    res.status(404);
    throw new Error('Delivery boy not found');
  }

  res.json(deliveryBoy);
});

// @desc    Create delivery boy
// @route   POST /api/delivery-boys
// @access  Private (Admin)
const createDeliveryBoy = asyncHandler(async (req, res) => {
  const {
    name, email, password, phone, dateOfBirth, gender, address,
    salary, vehicle, emergencyContact, serviceAreas
  } = req.body;

  if (!name || !email || !password || !phone || !dateOfBirth || !gender || !address || !salary || !vehicle || !emergencyContact) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const existingDeliveryBoy = await DeliveryBoy.findOne({
    $or: [{ email: email.toLowerCase() }, { phone }]
  });

  if (existingDeliveryBoy) {
    res.status(400);
    throw new Error('Delivery boy with this email or phone already exists');
  }

  const deliveryBoy = await DeliveryBoy.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    dateOfBirth,
    gender,
    address,
    salary,
    vehicle,
    emergencyContact,
    serviceAreas: serviceAreas || [],
    joiningDate: new Date()
  });

  res.status(201).json({
    _id: deliveryBoy._id,
    name: deliveryBoy.name,
    email: deliveryBoy.email,
    phone: deliveryBoy.phone,
    employeeId: deliveryBoy.employeeId,
    status: deliveryBoy.status,
    isActive: deliveryBoy.isActive,
    isVerified: deliveryBoy.isVerified
  });
});

// @desc    Update delivery boy
// @route   PUT /api/delivery-boys/:id
// @access  Private (Admin)
const updateDeliveryBoy = asyncHandler(async (req, res) => {
  const deliveryBoy = await DeliveryBoy.findById(req.params.id);

  if (!deliveryBoy) {
    res.status(404);
    throw new Error('Delivery boy not found');
  }

  const updatedFields = { ...req.body };
  delete updatedFields.password; // Don't allow password update through this route
  delete updatedFields.employeeId; // Don't allow employee ID change

  Object.keys(updatedFields).forEach(key => {
    if (updatedFields[key] !== undefined) {
      deliveryBoy[key] = updatedFields[key];
    }
  });

  const updatedDeliveryBoy = await deliveryBoy.save();

  res.json({
    _id: updatedDeliveryBoy._id,
    name: updatedDeliveryBoy.name,
    email: updatedDeliveryBoy.email,
    phone: updatedDeliveryBoy.phone,
    employeeId: updatedDeliveryBoy.employeeId,
    status: updatedDeliveryBoy.status,
    isActive: updatedDeliveryBoy.isActive,
    isVerified: updatedDeliveryBoy.isVerified,
    performance: updatedDeliveryBoy.performance
  });
});

// @desc    Verify delivery boy
// @route   PUT /api/delivery-boys/:id/verify
// @access  Private (Admin)
const verifyDeliveryBoy = asyncHandler(async (req, res) => {
  const deliveryBoy = await DeliveryBoy.findById(req.params.id);

  if (!deliveryBoy) {
    res.status(404);
    throw new Error('Delivery boy not found');
  }

  deliveryBoy.isVerified = true;
  deliveryBoy.verifiedBy = req.user._id;
  deliveryBoy.verifiedAt = new Date();

  await deliveryBoy.save();

  res.json({ message: 'Delivery boy verified successfully' });
});

// @desc    Delete delivery boy
// @route   DELETE /api/delivery-boys/:id
// @access  Private (Admin)
const deleteDeliveryBoy = asyncHandler(async (req, res) => {
  const deliveryBoy = await DeliveryBoy.findById(req.params.id);

  if (!deliveryBoy) {
    res.status(404);
    throw new Error('Delivery boy not found');
  }

  // Check if delivery boy has active orders
  const activeOrders = deliveryBoy.currentOrders.filter(order => 
    ['assigned', 'picked-up', 'in-transit'].includes(order.status)
  );

  if (activeOrders.length > 0) {
    res.status(400);
    throw new Error('Cannot delete delivery boy with active orders');
  }

  await DeliveryBoy.findByIdAndDelete(req.params.id);

  res.json({ message: 'Delivery boy deleted successfully' });
});

// @desc    Assign order to delivery boy
// @route   POST /api/delivery-boys/:id/assign-order
// @access  Private (Admin)
const assignOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400);
    throw new Error('Order ID is required');
  }

  const deliveryBoy = await DeliveryBoy.findById(req.params.id);
  const order = await Order.findById(orderId);

  if (!deliveryBoy) {
    res.status(404);
    throw new Error('Delivery boy not found');
  }

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!deliveryBoy.isAvailableForDelivery()) {
    res.status(400);
    throw new Error('Delivery boy is not available for delivery');
  }

  // Check if delivery boy can deliver to order's area
  const orderZipCode = order.shippingAddress.zipCode;
  if (!deliveryBoy.canDeliverToArea(orderZipCode)) {
    res.status(400);
    throw new Error('Delivery boy cannot deliver to this area');
  }

  // Assign order
  deliveryBoy.currentOrders.push({
    order: orderId,
    assignedAt: new Date(),
    status: 'assigned'
  });

  order.deliveryBoy = deliveryBoy._id;
  order.deliveryAssignedAt = new Date();
  order.orderStatus = 'processing';

  await Promise.all([deliveryBoy.save(), order.save()]);

  res.json({ message: 'Order assigned successfully' });
});

// @desc    Get available delivery boys for area
// @route   GET /api/delivery-boys/available/:zipCode
// @access  Private (Admin)
const getAvailableDeliveryBoys = asyncHandler(async (req, res) => {
  const { zipCode } = req.params;

  const availableDeliveryBoys = await DeliveryBoy.find({
    isActive: true,
    isVerified: true,
    status: 'available',
    'serviceAreas.zipCodes': zipCode,
    'serviceAreas.isActive': true
  })
  .select('name phone currentLocation performance serviceAreas')
  .sort({ 'performance.averageRating': -1 });

  // Filter by current workload
  const filteredDeliveryBoys = availableDeliveryBoys.filter(db => 
    db.getCurrentWorkload() < 5
  );

  res.json(filteredDeliveryBoys);
});

// DELIVERY BOY APP ROUTES

// @desc    Delivery boy login
// @route   POST /api/delivery-boys/auth/login
// @access  Public
const loginDeliveryBoy = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const deliveryBoy = await DeliveryBoy.findOne({ email: email.toLowerCase() });

  if (!deliveryBoy || !(await deliveryBoy.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!deliveryBoy.isActive) {
    res.status(401);
    throw new Error('Account is deactivated');
  }

  if (!deliveryBoy.isVerified) {
    res.status(401);
    throw new Error('Account is not verified. Please contact admin.');
  }

  deliveryBoy.lastLogin = new Date();
  await deliveryBoy.save();

  const token = generateToken(deliveryBoy._id, 'delivery-boy');

  res.json({
    _id: deliveryBoy._id,
    name: deliveryBoy.name,
    email: deliveryBoy.email,
    phone: deliveryBoy.phone,
    employeeId: deliveryBoy.employeeId,
    status: deliveryBoy.status,
    currentLocation: deliveryBoy.currentLocation,
    performance: deliveryBoy.performance,
    token,
    userType: 'delivery-boy'
  });
});

// @desc    Update delivery boy status
// @route   PUT /api/delivery-boys/status
// @access  Private (Delivery Boy)
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['available', 'busy', 'offline', 'on-break'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const deliveryBoy = await DeliveryBoy.findById(req.user._id);

  if (!deliveryBoy) {
    res.status(404);
    throw new Error('Delivery boy not found');
  }

  deliveryBoy.status = status;
  await deliveryBoy.save();

  res.json({ message: 'Status updated successfully', status });
});

// @desc    Update location
// @route   PUT /api/delivery-boys/location
// @access  Private (Delivery Boy)
const updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude, address } = req.body;

  if (!latitude || !longitude) {
    res.status(400);
    throw new Error('Latitude and longitude are required');
  }

  const deliveryBoy = await DeliveryBoy.findById(req.user._id);

  if (!deliveryBoy) {
    res.status(404);
    throw new Error('Delivery boy not found');
  }

  deliveryBoy.updateLocation(latitude, longitude, address);
  await deliveryBoy.save();

  res.json({ message: 'Location updated successfully' });
});

// @desc    Get assigned orders
// @route   GET /api/delivery-boys/orders
// @access  Private (Delivery Boy)
const getAssignedOrders = asyncHandler(async (req, res) => {
  const deliveryBoy = await DeliveryBoy.findById(req.user._id)
    .populate({
      path: 'currentOrders.order',
      populate: {
        path: 'user',
        select: 'name phone'
      }
    });

  if (!deliveryBoy) {
    res.status(404);
    throw new Error('Delivery boy not found');
  }

  const activeOrders = deliveryBoy.currentOrders.filter(orderItem => 
    ['assigned', 'picked-up', 'in-transit'].includes(orderItem.status)
  );

  res.json(activeOrders);
});

// @desc    Update order status
// @route   PUT /api/delivery-boys/orders/:orderId/status
// @access  Private (Delivery Boy)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { orderId } = req.params;

  if (!['picked-up', 'in-transit', 'delivered'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const deliveryBoy = await DeliveryBoy.findById(req.user._id);
  const order = await Order.findById(orderId);

  if (!deliveryBoy || !order) {
    res.status(404);
    throw new Error('Delivery boy or order not found');
  }

  // Find the order in delivery boy's current orders
  const orderItem = deliveryBoy.currentOrders.find(item => 
    item.order.toString() === orderId
  );

  if (!orderItem) {
    res.status(400);
    throw new Error('Order not assigned to this delivery boy');
  }

  // Update order status
  orderItem.status = status;
  
  if (status === 'picked-up') {
    order.deliveryPickedUpAt = new Date();
    order.orderStatus = 'shipped';
  } else if (status === 'in-transit') {
    order.deliveryInTransitAt = new Date();
  } else if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.actualDeliveryDate = new Date();
    order.orderStatus = 'delivered';
    
    // Update delivery boy performance
    deliveryBoy.performance.totalDeliveries += 1;
    deliveryBoy.performance.successfulDeliveries += 1;
    
    // Remove from current orders
    deliveryBoy.currentOrders = deliveryBoy.currentOrders.filter(item => 
      item.order.toString() !== orderId
    );
  }

  await Promise.all([deliveryBoy.save(), order.save()]);

  res.json({ message: 'Order status updated successfully' });
});

export {
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
};