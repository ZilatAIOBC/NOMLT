import React, { useState } from 'react';
import { Crown, Bell, MessageSquare, ChevronDown, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopHeader: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="mb-6 relative w-full lg:w-auto">
      <div className="flex items-center w-full justify-between lg:justify-start">
        {/* Mobile & Tablet: logo left */}
        <Link to="/" className="lg:hidden flex items-center">
          <img 
            src="/logo.svg" 
            alt="NOLMT.AI" 
            className="h-7"
          />
        </Link>

        {/* Desktop: actions visible and aligned left */}
        <div className="hidden lg:flex items-center gap-3 lg:-translate-x-2">
          <button className="px-3 py-1.5 rounded-full bg-purple-900/60 text-white border border-white/10 flex items-center gap-2 text-sm">
            <Crown className="w-4 h-4" />
            Upgrade
          </button>
          <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </button>
          <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Bell className="w-4 h-4 text-white/80" />
          </button>
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen((v) => !v)}
              className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold">Z</div>
              <span className="hidden sm:inline text-sm text-white/90">zohaib ali</span>
              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
            {isProfileOpen && (
              <div className="absolute left-0 mt-2 w-40 rounded-lg bg-[#121212] border border-white/10 shadow-xl overflow-hidden z-10">
                <a href="#" className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5">My Profile</a>
                <a href="#" className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5">Account Settings</a>
                <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">Sign Out</a>
              </div>
            )}
          </div>
        </div>

        {/* Mobile & Tablet: hamburger right */}
        <button
          className="lg:hidden w-9 h-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-label="Toggle header menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-white/90" /> : <Menu className="w-5 h-5 text-white/90" />}
        </button>
      </div>

      {/* Mobile & Tablet: dropdown with header actions (overlay, does not take layout space) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          {/* backdrop to close on outside click (limited to content area, not the sidebar) */}
          <div
            className="absolute left-0 right-0 top-full bottom-0 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 max-w-[calc(100vw-1rem)] p-3 rounded-lg border border-white/10 bg-[#0F0F0F]/95 backdrop-blur shadow-xl space-y-3 md:inset-x-0 md:w-full md:max-w-none md:rounded-none md:border-x-0 md:border-b md:mt-0 md:p-4">
            <button className="w-full justify-center px-3 py-2 rounded-md bg-purple-900/60 text-white border border-white/10 flex items-center gap-2 text-sm">
              <Crown className="w-4 h-4" />
              Upgrade
            </button>
            <div className="space-y-2">
              <button className="w-full justify-center py-2 rounded-md bg-white/5 border border-white/10 flex items-center hover:bg-white/10 transition-colors">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
              </button>
              <button className="w-full justify-center py-2 rounded-md bg-white/5 border border-white/10 flex items-center hover:bg-white/10 transition-colors">
                <Bell className="w-4 h-4 text-white/80" />
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold">Z</div>
                  <span className="text-sm text-white/90">zohaib ali</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProfileOpen && (
                <div className="mt-2 w-full rounded-lg bg-[#121212] border border-white/10 shadow-xl overflow-hidden">
                  <a href="#" className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5">My Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5">Account Settings</a>
                  <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">Sign Out</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopHeader;
