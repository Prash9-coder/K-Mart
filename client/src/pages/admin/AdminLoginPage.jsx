import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa';
import { login, logout } from '../../slices/authSlice';
import Message from '../../components/ui/Message';
import Loader from '../../components/ui/Loader';
import { isTestAuthActive } from '../../utils/testAuth';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Check if force login is requested
  const forceLogin = searchParams.get('force') === 'true';

  useEffect(() => {
    // If already authenticated and is admin, redirect to dashboard (unless force login is requested)
    if (isAuthenticated && user && user.isAdmin && !forceLogin) {
      navigate('/admin/dashboard');
    }
  }, [navigate, isAuthenticated, user, forceLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    
    if (result.type === 'auth/login/fulfilled') {
      const userData = result.payload;
      if (userData.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        // Not an admin user
        alert('Access denied. Admin privileges required.');
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    // Clear the force parameter and stay on login page
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Admin Portal</h2>
          <p className="mt-2 text-sm text-blue-200">
            Sign in to your admin account
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && <Message variant="error">{error}</Message>}
          
          {/* Current Auth Status */}
          {isAuthenticated && user && (
            <div className={`mb-6 p-4 border rounded-lg ${
              isTestAuthActive() 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  {isTestAuthActive() && (
                    <div className="flex items-center mb-2">
                      <FaExclamationTriangle className="text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">
                        🧪 Test Authentication Active
                      </span>
                    </div>
                  )}
                  <h4 className={`text-sm font-medium mb-1 ${
                    isTestAuthActive() ? 'text-yellow-800' : 'text-blue-800'
                  }`}>
                    👤 Currently logged in as:
                  </h4>
                  <p className={`text-sm ${
                    isTestAuthActive() ? 'text-yellow-700' : 'text-blue-700'
                  }`}>
                    <strong>{user.name}</strong> ({user.email})
                    {user.isAdmin && <span className="ml-2 text-green-600">✅ Admin</span>}
                  </p>
                  {isTestAuthActive() && (
                    <p className="text-xs text-yellow-600 mt-1">
                      This bypasses normal login. Logout to restore normal behavior.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                >
                  <FaSignOutAlt className="mr-1" />
                  Logout
                </button>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/admin/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Need admin access? Register here
                </Link>
              </div>
              <div className="text-sm">
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Customer Login
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <FaShieldAlt className="h-5 w-5 mr-2" />
                    Sign in to Admin Panel
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Admin Login */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">🚀 Demo Admin Access</h4>
            <p className="text-xs text-yellow-700 mb-3">
              For testing purposes, use these credentials:
            </p>
            <div className="space-y-2 text-xs">
              <div className="bg-white p-2 rounded border">
                <strong>Email:</strong> admin@kstore.com<br/>
                <strong>Password:</strong> Any password
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    email: 'admin@kstore.com',
                    password: 'admin123'
                  });
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
              >
                🎯 Fill Demo Credentials
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This is a secure admin area. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;