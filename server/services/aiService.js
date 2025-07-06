import { GoogleGenerativeAI } from '@google/generative-ai';
import { Product, Order, User } from '../models/index.js';

class AIService {
  constructor() {
    // Check if we have a valid API key
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Flag to determine if we should use mock responses
    this.useMockResponses = !apiKey || apiKey === 'your_google_gemini_api_key_here';
    
    if (!this.useMockResponses) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    } else {
      console.log('Using mock AI responses - please set a valid GEMINI_API_KEY in .env');
    }
  }

  // Generate product description based on product details
  async generateProductDescription(productData) {
    try {
      const { name, category, brand, weight, unit, tags, price } = productData;
      
      // Use mock response for development or when API key is missing
      if (this.useMockResponses) {
        console.log('Using mock product description for:', name);
        return this.getMockProductDescription(productData);
      }
      
      const prompt = `
        Generate a compelling and informative product description for a kirana/grocery store item with the following details:
        
        Product Name: ${name}
        Category: ${category}
        Brand: ${brand || 'Generic'}
        Weight/Size: ${weight ? `${weight} ${unit}` : 'Standard size'}
        Price: ₹${price || 'Competitive pricing'}
        Tags: ${tags ? tags.join(', ') : 'Quality product'}
        
        Please create a description that:
        1. Highlights the key features and benefits
        2. Appeals to Indian customers shopping for groceries
        3. Mentions quality, freshness, and value for money
        4. Is 2-3 sentences long and engaging
        5. Uses simple, clear language
        6. Includes relevant keywords for search optimization
        
        Format the response as plain text without any markdown or special formatting.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating product description:', error);
      throw new Error('Failed to generate product description');
    }
  }

  // AI Chatbot response generation
  async generateChatResponse(message, context = {}) {
    try {
      const { userId, userType = 'customer', conversationHistory = [] } = context;
      
      // Use mock response for development or when API key is missing
      if (this.useMockResponses) {
        console.log('Using mock chat response for message:', message);
        return this.getMockChatResponse(message);
      }
      
      // Get relevant context based on user type
      let contextInfo = '';
      if (userId && userType === 'customer') {
        contextInfo = await this.getCustomerContext(userId);
      }

      const systemPrompt = `
        You are an AI assistant for K-Store Cart, a kirana (grocery) store e-commerce platform in India. 
        You help customers with:
        - Product inquiries and recommendations
        - Order status and tracking
        - General shopping assistance
        - Account and cart management
        - Store policies and information
        
        Store Information:
        - Name: K-Store Cart
        - Type: Online Kirana/Grocery Store
        - Delivery: Fast delivery available
        - Payment: Multiple payment options accepted
        - Contact: support@kstorecard.com, (+91)9346335587, 6300472707
        - Address: 123 Market Street, City, State 12345
        
        ${contextInfo}
        
        Guidelines:
        1. Be helpful, friendly, and professional
        2. Use simple, clear language
        3. Provide specific product recommendations when asked
        4. Help with order-related queries
        5. If you can't help with something, direct them to customer support
        6. Keep responses concise but informative
        7. Use Indian context and terminology
        8. Mention prices in Indian Rupees (₹)
        
        Previous conversation:
        ${conversationHistory.slice(-5).map(msg => `${msg.sender}: ${msg.message}`).join('\n')}
        
        Customer message: ${message}
        
        Respond as the K-Store Cart AI assistant:
      `;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating chat response:', error);
      return "I'm sorry, I'm having trouble responding right now. Please contact our customer support at support@kstorecard.com or call (+91)9346335587 for immediate assistance.";
    }
  }

  // Get customer context for personalized responses
  async getCustomerContext(userId) {
    try {
      const user = await User.findById(userId).select('name email');
      const recentOrders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('orderItems.product', 'name category');
      
      const popularProducts = await Product.find({ isActive: true })
        .sort({ rating: -1, numReviews: -1 })
        .limit(5)
        .select('name category price');

      let context = `
        Customer Information:
        - Name: ${user?.name || 'Valued Customer'}
        - Email: ${user?.email || 'Not provided'}
      `;

      if (recentOrders.length > 0) {
        context += `
        Recent Orders:
        ${recentOrders.map(order => 
          `- Order #${order._id.toString().slice(-6)} (${order.orderStatus}) - ₹${order.totalPrice}`
        ).join('\n')}
        `;
      }

      context += `
        Popular Products Available:
        ${popularProducts.map(product => 
          `- ${product.name} (${product.category}) - ₹${product.price}`
        ).join('\n')}
      `;

      return context;
    } catch (error) {
      console.error('Error getting customer context:', error);
      return '';
    }
  }

  // Generate product recommendations
  async generateProductRecommendations(criteria) {
    try {
      const { category, budget, preferences = [] } = criteria;
      
      // Use mock response for development or when API key is missing
      if (this.useMockResponses) {
        console.log('Using mock product recommendations');
        return this.getMockProductRecommendations(criteria);
      }
      
      let query = { isActive: true };
      if (category) query.category = category;
      if (budget) query.price = { $lte: budget };

      const products = await Product.find(query)
        .sort({ rating: -1, numReviews: -1 })
        .limit(10)
        .select('name category price rating numReviews description');

      const prompt = `
        Based on the following products available in our K-Store Cart inventory, recommend the best 3-5 products for a customer looking for:
        Category: ${category || 'Any'}
        Budget: ${budget ? `₹${budget}` : 'Any budget'}
        Preferences: ${preferences.join(', ') || 'Quality products'}
        
        Available Products:
        ${products.map(p => 
          `- ${p.name} (${p.category}) - ₹${p.price} - Rating: ${p.rating}/5 (${p.numReviews} reviews)`
        ).join('\n')}
        
        Provide recommendations with brief reasons why each product is good, focusing on value, quality, and customer satisfaction.
        Format as a simple list without markdown.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return {
        recommendations: response.text().trim(),
        products: products.slice(0, 5)
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate product recommendations');
    }
  }
  
  // Mock methods for development and testing
  
  // Generate mock product description
  getMockProductDescription(productData) {
    const { name, category, brand, weight, unit, price, tags } = productData;
    
    const descriptions = {
      'Basmati Rice': `Premium ${brand || 'quality'} Basmati Rice, known for its aromatic fragrance and long grains. Perfect for biryanis and pulao, this ${weight} ${unit} pack offers excellent value for money at just ₹${price}.`,
      'default': `High-quality ${name} from ${brand || 'our trusted suppliers'}. This ${category} product weighing ${weight} ${unit} is priced at just ₹${price}, offering great value. ${tags ? 'Features: ' + tags.join(', ') : ''}`
    };
    
    return descriptions[name] || descriptions['default'];
  }
  
  // Generate mock chat response
  getMockChatResponse(message) {
    const responses = {
      'hello': 'Hello! How can I help you with your grocery shopping today?',
      'help': 'I can help you find products, check prices, provide cooking tips, or answer questions about our store. What would you like to know?',
      'default': 'Thank you for your message. Our team is here to help with all your grocery needs. Is there anything specific you\'re looking for today?'
    };
    
    // Check if message contains certain keywords
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return responses['hello'];
    } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return responses['help'];
    }
    
    return responses['default'];
  }
  
  // Generate mock product recommendations
  getMockProductRecommendations(criteria) {
    return {
      recommendations: [
        {
          name: 'Tata Salt',
          price: 42,
          description: 'Iodized salt for daily cooking needs',
          category: 'Essentials'
        },
        {
          name: 'Aashirvaad Atta',
          price: 350,
          description: 'Premium whole wheat flour for rotis',
          category: 'Flour & Grains'
        },
        {
          name: 'Maggi Noodles',
          price: 60,
          description: 'Quick and tasty instant noodles',
          category: 'Instant Food'
        }
      ],
      message: 'Here are some popular products you might like'
    };
  }
}

export default new AIService();