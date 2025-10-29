import React, { useState, useEffect } from 'react';
import { Check, ArrowUp, ArrowDown } from 'lucide-react';
import { plansService, PlanWithPricing, BillingCycle } from '../../services/plansService';
import { createCheckoutSession, Interval } from '../../services/paymentService';
import { getSubscriptionStatus, SubscriptionData, changeSubscriptionPlan } from '../../services/subscriptionService';
import { toast } from 'react-hot-toast';

// Using types from the service - keeping the same design

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; badgeText?: string }>=({ active, onClick, children, badgeText }) => (
  <button
    onClick={onClick}
    className={`relative px-6 py-2 rounded-full text-sm transition-colors ${
      active
        ? 'text-white bg-[#763EEA] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
        : 'text-white/90 hover:bg-white/5'
    }`}
  >
    {badgeText && (
      <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] leading-none px-3 py-1 rounded-full bg-[#763EEA] text-white shadow z-10 whitespace-nowrap min-w-[72px] text-center">
        {badgeText}
      </span>
    )}
    {children}
  </button>
);

const PurchaseSubscriptions: React.FC = () => {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [plans, setPlans] = useState<PlanWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both plans and current subscription
        const [plansData, subscription] = await Promise.all([
          plansService.getPlansWithPricing(),
          getSubscriptionStatus().catch(() => null) // Don't fail if no subscription
        ]);
        
        setPlans(plansData);
        setCurrentSubscription(subscription);
      } catch (err) {
        // Removed console for production
        setError('Failed to load subscription plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlanAction = async (planId: string, isUpgrade: boolean, isDowngrade: boolean) => {
    try {
      setProcessingPlanId(planId);
      
      // Step 1: Validate user authentication
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        toast.error('Please sign in to manage your subscription');
        setProcessingPlanId(null);
        return;
      }
      
      let userData;
      try {
        userData = JSON.parse(authUser);
      } catch (parseError) {
        // Removed console for production
        toast.error('Invalid user data. Please sign in again.');
        setProcessingPlanId(null);
        return;
      }
      
      const userId = userData?.id;
      const userEmail = userData?.email;
      
      if (!userId) {
        toast.error('User ID not found. Please sign in again.');
        setProcessingPlanId(null);
        return;
      }

      if (!userEmail) {
        toast.error('Email address not found. Please sign in again.');
        setProcessingPlanId(null);
        return;
      }

      // Step 2: Validate plan exists and has Stripe configuration
      const selectedPlan = plans.find(plan => plan.id === planId);
      if (!selectedPlan) {
        toast.error('Selected plan not found. Please refresh the page and try again.');
        setProcessingPlanId(null);
        return;
      }

      // Map BillingCycle to Interval
      const interval: Interval = cycle === 'yearly' ? 'yearly' : 'monthly';
      
      // Step 3: Validate Stripe price configuration
      const priceId = interval === 'yearly' ? selectedPlan.stripe_price_id_yearly : selectedPlan.stripe_price_id_monthly;
      if (!priceId) {
        toast.error(`${selectedPlan.display_name} plan is not configured for ${interval} billing. Please contact support.`);
        setProcessingPlanId(null);
        return;
      }

      // Step 4: Check if user is trying to purchase the same plan they already have
      if (currentSubscription && currentSubscription.plan_id === planId) {
        toast.error('You are already subscribed to this plan.');
        setProcessingPlanId(null);
        return;
      }

      // Step 5: Handle different scenarios
      if (currentSubscription && isDowngrade) {
        // For DOWNGRADE: Direct plan change with proration (they already paid more)
        toast.loading('Downgrading your plan...', { id: 'plan-change' });

        const result = await changeSubscriptionPlan(planId, interval);
        
        toast.dismiss('plan-change');
        
        if (result.success) {
          toast.success(result.message || 'Successfully downgraded your plan!');
          
          // Refresh subscription data
          const updatedSubscription = await getSubscriptionStatus();
          setCurrentSubscription(updatedSubscription);
          
          // Reload the page after a short delay to show the updated UI
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        // For UPGRADE or NEW SUBSCRIPTION: Go through Stripe checkout
        const actionText = isUpgrade ? 'upgrade' : 'subscription';
        toast.loading(`Preparing ${actionText} checkout...`, { id: 'checkout-prep' });

        const { url } = await createCheckoutSession({
          planId,
          interval,
          userId,
          isUpgrade: isUpgrade
        });

        // Validate checkout URL
        if (!url || typeof url !== 'string') {
          toast.error('Invalid checkout session. Please try again.');
          setProcessingPlanId(null);
          return;
        }

        toast.dismiss('checkout-prep');
        toast.success(`Redirecting to checkout for ${actionText}...`);
        
        // Small delay to show success message before redirect
        setTimeout(() => {
          window.location.href = url;
        }, 1000);
      }

    } catch (err: any) {
      // Removed console for production
      
      // Dismiss loading toasts
      toast.dismiss('checkout-prep');
      toast.dismiss('plan-change');
      
      // Handle specific error types
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (err.message?.includes('authentication') || err.message?.includes('unauthorized')) {
        toast.error('Authentication failed. Please sign in again.');
      } else if (err.message?.includes('plan not found')) {
        toast.error('Plan configuration error. Please refresh and try again.');
      } else if (err.message?.includes('Stripe')) {
        toast.error('Payment service error. Please try again or contact support.');
      } else {
        toast.error(err.message || 'Failed to process request. Please try again.');
      }
      
      setProcessingPlanId(null);
    }
  };

  // Loading state with skeleton cards
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center">Purchase a Subscription</h1>
          <p className="text-center text-gray-400 mt-2">Upgrade to get access to pro features and generate more and better</p>
        </div>

        {/* Loading tab bar */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#0C111C]/80 p-1 shadow-sm">
            <div className="px-6 py-2 rounded-full bg-white/10 animate-pulse w-20 h-8"></div>
            <div className="px-6 py-2 rounded-full bg-white/5 animate-pulse w-20 h-8"></div>
          </div>
        </div>

        {/* Loading skeleton cards */}
        <div className="flex justify-center">
        <div className="grid gap-7 md:gap-10 xl:gap-16 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-items-center">
            {[1, 2, 3].map((index) => (
              <div key={index} className="relative rounded-2xl border border-white/10 bg-[#121212] p-5 md:p-6 xl:p-6 pt-6 md:pt-7 xl:pt-8 flex flex-col w-full max-w-[320px] md:max-w-[340px] xl:w-[350px] min-h-[560px] md:min-h-[640px] xl:h-[750px] overflow-hidden animate-pulse">
                {/* Badge skeleton */}
                <div className="absolute top-3 right-4 w-16 h-5 bg-white/10 rounded-full"></div>
                
                {/* Title skeleton */}
                <div className="w-20 h-6 bg-white/10 rounded mb-3"></div>
                
                {/* Price skeleton */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="w-8 h-4 bg-white/10 rounded"></div>
                    <div className="w-16 h-8 bg-white/10 rounded"></div>
                    <div className="w-12 h-3 bg-white/10 rounded"></div>
                  </div>
                  <div className="w-24 h-3 bg-white/10 rounded"></div>
                </div>

                {/* Button skeleton */}
                <div className="mb-5 w-full h-12 bg-white/10 rounded-lg"></div>

                {/* Features skeleton */}
                <div className="space-y-3.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-white/10 rounded-full mt-0.5"></div>
                      <div className="w-32 h-4 bg-white/10 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state - keep the same design
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center">Purchase a Subscription</h1>
          <p className="text-center text-gray-400 mt-2">Upgrade to get access to pro features and generate more and better</p>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center">Purchase a Subscription</h1>
        <p className="text-center text-gray-400 mt-2">Upgrade to get access to pro features and generate more and better</p>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#0C111C]/80 p-1 shadow-sm">
          <TabButton active={cycle === 'monthly'} onClick={() => setCycle('monthly')}>Monthly</TabButton>
          <TabButton active={cycle === 'yearly'} onClick={() => setCycle('yearly')} badgeText="SAVE 30%">Yearly</TabButton>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="grid gap-7 md:gap-10 xl:gap-16 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-items-center">
        {plans.map((plan, index) => {
          const isCurrentPlan = currentSubscription && currentSubscription.plan_id === plan.id;
          
          // Determine if this is an upgrade or downgrade
          let isUpgrade = false;
          let isDowngrade = false;
          
          if (currentSubscription && !isCurrentPlan) {
            // Find the index of the current plan
            const currentPlanIndex = plans.findIndex(p => p.id === currentSubscription.plan_id);
            if (currentPlanIndex !== -1) {
              // If current plan index is less than this plan's index, it's an upgrade
              // If current plan index is greater than this plan's index, it's a downgrade
              isUpgrade = currentPlanIndex < index;
              isDowngrade = currentPlanIndex > index;
            }
          }
          
          return (
            <div 
              key={plan.id} 
              className={`relative rounded-2xl border p-5 md:p-6 xl:p-6 pt-6 md:pt-7 xl:pt-8 flex flex-col transition-all duration-300 w-full max-w-[320px] md:max-w-[340px] xl:w-[350px] min-h-[560px] md:min-h-[640px] xl:h-[750px] overflow-hidden ${
                isCurrentPlan 
                  ? 'border-[#763EEA]/60 bg-[#0D131F] shadow-[0_8px_25px_rgba(118,62,234,0.4)]' 
                  : 'border-white/10 bg-[#121212] hover:border-white/20 hover:shadow-[0_8px_25px_rgba(118,62,234,0.3)]'
              }`}
            >
            {plan.badge && (
              <div className={`absolute top-3 right-4 px-3 py-1 text-xs rounded-full ${
                plan.badge === 'Most Popular' 
                  ? 'bg-[#FED3A7] text-[#C06101]' 
                  : plan.badge === 'Special Offer'
                  ? 'bg-[#FF78AE] text-white'
                  : 'bg-gray-600 text-white border border-white/10'
              }`}>{plan.badge}</div>
            )}

            <div className="text-white font-bold text-base md:text-lg xl:text-xl mb-3">{plan.display_name}</div>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-white text-sm md:text-base leading-none">{plan.priceByCycle[cycle].currency}</span>
                <span className="text-white text-xl md:text-2xl font-semibold leading-none">{plan.priceByCycle[cycle].amount}</span>
                <span className="text-white/70 text-xs leading-none">{plan.priceByCycle[cycle].cadenceLabel}</span>
              </div>
              <div className="text-[11px] text-white/70 mt-1">{plan.priceByCycle[cycle].billedLabel}</div>
            </div>

            {(() => {
              const isProcessing = processingPlanId === plan.id;
              
              if (isCurrentPlan) {
                return (
                  <div className="mb-5 w-full justify-center px-4 md:px-5 py-2.5 md:py-3 rounded-lg text-center text-sm md:text-[15px] font-medium bg-[#763EEA]/20 border border-[#763EEA]/40 text-[#A78BFA]">
                    ✓ Current Plan
                  </div>
                );
              }
              
              // Determine button text and icon
              let buttonText = plan.cta;
              let ButtonIcon = null;
              
              if (currentSubscription) {
                if (isUpgrade) {
                  buttonText = 'Upgrade';
                  ButtonIcon = ArrowUp;
                } else if (isDowngrade) {
                  buttonText = 'Downgrade';
                  ButtonIcon = ArrowDown;
                }
              }
              
              return (
                <button 
                  onClick={() => handlePlanAction(plan.id, isUpgrade, isDowngrade)}
                  disabled={isProcessing}
                  className="mb-5 w-full justify-center px-4 md:px-5 py-2.5 md:py-3 rounded-lg text-white text-sm md:text-[15px] font-medium bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
                  {isProcessing ? 'Processing...' : buttonText}
                </button>
              );
            })()}

            <ul className="space-y-3 md:space-y-3.5 text-sm md:text-[15px] text-white/90">
              {plan.features.map((feature, i) => {
                const isUnlimitedSeedream = plan.seedream_unlimited && feature.toLowerCase().includes('seedream');
                if (isUnlimitedSeedream) {
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-gray-400 shrink-0" />
                      <div className="flex items-center gap-10">
                        <span className="text-white/90">Seedream V4</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-300 text-black">Unlimited</span>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-white/90">{feature}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default PurchaseSubscriptions;


