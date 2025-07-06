import { Link } from 'react-router-dom'
import { FaHome, FaShoppingCart } from 'react-icons/fa'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold mt-4 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="flex items-center justify-center bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark"
          >
            <FaHome className="mr-2" /> Go to Homepage
          </Link>
          <Link
            to="/products"
            className="flex items-center justify-center bg-secondary text-white py-2 px-6 rounded-md hover:bg-secondary-dark"
          >
            <FaShoppingCart className="mr-2" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage