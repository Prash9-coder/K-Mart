import { useState, useEffect } from 'react';
import { FaChartLine, FaUsers, FaShoppingBag, FaRupeeSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Loader from '../../components/ui/Loader';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  
  const [analytics] = useState({
    overview: {
      totalRevenue: 125750,
      totalOrders: 342,
      totalCustomers: 156,
      averageOrderValue: 368,
      revenueGrowth: 12.5,
      orderGrowth: 8.3,
      customerGrowth: 15.2,
      aovGrowth: -2.1
    },
    salesData: [
      { date: '2024-01-01', revenue: 4500, orders: 12 },
      { date: '2024-01-02', revenue: 3200, orders: 8 },
      { date: '2024-01-03', revenue: 5800, orders: 15 },
      { date: '2024-01-04', revenue: 4200, orders: 11 },
      { date: '2024-01-05', revenue: 6100, orders: 16 },
      { date: '2024-01-06', revenue: 3800, orders: 9 },
      { date: '2024-01-07', revenue: 7200, orders: 18 }
    ],
    topProducts: [
      { name: 'Basmati Rice 5kg', sales: 45, revenue: 13500, growth: 15.2 },
      { name: 'Cooking Oil 1L', sales: 38, revenue: 11400, growth: 8.7 },
      { name: 'Wheat Flour 10kg', sales: 32, revenue: 9600, growth: -3.2 },
      { name: 'Sugar 1kg', sales: 28, revenue: 1400, growth: 22.1 },
      { name: 'Tea Powder 500g', sales: 25, revenue: 3750, growth: 5.8 }
    ],
    topCategories: [
      { name: 'Groceries', sales: 156, revenue: 46800, percentage: 37.2 },
      { name: 'Electronics', sales: 89, revenue: 35600, percentage: 28.3 },
      { name: 'Home & Garden', sales: 67, revenue: 20100, percentage: 16.0 },
      { name: 'Clothing', sales: 45, revenue: 13500, percentage: 10.7 },
      { name: 'Sports', sales: 23, revenue: 9200, percentage: 7.3 }
    ],
    recentOrders: [
      { id: 'ORD-001', customer: 'John Doe', amount: 1250, status: 'Delivered', date: '2024-01-07' },
      { id: 'ORD-002', customer: 'Jane Smith', amount: 890, status: 'Processing', date: '2024-01-07' },
      { id: 'ORD-003', customer: 'Mike Johnson', amount: 2100, status: 'Shipped', date: '2024-01-06' },
      { id: 'ORD-004', customer: 'Sarah Williams', amount: 750, status: 'Delivered', date: '2024-01-06' },
      { id: 'ORD-005', customer: 'David Brown', amount: 1450, status: 'Processing', date: '2024-01-05' }
    ]
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const GrowthIndicator = ({ value }) => {
    const isPositive = value > 0;
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{value.toFixed(1)}%
        </span>
      </div>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.overview.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaRupeeSign className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <GrowthIndicator value={analytics.overview.revenueGrowth} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaShoppingBag className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <GrowthIndicator value={analytics.overview.orderGrowth} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalCustomers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaUsers className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <GrowthIndicator value={analytics.overview.customerGrowth} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.overview.averageOrderValue)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FaChartLine className="text-orange-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <GrowthIndicator value={analytics.overview.aovGrowth} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales Trend</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.salesData.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                  style={{
                    height: `${(day.revenue / Math.max(...analytics.salesData.map(d => d.revenue))) * 200}px`,
                    minHeight: '20px'
                  }}
                  title={`${formatDate(day.date)}: ${formatCurrency(day.revenue)}`}
                ></div>
                <span className="text-xs text-gray-600 mt-2">
                  {formatDate(day.date)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Products</h2>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} units sold</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(product.revenue)}
                  </p>
                  <GrowthIndicator value={product.growth} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Category Performance</h2>
          <div className="space-y-4">
            {analytics.topCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-600">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{category.sales} orders</span>
                  <span>{formatCurrency(category.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {analytics.recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(order.amount)}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;