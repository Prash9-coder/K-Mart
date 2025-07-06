import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch } from 'react-icons/fa'
import { logout } from '../../slices/authSlice'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user: userInfo } = useSelector((state) => state.auth)
  const { items: cartItems } = useSelector((state) => state.cart)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`)
      setSearchTerm('')
    }
  }

  const logoutHandler = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white shadow-lg backdrop-blur-sm sticky top-0 z-50 animate-slideIn">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-gradient-animate hover:scale-105 transition-transform duration-300">
            🛒 K-Store Cart
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-white/90 backdrop-blur-sm rounded-full overflow-hidden flex-1 mx-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white"
          >
            <input
              type="text"
              placeholder="Search products..."
              className="px-6 py-3 w-full text-gray-800 focus:outline-none bg-transparent input-interactive"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-red-500 p-3 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-300 btn-interactive ripple"
            >
              <FaSearch />
            </button>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="hover:text-yellow-300 transition-all duration-300 hover:scale-110 font-medium">
              Products
            </Link>
            <Link to="/cart" className="flex items-center hover:text-yellow-300 transition-all duration-300 hover:scale-110 relative group">
              <FaShoppingCart className="mr-2 group-hover:animate-bounce" />
              Cart
              {cartItems.length > 0 && (
                <span className="ml-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse-custom shadow-lg">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
            {userInfo ? (
              <div className="relative group">
                <button className="flex items-center hover:text-yellow-300 transition-all duration-300 hover:scale-110 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <FaUser className="mr-2" />
                  {userInfo.name}
                </button>
                <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl py-2 z-10 hidden group-hover:block animate-scaleIn border border-white/20">
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-105 mx-2 rounded-lg"
                  >
                    👤 Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-105 mx-2 rounded-lg"
                  >
                    📦 Orders
                  </Link>
                  {userInfo && userInfo.isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover:scale-105 mx-2 rounded-lg"
                    >
                      🛡️ Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logoutHandler}
                    className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-300 hover:scale-105 mx-2 rounded-lg"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center hover:text-yellow-300 transition-all duration-300 hover:scale-110 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm btn-interactive">
                <FaUser className="mr-2" />
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none bg-white/10 p-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes size={24} className="animate-spin" /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Search - Visible only on mobile */}
        <form 
          onSubmit={handleSearch}
          className="mt-4 md:hidden flex items-center bg-white rounded-md overflow-hidden"
        >
          <input
            type="text"
            placeholder="Search products..."
            className="px-4 py-2 w-full text-gray-800 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-secondary p-2 text-white"
          >
            <FaSearch />
          </button>
        </form>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 md:hidden animate-fadeIn">
            <ul className="flex flex-col space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4">
              <li>
                <Link
                  to="/products"
                  className="block py-2 hover:text-secondary-light"
                  onClick={toggleMenu}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="flex items-center py-2 hover:text-secondary-light"
                  onClick={toggleMenu}
                >
                  <FaShoppingCart className="mr-1" />
                  Cart
                  {cartItems.length > 0 && (
                    <span className="ml-1 bg-secondary rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </Link>
              </li>
              {userInfo ? (
                <>
                  <li>
                    <Link
                      to="/profile"
                      className="block py-2 hover:text-secondary-light"
                      onClick={toggleMenu}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/orders"
                      className="block py-2 hover:text-secondary-light"
                      onClick={toggleMenu}
                    >
                      Orders
                    </Link>
                  </li>
                  {userInfo && userInfo.isAdmin && (
                    <li>
                      <Link
                        to="/admin/dashboard"
                        className="block py-2 hover:text-secondary-light"
                        onClick={toggleMenu}
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={() => {
                        logoutHandler()
                        toggleMenu()
                      }}
                      className="block w-full text-left py-2 hover:text-secondary-light"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="flex items-center py-2 hover:text-secondary-light"
                    onClick={toggleMenu}
                  >
                    <FaUser className="mr-1" />
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header