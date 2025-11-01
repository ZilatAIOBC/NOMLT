import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { authService } from '../../services/authService';
import SidebarSectionList, { SidebarItem as TSidebarItem, SidebarSection as TSidebarSection } from './SidebarSectionList';
import { toast } from 'react-hot-toast';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  type IconComponent = React.ComponentType<any>;
  type SidebarItem = TSidebarItem;
  type SidebarSection = TSidebarSection;

  // Check if device is mobile/tablet on mount and on resize
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      const expanded = width >= 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      setIsExpanded(expanded);
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Helper to check if device should use collapsible behavior
  const isCollapsible = isMobile || isTablet;

  const homeItem: SidebarItem = useMemo(
    () => ({ name: 'Home', href: '/dashboard', icon: 'home', color: 'text-green-400' }),
    []
  );

  const sections: SidebarSection[] = useMemo(() => [
    {
      title: 'Tools',
      items: [
        { name: 'Text to Video', href: '/dashboard/text-to-video', icon: 'texttovideo', color: 'text-red-400' },
        { name: 'Image to Video', href: '/dashboard/image-to-video', icon: 'imagetovideo', color: 'text-yellow-400' },
        { name: 'Image to Image', href: '/dashboard/image-to-image', icon: 'imagetoimage', color: 'text-blue-400' },
        { name: 'Text To Image', href: '/dashboard/text-to-image', icon: 'texttoimage', color: 'text-green-400' },
      ],
    },
    {
      title: 'Assets',
      items: [
        { name: 'View Generations', href: '/dashboard/view-generations', icon: 'viewgenerations', color: 'text-purple-400' },
      ],
    },
    {
      title: 'Subscription & Support',
      items: [
        { name: 'Manage Subscription', href: '/dashboard/subscription', icon: 'mangesubscriptions', color: 'text-pink-500' },
        { name: 'Credits', href: '/dashboard/credits', icon: 'credits', color: 'text-orange-400' },
        { name: 'Account', href: '/dashboard/settings', icon: 'account', color: 'text-cyan-400' },
        { name: 'Billing', href: '/dashboard/billing', icon: 'billing', color: 'text-purple-500' },
      ],
    },
  ], []);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authService.logout();
      toast.success('Signed out successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to sign out');
      setIsSigningOut(false);
    } finally {
      navigate('/signin', { replace: true });
    }
  };

  const handleNavClick = useCallback(() => {
    if (isCollapsible) {
      setIsExpanded(false);
    }
  }, [isCollapsible]);

  const handleOverlayClick = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const renderHomeItem = useCallback(() => {
    const isCollapsed = isCollapsible && !isExpanded;
    const useLargeSize = (isCollapsed || isMobile);
    const sizeClass = useLargeSize ? 'w-6 h-6' : 'w-5 h-5';

    const isCustomIcon = typeof homeItem.icon === 'string';

    return (
      <NavLink
        key={homeItem.name}
        to={homeItem.href}
        end
        className={({ isActive }) => `flex ${isMobile && isExpanded ? 'w-[199px]' : ''} items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
          isActive
            ? 'bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] text-white'
            : isCollapsed 
              ? 'text-white hover:bg-gradient-to-r hover:from-[#4057EB] hover:via-[#823AEA] hover:to-[#2C60EB] hover:text-white'
              : 'text-white hover:bg-white/10'
        } ${isCollapsed ? 'justify-start' : ''}`}
        onClick={handleNavClick}
        title={isCollapsed ? homeItem.name : undefined}
      >
        {({ isActive }) => (
          <>
            <span className={`inline-flex ${isCollapsed ? 'hover:opacity-80' : ''} transition-opacity`}>
              {isCustomIcon ? (
                <img
                  src={`/${homeItem.icon}.svg`}
                  alt={homeItem.name}
                  className={`${isActive ? 'brightness-0 invert' : ''} ${sizeClass}`}
                />
              ) : (
                // Fallback if a component is ever passed
                (() => {
                  const IconComp = homeItem.icon as unknown as IconComponent;
                  return (
                    <IconComp className={`${sizeClass} ${isActive ? 'text-white' : homeItem.color}`} />
                  );
                })()
              )}
            </span>
            {(!isCollapsible || isExpanded) && <span className="whitespace-nowrap hover:opacity-80 transition-opacity">{homeItem.name}</span>}
          </>
        )}
      </NavLink>
    );
  }, [homeItem, isCollapsible, isExpanded, handleNavClick, isMobile]);

  const memoizedHomeItem = useMemo(() => renderHomeItem(), [renderHomeItem]);

  return (
    <>
      {/* Sidebar */}
      <div className={`
        flex flex-col h-screen bg-[#0F0F0F] border-r border-white/10 fixed left-0 top-0 transition-all duration-300 z-40
        ${isMobile 
          ? (isExpanded ? 'w-64' : 'w-16 sidebar-mobile-collapsed')
          : isTablet 
            ? (isExpanded ? 'w-64' : 'w-16')
            : 'w-64'
        }
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to={isCollapsible ? '/' : '/'} className={`flex items-center ${isCollapsible && !isExpanded ? 'justify-start' : 'justify-start'}`}>
            <img
              src={isCollapsible && !isExpanded ? '/videogenerations.svg' : '/logo.svg'}
              alt="NOLMT.AI"
              className={`${isCollapsible && !isExpanded ? 'h-12 w-12' : 'h-10'}`}
              style={{ width: isCollapsible && !isExpanded ? '48px' : 'auto', height: isCollapsible && !isExpanded ? '48px' : '40px' }}
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 md:px-4 py-6 space-y-4 lg:space-y-1 xl:space-y-4 overflow-y-auto">
          {/* Home */}
          {memoizedHomeItem}

          <SidebarSectionList
            sections={sections}
            isCollapsible={isCollapsible}
            isExpanded={isExpanded}
            handleNavClick={handleNavClick}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </nav>

        {/* Mobile/Tablet Toggle Section */}
        {isCollapsible && (
          <div className="border-t border-white/10 p-4 flex justify-center">
            <button
              onClick={handleToggleExpanded}
              className="p-3 text-white rounded-lg"
            >
              <span className="inline-flex hover:opacity-80 transition-opacity">
                {isExpanded ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
              </span>
            </button>
          </div>
        )}

        {/* Bottom Section */}
        <div className="border-t border-white/10 space-y-2">
          <button 
            onClick={handleSignOut} 
            disabled={isSigningOut}
            className={`flex items-center gap-3 ${
              isCollapsible && !isExpanded ? 'justify-start px-3' : 'px-3'
            } py-3 rounded-lg text-sm font-medium text-red-400 w-full ${
              isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className={`inline-flex ${isCollapsible && !isExpanded ? 'hover:opacity-80' : ''} transition-opacity`}>
              <LogOut className={`${(isCollapsible && !isExpanded) || isMobile || isTablet ? 'w-6 h-6' : 'w-5 h-5'} ${
                isSigningOut ? 'animate-pulse' : ''
              }`} />
            </span>
            {(!isCollapsible || isExpanded) && (
              <span className="whitespace-nowrap hover:opacity-80 transition-opacity">
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay (exclude tablet) */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={handleOverlayClick}
        />
      )}
    </>
  );
};

export default Sidebar;