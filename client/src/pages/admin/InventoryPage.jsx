import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaEdit, FaExclamationTriangle, FaSearch, FaDownload } from 'react-icons/fa';
import { fetchProducts } from '../../slices/productSlice';
import Loader from '../../components/ui/Loader';

const InventoryPage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);
  const { user: userInfo, isAuthenticated } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [updateLoading, setUpdateLoading] = useState(null);

  // Mock inventory data
  const [inventoryData, setInventoryData] = useState({});

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(fetchProducts({ pageSize: 1000 }));
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    // Mock inventory data for each product
    if (products && products.length > 0) {
      const mockInventory = {};
      products.forEach(product => {
        mockInventory[product._id] = {
          currentStock: Math.floor(Math.random() * 100) + 1,
          lowStockThreshold: 10,
          reorderPoint: 15,
          maxStock: 100,
          lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          supplier: 'Supplier ' + Math.floor(Math.random() * 5 + 1),
          location: 'Warehouse A-' + Math.floor(Math.random() * 10 + 1),
          costPrice: product.price * 0.7,
          sellingPrice: product.price
        };
      });
      setInventoryData(mockInventory);
    }
  }, [products]);

  const handleStockUpdate = async (productId, newStock) => {
    setUpdateLoading(productId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInventoryData(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          currentStock: newStock,
          lastRestocked: new Date().toISOString()
        }
      }));
    } finally {
      setUpdateLoading(null);
    }
  };

  const getStockStatus = (product) => {
    const inventory = inventoryData[product._id];
    if (!inventory) return 'unknown';
    
    if (inventory.currentStock === 0) return 'out';
    if (inventory.currentStock <= inventory.lowStockThreshold) return 'low';
    return 'good';
  };

  const getStockStatusBadge = (status) => {
    switch (status) {
      case 'out':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-200 text-red-800">Out of Stock</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800">Low Stock</span>;
      case 'good':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">In Stock</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">Unknown</span>;
    }
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const stockStatus = getStockStatus(product);
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && stockStatus === 'low') ||
                        (stockFilter === 'out' && stockStatus === 'out');
    
    return matchesSearch && matchesCategory && matchesStock;
  }) || [];

  const categories = [...new Set(products?.map(p => p.category).filter(Boolean))] || [];

  const exportInventory = () => {
    const csvContent = [
      ['Product Name', 'Category', 'Current Stock', 'Low Stock Threshold', 'Status', 'Cost Price', 'Selling Price', 'Last Restocked'],
      ...filteredProducts.map(product => {
        const inventory = inventoryData[product._id] || {};
        return [
          product.name,
          product.category || '',
          inventory.currentStock || 0,
          inventory.lowStockThreshold || 0,
          getStockStatus(product),
          inventory.costPrice || 0,
          inventory.sellingPrice || product.price,
          inventory.lastRestocked ? new Date(inventory.lastRestocked).toLocaleDateString() : ''
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <Loader />;

  const lowStockCount = filteredProducts.filter(p => getStockStatus(p) === 'low').length;
  const outOfStockCount = filteredProducts.filter(p => getStockStatus(p) === 'out').length;
  const totalValue = filteredProducts.reduce((sum, product) => {
    const inventory = inventoryData[product._id];
    return sum + (inventory ? inventory.currentStock * inventory.costPrice : 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <button
          onClick={exportInventory}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{filteredProducts.length}</p>
            <p className="text-sm text-gray-600">Total Products</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
            <p className="text-sm text-gray-600">Low Stock</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-gray-600">Total Value</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-yellow-600 mr-2" />
            <div>
              <h3 className="font-semibold text-yellow-800">Stock Alerts</h3>
              <p className="text-yellow-700">
                {outOfStockCount > 0 && `${outOfStockCount} products are out of stock. `}
                {lowStockCount > 0 && `${lowStockCount} products have low stock levels.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Restocked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const inventory = inventoryData[product._id] || {};
                const stockStatus = getStockStatus(product);
                
                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={product.image || '/placeholder-image.jpg'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg mr-4"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={inventory.currentStock || 0}
                          onChange={(e) => {
                            const newStock = parseInt(e.target.value) || 0;
                            setInventoryData(prev => ({
                              ...prev,
                              [product._id]: {
                                ...prev[product._id],
                                currentStock: newStock
                              }
                            }));
                          }}
                          onBlur={(e) => {
                            const newStock = parseInt(e.target.value) || 0;
                            if (newStock !== inventory.currentStock) {
                              handleStockUpdate(product._id, newStock);
                            }
                          }}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                        {updateLoading === product._id && (
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Threshold: {inventory.lowStockThreshold || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStockStatusBadge(stockStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(inventory.costPrice || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(inventory.sellingPrice || product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inventory.lastRestocked ? formatDate(inventory.lastRestocked) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/product/${product._id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Product"
                      >
                        <FaEdit />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;