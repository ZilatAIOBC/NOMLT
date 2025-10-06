import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img 
              src="/logo.svg" 
              alt="NOLMT.AI" 
              className="h-10 mx-auto"
            />
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Forgot your password?</h2>
          <p className="text-gray-400">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Remembered your password?{' '}
              <Link to="/signin" className="text-blue-400 hover:text-blue-300 font-medium">
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



