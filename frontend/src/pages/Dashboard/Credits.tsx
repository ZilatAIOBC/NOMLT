import React from 'react';
import HeaderBar from '../../components/dashboard/HeaderBar';
import TopHeader from '../../components/dashboard/TopHeader';

const Credits: React.FC = () => {
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

          {/* Balance + CTA row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
            {/* Balance card */}
            <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] px-5 py-6 sm:px-6 sm:py-7">
              <div className="text-sm text-white/70">Current Balance</div>
              <div className="mt-2 flex items-end gap-2">
                <div className="text-4xl sm:text-5xl font-semibold tracking-tight">500</div>
                <div className="mb-1 text-white/70 font-medium">Credits</div>
              </div>
            </div>

            {/* CTA gradient card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#5B3BEA] via-[#7A3AEA] to-[#2C60EB] p-5 sm:p-6 flex items-center">
              <div className="flex-1">
                <div className="text-white font-semibold text-lg">Need more credits?</div>
                <div className="text-white/80 text-sm mt-1">Select a package below or add a custom amount.</div>
              </div>
              <button className="mt-4 lg:mt-0 whitespace-nowrap inline-flex items-center justify-center rounded-lg bg-white text-[#0F0F0F] font-medium px-4 py-2 text-sm hover:bg-white/90 transition-colors">Add More Credits</button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-white/10 bg-[#0B0B0B]">
              <div className="text-lg font-semibold">Recent Transactions</div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-[#0B0B0B]">
                <thead>
                  <tr className="text-left text-white/60 text-sm">
                    <th className="px-5 sm:px-6 py-3 border-b border-white/10 font-medium">Date</th>
                    <th className="px-5 sm:px-6 py-3 border-b border-white/10 font-medium">Description</th>
                    <th className="px-5 sm:px-6 py-3 border-b border-white/10 font-medium">Amount</th>
                    <th className="px-5 sm:px-6 py-3 border-b border-white/10 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  <tr>
                    <td className="px-5 sm:px-6 py-4 text-white/80">2024-01-15</td>
                    <td className="px-5 sm:px-6 py-4 text-white/90">Purchased Standard Package</td>
                    <td className="px-5 sm:px-6 py-4 text-green-400 font-medium">+500 Credits</td>
                    <td className="px-5 sm:px-6 py-4 text-white/80">500 Credits</td>
                  </tr>
                  <tr>
                    <td className="px-5 sm:px-6 py-4 text-white/80">2024-01-10</td>
                    <td className="px-5 sm:px-6 py-4 text-white/90">Used AI Model A</td>
                    <td className="px-5 sm:px-6 py-4 text-red-400 font-medium">-50 Credits</td>
                    <td className="px-5 sm:px-6 py-4 text-white/80">0 Credits</td>
                  </tr>
                  <tr>
                    <td className="px-5 sm:px-6 py-4 text-white/80">2023-12-20</td>
                    <td className="px-5 sm:px-6 py-4 text-white/90">Purchased Basic Package</td>
                    <td className="px-5 sm:px-6 py-4 text-green-400 font-medium">+100 Credits</td>
                    <td className="px-5 sm:px-6 py-4 text-white/80">50 Credits</td>
                  </tr>
                  <tr>
                    <td className="px-5 sm:px-6 py-4 text-white/80">2023-12-15</td>
                    <td className="px-5 sm:px-6 py-4 text-white/90">Used AI Model B</td>
                    <td className="px-5 sm:px-6 py-4 text-red-400 font-medium">-20 Credits</td>
                    <td className="px-5 sm:px-6 py-4 text-white/80">0 Credits</td>
                  </tr>
                  <tr>
                    <td className="px-5 sm:px-6 py-4 text-white/80">2023-12-01</td>
                    <td className="px-5 sm:px-6 py-4 text-white/90">Initial Credits</td>
                    <td className="px-5 sm:px-6 py-4 text-green-400 font-medium">+20 Credits</td>
                    <td className="px-5 sm:px-6 py-4 text-white/80">20 Credits</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;


