import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { saveShippingAddress, savePaymentMethod, clearCart } from '../slices/cartSlice'
import { createOrder } from '../slices/orderSlice'
import { validateCoupon, clearCoupon } from '../slices/couponSlice'
import { FaArrowRight, FaSpinner } from 'react-icons/fa'
import Message from '../components/ui/Message'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { items: cartItems, shippingAddress, paymentMethod: savedPaymentMethod, totalAmount } = useSelector((state) => state.cart)
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { loading: orderLoading, error: orderError, success: orderSuccess, order } = useSelector((state) => state.order)
  const { appliedCoupon, discountAmount, loading: couponLoading, error: couponError } = useSelector((state) => state.coupon)
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout')
    }
    if (cartItems.length === 0) {
      navigate('/cart')
    }
  }, [isAuthenticated, navigate, cartItems.length])
  
  // Check if we're using mock authentication (only in development)
  const isDevelopment = import.meta.env.MODE === 'development';
  const isMockAuth = isDevelopment && user && (!user.token || user.token.startsWith('mock_token_') || user.token === 'test_admin_token_for_development')

  // Redirect to order success page when order is created
  useEffect(() => {
    if (orderSuccess && order) {
      dispatch(clearCart())
      
      if (isMockAuth) {
        // For mock authentication, go to the order success page
        navigate('/order-success')
      } else {
        // For real authentication, go to the order detail page
        navigate(`/order/${order._id}`)
      }
    }
  }, [orderSuccess, order, dispatch, navigate, isMockAuth])
  
  const [step, setStep] = useState(1)
  const [couponCode, setCouponCode] = useState('')
  
  // Shipping form state
  const [address, setAddress] = useState(shippingAddress.address || '')
  const [city, setCity] = useState(shippingAddress.city || '')
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '')
  const [state, setState] = useState(shippingAddress.state || '')
  const [country, setCountry] = useState(shippingAddress.country || 'India')
  const [phone, setPhone] = useState(shippingAddress.phone || '')
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState(savedPaymentMethod || 'COD')
  
  const submitShippingHandler = (e) => {
    e.preventDefault()
    dispatch(
      saveShippingAddress({
        address,
        city,
        postalCode,
        state,
        country,
        phone,
      })
    )
    setStep(2)
  }
  
  const submitPaymentHandler = (e) => {
    e.preventDefault()
    dispatch(savePaymentMethod(paymentMethod))
    setStep(3)
  }
  
  const applyCouponHandler = (e) => {
    e.preventDefault()
    if (couponCode.trim()) {
      if (isMockAuth) {
        // For mock authentication, create a mock coupon response
        const mockDiscount = Math.round(totalAmount * 0.1 * 100) / 100; // 10% discount
        const mockCoupon = {
          _id: 'mock_coupon_' + Date.now(),
          code: couponCode.trim(),
          description: 'Mock coupon for testing',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 0,
          maxDiscountAmount: 1000,
          isActive: true
        };
        
        // Simulate successful coupon validation
        dispatch({ 
          type: 'coupon/validateCoupon/fulfilled', 
          payload: {
            coupon: mockCoupon,
            discountAmount: mockDiscount
          }
        });
      } else {
        // Real authentication, use the API
        dispatch(validateCoupon({
          code: couponCode.trim(),
          orderAmount: totalAmount,
          orderItems: cartItems
        }));
      }
    }
  }

  const removeCouponHandler = () => {
    dispatch(clearCoupon())
    setCouponCode('')
  }

  const placeOrderHandler = () => {
    const orderData = {
      orderItems: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        product: item.id
      })),
      shippingAddress: {
        address,
        city,
        postalCode,
        state,
        country,
        phone
      },
      paymentMethod,
      itemsPrice: totalAmount,
      taxPrice: Math.round(totalAmount * 0.05 * 100) / 100, // 5% tax
      shippingPrice: totalAmount > 500 ? 0 : 50,
      couponCode: appliedCoupon?.code || null,
      couponDiscount: discountAmount || 0,
      totalPrice: Math.round((totalAmount + (totalAmount * 0.05) + (totalAmount > 500 ? 0 : 50) - (discountAmount || 0)) * 100) / 100
    }

    if (isMockAuth) {
      // For mock authentication, create a mock order
      const mockOrder = {
        _id: 'mock_order_' + Date.now(),
        ...orderData,
        user: user.id,
        orderNumber: 'ORD' + Math.floor(100000 + Math.random() * 900000),
        status: 'Processing',
        createdAt: new Date().toISOString()
      };
      
      // Simulate successful order creation
      dispatch({ 
        type: 'order/createOrder/fulfilled', 
        payload: mockOrder 
      });
      
      // Clear the cart
      dispatch(clearCart());
      
      // Navigate to order success page
      navigate('/order-success');
    } else {
      // Real authentication, use the API
      dispatch(createOrder(orderData));
    }
  }

  // Calculate totals
  const itemsPrice = totalAmount
  const taxPrice = Math.round(totalAmount * 0.05 * 100) / 100
  const shippingPrice = totalAmount > 500 ? 0 : 50
  const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice - (discountAmount || 0)) * 100) / 100
  
  return (
    <div className="max-w-3xl mx-auto">
      {orderError && <Message type="error" message={orderError} />}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex-1 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="font-medium">Shipping</span>
            </div>
          </div>
          <div className={`h-1 flex-1 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="font-medium">Payment</span>
            </div>
          </div>
          <div className={`h-1 flex-1 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="font-medium">Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Shipping */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <form onSubmit={submitShippingHandler}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="address" className="block mb-1 font-medium">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full p-2 border rounded-md"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="city" className="block mb-1 font-medium">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  className="w-full p-2 border rounded-md"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block mb-1 font-medium">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  className="w-full p-2 border rounded-md"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="state" className="block mb-1 font-medium">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  className="w-full p-2 border rounded-md"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="country" className="block mb-1 font-medium">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  className="w-full p-2 border rounded-md"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block mb-1 font-medium">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full p-2 border rounded-md"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark flex items-center ml-auto"
            >
              Continue <FaArrowRight className="ml-2" />
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <form onSubmit={submitPaymentHandler}>
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                <label htmlFor="cod">Cash on Delivery</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="upi"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                <label htmlFor="upi">UPI</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="Card"
                  checked={paymentMethod === 'Card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                <label htmlFor="card">Credit/Debit Card</label>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-primary hover:underline"
              >
                Back to Shipping
              </button>
              <button
                type="submit"
                className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark flex items-center"
              >
                Continue <FaArrowRight className="ml-2" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Review Order */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>
          
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">Shipping Address</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p>{address}</p>
              <p>{city}, {state} {postalCode}</p>
              <p>{country}</p>
              <p>Phone: {phone}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">Payment Method</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p>{paymentMethod}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">Order Items</h3>
            <div className="bg-gray-50 p-3 rounded space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 rounded object-cover mr-3" 
                    />
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon Section */}
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">Discount Coupon</h3>
            <div className="bg-gray-50 p-3 rounded">
              {appliedCoupon ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-600">Coupon Applied: {appliedCoupon.code}</p>
                    <p className="text-sm text-gray-600">{appliedCoupon.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">-₹{discountAmount.toFixed(2)}</p>
                    <button 
                      onClick={removeCouponHandler}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={applyCouponHandler} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                  >
                    {couponLoading ? <FaSpinner className="animate-spin" /> : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">Order Summary</h3>
            <div className="bg-gray-50 p-3 rounded space-y-2">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>₹{itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>₹{shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%):</span>
                <span>₹{taxPrice.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-primary hover:underline"
            >
              Back to Payment
            </button>
            <button
              type="button"
              onClick={placeOrderHandler}
              disabled={orderLoading}
              className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
            >
              {orderLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckoutPage