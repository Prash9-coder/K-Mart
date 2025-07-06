import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Loader from '../ui/Loader';

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/admin/login');
        return;
      }
      
      if (!user?.isAdmin) {
        navigate('/admin/login');
        return;
      }
    }
  }, [isAuthenticated, user?.isAdmin, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Checking admin privileges...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;