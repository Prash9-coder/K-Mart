import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaShoppingBag, FaClipboardList, FaChartLine, FaCog, FaTicketAlt, FaStar, FaWarehouse } from 'react-icons/fa';
import Message from '../../components/ui/Message';
import Loader from '../../components/ui/Loader';
import useAdminAuth from '../../hooks/useAdminAuth';

const AdminDashboardPage = () => {
  const { isAuthorized, loading: authLoading } = useAdminAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Mock statistics
  const [stats, setStats] = useState({
    totalUsers: 45,
    totalProducts: 120,
    totalOrders: 78,
    totalRevenue: 25750,
    recentOrders: [
      { _id: '101', user: 'John Doe', total: 1250, date: '2023-06-15', status: 'Delivered' },
      { _id: '102', user: 'Jane Smith', total: 890, date: '2023-06-14', status: 'Processing' },
      { _id: '103', user: 'Mike Johnson', total: 2100, date: '2023-06-13', status: 'Shipped' },
      { _id: '104', user: 'Sarah Williams', total: 750, date: '2023-06-12', status: 'Delivered' },
    ],
    topProducts: [
      { _id: '201', name: 'Rice', sold: 45, revenue: 4500 },
      { _id: '202', name: 'Cooking Oil', sold: 38, revenue: 3800 },
      { _id: '203', name: 'Wheat Flour', sold: 32, revenue: 3200 },
      { _id: '204', name: 'Sugar', sold: 30, revenue: 1500 },
    ]
  });

  // Data loading effect
  useEffect(() => {
    if (isAuthorized && !dataLoaded && !loading) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setDataLoaded(true);
      }, 1000);
    }
  }, [isAuthorized, dataLoaded, loading]);

  // Show loading while checking auth or loading data
  if (authLoading || (isAuthorized && loading)) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader />
      </div>
    );
  }

  // Don't render anything if not authorized (hook will handle redirect)
  if (!isAuthorized) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                  <FaUsers size={24} />
                </div>
                <div>
                  <p className="text-gray-500">Total Users</p>
                  <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                  <FaShoppingBag size={24} />
                </div>
                <div>
                  <p className="text-gray-500">Total Products</p>
                  <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                  <FaClipboardList size={24} />
                </div>
                <div>
                  <p className="text-gray-500">Total Orders</p>
                  <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                  <FaChartLine size={24} />
                </div>
                <div>
                  <p className="text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold">₹{stats.totalRevenue}</h3>
                </div>
              </div>
            </div>
          </div>
          
          {/* Admin Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/analytics" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors flex flex-col items-center">
                <FaChartLine className="text-2xl mb-2" />
                <span>Analytics</span>
              </Link>
              <Link to="/admin/products" className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors flex flex-col items-center">
                <FaShoppingBag className="text-2xl mb-2" />
                <span>Products</span>
              </Link>
              <Link to="/admin/inventory" className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-center transition-colors flex flex-col items-center">
                <FaWarehouse className="text-2xl mb-2" />
                <span>Inventory</span>
              </Link>
              <Link to="/admin/orders" className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors flex flex-col items-center">
                <FaClipboardList className="text-2xl mb-2" />
                <span>Orders</span>
              </Link>
              <Link to="/admin/users" className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg text-center transition-colors flex flex-col items-center">
                <FaUsers className="text-2xl mb-2" />
                <span>Users</span>
              </Link>
              <Link to="/admin/coupons" className="bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-lg text-center transition-colors flex flex-col items-center">
                <FaTicketAlt className="text-2xl mb-2" />
                <span>Coupons</span>
              </Link>
              <Link to="/admin/reviews" className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg text-center transition-colors flex flex-col items-center">
                <FaStar className="text-2xl mb-2" />
                <span>Reviews</span>
              </Link>
              <Link to="/admin/products" className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg text-center transition-colors flex flex-col items-center">
                <FaCog className="text-2xl mb-2" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Link to="/admin/orders" className="text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.user}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{order.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{order.total}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Top Products */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Top Selling Products</h2>
              <Link to="/admin/products" className="text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.topProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.sold}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{product.revenue}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;