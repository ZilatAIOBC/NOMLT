import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authUser = localStorage.getItem('authUser');
        const accessToken = localStorage.getItem('accessToken');

        if (!authUser || !accessToken) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(authUser);
        setUser(userData);
      } catch (error) {
        // Removed console for production
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    toast.error('Please sign in to access this page');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    toast.error('Admin access required');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
