import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Message from '../../components/ui/Message';
import Loader from '../../components/ui/Loader';

const UserEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { user: userInfo, isAuthenticated } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Mock users data
  const mockUsers = [
    {
      _id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      isAdmin: true,
    },
    {
      _id: '2',
      name: 'John Doe',
      email: 'john@example.com',
      isAdmin: false,
    },
    {
      _id: '3',
      name: 'Jane Doe',
      email: 'jane@example.com',
      isAdmin: false,
    },
    {
      _id: '4',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      isAdmin: false,
    },
    {
      _id: '5',
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      isAdmin: false,
    },
  ];

  useEffect(() => {
    // Check if user is admin
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/admin/login');
      return;
    }
    
    // Fetch user details
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const user = mockUsers.find(u => u._id === id);
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setIsAdmin(user.isAdmin);
      } else {
        setError('User not found');
      }
      setLoading(false);
    }, 500);
  }, [id, navigate, userInfo]);

  const submitHandler = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !email) {
      setError('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Prepare user data
    const userData = {
      name,
      email,
      isAdmin,
    };
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    }, 1000);
  };

  return (
    <div>
      <button
        onClick={() => navigate('/admin/users')}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
      >
        <FaArrowLeft className="mr-1" /> Back to Users
      </button>
      
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {success && (
            <Message variant="success">
              User updated successfully
            </Message>
          )}
          
          <form onSubmit={submitHandler}>
            <div className="space-y-4 max-w-md">
              <div>
                <label htmlFor="name" className="block mb-1 font-medium">
                  Name <span className="text-red-500">*</span>
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
              
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">
                  Email <span className="text-red-500">*</span>
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
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAdmin"
                  className="mr-2"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <label htmlFor="isAdmin" className="font-medium">
                  Admin User
                </label>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark"
                  disabled={loading}
                >
                  {loading ? <Loader /> : 'Update'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserEditPage;