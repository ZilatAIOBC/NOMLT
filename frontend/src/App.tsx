import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Landing from './pages/Landingpage /Landing';
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import PlansAndPricing from './pages/Admin/PlansAndPricing';
import Analytics from './pages/Admin/Analytics';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import { Toaster, toast } from 'react-hot-toast';
import { useEffect, useRef } from 'react';

function VerifiedToastListener() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasShownRef = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isVerified = params.get('verified') === 'true';
    if (isVerified && !hasShownRef.current) {
      hasShownRef.current = true;
      toast.success('Email verified successfully. You can now sign in.');
      // Remove the query param to avoid duplicate toasts on re-renders
      navigate({ pathname: location.pathname }, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);
  return null;
}

function App() {
  return (
    <Router>
      <VerifiedToastListener />
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="plans" element={<PlansAndPricing />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;