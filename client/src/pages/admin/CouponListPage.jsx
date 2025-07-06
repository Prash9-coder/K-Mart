import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { getActiveCoupons } from '../../slices/couponSlice';
import Message from '../../components/ui/Message';
import Loader from '../../components/ui/Loader';

const CouponListPage = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error } = useSelector((state) => state.coupon);
  const { user: userInfo, isAuthenticated } = useSelector((state) => state.auth);

  const [deleteLoading, setDeleteLoading] = useState(null);

  // Mock coupon data
  const [mockCoupons] = useState([
    {
      _id: '1',
      code: 'SAVE20',
      description: '20% off on all products',
      discountType: 'percentage',
      discountValue: 20,
      minimumOrderAmount: 500,
      usageLimit: 100,
      usedCount: 25,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true
    },
    {
      _id: '2',
      code: 'FLAT100',
      description: 'Flat ₹100 off',
      discountType: 'fixed',
      discountValue: 100,
      minimumOrderAmount: 1000,
      usageLimit: 50,
      usedCount: 10,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      isActive: true
    }
  ]);

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(getActiveCoupons());
    }
  }, [dispatch, userInfo]);

  const handleDelete = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      setDeleteLoading(couponId);
      // Mock delete - in real app this would be an API call
      setTimeout(() => {
        setDeleteLoading(null);
        alert('Coupon deleted successfully!');
      }, 1000);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (!coupon.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">Inactive</span>;
    } else if (now < startDate) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800">Scheduled</span>;
    } else if (now > endDate) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-200 text-red-800">Expired</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">Active</span>;
    }
  };

  const displayCoupons = mockCoupons; // Use mock data for now

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Coupon Management</h1>
        <Link
          to="/admin/coupon/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Create Coupon
        </Link>
      </div>

      {error && <Message variant="error">{error}</Message>}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayCoupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{coupon.code}</div>
                    <div className="text-sm text-gray-500">{coupon.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-gray-900">
                      {coupon.discountType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.discountType === 'percentage' 
                      ? `${coupon.discountValue}%` 
                      : `₹${coupon.discountValue}`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{formatDate(coupon.startDate)}</div>
                    <div className="text-gray-500">to {formatDate(coupon.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(coupon)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/coupon/${coupon._id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye />
                      </Link>
                      <Link
                        to={`/admin/coupon/${coupon._id}/edit`}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                        disabled={deleteLoading === coupon._id}
                      >
                        {deleteLoading === coupon._id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CouponListPage;