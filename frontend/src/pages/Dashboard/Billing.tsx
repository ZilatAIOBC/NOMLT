import React from 'react';
import HeaderBar from '../../components/dashboard/HeaderBar';
import TopHeader from '../../components/dashboard/TopHeader';
import { CalendarDays, CreditCard, DollarSign, Star, CheckCircle } from 'lucide-react';

const Billing: React.FC = () => {
  return (
    <div className="ml-16 lg:ml-64 min-h-screen bg-[#0F0F0F] text-white transition-all duration-300">
      <HeaderBar>
        <TopHeader />
      </HeaderBar>

      <div className="p-4 sm:p-6 lg:p-8 pt-28 md:pt-32 xl:pt-36">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Billing Information</h1>
          <p className="text-white/70 mb-6 sm:mb-10">Manage your subscription and payment details.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Active Subscription */}
            <div className="rounded-2xl border border-white/10 bg-[#0D131F] p-5 sm:p-6">
              <div className="text-lg font-semibold mb-4">Active Subscription</div>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-white/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Current Plan</div>
                    <div className="text-white/90">Premium Plan</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-white/10 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Next Billing Date</div>
                    <div className="text-white/90">Renews on July 15, 2024</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600/20 border border-white/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Amount Due</div>
                    <div className="text-white/90">$29.99</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-white/10 bg-[#0D131F] p-5 sm:p-6">
              <div className="text-lg font-semibold mb-4">Payment Method</div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-white/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-indigo-300" />
                </div>
                <div className="flex-1">
                  <div className="text-white/90">Visa ending in 4242</div>
                  <div className="text-sm text-white/70">Expires 12/26</div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button className="inline-flex items-center justify-center rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium px-4 py-2 text-sm transition-colors">
                  Update Payment Method
                </button>
                <button className="inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white font-medium px-4 py-2 text-sm hover:bg-white/10 transition-colors">
                  Manage Subscription
                </button>
              </div>
            </div>
          </div>

          {/* Past Transactions */}
          <div className="mt-8 sm:mt-10">
            <div className="text-lg font-semibold mb-4">Past Transactions</div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D131F]">
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4 border-b border-white/10 text-sm text-white/70">
                <div className="col-span-3">Date</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Status</div>
              </div>

              {/* rows */}
              {[
                { date: 'June 15, 2024', desc: 'Subscription Renewal', amount: '$29.99' },
                { date: 'May 15, 2024', desc: 'Subscription Renewal', amount: '$29.99' },
                { date: 'April 15, 2024', desc: 'Subscription Renewal', amount: '$29.99' },
                { date: 'March 15, 2024', desc: 'Subscription Renewal', amount: '$29.99' },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-t border-white/5"
                >
                  <div className="md:col-span-3 text-white/90">{row.date}</div>
                  <div className="md:col-span-5 text-white/90">{row.desc}</div>
                  <div className="md:col-span-2 text-white/90">{row.amount}</div>
                  <div className="md:col-span-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600/15 text-emerald-300 text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Paid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;



