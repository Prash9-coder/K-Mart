import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaImage } from 'react-icons/fa';
import axios from 'axios';
import Message from '../../components/ui/Message';
import Loader from '../../components/ui/Loader';
import AIProductDescriptionGenerator from '../../components/admin/AIProductDescriptionGenerator';
import BarcodeGenerator from '../../components/admin/BarcodeGenerator';

const ProductCreateEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: userInfo, isAuthenticated } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    brand: '',
    category: '',
    countInStock: '',
    weight: '',
    unit: 'kg',
    barcode: '',
    tags: '',
    isActive: true,
  });

  const categories = [
    'Grains & Cereals',
    'Pulses & Lentils', 
    'Cooking Oil',
    'Spices & Seasonings',
    'Dairy Products',
    'Beverages',
    'Snacks & Confectionery',
    'Personal Care',
    'Household Items',
    'Cleaning Supplies',
    'Baby Care',
    'Health & Wellness',
    'Frozen Foods',
    'Bakery Items',
    'Fruits & Vegetables'
  ];

  const units = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'dozen'];

  // Authentication check effect
  useEffect(() => {
    if (!isAuthenticated || !userInfo?.isAdmin) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, userInfo?.isAdmin, navigate]);

  // Fetch product data for editing
  useEffect(() => {
    if (isAuthenticated && userInfo?.isAdmin && id && id !== 'new') {
      fetchProduct();
    }
  }, [isAuthenticated, userInfo?.isAdmin, id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get(`/api/products/${id}`, config);
      setFormData({
        name: data.name || '',
        price: data.price || '',
        description: data.description || '',
        image: data.image || '',
        brand: data.brand || '',
        category: data.category || '',
        countInStock: data.countInStock || '',
        weight: data.weight || '',
        unit: data.unit || 'kg',
        barcode: data.barcode || '',
        tags: data.tags ? data.tags.join(', ') : '',
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      setUploading(true);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('/api/upload', formDataUpload, config);
      setFormData(prev => ({ ...prev, image: data }));
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        countInStock: parseInt(formData.countInStock),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      };

      if (id && id !== 'new') {
        // Update existing product
        await axios.put(`/api/products/${id}`, productData, config);
        setSuccess('Product updated successfully!');
      } else {
        // Create new product
        await axios.post('/api/products', productData, config);
        setSuccess('Product created successfully!');
      }

      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id && id !== 'new') {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link
          to="/admin/products"
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">
          {id && id !== 'new' ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>
      
      {error && <Message variant="error">{error}</Message>}
      {success && <Message variant="success">{success}</Message>}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter brand name"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode/SKU
                </label>
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter barcode or SKU"
                />
              </div>
            </div>
          </div>

          {/* Barcode Generator */}
          <BarcodeGenerator
            productId={id && id !== 'new' ? id : Date.now().toString()}
            productName={formData.name}
            currentBarcode={formData.barcode}
            onBarcodeGenerated={(barcode) => 
              setFormData(prev => ({ ...prev, barcode }))
            }
          />

          {/* Pricing & Inventory */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="countInStock"
                  name="countInStock"
                  value={formData.countInStock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                    Weight/Size
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Image */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Image</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/*"
                    onChange={uploadFileHandler}
                    className="hidden"
                  />
                  <label
                    htmlFor="imageFile"
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md border border-gray-300 flex items-center"
                  >
                    <FaUpload className="mr-2" />
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </label>
                </div>
              </div>
            </div>
            
            {formData.image && (
              <div className="mt-4">
                <img
                  src={formData.image}
                  alt="Product preview"
                  className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>

          {/* AI Description Generator */}
          <AIProductDescriptionGenerator
            productData={formData}
            onDescriptionGenerated={(description) => 
              setFormData(prev => ({ ...prev, description }))
            }
          />

          {/* Description & Tags */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter product description or use AI generator above"
                />
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="organic, premium, local"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Product is active and available for sale
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link
              to="/admin/products"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Saving...' : (id && id !== 'new' ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreateEditPage;