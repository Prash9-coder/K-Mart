import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../slices/authSlice'
import Loader from '../components/ui/Loader'
import Message from '../components/ui/Message'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { loading, error, user: userInfo } = useSelector((state) => state.auth)

  const redirect = location.search ? location.search.split('=')[1] : '/'

  useEffect(() => {
    if (userInfo) {
      // If user is admin and was trying to access admin pages, redirect to admin dashboard
      if (userInfo.isAdmin && (redirect.includes('admin') || redirect === '/')) {
        navigate('/admin/dashboard')
      } else {
        navigate(redirect)
      }
    }
  }, [navigate, userInfo, redirect])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 card-interactive glow-on-hover">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-bounce-custom">
              <span className="text-2xl">👤</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome Back!</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>
          
          {error && <Message variant="error">{error}</Message>}
          
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                📧 Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 input-interactive bg-white/50 backdrop-blur-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                🔒 Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 input-interactive bg-white/50 backdrop-blur-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 btn-interactive ripple shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Signing In...
                </div>
              ) : (
                '🚀 Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/admin/login"
                className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-300"
              >
                🛡️ Admin Login
              </Link>
            </div>
            <p className="text-gray-600">
              New customer?{' '}
              <Link
                to={redirect ? `/register?redirect=${redirect}` : '/register'}
                className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-300"
              >
                Register
              </Link>
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <p className="text-center text-gray-600 mb-4">Or sign in with</p>
            <div className="flex justify-center space-x-4">
              <button className="flex-1 py-2 border rounded-md hover:bg-gray-50">
                Google
              </button>
              <button className="flex-1 py-2 border rounded-md hover:bg-gray-50">
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage