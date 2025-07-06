import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaTimes, FaCheck } from 'react-icons/fa';
import Message from '../../components/ui/Message';
import Loader from '../../components/ui/Loader';

const OrderListPage = () => {
  const navigate = useNavigate();
  const { user: userInfo, isAuthenticated } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Mock orders data
  const mockOrders = [
    {
      _id: '1',
      user: { _id: '2', name: 'John Doe' },
      createdAt: '2023-06-15',
      totalPrice: 125.99,
      isPaid: true,
      paidAt: '2023-06-15',
      isDelivered: true,
      deliveredAt: '2023-06-18',
    },
    {
      _id: '2',
      user: { _id: '3', name: 'Jane Doe' },
      createdAt: '2023-06-14',
      totalPrice: 89.99,
      isPaid: true,
      paidAt: '2023-06-14',
      isDelivered: false,
      deliveredAt: null,
    },
    {
      _id: '3',
      user: { _id: '2', name: 'John Doe' },
      createdAt: '2023-06-13',
      totalPrice: 149.99,
      isPaid: false,
      paidAt: null,
      isDelivered: false,
      deliveredAt: null,
    },
    {
      _id: '4',
      user: { _id: '4', name: 'Mike Johnson' },
      createdAt: '2023-06-12',
      totalPrice: 75.50,
      isPaid: true,
      paidAt: '2023-06-12',
      isDelivered: true,
      deliveredAt: '2023-06-15',
    },
    {
      _id: '5',
      user: { _id: '5', name: 'Sarah Williams' },
      createdAt: '2023-06-11',
      totalPrice: 199.99,
      isPaid: true,
      paidAt: '2023-06-11',
      isDelivered: true,
      deliveredAt: '2023-06-14',
    },
  ];

  // Authentication check effect
  useEffect(() => {
    if (!isAuthenticated || !userInfo?.isAdmin) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, userInfo?.isAdmin, navigate]);

  // Data loading effect
  useEffect(() => {
    if (isAuthenticated && userInfo?.isAdmin && !dataLoaded) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setOrders(mockOrders);
        setLoading(false);
        setDataLoaded(true);
      }, 1000);
    }
  }, [isAuthenticated, userInfo?.isAdmin, dataLoaded]);

  const markAsDeliveredHandler = (id) => {
    // In a real app, this would make an API call to update the order
    setOrders(
      orders.map((order) =>
        order._id === id
          ? { ...order, isDelivered: true, deliveredAt: new Date().toISOString().split('T')[0] }
          : order
      )
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivered
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{order.totalPrice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.isPaid ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {order.paidAt}
                        </span>
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.isDelivered ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {order.deliveredAt}
                        </span>
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEye size={18} />
                        </Link>
                        {order.isPaid && !order.isDelivered && (
                          <button
                            onClick={() => markAsDeliveredHandler(order._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Delivered"
                          >
                            <FaCheck size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderListPage;