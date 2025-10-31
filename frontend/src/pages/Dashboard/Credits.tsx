import React, { useEffect, useState } from 'react';
import HeaderBar from '../../components/dashboard/HeaderBar';
import TopHeader from '../../components/dashboard/TopHeader';
import { getCreditSummary, formatCredits, type CreditSummary, type CreditTransaction } from '../../services/creditsService';
import BuyCreditsModal from '../../components/dashboard/BuyCreditsModal';

const Credits: React.FC = () => {
  const [creditData, setCreditData] = useState<CreditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Ensure page starts at the top whenever Credits mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchCreditData();
  }, []);

  const fetchCreditData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCreditSummary();
      console.log('[frontend][credits] summary loaded', data);
      setCreditData(data);
    } catch (err) {
      // Removed console for production
      console.warn('[frontend][credits] failed to load summary', err);
      setError('Failed to load credit information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'earned': 'Credits Earned',
      'spent': 'Credits Used',
      'purchased': 'Credits Purchased',
      'bonus': 'Bonus Credits',
      'refund': 'Refund',
    };
    return labels[type] || type;
  };

  const cleanDescription = (t: CreditTransaction) => {
    // Normalize top-ups to a clean label
    if (t.type === 'purchased' && t.reference_type === 'credit_topup') {
      return 'Credit top-up purchase';
    }
    const description = t.description || '';
    if (!description) return getTransactionTypeLabel(t.type);
    // Remove IDs in parentheses (Stripe IDs, etc.)
    return description.replace(/\([^)]+\)/g, '').trim() || getTransactionTypeLabel(t.type);
  };

  return (
    <div className="ml-16 lg:ml-64 min-h-screen bg-[#0F0F0F] text-white transition-all duration-300">
      <HeaderBar>
        <TopHeader />
      </HeaderBar>

      <div className="p-4 sm:p-6 lg:p-8 pt-28 md:pt-32 xl:pt-36">
        <div className="w-full max-w-6xl mx-auto">
          {/* Page title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">Your Credits</h1>
          <p className="text-white/70 max-w-2xl mb-8">Manage your credits for AI model usage. Credits are used to access and run AI models on the platform.</p>

          {loading && (
            <>
              {/* Skeleton for Balance + CTA row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
                {/* Skeleton Balance card */}
                <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] px-5 py-6 sm:px-6 sm:py-7">
                  <div className="h-4 w-32 bg-white/10 rounded animate-pulse mb-4"></div>
                  <div className="h-12 w-40 bg-white/10 rounded animate-pulse mb-6"></div>
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="h-4 w-full bg-white/5 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-white/5 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Skeleton CTA card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6 sm:px-6 sm:py-7">
                  <div className="h-6 w-48 bg-white/10 rounded animate-pulse mb-3"></div>
                  <div className="h-4 w-64 bg-white/10 rounded animate-pulse mb-4"></div>
                  <div className="h-10 w-32 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Skeleton for Transactions */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0B0B0B]">
                <div className="px-6 py-5 border-b border-white/10">
                  <div className="h-6 w-48 bg-white/10 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-64 bg-white/5 rounded animate-pulse"></div>
                </div>
                <div className="overflow-x-auto">
                  <div className="px-4 py-3 border-b border-white/5">
                    <div className="flex gap-4">
                      <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                      <div className="h-4 w-40 bg-white/10 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-white/10 rounded animate-pulse ml-auto"></div>
                      <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                    </div>
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="px-4 py-4 border-b border-white/5">
                      <div className="flex gap-4">
                        <div className="h-4 w-28 bg-white/5 rounded animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-40 bg-white/5 rounded animate-pulse"></div>
                          <div className="h-3 w-32 bg-white/5 rounded animate-pulse"></div>
                        </div>
                        <div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && creditData && (
            <>
              {/* Balance + CTA row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
                {/* Balance card */}
                <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] px-5 py-6 sm:px-6 sm:py-7">
                  <div className="text-sm text-white/70">Current Balance</div>
                  <div className="mt-2 flex items-end gap-2">
                    <div className="text-4xl sm:text-5xl font-semibold tracking-tight">
                      {formatCredits(creditData.balance)}
                    </div>
                    <div className="mb-1 text-white/70 font-medium">Credits</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Lifetime Earned:</span>
                      <span className="text-white/80 font-medium">{formatCredits(creditData.lifetime_earned)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-white/60">Lifetime Spent:</span>
                      <span className="text-white/80 font-medium">{formatCredits(creditData.lifetime_spent)}</span>
                    </div>
                  </div>
                </div>

                {/* CTA gradient card */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#5B3BEA] via-[#7A3AEA] to-[#2C60EB] p-5 sm:p-6 flex items-center">
                  <div className="flex-1">
                    <div className="text-white font-semibold text-lg">Need more credits?</div>
                    <div className="text-white/80 text-sm mt-1">Top up instantly or view plans.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowBuyModal(true)}
                      className="mt-4 lg:mt-0 whitespace-nowrap inline-flex items-center justify-center rounded-lg bg-white text-[#0F0F0F] font-medium px-4 py-2 text-sm hover:bg-white/90 transition-colors"
                    >
                      Buy Credits
                    </button>
                    <button 
                      onClick={() => window.location.href = '/dashboard/billing'}
                      className="mt-4 lg:mt-0 whitespace-nowrap inline-flex items-center justify-center rounded-lg border border-white/20 text-white font-medium px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                    >
                      View Plans
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0B0B0B]">
                <div className="px-6 py-5 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
                  <p className="text-sm text-white/50 mt-1">Your credit activity history</p>
                </div>
                <div className="overflow-x-auto">
                  {creditData.recent_transactions.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-3">
                        <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-white/50 text-sm">No transactions yet</p>
                    </div>
                  ) : (
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-white/50 text-xs uppercase tracking-wide border-b border-white/5">
                          <th className="px-4 py-3 font-medium w-1/5">Date</th>
                          <th className="px-4 py-3 font-medium w-2/5">Description</th>
                          <th className="px-4 py-3 font-medium text-right w-1/5">Amount</th>
                          <th className="px-4 py-3 font-medium text-right w-1/5">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creditData.recent_transactions.map((transaction: CreditTransaction) => (
                          <tr 
                            key={transaction.id}
                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-4 py-4 text-sm text-white/70">
                              {formatDate(transaction.created_at)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-white/90 font-medium">
                                {cleanDescription(transaction)}
                              </div>
                              <div className="text-xs text-white/40 mt-0.5 capitalize">
                                {transaction.type.replace('_', ' ')}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className={`text-sm font-semibold ${
                                transaction.type === 'spent' ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {transaction.type === 'spent' ? '-' : '+'}
                                {formatCredits(transaction.amount)} Credits
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right text-sm text-white/80 font-medium">
                              {formatCredits(transaction.balance_after)} Credits
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <BuyCreditsModal open={showBuyModal} onClose={() => setShowBuyModal(false)} />
    </div>
  );
};

export default Credits;


