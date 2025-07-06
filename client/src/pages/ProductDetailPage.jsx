import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchProductById } from '../slices/productSlice'
import { addToCart } from '../slices/cartSlice'
import Loader from '../components/ui/Loader'
import Message from '../components/ui/Message'
import Rating from '../components/ui/Rating'
import ProductReviews from '../components/ProductReviews'
import { FaArrowLeft, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  
  const { product, loading, error } = useSelector((state) => state.product)

  useEffect(() => {
    dispatch(fetchProductById(id))
  }, [dispatch, id])

  const increaseQty = () => {
    if (product && qty < product.countInStock) {
      setQty(qty + 1)
    }
  }

  const decreaseQty = () => {
    if (qty > 1) {
      setQty(qty - 1)
    }
  }

  const addToCartHandler = () => {
    if (!product) return;
    
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        image: product.image || '',
        price: product.price,
        countInStock: product.countInStock,
        quantity: qty,
      })
    )
    navigate('/cart')
  }

  return (
    <div>
      <Link to="/products" className="flex items-center text-primary mb-4 hover:underline">
        <FaArrowLeft className="mr-1" /> Back to Products
      </Link>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Product Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              {product && product.image ? (
                <img
                  src={product.image}
                  alt={product.name || 'Product image'}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl font-bold mb-2">{product?.name || 'Product Name'}</h1>
              <div className="mb-4">
                <Rating
                  value={product?.rating || 0}
                  text={`${product?.numReviews || 0} reviews`}
                />
              </div>
              <div className="text-2xl font-bold text-primary mb-4">
                ₹{product?.price || 0}
              </div>
              
              {product && product.countInStock > 0 ? (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full inline-block mb-4">
                  In Stock
                </div>
              ) : (
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full inline-block mb-4">
                  Out of Stock
                </div>
              )}

              {product && product.countInStock > 0 && (
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <span className="mr-4">Quantity:</span>
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={decreaseQty}
                        className="px-3 py-1 border-r"
                        disabled={qty <= 1}
                      >
                        <FaMinus />
                      </button>
                      <span className="px-4 py-1">{qty}</span>
                      <button
                        onClick={increaseQty}
                        className="px-3 py-1 border-l"
                        disabled={qty >= (product?.countInStock || 0)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={addToCartHandler}
                    className="bg-primary text-white py-2 px-6 rounded-md flex items-center hover:bg-primary-dark"
                    disabled={!product || product.countInStock === 0}
                  >
                    <FaShoppingCart className="mr-2" /> Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="flex border-b">
              <button
                className={`px-4 py-3 font-medium ${
                  activeTab === 'description'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`px-4 py-3 font-medium ${
                  activeTab === 'specifications'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
              <button
                className={`px-4 py-3 font-medium ${
                  activeTab === 'reviews'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({product?.numReviews || 0})
              </button>
            </div>
            <div className="p-6">
              {activeTab === 'description' && (
                <div>
                  <p>{product?.description || 'No description available.'}</p>
                </div>
              )}
              {activeTab === 'specifications' && (
                <div>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Brand</td>
                        <td className="py-2">{product?.brand || 'N/A'}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Category</td>
                        <td className="py-2">{product?.category || 'N/A'}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Weight</td>
                        <td className="py-2">{product?.weight ? `${product.weight} ${product.unit || 'g'}` : '250g'}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Dimensions</td>
                        <td className="py-2">10 x 5 x 2 cm</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Shelf Life</td>
                        <td className="py-2">12 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'reviews' && product && (
                <ProductReviews product={product} />
              )}
            </div>
          </div>

          {/* Related Products */}
          <div>
            <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
            {/* This would be populated with actual related products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <p className="text-center text-gray-500">Related products will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ProductDetailPage