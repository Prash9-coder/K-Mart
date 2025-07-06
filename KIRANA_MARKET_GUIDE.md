# 🏪 Kirana Market - Complete Digital Solution

A comprehensive digital platform for traditional Kirana (neighborhood grocery) stores with modern e-commerce capabilities, local delivery system, and customer relationship management.

## 🌟 Features Overview

### 🔐 **Security & Authentication**
- **Separate Login Systems**: Complete security separation between Admin, Customer, and Delivery Boy
- **Role-Based Access Control**: Super Admin, Admin, Manager, Staff with specific permissions
- **Enhanced Security**: Account locking, login attempt tracking, JWT tokens with different expiry times

### 👥 **User Management**
- **Customer Profiles**: Complete customer management with purchase history, preferences, and analytics
- **Admin Management**: Multi-level admin system with role-based permissions
- **Delivery Boy System**: Complete delivery personnel management with performance tracking

### 💳 **Credit/Udhar System**
- **Credit Accounts**: Traditional "udhar" system digitized with credit limits and tracking
- **Credit Scoring**: Dynamic credit scoring based on payment history
- **Payment Tracking**: Complete transaction history with receipts and due dates
- **Credit Analytics**: Comprehensive reporting for credit management

### 🎯 **Loyalty Points & Rewards**
- **Tier System**: Bronze, Silver, Gold, Platinum customer tiers
- **Points Earning**: Automatic point calculation on purchases
- **Redemption System**: Use points for discounts and rewards
- **Customer Analytics**: Purchase patterns, favorite categories, spending analysis

### 🚚 **Delivery Management**
- **Real-time Tracking**: Live location tracking of delivery personnel
- **Service Areas**: ZIP code-based delivery area management
- **Performance Metrics**: Success rates, ratings, earnings tracking
- **Order Assignment**: Intelligent order assignment based on location and workload

### 📦 **Inventory Management**
- **Stock Tracking**: Real-time stock levels with reserved and available quantities
- **Batch Management**: Expiry tracking, FIFO management for perishables
- **Auto Alerts**: Low stock, out of stock, expiry warnings
- **Stock Movements**: Complete audit trail of all inventory changes
- **Reorder Management**: Automatic reorder suggestions and supplier management

### 💰 **Wholesale & Bulk Pricing**
- **Bulk Pricing Tiers**: Quantity-based pricing for different customer segments
- **Wholesale Accounts**: Special pricing for wholesale customers
- **Customer Types**: Regular, Premium, Wholesale, VIP with different benefits

### 📱 **WhatsApp Integration**
- **Order via WhatsApp**: Customers can place orders through WhatsApp messages
- **AI Processing**: Automatic order parsing and product matching
- **Quote Generation**: Automatic price quotes sent via WhatsApp
- **Conversation Management**: Complete message history and status tracking

### 🔔 **Notification System**
- **Multi-channel**: Push, Email, SMS, WhatsApp, In-app notifications
- **Smart Targeting**: Role-specific notifications (Customer/Admin/Delivery)
- **Delivery Tracking**: Status tracking for all notification channels
- **Bulk Notifications**: Send announcements to customer segments

### 🏪 **Kirana-Specific Features**
- **Local Language Support**: Hindi and regional language product names
- **Seasonal Products**: Availability tracking by months and seasons
- **Local Sourcing**: Farm location, harvest date tracking for fresh produce
- **Storage Requirements**: Temperature, humidity specifications for proper storage

## 🚀 **Getting Started**

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Kirana-Project
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   Create `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/kiranamarket
   JWT_SECRET=your_jwt_secret_key_here
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Payment Gateway (Optional)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_SECRET=your_razorpay_secret
   
   # WhatsApp API (Optional)
   WHATSAPP_API_URL=your_whatsapp_api_url
   WHATSAPP_API_TOKEN=your_whatsapp_api_token
   ```

5. **Database Setup**
   ```bash
   # Start MongoDB service
   # Then seed the database with sample data
   cd server
   npm run kirana:import
   ```

6. **Start the application**
   ```bash
   # Start server (from server directory)
   npm run dev
   
   # Start client (from client directory)
   npm run dev
   ```

## 🔑 **Default Login Credentials**

### Admin Logins
- **Super Admin**: superadmin@kiranamarket.com / admin123456
- **Manager**: manager@kiranamarket.com / manager123
- **Staff**: staff@kiranamarket.com / staff123

### Customer Logins
- **Regular Customer**: rajesh@example.com / customer123
- **Premium Customer**: priya@example.com / customer123
- **Wholesale Customer**: wholesale@example.com / customer123

### Delivery Boy Logins
- **Delivery Boy 1**: amit@kiranamarket.com / delivery123
- **Delivery Boy 2**: ravi@kiranamarket.com / delivery123

## 📱 **API Endpoints**

### Authentication
```
POST /api/admin/auth/login          # Admin login
POST /api/customer/auth/register    # Customer registration
POST /api/customer/auth/login       # Customer login
POST /api/delivery-boys/auth/login  # Delivery boy login
```

