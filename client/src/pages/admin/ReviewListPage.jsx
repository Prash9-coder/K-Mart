import { useState } from 'react';
import { FaCheck, FaTimes, FaFlag, FaTrash } from 'react-icons/fa';
import Rating from '../../components/ui/Rating';

const ReviewListPage = () => {
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const [reviews, setReviews] = useState([
    {
      _id: '1',
      user: { name: 'John Doe', email: 'john@example.com' },
      product: { name: 'Basmati Rice 5kg', _id: 'prod1' },
      rating: 5,
      comment: 'Excellent quality rice! Very satisfied with the purchase.',
      status: 'approved',
      isVerifiedPurchase: true,
      createdAt: '2024-01-07T10:30:00Z'
    },
    {
      _id: '2',
      user: { name: 'Jane Smith', email: 'jane@example.com' },
      product: { name: 'Cooking Oil 1L', _id: 'prod2' },
      rating: 2,
      comment: 'The oil quality was not good. It had a strange smell.',
      status: 'pending',
      isVerifiedPurchase: true,
      createdAt: '2024-01-06T15:45:00Z'
    },
    {
      _id: '3',
      user: { name: 'Mike Johnson', email: 'mike@example.com' },
      product: { name: 'Wheat Flour 10kg', _id: 'prod3' },
      rating: 1,
      comment: 'This is absolutely terrible! Worst product ever!',
      status: 'flagged',
      isVerifiedPurchase: false,
      createdAt: '2024-01-05T09:20:00Z',
      flagReason: 'Inappropriate language'
    }
  ]);

  const handleStatusChange = async (reviewId, newStatus) => {
    setActionLoading(reviewId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, status: newStatus, updatedAt: new Date().toISOString() }
          : review
      ));
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlag = async (reviewId) => {
    const flagReason = prompt('Enter reason for flagging:');
    if (!flagReason) return;

    setActionLoading(reviewId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { 
              ...review, 
              status: 'flagged', 
              flagReason,
              updatedAt: new Date().toISOString() 
            }
          : review
      ));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    setActionLoading(reviewId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReviews(prev => prev.filter(review => review._id !== reviewId));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    return review.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      flagged: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Flagged' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Review Management</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{reviews.length}</p>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {reviews.filter(r => r.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.status === 'approved').length}
            </p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {reviews.filter(r => r.status === 'flagged').length}
            </p>
            <p className="text-sm text-gray-600">Flagged</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <Rating value={review.rating} />
                      <p className="text-sm text-gray-900 max-w-xs">
                        {review.comment.length > 100 
                          ? `${review.comment.substring(0, 100)}...` 
                          : review.comment
                        }
                      </p>
                      {review.isVerifiedPurchase && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                      {review.flagReason && (
                        <div className="text-xs text-red-600">
                          <strong>Flag Reason:</strong> {review.flagReason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {review.product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {review.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {review.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(review.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(review._id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                            disabled={actionLoading === review._id}
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleStatusChange(review._id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                            disabled={actionLoading === review._id}
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      
                      {review.status !== 'flagged' && (
                        <button
                          onClick={() => handleFlag(review._id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Flag"
                          disabled={actionLoading === review._id}
                        >
                          <FaFlag />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                        disabled={actionLoading === review._id}
                      >
                        {actionLoading === review._id ? (
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

        {filteredReviews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {filter === 'all' ? 'No reviews found' : `No ${filter} reviews found`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewListPage;