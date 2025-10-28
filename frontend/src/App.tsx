import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import UserProtectedRoute from './components/auth/UserProtectedRoute';

// Lazy load components for code splitting
const Landing = lazy(() => import('./pages/Landingpage /Landing'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const SignIn = lazy(() => import('./pages/auth/SignIn'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const PlansAndPricing = lazy(() => import('./pages/Admin/PlansAndPricing'));
const Analytics = lazy(() => import('./pages/Admin/Analytics'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));

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
      <div className="min-h-screen ">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/authbg.png)' }}>
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-white text-sm">Loading...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            
            {/* User Dashboard Routes - Protected */}
            <Route path="/dashboard/*" element={
              <UserProtectedRoute>
                <Dashboard />
              </UserProtectedRoute>
            } />
            
            {/* Admin Routes - Protected */}
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
        </Suspense>
      </div>
    </Router>
  );
}

export default App;