### Customer Management
```
GET  /api/customer/auth/profile     # Get customer profile
PUT  /api/customer/auth/profile     # Update customer profile
POST /api/customer/auth/address     # Add customer address
GET  /api/customer/auth/loyalty-points  # Get loyalty points
GET  /api/customer/auth/credit-account  # Get credit account
```

### Admin Management
```
GET  /api/admin/auth/admins         # Get all admins (Super Admin only)
POST /api/admin/auth/create         # Create new admin (Super Admin only)
PUT  /api/admin/auth/admin/:id      # Update admin (Super Admin only)
```

### Inventory Management
```
GET  /api/inventory                 # Get inventory items
POST /api/inventory                 # Create inventory
POST /api/inventory/:id/movement    # Add stock movement
GET  /api/inventory/alerts          # Get active alerts
GET  /api/inventory/analytics       # Get inventory analytics
```

### Credit Management
```
GET  /api/credit/customers          # Get credit customers
PUT  /api/credit/customer/:id/approve  # Approve credit account
POST /api/credit/customer/:id/payment  # Record payment
GET  /api/credit/analytics          # Get credit analytics
```

### Delivery Management
```
GET  /api/delivery-boys             # Get delivery boys
POST /api/delivery-boys             # Create delivery boy
POST /api/delivery-boys/:id/assign-order  # Assign order
GET  /api/delivery-boys/available/:zipCode  # Get available delivery boys
```

### WhatsApp Integration
```
POST /api/whatsapp/webhook          # WhatsApp webhook
GET  /api/whatsapp/orders           # Get WhatsApp orders
POST /api/whatsapp/orders/:id/quote # Generate quote
POST /api/whatsapp/orders/:id/confirm  # Confirm order
```

### Notifications
```
GET  /api/notifications             # Get user notifications
PUT  /api/notifications/:id/read    # Mark as read
POST /api/notifications/send        # Send notification (Admin)
POST /api/notifications/send-bulk   # Send bulk notification (Admin)
```

## 🏗️ **System Architecture**

### Backend Structure
```
server/
├── controllers/          # Business logic
├── models/              # Database schemas
├── routes/              # API routes
├── middleware/          # Authentication & validation
├── utils/               # Helper functions
├── data/                # Seeders and sample data
└── uploads/             # File uploads
```

### Database Models
- **Admin**: Admin user management with roles and permissions
- **Customer**: Customer profiles with loyalty points and credit accounts
- **DeliveryBoy**: Delivery personnel with performance tracking
- **Product**: Product catalog with Kirana-specific fields
- **Order**: Order management with delivery tracking
- **Inventory**: Stock management with batch tracking
- **CreditTransaction**: Credit/Udhar transaction history
- **WhatsAppOrder**: WhatsApp order processing
- **Notification**: Multi-channel notification system

## 🔧 **Configuration**

### Admin Permissions
- `manage-products`: Product catalog management
- `manage-orders`: Order processing and management
- `manage-customers`: Customer relationship management
- `manage-delivery-boys`: Delivery personnel management
- `manage-inventory`: Stock and inventory management
- `view-analytics`: Access to reports and analytics
- `manage-coupons`: Discount and coupon management
- `manage-credit`: Credit/Udhar system management
- `manage-payments`: Payment processing
- `manage-staff`: Staff and admin management

### Customer Types
- **Regular**: Standard customers with basic features
- **Premium**: Enhanced features and priority support
- **Wholesale**: Bulk pricing and wholesale features
- **VIP**: All premium features with maximum benefits

### Notification Channels
- **Push**: Mobile app push notifications
- **Email**: Email notifications with templates
- **SMS**: Text message notifications
- **WhatsApp**: WhatsApp Business API integration
- **In-app**: Dashboard notifications

## 📊 **Analytics & Reporting**

### Customer Analytics
- Purchase history and patterns
- Favorite categories and products
- Spending analysis and trends
- Loyalty points earning/redemption
- Credit utilization and payment history

### Inventory Analytics
- Stock turnover rates
- Fast/slow moving products
- Category-wise performance
- Supplier performance
- Waste and expiry tracking

### Delivery Analytics
- Delivery boy performance metrics
- Area-wise delivery statistics
- Customer satisfaction ratings
- Delivery time analysis
- Route optimization insights

### Credit Analytics
- Outstanding balances
- Payment trends
- Credit score distribution
- Risk assessment
- Collection efficiency

## 🔒 **Security Features**

### Authentication Security
- Separate authentication systems for different user types
- JWT tokens with role-based expiry times
- Account locking after failed login attempts
- Password strength requirements
- Two-factor authentication support (for admins)

### Data Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Audit trails for sensitive operations

### Access Control
- Role-based permissions
- Resource-level access control
- API endpoint protection
- File upload security
- Session management

## 🚀 **Deployment**

### Production Setup
1. Set up MongoDB cluster
2. Configure environment variables
3. Set up SSL certificates
4. Configure reverse proxy (Nginx)
5. Set up monitoring and logging
6. Configure backup strategies

### Scaling Considerations
- Database indexing optimization
- Caching strategies (Redis)
- Load balancing
- CDN for static assets
- Microservices architecture (future)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 **Support**

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the traditional Kirana store ecosystem**