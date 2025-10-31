import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success('Registration successful. Check your email to verify your account.');
      navigate('/signin');
    } catch (error: any) {
      const status = error?.status;
      const message = error?.data?.message || error?.message || 'Registration failed';
      // Handle express-validator errors array
      const validationErrors: Array<{ msg: string; param: string }>|undefined = error?.data?.errors;
      if (status === 400 && Array.isArray(validationErrors)) {
        const fieldErrors: Record<string, string> = {};
        validationErrors.forEach((ve) => {
          if (ve?.param && ve?.msg && !fieldErrors[ve.param]) {
            fieldErrors[ve.param] = ve.msg;
          }
        });
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        // Show a concise toast too
        toast.error('Please fix the highlighted fields.');
      } else if (status === 400 && message.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: message }));
        toast.error(message);
      } else {
        toast.error(message);
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
            <h2 className="text-2xl font-bold text-white mb-1">Start your FREE trial</h2>
            <p className="text-gray-400 text-sm">No credit card required</p>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={googleLoading || loading}
            className={`w-full flex items-center justify-center gap-3 bg-transparent hover:bg-white/10 text-white font-medium py-2.5 px-4 rounded-lg transition-colors mb-4 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => {
              if (googleLoading) return;
              setGoogleLoading(true);
              toast.loading('Redirecting to Google...', { id: 'google-oauth' });
              authService.googleStart();
            }}
          >
            {googleLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                 Redirecting to Google...
              </>
            ) : (
              <>
                <span className="bg-white rounded-full w-5 h-5 flex items-center justify-center">
                  <img src="/google.svg" alt="Google" className="w-4 h-4" />
                </span>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="text-gray-400 text-xs">OR</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors text-sm ${
                    errors.firstName 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:border-transparent'
                  }`}
                  style={!errors.firstName ? { '--tw-ring-color': '#8A3FFC' } as React.CSSProperties : {}}
                  placeholder="First name"
                />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors text-sm ${
                    errors.lastName 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:border-transparent'
                  }`}
                  style={!errors.lastName ? { '--tw-ring-color': '#8A3FFC' } as React.CSSProperties : {}}
                  placeholder="Last name"
                />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3.5 py-2.5 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors text-sm ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:border-transparent'
                }`}
                style={!errors.email ? { '--tw-ring-color': '#8A3FFC' } as React.CSSProperties : {}}
                placeholder="Email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 pr-10 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors text-sm ${
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
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ marginTop: '2rem' }}
            >
              {loading ? 'Processing...' : 'Sign Up'}
            </button>
          </form>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-white text-sm">
              By signing up you accept our{' '}
              <Link to="/terms-and-conditions" className="hover:opacity-80" style={{ color: '#8A3FFC' }}>
                Terms and Conditions
              </Link>
            </p>
          </div>

          {/* Sign In Link */}
          <div className="mt-3 text-center">
            <p className="text-white text-sm">
              Already registered?{' '}
              <Link to="/signin" className="font-medium hover:opacity-80" style={{ color: '#8A3FFC' }}>
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;