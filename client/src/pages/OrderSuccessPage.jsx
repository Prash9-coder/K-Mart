import { Link } from 'react-router-dom'
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa'

const OrderSuccessPage = () => {
  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md text-center">
      <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. Your order has been received and is being processed.
      </p>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500 mb-2">
          A confirmation email has been sent to your registered email address.
        </p>
        <p className="text-sm text-gray-500">
          You can check the status of your order in the "My Orders" section.
        </p>
      </div>
      <div className="flex flex-col space-y-3">
        <Link
          to="/orders"
          className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark flex items-center justify-center"
        >
          <FaShoppingBag className="mr-2" /> View My Orders
        </Link>
        <Link
          to="/"
          className="text-primary hover:underline"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default OrderSuccessPage