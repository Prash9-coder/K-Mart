import asyncHandler from 'express-async-handler';
import WhatsAppOrder from '../models/WhatsAppOrder.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Receive WhatsApp message webhook
// @route   POST /api/whatsapp/webhook
// @access  Public (WhatsApp webhook)
const receiveWhatsAppMessage = asyncHandler(async (req, res) => {
  const { phoneNumber, messageId, content, customerName, conversationId } = req.body;

  if (!phoneNumber || !messageId || !content) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  // Find or create customer
  let customer = await Customer.findOne({ phone: phoneNumber });
  
  if (!customer) {
    // Create new customer from WhatsApp
    customer = await Customer.create({
      name: customerName || `WhatsApp Customer ${phoneNumber}`,
      email: `${phoneNumber}@whatsapp.temp`, // Temporary email
      password: 'temp123', // Temporary password
      phone: phoneNumber,
      whatsappNumber: phoneNumber,
      whatsappVerified: true
    });
  }

  // Check if this is a new order or continuation
  let whatsappOrder = await WhatsAppOrder.findOne({ conversationId });

  if (!whatsappOrder) {
    // Create new WhatsApp order
    whatsappOrder = await WhatsAppOrder.create({
      customer: customer._id,
      phoneNumber,
      customerName: customer.name,
      conversationId,
      messageId,
      orderText: content,
      parsedItems: [],
      status: 'received'
    });

    // Parse the order text (simplified version)
    const parsedItems = await parseOrderText(content);
    whatsappOrder.parsedItems = parsedItems;
    whatsappOrder.status = 'processing';
    
    await whatsappOrder.save();
  }

  // Add message to conversation
  whatsappOrder.addMessage('incoming', content, messageId);
  await whatsappOrder.save();

  // Process the order if it's a new order
  if (whatsappOrder.status === 'processing') {
    await processWhatsAppOrder(whatsappOrder);
  }

  res.json({ message: 'Message received and processed' });
});

// @desc    Get all WhatsApp orders
// @route   GET /api/whatsapp/orders
// @access  Private (Admin)
const getWhatsAppOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.needsReview === 'true') {
    filter['processingDetails.needsHumanReview'] = true;
  }

  const orders = await WhatsAppOrder.find(filter)
    .populate('customer', 'name phone email')
    .populate('assignedTo', 'name')
    .populate('order', 'orderNumber totalPrice orderStatus')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await WhatsAppOrder.countDocuments(filter);

  res.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get WhatsApp order by ID
// @route   GET /api/whatsapp/orders/:id
// @access  Private (Admin)
const getWhatsAppOrderById = asyncHandler(async (req, res) => {
  const order = await WhatsAppOrder.findById(req.params.id)
    .populate('customer', 'name phone email addresses')
    .populate('assignedTo', 'name email')
    .populate('parsedItems.product', 'name price images sku')
    .populate('quote.items.product', 'name price images sku')
    .populate('order');

  if (!order) {
    res.status(404);
    throw new Error('WhatsApp order not found');
  }

  res.json(order);
});

// @desc    Assign WhatsApp order to staff
// @route   PUT /api/whatsapp/orders/:id/assign
// @access  Private (Admin)
const assignWhatsAppOrder = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;

  const order = await WhatsAppOrder.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('WhatsApp order not found');
  }

  order.assignedTo = assignedTo || req.user._id;
  order.assignedAt = new Date();

  await order.save();

  res.json({ message: 'Order assigned successfully' });
});

// @desc    Update parsed items
// @route   PUT /api/whatsapp/orders/:id/items
// @access  Private (Admin)
const updateParsedItems = asyncHandler(async (req, res) => {
  const { parsedItems } = req.body;

  const order = await WhatsAppOrder.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('WhatsApp order not found');
  }

  order.parsedItems = parsedItems;
  order.status = 'items_matched';
  order.processingDetails.processedBy = 'human';

  await order.save();

  res.json({ message: 'Items updated successfully' });
});

// @desc    Generate and send quote
// @route   POST /api/whatsapp/orders/:id/quote
// @access  Private (Admin)
const generateQuote = asyncHandler(async (req, res) => {
  const order = await WhatsAppOrder.findById(req.params.id)
    .populate('parsedItems.product');

  if (!order) {
    res.status(404);
    throw new Error('WhatsApp order not found');
  }

  // Generate quote
  const quote = order.generateQuote();
  await order.save();

  // Send quote via WhatsApp (integrate with WhatsApp API)
  const quoteMessage = formatQuoteMessage(quote);
  await sendWhatsAppMessage(order.phoneNumber, quoteMessage);

  order.addMessage('outgoing', quoteMessage, `quote_${Date.now()}`);
  order.status = 'quote_sent';
  await order.save();

  res.json({ message: 'Quote generated and sent successfully', quote });
});

