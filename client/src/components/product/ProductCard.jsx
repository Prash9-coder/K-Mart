import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { FaShoppingCart } from 'react-icons/fa'
import Rating from '../ui/Rating'
import { addToCart } from '../../slices/cartSlice'

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()

  const addToCartHandler = () => {
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        countInStock: product.countInStock,
        quantity: 1,
      })
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden card-interactive glow-on-hover group animate-fadeIn">
      <div className="relative overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
        {product.countInStock === 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            Out of Stock
          </div>
        )}
        {product.countInStock > 0 && product.countInStock <= 5 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
            Only {product.countInStock} left!
          </div>
        )}
      </div>
      <div className="p-5">
        <Link to={`/products/${product._id}`}>
          <h2 className="text-lg font-semibold text-gray-800 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text transition-all duration-300 truncate group-hover:scale-105">
            {product.name}
          </h2>
        </Link>
        <div className="mt-3 mb-4 transform group-hover:scale-105 transition-transform duration-300">
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            ₹{product.price}
          </span>
          <button
            className={`p-3 rounded-full transition-all duration-300 btn-interactive ripple ${
              product.countInStock === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl animate-float'
            }`}
            onClick={addToCartHandler}
            disabled={product.countInStock === 0}
          >
            <FaShoppingCart className={product.countInStock > 0 ? 'group-hover:animate-bounce' : ''} />
          </button>
        </div>
        {product.countInStock > 0 && (
          <div className="mt-3 text-center">
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              ✅ In Stock ({product.countInStock} available)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard