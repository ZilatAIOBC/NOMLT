import React from 'react';
import HeaderBar from '../../components/dashboard/HeaderBar';
import TopHeader from '../../components/dashboard/TopHeader';

const Settings: React.FC = () => {
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

                <div className="px-5 sm:px-6 py-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
                    <input
                      type="text"
                      defaultValue="Jane Doe"
                      className="w-full rounded-lg bg-[#0F0F0F] border border-white/10 text-white/90 placeholder-white/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email address</label>
                    <input
                      type="email"
                      defaultValue="jane.doe@example.com"
                      className="w-full rounded-lg bg-[#0F0F0F] border border-white/10 text-white/90 placeholder-white/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Photo</label>
                    <div className="flex items-center gap-4">
                      <img
                        src="https://i.pravatar.cc/56?img=5"
                        alt="avatar"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <button className="inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 text-sm hover:bg-white/10 transition-colors">
                        Change
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-5 sm:px-6 py-4 border-t border-white/10 flex items-center justify-end">
                  <button className="inline-flex items-center justify-center rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium px-4 py-2 text-sm transition-colors">
                    Save
                  </button>
                </div>
              </div>

            {/* Change Password */}
            <div className="rounded-2xl border border-white/10 bg-[#0D131F] overflow-hidden mt-6">
              <div className="px-5 sm:px-6 py-5 sm:py-6 border-b border-white/10">
                <div>
                  <div className="text-lg font-semibold">Change Password</div>
                  <div className="text-sm text-white/70 mt-1">Ensure your account is using a long, random password to stay secure.</div>
                </div>
              </div>

              <div className="px-5 sm:px-6 py-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full rounded-lg bg-[#0F0F0F] border border-white/10 text-white/90 placeholder-white/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full rounded-lg bg-[#0F0F0F] border border-white/10 text-white/90 placeholder-white/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full rounded-lg bg-[#0F0F0F] border border-white/10 text-white/90 placeholder-white/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/40"
                  />
                </div>
              </div>

              <div className="px-5 sm:px-6 py-4 border-t border-white/10 flex items-center justify-end">
                <button className="inline-flex items-center justify-center rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium px-4 py-2 text-sm transition-colors">
                  Save
                </button>
              </div>
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
                {/* Current Plan row */}
                <div className="rounded-lg border border-white/10 bg-[#0B111B] px-4 sm:px-5 py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-white/80">Current Plan: <span className="text-indigo-300 font-medium">Pro Tier</span></div>
                    <div className="text-xs text-white/60 mt-1">Renews on: January 1, 2025</div>
                  </div>
                  <button className="whitespace-nowrap inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white px-3 py-2 text-sm hover:bg-white/10 transition-colors">Change Plan</button>
                </div>

                {/* Credits row */}
                <div className="rounded-lg border border-white/10 bg-[#0B111B] px-4 sm:px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm text-white/80">Credits Remaining: <span className="font-semibold text-white">1,500</span></div>
                    <button className="whitespace-nowrap inline-flex items-center justify-center rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-3 py-2 text-sm transition-colors">Buy Credits</button>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-2/5 bg-gradient-to-r from-[#7C3AED] to-[#6366F1] rounded-full" />
                  </div>
                </div>
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
