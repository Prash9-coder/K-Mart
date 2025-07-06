import asyncHandler from 'express-async-handler';
import aiService from '../services/aiService.js';
import barcodeService from '../services/barcodeService.js';

// @desc    Generate product description using AI
// @route   POST /api/ai/generate-description
// @access  Private/Admin
const generateProductDescription = asyncHandler(async (req, res) => {
  try {
    const { name, category, brand, weight, unit, tags, price } = req.body;

    if (!name || !category) {
      res.status(400);
      throw new Error('Product name and category are required');
    }

    const productData = {
      name,
      category,
      brand,
      weight,
      unit,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      price
    };

    const description = await aiService.generateProductDescription(productData);

    res.json({
      success: true,
      description
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || 'Failed to generate product description');
  }
});

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Public
const chatWithAI = asyncHandler(async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      res.status(400);
      throw new Error('Message is required');
    }

    const context = {
      userId: req.user?._id,
      userType: req.user?.isAdmin ? 'admin' : 'customer',
      conversationHistory
    };

    const response = await aiService.generateChatResponse(message, context);

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || 'Failed to generate chat response');
  }
});

// @desc    Get product recommendations from AI
// @route   POST /api/ai/recommendations
// @access  Public
const getProductRecommendations = asyncHandler(async (req, res) => {
  try {
    const { category, budget, preferences = [] } = req.body;

    const criteria = {
      category,
      budget: budget ? parseFloat(budget) : null,
      preferences: Array.isArray(preferences) ? preferences : []
    };

    const recommendations = await aiService.generateProductRecommendations(criteria);

    res.json({
      success: true,
      ...recommendations
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || 'Failed to generate recommendations');
  }
});

// @desc    Generate barcode for product
// @route   POST /api/ai/generate-barcode
// @access  Private/Admin
const generateBarcode = asyncHandler(async (req, res) => {
  try {
    const { productId, productName, type = 'CODE128' } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    let barcode;
    
    if (type === 'EAN13') {
      // Generate EAN-13 for retail products
      const manufacturerCode = '1234'; // You can make this configurable
      const productCode = productId.toString().slice(-5).padStart(5, '0');
      barcode = barcodeService.generateEAN13('890', manufacturerCode, productCode);
    } else {
      // Generate standard barcode
      barcode = barcodeService.generateBarcode(productId, productName);
    }

    // Get barcode configuration for client-side image generation
    const barcodeConfig = barcodeService.getBarcodeConfig(barcode, {
      format: type,
      width: 2,
      height: 100,
      displayValue: true
    });

    res.json({
      success: true,
      barcode,
      barcodeConfig,
      type
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || 'Failed to generate barcode');
  }
});

// @desc    Validate barcode
// @route   POST /api/ai/validate-barcode
// @access  Private/Admin
const validateBarcode = asyncHandler(async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      res.status(400);
      throw new Error('Barcode is required');
    }

    const isValid = barcodeService.validateBarcode(barcode);

    res.json({
      success: true,
      isValid,
      barcode
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || 'Failed to validate barcode');
  }
});

export {
  generateProductDescription,
  chatWithAI,
  getProductRecommendations,
  generateBarcode,
  validateBarcode
};