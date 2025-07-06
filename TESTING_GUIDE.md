# Kirana Market - Production Testing Guide

This guide will help you thoroughly test your deployed Kirana Market application to ensure everything is working correctly in production.

## 1. Basic Functionality Testing

### Frontend Loading
- [ ] Verify the homepage loads correctly
- [ ] Check that all images and assets are loading
- [ ] Test navigation between different pages
- [ ] Verify responsive design on mobile devices

### User Authentication
- [ ] Test user registration with a new email
- [ ] Verify email validation works
- [ ] Test login with correct credentials
- [ ] Test login with incorrect credentials
- [ ] Test password reset functionality
- [ ] Verify logout functionality

## 2. Product Functionality

### Product Browsing
- [ ] Verify product listings load correctly
- [ ] Test product search functionality
- [ ] Test product filtering by category
- [ ] Test product sorting (price, popularity, etc.)
- [ ] Verify product images load correctly

### Product Details
- [ ] Verify product details page loads correctly
- [ ] Test image gallery functionality
- [ ] Verify product description, price, and availability are displayed correctly
- [ ] Test "Add to Cart" functionality
- [ ] Test "Add to Wishlist" functionality

## 3. Shopping Cart

### Cart Management
- [ ] Add multiple products to cart
- [ ] Update product quantities in cart
- [ ] Remove products from cart
- [ ] Verify cart total is calculated correctly
- [ ] Test cart persistence after logout/login

### Checkout Process
- [ ] Proceed to checkout from cart
- [ ] Test address form validation
- [ ] Test coupon code application
- [ ] Verify order summary is correct
- [ ] Test different payment methods

## 4. Payment Processing

### Stripe Integration
- [ ] Test successful payment with test card: 4242 4242 4242 4242
- [ ] Test failed payment with test card: 4000 0000 0000 0002
- [ ] Test card authentication with test card: 4000 0025 0000 3155
- [ ] Verify payment confirmation page
- [ ] Check for order confirmation email

## 5. User Account

### Account Management
- [ ] View and update profile information
- [ ] Change password
- [ ] View order history
- [ ] Track current orders
- [ ] Manage saved addresses
- [ ] View and manage wishlist

## 6. Admin Functionality

### Admin Authentication
- [ ] Test admin login
- [ ] Verify admin-only routes are protected

### Product Management
- [ ] Add a new product
- [ ] Edit an existing product
- [ ] Upload product images
- [ ] Delete a product
- [ ] Test AI product description generator

### Order Management
- [ ] View all orders
- [ ] Update order status
- [ ] View order details
- [ ] Process refunds

### User Management
- [ ] View all users
- [ ] Edit user details
- [ ] Disable/enable user accounts

### Inventory Management
- [ ] View inventory levels
- [ ] Update stock quantities
- [ ] Set low stock alerts
- [ ] Generate barcodes

### Analytics Dashboard
- [ ] Verify sales charts load correctly
- [ ] Check revenue statistics
- [ ] View popular products
- [ ] Test date range filters

## 7. Performance Testing

### Load Time
- [ ] Measure homepage load time
- [ ] Measure product page load time
- [ ] Measure checkout page load time

### API Response
- [ ] Check API response times for product listings
- [ ] Check API response times for cart operations
- [ ] Check API response times for user authentication

## 8. Security Testing

### Authentication
- [ ] Verify JWT expiration works correctly
- [ ] Test access to protected routes without authentication
- [ ] Test CSRF protection

### Input Validation
- [ ] Test form validation for all inputs
- [ ] Test API endpoints with invalid data
- [ ] Test for SQL injection vulnerabilities
- [ ] Test for XSS vulnerabilities

## 9. Error Handling

### Client-Side Errors
- [ ] Test error messages for form validation
- [ ] Test error handling for failed API requests
- [ ] Verify error boundaries catch component errors

### Server-Side Errors
- [ ] Test error responses for invalid API requests
- [ ] Test error handling for database connection issues
- [ ] Verify 404 page for non-existent routes

## 10. Integration Testing

### Email Notifications
- [ ] Verify order confirmation emails
- [ ] Test password reset emails
- [ ] Check welcome emails for new users

### Third-Party Services
- [ ] Test Stripe webhook functionality
- [ ] Verify Gemini AI integration
- [ ] Test any other third-party integrations

## Test Data

### Test Credit Cards (Stripe)
- **Successful payment**: 4242 4242 4242 4242
- **Failed payment**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

### Test User Accounts
- **Customer**: customer@test.com / password123
- **Admin**: admin@test.com / admin123

## Reporting Issues

If you encounter any issues during testing, document them with the following information:
1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Browser/device information

Submit issues to the project repository or contact the development team directly.