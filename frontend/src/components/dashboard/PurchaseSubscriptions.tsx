import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { plansService, PlanWithPricing, BillingCycle } from '../../services/plansService';

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

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const plansData = await plansService.getPlansWithPricing();
        setPlans(plansData);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load subscription plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

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
        {plans.map((plan) => (
            <div key={plan.id} className="relative rounded-2xl border border-white/10 bg-[#121212] p-5 md:p-6 xl:p-6 pt-6 md:pt-7 xl:pt-8 flex flex-col hover:border-white/20 hover:shadow-[0_8px_25px_rgba(118,62,234,0.3)] transition-all duration-300 w-full max-w-[320px] md:max-w-[340px] xl:w-[350px] min-h-[560px] md:min-h-[640px] xl:h-[750px] overflow-hidden">
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

            <button className="mb-5 w-full justify-center px-4 md:px-5 py-2.5 md:py-3 rounded-lg text-white text-sm md:text-[15px] font-medium bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] hover:opacity-95 transition-opacity">
              {plan.cta}
            </button>

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
        ))}
        </div>
      </div>
    </div>
  );
};

export default PurchaseSubscriptions;


