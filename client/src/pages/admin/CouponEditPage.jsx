import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Message from '../../components/ui/Message';

const CouponEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    usageLimit: '',
    usageLimitPerUser: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (id && id !== 'create') {
      // Mock data for editing
      setFormData({
        code: 'SAVE20',
        description: '20% off on all products',
        discountType: 'percentage',
        discountValue: '20',
        minimumOrderAmount: '500',
        maximumDiscountAmount: '1000',
        usageLimit: '100',
        usageLimitPerUser: '1',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(id && id !== 'create' ? 'Coupon updated successfully!' : 'Coupon created successfully!');
      navigate('/admin/coupons');
    } catch (error) {
      setSubmitError('Failed to save coupon');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {id && id !== 'create' ? 'Edit Coupon' : 'Create New Coupon'}
        </h1>

        {submitError && <Message variant="error">{submitError}</Message>}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="e.g., SAVE20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the coupon"
              />
            </div>

            {/* Discount Settings */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Discount Settings</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value *
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
                placeholder={formData.discountType === 'percentage' ? '20' : '100'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Amount
              </label>
              <input
                type="number"
                name="minimumOrderAmount"
                value={formData.minimumOrderAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Discount Amount
              </label>
              <input
                type="number"
                name="maximumDiscountAmount"
                value={formData.maximumDiscountAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                placeholder="1000"
              />
            </div>

            {/* Usage Limits */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Usage Limits</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Usage Limit
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Limit Per User
              </label>
              <input
                type="number"
                name="usageLimitPerUser"
                value={formData.usageLimitPerUser}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                placeholder="1"
              />
            </div>

            {/* Validity Period */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Validity Period</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/admin/coupons')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitLoading ? 'Saving...' : (id && id !== 'create' ? 'Update Coupon' : 'Create Coupon')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponEditPage;