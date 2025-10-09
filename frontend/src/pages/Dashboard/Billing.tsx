import React, { useEffect, useState, useRef } from 'react';
import HeaderBar from '../../components/dashboard/HeaderBar';
import TopHeader from '../../components/dashboard/TopHeader';
import CancelSubscriptionModal from '../../components/dashboard/CancelSubscriptionModal';
import { CalendarDays, DollarSign, Star, CheckCircle, Loader2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { retrieveCheckoutSession } from '../../services/paymentService';
import { getSubscriptionStatus, getTransactionHistory, SubscriptionData, TransactionData, cancelSubscription, reactivateSubscription } from '../../services/subscriptionService';
import { toast } from 'react-hot-toast';

const Billing: React.FC = () => {
  const [verifyingSession, setVerifyingSession] = useState(false);
  const [billingData, setBillingData] = useState<SubscriptionData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const loadBillingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user ID from localStorage
        const authUser = localStorage.getItem('authUser');
        if (!authUser) {
          setError('Please sign in to view billing information');
          setLoading(false);
          return;
        }
        
        const userData = JSON.parse(authUser);
        const userId = userData.id;
        
        if (!userId) {
          setError('User ID not found. Please sign in again.');
          setLoading(false);
          return;
        }

        // Fetch subscription data and transactions
        const [subscription, transactionHistory] = await Promise.all([
          getSubscriptionStatus(),
          getTransactionHistory()
        ]);
        
        setBillingData(subscription);
        setTransactions(transactionHistory);
        
      } catch (err: any) {
        console.error('Error loading billing data:', err);
        setError(err.message || 'Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    const verifyCheckoutSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      const canceled = params.get('canceled');

      if (canceled === 'true') {
        toast.error('Checkout was canceled');
        // Clean up URL immediately
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      if (sessionId) {
        try {
          setVerifyingSession(true);
          const { session } = await retrieveCheckoutSession(sessionId);
          
          if (session.payment_status === 'paid') {
            toast.success('Subscription activated successfully! 🎉');
            // Webhook should handle saving to database, no need to reload
          } else if (session.payment_status === 'unpaid') {
            toast.error('Payment was not completed');
          }
          
          // Clean up URL immediately
          window.history.replaceState({}, '', window.location.pathname);
        } catch (error: any) {
          console.error('Error verifying checkout session:', error);
          toast.error('Failed to verify payment status');
        } finally {
          setVerifyingSession(false);
        }
      }
    };

    // Load billing data
    loadBillingData();
    
    // Check for checkout session verification only if URL has session_id
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id') || params.get('canceled')) {
      verifyCheckoutSession();
    }
  }, []); // Empty dependency array - run only once on mount

  const handleCancelSubscription = async () => {
    try {
      setCanceling(true);
      setShowCancelModal(false);
      
      const result = await cancelSubscription();
      
      if (result.success) {
        toast.success(result.message || 'Subscription canceled successfully');
        
        // Refresh billing data
        const updatedSubscription = await getSubscriptionStatus();
        setBillingData(updatedSubscription);
      }
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      toast.error(err.message || 'Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setReactivating(true);
      const result = await reactivateSubscription();
      
      if (result.success) {
        toast.success(result.message || 'Subscription reactivated successfully');
        
        // Refresh billing data
        const updatedSubscription = await getSubscriptionStatus();
        setBillingData(updatedSubscription);
      }
    } catch (err: any) {
      console.error('Error reactivating subscription:', err);
      toast.error(err.message || 'Failed to reactivate subscription');
    } finally {
      setReactivating(false);
    }
  };

  return (
    <div className="ml-16 lg:ml-64 min-h-screen bg-[#0F0F0F] text-white transition-all duration-300">
      <HeaderBar>
        <TopHeader />
      </HeaderBar>

      <div className="p-4 sm:p-6 lg:p-8 pt-28 md:pt-32 xl:pt-36">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Billing Information</h1>
          <p className="text-white/70 mb-6 sm:mb-10">Manage your subscription and payment details.</p>

          {/* Cancel Confirmation Modal */}
          <CancelSubscriptionModal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleCancelSubscription}
            currentPeriodEnd={billingData?.current_period_end || null}
            isLoading={canceling}
          />

          {/* Verifying Session Notification */}
          {verifyingSession && (
            <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-blue-400">Verifying your payment...</span>
            </div>
          )}

          {/* Active Subscription */}
          <div className="rounded-2xl border border-white/10 bg-[#0D131F] p-5 sm:p-6 max-w-2xl">
            <div className="text-lg font-semibold mb-4">Active Subscription</div>
            {loading ? (
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-600/20 border border-white/10 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Loading...</div>
                    <div className="text-white/90">Please wait</div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </div>
            ) : billingData ? (
              <div>
                {/* Cancellation Warning */}
                {billingData.cancel_at_period_end && (
                  <div className="mb-5 p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-blue-300 font-semibold text-base mb-2">
                          Subscription Ending Soon
                        </div>
                        <div className="text-blue-200/80 text-sm mb-4 leading-relaxed">
                          Your subscription will end on{' '}
                          <span className="font-semibold text-white">
                            {billingData.current_period_end 
                              ? new Date(billingData.current_period_end).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : 'the end of your billing period'
                            }
                          </span>
                          . You'll keep full access until then.
                        </div>
                        <button
                          onClick={handleReactivateSubscription}
                          disabled={reactivating}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {reactivating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Reactivating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              Reactivate Subscription
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-white/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-white/80">Current Plan</div>
                      <div className="text-white/90">{billingData.display_name}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-white/10 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-sm text-white/80">Next Billing Date</div>
                      <div className="text-white/90">
                        {billingData.current_period_end 
                          ? new Date(billingData.current_period_end).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600/20 border border-white/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <div className="text-sm text-white/80">Subscription Status</div>
                      <div className="text-white/90 capitalize">{billingData.status}</div>
                    </div>
                  </div>
                </div>

                {/* Subscription Actions */}
                <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                  <a
                    href="/dashboard/subscription"
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-4 py-2.5 text-sm transition-colors shadow-lg hover:shadow-blue-500/25"
                  >
                    Change Plan
                  </a>
                  
                  {!billingData.cancel_at_period_end && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-medium px-4 py-2.5 text-sm transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-white/70 mb-4">No active subscription</div>
                <a 
                  href="/dashboard/subscription" 
                  className="inline-flex items-center justify-center rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium px-4 py-2 text-sm transition-colors"
                >
                  Choose a Plan
                </a>
              </div>
            )}
          </div>

          {/* Past Transactions */}
          <div className="mt-8 sm:mt-10">
            <div className="text-lg font-semibold mb-4">Transaction History</div>
            {loading ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D131F] p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  <span className="ml-2 text-white/70">Loading transactions...</span>
                </div>
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D131F]">
                <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-4 border-b border-white/10 text-sm text-white/70">
                  <div className="col-span-3">Date</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-3">Status</div>
                </div>

                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-5 py-4 border-t border-white/5"
                  >
                    <div className="md:col-span-3 text-white/90">{transaction.date}</div>
                    <div className="md:col-span-4 text-white/90">{transaction.description}</div>
                    <div className="md:col-span-2 text-white/90 font-medium">{transaction.amount}</div>
                    <div className="md:col-span-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'paid' || transaction.status === 'active'
                          ? 'bg-emerald-600/15 text-emerald-300'
                          : transaction.status === 'canceled'
                          ? 'bg-red-600/15 text-red-300'
                          : 'bg-yellow-600/15 text-yellow-300'
                      }`}>
                        {transaction.status === 'paid' || transaction.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Paid
                          </>
                        ) : (
                          transaction.status
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D131F] p-8">
                <div className="text-center">
                  <div className="text-white/70 mb-2">No transactions found</div>
                  <div className="text-sm text-white/50">Your transaction history will appear here</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;



