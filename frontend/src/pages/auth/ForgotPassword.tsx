import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Email is required');
      return;
    }
    try {
      setLoading(true);
      const { message } = await authService.forgotPassword(email.trim());
      toast.success(message || 'If that email exists, a reset link has been sent.');
    } catch (err: any) {
      toast.success('If that email exists, a reset link has been sent.');
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
            <h2 className="text-2xl font-bold text-white mb-1">Forgot your password?</h2>
            <p className="text-gray-400 text-sm">Enter your email to receive a reset link</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors text-sm ${
                    error 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:border-transparent'
                  }`}
                  style={!error ? { '--tw-ring-color': '#8A3FFC' } as React.CSSProperties : {}}
                  placeholder="Email"
                />
              </div>
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ marginTop: '2rem' }}
            >
              {loading ? 'Sending...' : 'Send reset link'}
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

export default ForgotPassword;



