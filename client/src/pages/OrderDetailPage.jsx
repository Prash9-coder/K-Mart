import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaArrowLeft, FaCreditCard } from 'react-icons/fa'
import Message from '../components/ui/Message'
import Loader from '../components/ui/Loader'
import StripePaymentWrapper from '../components/payment/StripePaymentWrapper'

const OrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: userInfo } = useSelector((state) => state.auth)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [showStripeForm, setShowStripeForm] = useState(false)
  
  // Mock orders data - in a real app, you would fetch this from an API
  const mockOrders = [
    {
      _id: '1',
      createdAt: '2023-01-15',
      totalPrice: 125.99,
      isPaid: true,
      paidAt: '2023-01-15',
      isDelivered: true,
      deliveredAt: '2023-01-18',
      shippingAddress: {
        address: '123 Main St',
        city: 'Mumbai',
        postalCode: '400001',
        state: 'Maharashtra',
        country: 'India',
        phone: '9876543210'
      },
      paymentMethod: 'UPI',
      orderItems: [
        { name: 'Rice', qty: 2, price: 45.99, image: 'https://via.placeholder.com/50' },
        { name: 'Cooking Oil', qty: 1, price: 34.01, image: 'https://via.placeholder.com/50' }
      ],
      itemsPrice: 125.99,
      taxPrice: 0,
      shippingPrice: 0
    },
    {
      _id: '2',
      createdAt: '2023-02-20',
      totalPrice: 89.99,
      isPaid: true,
      paidAt: '2023-02-20',
      isDelivered: false,
      deliveredAt: null,
      shippingAddress: {
        address: '456 Park Ave',
        city: 'Delhi',
        postalCode: '110001',
        state: 'Delhi',
        country: 'India',
        phone: '9876543211'
      },
      paymentMethod: 'Card',
      orderItems: [
        { name: 'Wheat Flour', qty: 1, price: 29.99, image: 'https://via.placeholder.com/50' },
        { name: 'Sugar', qty: 2, price: 30.00, image: 'https://via.placeholder.com/50' }
      ],
      itemsPrice: 89.99,
      taxPrice: 0,
      shippingPrice: 0
    },
    {
      _id: '3',
      createdAt: '2023-03-10',
      totalPrice: 149.99,
      isPaid: false,
      paidAt: null,
      isDelivered: false,
      deliveredAt: null,
      shippingAddress: {
        address: '789 Lake Rd',
        city: 'Bangalore',
        postalCode: '560001',
        state: 'Karnataka',
        country: 'India',
        phone: '9876543212'
      },
      paymentMethod: 'COD',
      orderItems: [
        { name: 'Detergent', qty: 1, price: 99.99, image: 'https://via.placeholder.com/50' },
        { name: 'Toothpaste', qty: 2, price: 25.00, image: 'https://via.placeholder.com/50' }
      ],
      itemsPrice: 149.99,
      taxPrice: 0,
      shippingPrice: 0
    },
  ]

  // Handle payment process
  const handlePayNow = () => {
    setShowStripeForm(true);
  }
  
  // Handle successful payment
  const handlePaymentSuccess = (paymentIntent) => {
    // Update the order with payment information
    const updatedOrder = {
      ...order,
      isPaid: true,
      paidAt: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      paymentResult: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date().toISOString(),
        email_address: userInfo.email
      }
    }
    
    setOrder(updatedOrder)
    setPaymentSuccess(true)
    setShowStripeForm(false)
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setPaymentSuccess(false)
    }, 3000)
  }
  
  // Handle payment error
  const handlePaymentError = (error) => {
    console.error('Payment failed:', error)
    setPaymentLoading(false)
  }

  // Check if we're using mock authentication (only in development)
  const isDevelopment = import.meta.env.MODE === 'development';
  const isMockAuth = isDevelopment && userInfo && (!userInfo.token || userInfo.token.startsWith('mock_token_') || userInfo.token === 'test_admin_token_for_development')

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
    } else {
      // Simulate API call to fetch order details
      setLoading(true)
      
      if (isMockAuth) {
        // For mock authentication, check if this is one of our mock orders from OrdersPage
        if (id.startsWith('mock_order_')) {
          // Create a mock order that matches the ID
          const mockOrder = {
            _id: id,
            orderNumber: id === 'mock_order_1' ? 'ORD123456' : 'ORD654321',
            createdAt: new Date(Date.now() - (id === 'mock_order_1' ? 7 : 2) * 24 * 60 * 60 * 1000).toISOString(),
            user: userInfo.id,
            orderItems: id === 'mock_order_1' ? [
              {
                name: 'Sample Product 1',
                qty: 2,
                image: 'https://via.placeholder.com/150',
                price: 299.99
              },
              {
                name: 'Sample Product 2',
                qty: 1,
                image: 'https://via.placeholder.com/150',
                price: 199.99
              }
            ] : [
              {
                name: 'Sample Product 3',
                qty: 1,
                image: 'https://via.placeholder.com/150',
                price: 499.99
              }
            ],
            shippingAddress: {
              address: id === 'mock_order_1' ? '123 Test Street' : '456 Test Avenue',
              city: 'Test City',
              postalCode: id === 'mock_order_1' ? '123456' : '654321',
              state: 'Test State',
              country: 'India',
              phone: '9876543210'
            },
            paymentMethod: id === 'mock_order_1' ? 'COD' : 'UPI',
            itemsPrice: id === 'mock_order_1' ? 799.97 : 499.99,
            taxPrice: id === 'mock_order_1' ? 40.00 : 25.00,
            shippingPrice: id === 'mock_order_1' ? 0 : 50,
            totalPrice: id === 'mock_order_1' ? 839.97 : 574.99,
            isPaid: id === 'mock_order_1',
            paidAt: id === 'mock_order_1' ? new Date().toISOString() : null,
            isDelivered: id === 'mock_order_1',
            deliveredAt: id === 'mock_order_1' ? new Date().toISOString() : null,
            status: id === 'mock_order_1' ? 'delivered' : 'processing'
          };
          
          setTimeout(() => {
            setOrder(mockOrder);
            setLoading(false);
          }, 1000);
        } else {
          // If it's not one of our mock orders, check the mockOrders array
          setTimeout(() => {
            const foundOrder = mockOrders.find(o => o._id === id);
            if (foundOrder) {
              setOrder(foundOrder);
              setLoading(false);
            } else {
              setError('Order not found');
              setLoading(false);
            }
          }, 1000);
        }
      } else {
        // For real authentication, we would fetch from the API
        // This is just a placeholder for the real implementation
        setTimeout(() => {
          const foundOrder = mockOrders.find(o => o._id === id);
          if (foundOrder) {
            setOrder(foundOrder);
            setLoading(false);
          } else {
            setError('Order not found');
            setLoading(false);
          }
        }, 1000);
      }
    }
  }, [id, navigate, userInfo, isMockAuth])

  return (
    <div>
      <Link to="/orders" className="flex items-center text-primary mb-4 hover:underline">
        <FaArrowLeft className="mr-1" /> Back to Orders
      </Link>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : order ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4">Order #{order._id}</h1>
            <p className="text-gray-600 mb-4">Placed on {order.createdAt}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Shipping</h2>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Name:</strong> {userInfo.name}</p>
                  <p><strong>Address:</strong> {order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
                  <div className="mt-2">
                    {order.isDelivered ? (
                      <div className="bg-green-100 text-green-800 p-2 rounded">
                        Delivered on {order.deliveredAt}
                      </div>
                    ) : (
                      <div className="bg-red-100 text-red-800 p-2 rounded">
                        Not Delivered
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-2">Payment</h2>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Method:</strong> {order.paymentMethod}</p>
                  <div className="mt-2">
                    {order.isPaid ? (
                      <div className="bg-green-100 text-green-800 p-2 rounded">
                        Paid on {order.paidAt}
                      </div>
                    ) : (
                      <div className="bg-red-100 text-red-800 p-2 rounded">
                        Not Paid
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-lg font-semibold mb-2">Order Items</h2>
            <div className="bg-gray-50 rounded overflow-hidden mb-6">
              <ul className="divide-y">
                {order.orderItems.map((item, index) => (
                  <li key={index} className="p-4 flex items-center">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded mr-4"
                    />
                    <div className="flex-1">
                      <Link to={`/products/${index + 1}`} className="text-primary hover:underline">
                        {item.name}
                      </Link>
                    </div>
                    <div className="text-gray-600">
                      {item.qty} x ₹{item.price} = ₹{(item.qty * item.price).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
            <div className="bg-gray-50 p-4 rounded">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>₹{order.itemsPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₹{order.shippingPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{order.taxPrice}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{order.totalPrice}</span>
                </div>
              </div>
            </div>
            
            {!order.isPaid && (
              <div className="mt-6">
                {paymentSuccess && (
                  <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
                    Payment successful! Thank you for your purchase.
                  </div>
                )}
                
                {!showStripeForm ? (
                  <button 
                    onClick={handlePayNow}
                    className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark flex items-center justify-center"
                  >
                    <FaCreditCard className="mr-2" /> Pay Now with Card
                  </button>
                ) : (
                  <StripePaymentWrapper 
                    amount={order.totalPrice} 
                    orderId={order._id}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <Message>Order not found</Message>
      )}
    </div>
  )
}

export default OrderDetailPage