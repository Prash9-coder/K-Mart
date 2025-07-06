import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-900/10"></div>
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold mb-6 text-gradient-animate">🛒 K-Store Cart</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your one-stop solution for all kirana and general store needs. Shop groceries, 
              household items, and more at the best prices with fast delivery.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-125 btn-interactive">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:scale-125 btn-interactive">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-all duration-300 hover:scale-125 btn-interactive">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-all duration-300 hover:scale-125 btn-interactive">
                <FaYoutube size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <h3 className="text-xl font-bold mb-6 text-blue-300">🔗 Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">
                  🏠 Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">
                  📦 Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">
                  🛒 Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">
                  🔐 Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">
                  📝 Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <h3 className="text-xl font-bold mb-6 text-purple-300">🏪 Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products?category=groceries" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">
                  🥬 Groceries
                </Link>
              </li>
              <li>
                <Link to="/products?category=household" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">
                  🏠 Household
                </Link>
              </li>
              <li>
                <Link to="/products?category=personal-care" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">
                  🧴 Personal Care
                </Link>
              </li>
              <li>
                <Link to="/products?category=beverages" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">
                  🥤 Beverages
                </Link>
              </li>
              <li>
                <Link to="/products?category=snacks" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">
                  🍿 Snacks & Confectionery
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="animate-fadeIn" style={{animationDelay: '0.6s'}}>
            <h3 className="text-xl font-bold mb-6 text-green-300">📞 Contact Us</h3>
            <address className="not-italic text-gray-300 space-y-3">
              <p className="hover:text-white transition-colors duration-300">📍 Near Gate Karepalli Railway Gate</p>
              <p className="hover:text-white transition-colors duration-300">🏙️ Gate Karepalli, Beside of Railway Gate.</p>
              <p className="hover:text-white transition-colors duration-300">📱 Phone: (+91)9346335587,6300472707</p>
              <p className="hover:text-white transition-colors duration-300">✉️ Email: support@kstorecard.com</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700/50 mt-12 pt-8 text-center">
          <div className="animate-fadeIn" style={{animationDelay: '0.8s'}}>
            <p className="text-gray-400 hover:text-white transition-colors duration-300">
              &copy; {currentYear} K-Store Cart. All rights reserved. Made with ❤️ for better shopping experience.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer