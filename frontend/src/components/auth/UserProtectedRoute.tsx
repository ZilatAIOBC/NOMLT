import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authHelper } from '../../utils/authHelper';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface UserProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * UserProtectedRoute - Protects user dashboard routes
 * 
 * Features:
 * - Checks if user is authenticated
 * - Validates user role (non-admin users only)
 * - Redirects to signin if not authenticated
 * - Redirects admin users to admin dashboard
 * - Shows loading state during authentication check
 */
const UserProtectedRoute: React.FC<UserProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (!authHelper.isAuthenticated()) {
          setLoading(false);
          return;
        }

        const userData = authHelper.getCurrentUser();
        setUser(userData);
      } catch (error) {
        // Removed console for production
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!user) {
    toast.error('Please sign in to access this page');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Redirect admin users to admin dashboard
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default UserProtectedRoute;