// @desc    Confirm order
// @route   POST /api/whatsapp/orders/:id/confirm
// @access  Private (Admin)
const confirmWhatsAppOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress, modifications } = req.body;

  const whatsappOrder = await WhatsAppOrder.findById(req.params.id)
    .populate('customer')
    .populate('quote.items.product');

  if (!whatsappOrder) {
    res.status(404);
    throw new Error('WhatsApp order not found');
  }

  if (!whatsappOrder.isQuoteValid()) {
    res.status(400);
    throw new Error('Quote has expired. Please generate a new quote.');
  }

  // Create regular order
  const orderItems = whatsappOrder.quote.items.map(item => ({
    product: item.product._id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    image: item.product.images[0]?.url || null,
    sku: item.product.sku
  }));

  const shippingAddress = {
    firstName: whatsappOrder.customer.name.split(' ')[0],
    lastName: whatsappOrder.customer.name.split(' ').slice(1).join(' ') || '',
    address: deliveryAddress?.address || 'WhatsApp Order',
    city: deliveryAddress?.city || 'Unknown',
    state: deliveryAddress?.state || 'Unknown',
    zipCode: deliveryAddress?.zipCode || '000000',
    country: 'India',
    phone: whatsappOrder.phoneNumber
  };

  const order = await Order.create({
    user: whatsappOrder.customer._id,
    orderItems,
    shippingAddress,
    paymentMethod: 'cod', // Default to COD for WhatsApp orders
    orderStatus: 'confirmed',
    itemsPrice: whatsappOrder.quote.subtotal,
    shippingPrice: whatsappOrder.quote.deliveryCharge,
    totalPrice: whatsappOrder.quote.total,
    orderSource: 'whatsapp',
    whatsappDetails: {
      phoneNumber: whatsappOrder.phoneNumber,
      messageId: whatsappOrder.messageId,
      conversationId: whatsappOrder.conversationId
    }
  });

  // Update WhatsApp order
  whatsappOrder.order = order._id;
  whatsappOrder.status = 'order_created';
  whatsappOrder.customerResponse = {
    confirmed: true,
    responseTime: new Date(),
    modifications
  };

  await whatsappOrder.save();

  // Send confirmation message
  const confirmationMessage = `✅ Order Confirmed!\n\nOrder Number: ${order.orderNumber}\nTotal: ₹${order.totalPrice}\n\nYour order will be delivered soon. Thank you for shopping with us!`;
  
  await sendWhatsAppMessage(whatsappOrder.phoneNumber, confirmationMessage);
  whatsappOrder.addMessage('outgoing', confirmationMessage, `confirm_${Date.now()}`);
  await whatsappOrder.save();

  res.json({ 
    message: 'Order confirmed successfully', 
    order: {
      _id: order._id,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice
    }
  });
});

// @desc    Send WhatsApp message
// @route   POST /api/whatsapp/send-message
// @access  Private (Admin)
const sendMessage = asyncHandler(async (req, res) => {
  const { phoneNumber, message, orderId } = req.body;

  if (!phoneNumber || !message) {
    res.status(400);
    throw new Error('Phone number and message are required');
  }

  // Send message via WhatsApp API
  const messageId = await sendWhatsAppMessage(phoneNumber, message);

  // If orderId is provided, add to conversation
  if (orderId) {
    const whatsappOrder = await WhatsAppOrder.findById(orderId);
    if (whatsappOrder) {
      whatsappOrder.addMessage('outgoing', message, messageId);
      await whatsappOrder.save();
    }
  }

  res.json({ message: 'Message sent successfully', messageId });
});

// Helper functions

const parseOrderText = async (text) => {
  // Simplified order parsing - in production, use NLP/AI
  const lines = text.toLowerCase().split('\n');
  const parsedItems = [];

  for (const line of lines) {
    // Simple pattern matching for "quantity product"
    const match = line.match(/(\d+)\s*(.+)/);
    if (match) {
      const quantity = parseInt(match[1]);
      const productName = match[2].trim();

      // Try to find matching product
      const product = await Product.findOne({
        $or: [
          { name: new RegExp(productName, 'i') },
          { localName: new RegExp(productName, 'i') },
          { hindiName: new RegExp(productName, 'i') },
          { tags: new RegExp(productName, 'i') }
        ]
      });

      parsedItems.push({
        productName,
        quantity,
        unit: 'piece',
        estimatedPrice: product ? product.price : 0,
        product: product ? product._id : null,
        matched: !!product,
        confidence: product ? 0.8 : 0.2
      });
    }
  }

  return parsedItems;
};

const processWhatsAppOrder = async (whatsappOrder) => {
  // Check if all items are matched
  const unmatchedItems = whatsappOrder.parsedItems.filter(item => !item.matched);
  
  if (unmatchedItems.length > 0) {
    whatsappOrder.processingDetails.needsHumanReview = true;
    whatsappOrder.processingDetails.reviewReason = 'Some items could not be matched automatically';
  } else {
    whatsappOrder.status = 'items_matched';
  }

  await whatsappOrder.save();
};

const formatQuoteMessage = (quote) => {
  let message = '🛒 *Your Order Quote*\n\n';
  
  quote.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `   Qty: ${item.quantity} × ₹${item.price} = ₹${item.total}\n\n`;
  });

  message += `Subtotal: ₹${quote.subtotal}\n`;
  message += `Delivery: ₹${quote.deliveryCharge}\n`;
  message += `*Total: ₹${quote.total}*\n\n`;
  message += `Reply with "YES" to confirm or "NO" to cancel.\n`;
  message += `Quote valid until: ${quote.validUntil.toLocaleString()}`;

  return message;
};

const sendWhatsAppMessage = async (phoneNumber, message) => {
  // Integrate with WhatsApp Business API
  // This is a placeholder - implement actual WhatsApp API integration
  console.log(`Sending WhatsApp message to ${phoneNumber}: ${message}`);
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export {
  receiveWhatsAppMessage,
  getWhatsAppOrders,
  getWhatsAppOrderById,
  assignWhatsAppOrder,
  updateParsedItems,
  generateQuote,
  confirmWhatsAppOrder,
  sendMessage
};