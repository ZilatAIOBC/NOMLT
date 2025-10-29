import React, { useState, useEffect, useRef } from 'react';
import { Crown, ChevronDown, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CreditDisplay from './CreditDisplay';
import { authService } from '../../services/authService';

interface TopHeaderProps {
  creditRefreshTrigger?: number;
}

const TopHeader: React.FC<TopHeaderProps> = ({ creditRefreshTrigger = 0 }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userInitial, setUserInitial] = useState('U');
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileProfileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load user data from localStorage
    try {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const name = user.name || 'User';
        setUserName(name);
        setUserInitial(name.charAt(0).toUpperCase());
      }
    } catch (error) {
      // Silently fail if can't load user data
    }
  }, []);

  // Close dropdown on outside click (mouse/touch/pen) and on Escape
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node | null;
      // Ignore clicks on the profile toggle buttons themselves
      if (
        targetNode instanceof Element &&
        (targetNode.closest('[data-profile-toggle="true"]') as Element | null)
      ) {
        return;
      }
      const clickedOutsideDesktop =
        profileDropdownRef.current &&
        targetNode &&
        !profileDropdownRef.current.contains(targetNode);
      const clickedOutsideMobile =
        mobileProfileDropdownRef.current &&
        targetNode &&
        !mobileProfileDropdownRef.current.contains(targetNode);

      if (clickedOutsideDesktop || clickedOutsideMobile) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    const handleScroll = () => {
      // On mobile/tablet, scrolling should dismiss the dropdown to avoid overlay issues
      setIsProfileOpen(false);
    };

    if (isProfileOpen) {
      document.addEventListener('pointerdown', handlePointerDown, { passive: true });
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown as EventListener);
      document.removeEventListener('keydown', handleKeyDown as EventListener);
      window.removeEventListener('scroll', handleScroll as EventListener);
    };
  }, [isProfileOpen]);

  const handleSignOut = async () => {
    try {
      await authService.logout();
      navigate('/signin');
    } catch (error) {
      // Force logout even if there's an error
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      navigate('/signin');
    }
  };

  const handleNavigateToSettings = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/dashboard/settings');
  };

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
          <CreditDisplay variant="full" refreshTrigger={creditRefreshTrigger} />
          <button 
            onClick={() => navigate('/dashboard/subscription')}
            className="px-3 py-1.5 rounded-full bg-purple-900/60 text-white border border-white/10 flex items-center gap-2 text-sm hover:bg-purple-800/60 transition-colors"
          >
            <Crown className="w-4 h-4" />
            Upgrade
          </button>
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileOpen((v) => !v)}
              className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              aria-haspopup="menu"
              aria-expanded={isProfileOpen}
              data-profile-toggle="true"
            >
              <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold">{userInitial}</div>
              <span className="hidden sm:inline text-sm text-white/90">{userName}</span>
              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
            {isProfileOpen && (
              <div className="absolute left-0 mt-2 w-40 rounded-lg bg-[#121212] border border-white/10 shadow-xl overflow-hidden z-10">
                <button 
                  onClick={handleNavigateToSettings}
                  className="w-full text-left block px-4 py-2 text-sm text-white/90 hover:bg-white/5 transition-colors"
                >
                  Account Settings
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Sign Out
                </button>
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
          <div
            className="absolute right-0 top-full mt-2 z-50 w-80 max-w-[calc(100vw-1rem)] p-3 rounded-lg border border-white/10 bg-[#0F0F0F]/95 backdrop-blur shadow-xl space-y-3 md:inset-x-0 md:w-full md:max-w-none md:rounded-none md:border-x-0 md:border-b md:mt-0 md:p-4"
            onClickCapture={(e) => {
              if (!isProfileOpen) return;
              const target = e.target as Node;
              // Ignore clicks on the toggle button
              if (
                target instanceof Element &&
                (target.closest('[data-profile-toggle="true"]') as Element | null)
              ) {
                return;
              }
              if (
                mobileProfileDropdownRef.current &&
                !mobileProfileDropdownRef.current.contains(target)
              ) {
                setIsProfileOpen(false);
              }
            }}
          >
            <div className="w-full flex justify-center">
              <CreditDisplay variant="full" refreshTrigger={creditRefreshTrigger} />
            </div>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/dashboard/subscription');
              }}
              className="w-full justify-center px-3 py-2 rounded-md bg-purple-900/60 text-white border border-white/10 flex items-center gap-2 text-sm hover:bg-purple-800/60 transition-colors"
            >
              <Crown className="w-4 h-4" />
              Upgrade
            </button>
            <div className="relative" ref={mobileProfileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                data-profile-toggle="true"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold">{userInitial}</div>
                  <span className="text-sm text-white/90">{userName}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProfileOpen && (
                <div className="mt-2 w-full rounded-lg bg-[#121212] border border-white/10 shadow-xl overflow-hidden">
                  <button 
                    onClick={handleNavigateToSettings}
                    className="w-full text-left block px-4 py-2 text-sm text-white/90 hover:bg-white/5 transition-colors"
                  >
                    Account Settings
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Sign Out
                  </button>
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
