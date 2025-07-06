import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import Message from '../../components/ui/Message';
import Loader from '../../components/ui/Loader';

const UserListPage = () => {
  const navigate = useNavigate();
  const { user: userInfo, isAuthenticated } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
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
      // Redirect to admin login page
      navigate('/admin/login');
    } else {
      // Fetch users
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    }
  }, [userInfo, navigate]);

  const deleteHandler = (id) => {
    if (deleteConfirm === id) {
      // In a real app, this would make an API call to delete the user
      setUsers(users.filter(user => user._id !== id));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const toggleAdminHandler = (id) => {
    // In a real app, this would make an API call to update the user
    setUsers(
      users.map((user) =>
        user._id === id ? { ...user, isAdmin: !user.isAdmin } : user
      )
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isAdmin ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => toggleAdminHandler(user._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title={user.isAdmin ? "Remove Admin" : "Make Admin"}
                          disabled={user._id === userInfo._id}
                        >
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </button>
                        <Link
                          to={`/admin/user/${user._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit size={18} />
                        </Link>
                        <button
                          onClick={() => deleteHandler(user._id)}
                          className={`${
                            deleteConfirm === user._id
                              ? 'text-red-600'
                              : 'text-gray-600 hover:text-red-900'
                          }`}
                          disabled={user._id === userInfo._id}
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListPage;