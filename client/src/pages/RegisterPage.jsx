import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../slices/authSlice'
import Loader from '../components/ui/Loader'
import Message from '../components/ui/Message'

const RegisterPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)

  const { loading, error, user: userInfo } = useSelector((state) => state.auth)

  const redirect = location.search ? location.search.split('=')[1] : '/'

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [navigate, userInfo, redirect])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const submitHandler = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
    } else {
      setMessage(null)
      dispatch(register({ name, email, password }))
    }
  }

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
          
          {message && <Message variant="error">{message}</Message>}
          {error && <Message variant="error">{error}</Message>}
          
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-1 font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full p-2 border rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block mb-1 font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block mb-1 font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-2 border rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block mb-1 font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-2 border rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? <Loader /> : 'Register'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p>
              Already have an account?{' '}
              <Link
                to={redirect ? `/login?redirect=${redirect}` : '/login'}
                className="text-primary hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <p className="text-center text-gray-600 mb-4">Or register with</p>
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

export default RegisterPage