import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createProductReview } from '../slices/productSlice'
import { FaStar, FaUser, FaSpinner } from 'react-icons/fa'
import Message from './ui/Message'

const ProductReviews = ({ product }) => {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { loading, error, success } = useSelector((state) => state.product)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Check if user has already reviewed this product
  const hasReviewed = product?.reviews?.some(review => review.user === user?._id) || false

  useEffect(() => {
    if (success) {
      setRating(0)
      setComment('')
      setShowReviewForm(false)
    }
  }, [success])

  const submitReviewHandler = (e) => {
    e.preventDefault()
    if (!product || rating === 0 || comment.trim() === '') {
      return
    }
    
    dispatch(createProductReview({
      productId: product._id,
      rating,
      comment: comment.trim()
    }))
  }

  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    const [hover, setHover] = useState(0)

    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1
          return (
            <button
              key={index}
              type="button"
              disabled={readonly}
              className={`text-2xl ${
                ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
              } ${readonly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-400'}`}
              onClick={() => !readonly && onRatingChange(ratingValue)}
              onMouseEnter={() => !readonly && setHover(ratingValue)}
              onMouseLeave={() => !readonly && setHover(0)}
            >
              <FaStar />
            </button>
          )
        })}
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="mt-8">
      <div className="border-t pt-8">
        <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
        
        {/* Review Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl font-bold mr-2">{product.rating?.toFixed(1) || '0.0'}</span>
              <div>
                <StarRating rating={product.rating || 0} readonly />
                <p className="text-sm text-gray-600">{product.numReviews || 0} reviews</p>
              </div>
            </div>
            
            {isAuthenticated && !hasReviewed && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
              >
                Write a Review
              </button>
            )}
          </div>
          
          {hasReviewed && (
            <p className="text-sm text-gray-600">You have already reviewed this product.</p>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="mb-6 p-4 border rounded-lg bg-white">
            <h4 className="text-lg font-semibold mb-4">Write Your Review</h4>
            {error && <Message type="error" message={error} />}
            
            <form onSubmit={submitReviewHandler}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <StarRating rating={rating} onRatingChange={setRating} />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || rating === 0 || comment.trim() === ''}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {product?.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div key={review._id || review.id || Math.random().toString()} className="border-b pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <FaUser className="text-gray-600" />
                    </div>
                    <div>
                      <h5 className="font-medium">{review.name || 'Anonymous'}</h5>
                      <div className="flex items-center">
                        <StarRating rating={review.rating || 0} readonly />
                        <span className="ml-2 text-sm text-gray-600">
                          {review.createdAt ? formatDate(review.createdAt) : 'Unknown date'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 ml-13">{review.comment || 'No comment provided'}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-8">
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductReviews