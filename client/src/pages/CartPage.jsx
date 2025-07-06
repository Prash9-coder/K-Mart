import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa'
import { addToCart, removeFromCart } from '../slices/cartSlice'
import Message from '../components/ui/Message'

const CartPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { items: cartItems } = useSelector((state) => state.cart)
  const { user: userInfo } = useSelector((state) => state.auth)

  // Calculate prices
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )
  const shippingPrice = itemsPrice > 500 ? 0 : 50
  const taxPrice = Number((0.05 * itemsPrice).toFixed(2))
  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2)

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id))
  }

  const checkoutHandler = () => {
    if (!userInfo) {
      navigate('/login?redirect=checkout')
    } else {
      navigate('/checkout')
    }
  }

  const updateCartHandler = (item, quantity) => {
    if (quantity > 0 && quantity <= item.countInStock) {
      dispatch(
        addToCart({
          ...item,
          quantity,
        })
      )
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🛒 Shopping Cart
        </h1>
        <Link
          to="/products"
          className="flex items-center text-blue-600 hover:text-purple-600 transition-all duration-300 font-medium btn-interactive"
        >
          <FaArrowLeft className="mr-2" />
          Continue Shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <Message>
          Your cart is empty.{' '}
          <Link to="/products" className="text-primary hover:underline">
            Go Shopping
          </Link>
        </Message>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>

                      {/* Product Name */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.id}`}
                          className="text-lg font-medium text-gray-800 hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <p className="text-gray-500">₹{item.price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-md">
                        <button
                          className="px-3 py-1 border-r"
                          onClick={() => updateCartHandler(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus />
                        </button>
                        <span className="px-4 py-1">{item.quantity}</span>
                        <button
                          className="px-3 py-1 border-l"
                          onClick={() => updateCartHandler(item, item.quantity + 1)}
                          disabled={item.quantity >= item.countInStock}
                        >
                          <FaPlus />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeFromCartHandler(item.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center mt-4 text-primary hover:underline"
            >
              <FaArrowLeft className="mr-1" /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)}):</span>
                  <span>₹{itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₹{shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{taxPrice}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:bg-gray-400"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage