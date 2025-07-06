import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaImage } from 'react-icons/fa';
import axios from 'axios';
import Message from '../../components/ui/Message';
import Loader from '../../components/ui/Loader';

const ProductListPage = () => {
  const navigate = useNavigate();
  const { user: userInfo, isAuthenticated } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Authentication check effect
  useEffect(() => {
    if (!isAuthenticated || !userInfo?.isAdmin) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, userInfo?.isAdmin, navigate]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/products', config);
      setProducts(data.products || data);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Data loading effect
  useEffect(() => {
    if (isAuthenticated && userInfo?.isAdmin) {
      fetchProducts();
    }
  }, [isAuthenticated, userInfo?.isAdmin]);

  const deleteHandler = async (id) => {
    if (deleteConfirm === id) {
      try {
        setDeleteLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.delete(`/api/products/${id}`, config);
        setProducts(products.filter(product => product._id !== id));
        setDeleteConfirm(null);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete product');
      } finally {
        setDeleteLoading(false);
      }
    } else {
      setDeleteConfirm(id);
    }
  };

  const createProductHandler = () => {
    navigate('/admin/product/new');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={createProductHandler}
          className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark flex items-center"
        >
          <FaPlus className="mr-2" /> Add Product
        </button>
      </div>
      
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
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-sm">Get started by adding your first product.</p>
                        <button
                          onClick={createProductHandler}
                          className="mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark"
                        >
                          Add Product
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-12 w-12">
                        {product.image ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.image}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <FaImage className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{product.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.brand || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${product.countInStock < 10 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {product.countInStock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.countInStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/admin/product/${product._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit Product"
                        >
                          <FaEdit size={16} />
                        </Link>
                        <button
                          onClick={() => deleteHandler(product._id)}
                          disabled={deleteLoading}
                          className={`p-1 ${
                            deleteConfirm === product._id
                              ? 'text-red-600'
                              : 'text-gray-600 hover:text-red-900'
                          } ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={deleteConfirm === product._id ? 'Click again to confirm' : 'Delete Product'}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListPage;