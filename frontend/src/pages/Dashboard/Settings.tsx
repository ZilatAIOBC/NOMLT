import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import HeaderBar from '../../components/dashboard/HeaderBar';
import TopHeader from '../../components/dashboard/TopHeader';
import { getCreditBalance } from '../../services/creditsService';
import { getSubscriptionStatus, SubscriptionData } from '../../services/subscriptionService';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [lifetimeEarned, setLifetimeEarned] = useState<number>(0);
  const [lifetimeSpent, setLifetimeSpent] = useState<number>(0);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile update states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountData();
    loadUserProfile();
  }, []);

  // Auto-dismiss profile alerts
  useEffect(() => {
    if (profileSuccess || profileError) {
      const timer = setTimeout(() => {
        setProfileSuccess(null);
        setProfileError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccess, profileError]);

  // Auto-dismiss password alerts
  useEffect(() => {
    if (passwordSuccess || passwordError) {
      const timer = setTimeout(() => {
        setPasswordSuccess(null);
        setPasswordError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess, passwordError]);

  const loadUserProfile = () => {
    try {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setName(user.name || '');
        setEmail(user.email || '');
      }
    } catch (error) {
      // Removed console for production
    }
  };

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch credit balance and subscription in parallel
      const [creditsData, subscriptionData] = await Promise.all([
        getCreditBalance().catch(() => ({ balance: 0, lifetime_earned: 0, lifetime_spent: 0, updated_at: '' })),
        getSubscriptionStatus().catch(() => null),
      ]);

      setCreditBalance(creditsData.balance);
      setLifetimeEarned(creditsData.lifetime_earned);
      setLifetimeSpent(creditsData.lifetime_spent);
      setSubscription(subscriptionData);
    } catch (err) {
      // Removed console for production
      setError('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateCreditPercentage = () => {
    // Calculate percentage of remaining credits out of lifetime earned
    if (lifetimeEarned === 0) return 0;
    const percentage = (creditBalance || 0) / lifetimeEarned * 100;
    return Math.max(0, Math.min(percentage, 100));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      setPasswordError('Password must contain uppercase, lowercase, and number');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    try {
      setPasswordLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      toast.success('Password changed successfully');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
      toast.error(err?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    // Validation
    if (!name.trim()) {
      setProfileError('Name is required');
      return;
    }

    if (!email.trim()) {
      setProfileError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError('Please enter a valid email address');
      return;
    }

    try {
      setProfileLoading(true);
      await authService.updateProfile(name.trim(), email.trim());
      setProfileSuccess('Profile updated successfully!');
      toast.success('Profile updated successfully');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="ml-16 lg:ml-64 min-h-screen bg-[#0F0F0F] text-white transition-all duration-300">
      <HeaderBar>
        <TopHeader />
      </HeaderBar>

      <div className="p-4 sm:p-6 lg:p-8 pt-28 sm:pt-32 md:pt-36 lg:pt-40 xl:pt-36">
        <div className="w-full max-w-7xl mx-auto ">
          <div  className="grid grid-cols-1 xl:grid-cols-4 gap-6 xl:gap-8  ">
            <div className="xl:col-span-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Account Settings</h1>
              <p className="text-white/70 mt-3">Manage your profile, password, and plan.</p>
            </div>

            <div className="xl:col-span-3">
              <div className="rounded-2xl border border-white/10 bg-[#0D131F] overflow-hidden">
                <div className="px-5 sm:px-6 py-5 sm:py-6 border-b border-white/10">
                  <div>
                    <div className="text-lg font-semibold">Profile</div>
                    <div className="text-sm text-white/70 mt-1">Update your personal information.</div>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate}>
                  <div className="px-5 sm:px-6 py-6 space-y-5">
                    {profileError && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {profileError}
                      </div>
                    )}
                    
                    {profileSuccess && (
                      <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                        {profileSuccess}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full rounded-lg bg-[#0F0F0F] border border-white/10 text-white/90 placeholder-white/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/40"
                        disabled={profileLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Email address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full rounded-lg bg-[#0F0F0F] border border-white/10 text-white/90 placeholder-white/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/40"
                        disabled={profileLoading}
                      />
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 py-4 border-t border-white/10 flex items-center justify-end">
                    <button 
                      type="submit"
                      disabled={profileLoading}
                      className="inline-flex items-center justify-center rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {profileLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                  </div>
                </form>
              </div>

            {/* Change Password */}
            <div className="rounded-2xl border border-white/10 bg-[#0D131F] overflow-hidden mt-6">
              <div className="px-5 sm:px-6 py-5 sm:py-6 border-b border-white/10">
                <div>
                  <div className="text-lg font-semibold">Change Password</div>
                  <div className="text-sm text-white/70 mt-1">Ensure your account is using a long, random password to stay secure.</div>
                </div>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div className="px-5 sm:px-6 py-6 space-y-5">
                  {passwordError && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {passwordError}
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                      {passwordSuccess}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full rounded-lg bg-[#0F0F0F] border border-white/10 text-white/90 placeholder-white/40 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/40"
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        disabled={passwordLoading}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full rounded-lg bg-[#0F0F0F] border border-white/10 text-white/90 placeholder-white/40 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/40"
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        disabled={passwordLoading}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full rounded-lg bg-[#0F0F0F] border border-white/10 text-white/90 placeholder-white/40 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/40"
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        disabled={passwordLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-5 sm:px-6 py-4 border-t border-white/10 flex items-center justify-end">
                  <button 
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center justify-center rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Plan & Credits */}
            <div className="rounded-2xl border border-white/10 bg-[#0D131F] overflow-hidden mt-6">
              <div className="px-5 sm:px-6 py-5 sm:py-6 border-b border-white/10">
                <div>
                  <div className="text-lg font-semibold">Plan & Credits</div>
                  <div className="text-sm text-white/70 mt-1">Manage your subscription and credit usage.</div>
                </div>
              </div>

              <div className="px-5 sm:px-6 py-6 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : error ? (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                ) : (
                  <>
                    {/* Current Plan row */}
                    <div className="rounded-lg border border-white/10 bg-[#0B111B] px-4 sm:px-5 py-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-white/80">
                          Current Plan:{' '}
                          <span className="text-indigo-300 font-medium">
                            {subscription?.display_name || subscription?.plan_name || 'Free Plan'}
                          </span>
                          {subscription?.cancel_at_period_end && (
                            <span className="ml-2 text-xs text-yellow-400">(Canceling)</span>
                          )}
                        </div>
                        {subscription?.current_period_end ? (
                          <div className="text-xs text-white/60 mt-1">
                            {subscription.cancel_at_period_end ? 'Expires on' : 'Renews on'}: {formatDate(subscription.current_period_end)}
                          </div>
                        ) : (
                          <div className="text-xs text-white/60 mt-1">No active subscription</div>
                        )}
                      </div>
                      <button 
                        onClick={() => navigate('/dashboard/billing')}
                        className="whitespace-nowrap inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white px-3 py-2 text-sm hover:bg-white/10 transition-colors"
                      >
                        Change Plan
                      </button>
                    </div>

                    {/* Credits row */}
                    <div className="rounded-lg border border-white/10 bg-[#0B111B] px-4 sm:px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-sm text-white/80">
                            Credits Remaining:{' '}
                            <span className="font-semibold text-white">
                              {creditBalance !== null ? creditBalance.toLocaleString() : '0'}
                            </span>
                          </div>
                          {lifetimeEarned > 0 && (
                            <div className="text-xs text-white/60 mt-1">
                              Used: {lifetimeSpent.toLocaleString()} / Total Earned: {lifetimeEarned.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => navigate('/dashboard/credits')}
                          className="whitespace-nowrap inline-flex items-center justify-center rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-3 py-2 text-sm transition-colors"
                        >
                          Buy Credits
                        </button>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] rounded-full transition-all duration-300" 
                          style={{ width: `${calculateCreditPercentage()}%` }}
                        />
                      </div>
                      {creditBalance !== null && creditBalance < 100 && (
                        <div className="mt-2 text-xs text-yellow-400">
                          ⚠️ Low credit balance. Consider purchasing more credits.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
