import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getMyOrders, cancelOrder, requestReturn } from '../slices/orderSlice'
import Message from '../components/ui/Message'
import Loader from '../components/ui/Loader'
import { FaEye, FaTimes, FaUndo, FaSpinner } from 'react-icons/fa'

const OrdersPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { orders, loading, error } = useSelector((state) => state.order)
  
  const [cancelReason, setCancelReason] = useState('')
  const [returnReason, setReturnReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Check if we're using mock authentication (only in development)
  const isDevelopment = import.meta.env.MODE === 'development';
  const isMockAuth = isDevelopment && user && (!user.token || user.token.startsWith('mock_token_') || user.token === 'test_admin_token_for_development')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    } else if (isMockAuth) {
      // Create mock orders for development
      const mockOrders = [
        {
          _id: 'mock_order_1',
          orderNumber: 'ORD123456',
          user: user.id,
          orderItems: [
            {
              name: 'Sample Product 1',
              quantity: 2,
              image: 'https://via.placeholder.com/150',
              price: 299.99,
              product: 'prod_1'
            },
            {
              name: 'Sample Product 2',
              quantity: 1,
              image: 'https://via.placeholder.com/150',
              price: 199.99,
              product: 'prod_2'
            }
          ],
          shippingAddress: {
            address: '123 Test Street',
            city: 'Test City',
            postalCode: '123456',
            state: 'Test State',
            country: 'India',
            phone: '9876543210'
          },
          paymentMethod: 'COD',
          itemsPrice: 799.97,
          taxPrice: 40.00,
          shippingPrice: 0,
          totalPrice: 839.97,
          isPaid: true,
          paidAt: new Date().toISOString(),
          status: 'delivered',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'mock_order_2',
          orderNumber: 'ORD654321',
          user: user.id,
          orderItems: [
            {
              name: 'Sample Product 3',
              quantity: 1,
              image: 'https://via.placeholder.com/150',
              price: 499.99,
              product: 'prod_3'
            }
          ],
          shippingAddress: {
            address: '456 Test Avenue',
            city: 'Test City',
            postalCode: '654321',
            state: 'Test State',
            country: 'India',
            phone: '9876543210'
          },
          paymentMethod: 'UPI',
          itemsPrice: 499.99,
          taxPrice: 25.00,
          shippingPrice: 50,
          totalPrice: 574.99,
          isPaid: false,
          status: 'processing',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Dispatch mock orders
      dispatch({ type: 'order/getMyOrders/fulfilled', payload: mockOrders });
    } else {
      dispatch(getMyOrders())
    }
  }, [isAuthenticated, navigate, dispatch, user, isMockAuth])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'returned':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'confirmed':
        return 'Confirmed'
      case 'processing':
        return 'Processing'
      case 'shipped':
        return 'Shipped'
      case 'delivered':
        return 'Delivered'
      case 'cancelled':
        return 'Cancelled'
      case 'returned':
        return 'Returned'
      default:
        return 'Unknown'
    }
  }

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return

    setActionLoading(true)
    try {
      if (isMockAuth) {
        // For mock authentication, update the orders in the Redux store directly
        setTimeout(() => {
          // Find the order in the current orders array
          const updatedOrders = orders.map(order => 
            order._id === selectedOrderId 
              ? { ...order, status: 'cancelled' } 
              : order
          );
          
          // Dispatch the updated orders
          dispatch({ type: 'order/getMyOrders/fulfilled', payload: updatedOrders });
          
          setShowCancelModal(false);
          setCancelReason('');
          setSelectedOrderId(null);
        }, 1000); // Simulate API delay
      } else {
        // Real authentication, use the API
        await dispatch(cancelOrder({ orderId: selectedOrderId, reason: cancelReason }));
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedOrderId(null);
        dispatch(getMyOrders()); // Refresh orders
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setActionLoading(false);
    }
  }

  const handleReturnRequest = async () => {
    if (!returnReason.trim()) return

    setActionLoading(true)
    try {
      if (isMockAuth) {
        // For mock authentication, update the orders in the Redux store directly
        setTimeout(() => {
          // Find the order in the current orders array
          const updatedOrders = orders.map(order => 
            order._id === selectedOrderId 
              ? { ...order, status: 'returned' } 
              : order
          );
          
          // Dispatch the updated orders
          dispatch({ type: 'order/getMyOrders/fulfilled', payload: updatedOrders });
          
          setShowReturnModal(false);
          setReturnReason('');
          setSelectedOrderId(null);
        }, 1000); // Simulate API delay
      } else {
        // Real authentication, use the API
        await dispatch(requestReturn({ orderId: selectedOrderId, reason: returnReason }));
        setShowReturnModal(false);
        setReturnReason('');
        setSelectedOrderId(null);
        dispatch(getMyOrders()); // Refresh orders
      }
    } catch (error) {
      console.error('Error requesting return:', error);
    } finally {
      setActionLoading(false);
    }
  }

  const canCancelOrder = (status) => {
    return ['pending', 'confirmed'].includes(status)
  }

  const canReturnOrder = (status) => {
    return status === 'delivered'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : orders.length === 0 ? (
        <Message>You have no orders</Message>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Order #{order.orderNumber || order._id}</h2>
                  <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                  {order.trackingNumber && (
                    <p className="text-sm text-blue-600">Tracking: {order.trackingNumber}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {order.isPaid ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Paid
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Not Paid
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Items</h3>
                  <ul className="divide-y">
                    {order.orderItems.map((item, index) => (
                      <li key={index} className="py-2 flex justify-between">
                        <div className="flex items-center">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-10 h-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-600 ml-2">x{item.quantity}</span>
                          </div>
                        </div>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Items:</span>
                    <span>₹{order.itemsPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{order.shippingPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{order.taxPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  {order.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{order.couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{order.totalPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <div className="space-x-2">
                    {canCancelOrder(order.status) && (
                      <button
                        onClick={() => {
                          setSelectedOrderId(order._id)
                          setShowCancelModal(true)
                        }}
                        className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 text-sm flex items-center gap-1"
                      >
                        <FaTimes /> Cancel
                      </button>
                    )}
                    {canReturnOrder(order.status) && (
                      <button
                        onClick={() => {
                          setSelectedOrderId(order._id)
                          setShowReturnModal(true)
                        }}
                        className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 text-sm flex items-center gap-1"
                      >
                        <FaUndo /> Return
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark flex items-center gap-1"
                  >
                    <FaEye /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for cancellation:</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              placeholder="Reason for cancellation..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || actionLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? <FaSpinner className="animate-spin" /> : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Order Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Return</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for return:</p>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              placeholder="Reason for return..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowReturnModal(false)
                  setReturnReason('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnRequest}
                disabled={!returnReason.trim() || actionLoading}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? <FaSpinner className="animate-spin" /> : 'Request Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage