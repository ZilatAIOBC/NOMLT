import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { plansService, PlanWithPricing, BillingCycle } from '../../services/plansService';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; badgeText?: string }> = ({ active, onClick, children, badgeText }) => (
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

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [plans, setPlans] = useState<PlanWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch only plans data
        const plansData = await plansService.getPlansWithPricing();
        setPlans(plansData);
      } catch (err) {
        // Removed console for production
        setError('Failed to load subscription plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGetStarted = () => {
    // Simply redirect to signup page
    navigate('/signin');
  };

  // Loading state with skeleton cards
  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            {/* Decorative lines with "Pricing" */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-4">
              <div className="w-8 sm:w-12 md:w-16 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F] to-[#9333EA]"></div>
              <h3 className="text-white text-xs sm:text-sm md:text-sm font-medium tracking-[0.1em] uppercase">
                Pricing
              </h3>
              <div className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
              Purchase a Subscription
            </h1>
            <p className="text-center text-gray-400 mt-2">
              Upgrade to get access to pro features and generate more and better
            </p>
          </div>

          {/* Loading tab bar */}
          <div className="flex items-center justify-center mb-12">
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
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            {/* Decorative lines with "Pricing" */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-4">
              <div className="w-8 sm:w-12 md:w-16 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F] to-[#9333EA]"></div>
              <h3 className="text-white text-xs sm:text-sm md:text-sm font-medium tracking-[0.1em] uppercase">
                Pricing
              </h3>
              <div className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
              Purchase a Subscription
            </h1>
            <p className="text-center text-gray-400 mt-2">
              Upgrade to get access to pro features and generate more and better
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-16 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {/* Decorative lines with "Pricing" */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-4">
            <div className="w-8 sm:w-12 md:w-16 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F] to-[#9333EA]"></div>
            <h3 className="text-white text-xs sm:text-sm md:text-sm font-medium tracking-[0.1em] uppercase">
              Pricing
            </h3>
            <div className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
            Purchase a Subscription
          </h1>
          <p className="text-center text-gray-400 mt-2">
            Upgrade to get access to pro features and generate more and better
          </p>
        </div>

        <div className="flex items-center justify-center mb-12">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#0C111C]/80 p-1 shadow-sm">
            <TabButton active={cycle === 'monthly'} onClick={() => setCycle('monthly')}>Monthly</TabButton>
            <TabButton active={cycle === 'yearly'} onClick={() => setCycle('yearly')} badgeText="SAVE 30%">Yearly</TabButton>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="grid gap-7 md:gap-10 xl:gap-16 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-items-center">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className="relative rounded-2xl border border-white/10  hover:border-white/20 hover:shadow-[0_8px_25px_rgba(118,62,234,0.3)] p-5 md:p-6 xl:p-6 pt-6 md:pt-7 xl:pt-8 flex flex-col transition-all duration-300 w-full max-w-[320px] md:max-w-[340px] xl:w-[350px] min-h-[560px] md:min-h-[640px] xl:h-[750px] overflow-hidden"
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

                <button 
                  onClick={handleGetStarted}
                  className="mb-5 w-full justify-center px-4 md:px-5 py-2.5 md:py-3 rounded-lg text-white text-sm md:text-[15px] font-medium bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] hover:opacity-95 transition-opacity flex items-center gap-2"
                >
                  Get Started
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
    </section>
  );
};

export default Pricing;
