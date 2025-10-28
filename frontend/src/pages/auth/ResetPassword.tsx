import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);

  useEffect(() => {
    // Supabase sets a recovery session when redirecting back from the email link
    // We don't need to read token manually; updateUser will use the current session
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!password) newErrors.password = 'Password is required';
    else if (!validatePassword(password)) newErrors.password = 'At least 8 chars with uppercase, lowercase, and number';
    if (!confirm) newErrors.confirm = 'Please confirm your password';
    else if (confirm !== password) newErrors.confirm = 'Passwords do not match';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      setLoading(true);
      const { message } = await authService.resetPassword('unused', password);
      toast.success(message || 'Password reset successful. You can now sign in.');
      navigate('/signin');
    } catch (err: any) {
      const status = err?.status;
      const message = err?.data?.message || err?.message || 'Reset failed';
      if (status === 400) {
        toast.error(message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundImage: 'url(/authbg.png)' }}>
      <div className="max-w-md w-full">
        {/* Form Container with Glow Effect */}
        <div className="bg-black/20 backdrop-blur-md border rounded-2xl p-8 shadow-[0_0_30px_rgba(138,63,252,0.4)]" style={{ borderColor: '#8A3FFC' }}>
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block">
              <img 
                src="/logo.svg" 
                alt="NOLMT.AI" 
                className="h-8 mx-auto"
              />
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Reset your password</h2>
            <p className="text-gray-400 text-sm">Create a new strong password</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors text-sm ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:border-transparent'
                  }`}
                  style={!errors.password ? { '--tw-ring-color': '#8A3FFC' } as React.CSSProperties : {}}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              {!errors.password && <p className="text-gray-500 text-xs mt-1">At least 8 chars with uppercase, lowercase, and number</p>}
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirm"
                  name="confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors text-sm ${
                    errors.confirm 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:border-transparent'
                  }`}
                  style={!errors.confirm ? { '--tw-ring-color': '#8A3FFC' } as React.CSSProperties : {}}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ marginTop: '2rem' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-white text-sm">
              Remembered your password?{' '}
              <Link to="/signin" className="font-medium hover:opacity-80" style={{ color: '#8A3FFC' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;



