import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const useAdminAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Don't redirect if still loading
    if (loading) return;

    // Only redirect once to prevent infinite loops
    if (!hasRedirected.current && (!isAuthenticated || !user?.isAdmin)) {
      hasRedirected.current = true;
      navigate('/admin/login');
    }

    // Reset redirect flag if user becomes authenticated admin
    if (isAuthenticated && user?.isAdmin) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, user?.isAdmin, loading, navigate]);

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin: user?.isAdmin || false,
    isAuthorized: isAuthenticated && user?.isAdmin
  };
};

export default useAdminAuth;