import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';

// Removed unused SidebarItem to simplify and avoid lints

export default function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const menuItems = [
    {
      iconSrc: '/admindashboard.svg',
      label: 'Dashboard',
      path: '/admin/dashboard',
    },
    {
      iconSrc: '/adminusermanagment.svg',
      label: 'User Management',
      path: '/admin/users',
    },
    {
      iconSrc: '/adminplans.svg',
      label: 'Plans & Pricing',
      path: '/admin/plans',
    },
    {
      iconSrc: '/adminanalytics.svg',
      label: 'Analytics',
      path: '/admin/analytics',
    },
  ];

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await authService.logoutAdmin();
      toast.success('Signed out successfully');
      navigate('/signin', { replace: true });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to sign out');
      setIsSigningOut(false);
    }
  }, [navigate]);

  return (
    <>
    <div
      className={`fixed top-0 left-0 h-screen bg-[#0F0F0F] border-r border-white/10 flex flex-col transition-all duration-300 z-40 ${
        isMobile ? (isExpanded ? 'w-64' : 'w-16 sidebar-mobile-collapsed') : 
        isTablet ? (isExpanded ? 'w-64' : 'w-16') : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/admin/dashboard" className={`flex items-center ${(isMobile || isTablet) && !isExpanded ? 'justify-start' : 'justify-start'}`}>
          <img
            src={(isMobile || isTablet) && !isExpanded ? '/videogenerations.svg' : '/logo.svg'}
            alt="NOLMT.AI"
            className={`${(isMobile || isTablet) && !isExpanded ? 'h-12 w-12' : 'h-10'}`}
            style={{ width: (isMobile || isTablet) && !isExpanded ? '48px' : 'auto', height: (isMobile || isTablet) && !isExpanded ? '48px' : '40px' }}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${(isMobile || isTablet) && !isExpanded ? 'px-3' : 'px-4'} py-6 space-y-2`}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex ${isMobile && isExpanded ? 'w-[199px]' : ''} items-center gap-3 rounded-lg text-sm font-medium ${
              currentPath === item.path
                ? 'bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] text-white'
                : (isMobile || isTablet) && !isExpanded
                  ? 'text-white hover:bg-gradient-to-r hover:from-[#4057EB]  hover:via-[#823AEA] hover:to-[#2C60EB] hover:text-white'
                  : 'text-white hover:bg-white/10'
            } ${(isMobile || isTablet) && !isExpanded ? 'justify-start px-3 py-3' : 'px-3 py-3'}`}
            title={undefined}
          >
            <img
              src={item.iconSrc}
              alt={item.label}
              className={` ${(isMobile || isTablet) && !isExpanded ? 'w-6 h-6' : 'w-5 h-5'} ${
                currentPath === item.path ? 'brightness-0 invert' : ''
              } transition-opacity hover:opacity-80`}
            />
            {!((isMobile || isTablet) && !isExpanded) && <span className="whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Toggle (only on mobile/tablet) */}
      {(isMobile || isTablet) && (
        <div className="border-t border-white/10 p-4 flex justify-center">
          <button
            onClick={handleToggleExpanded}
            className="p-3 text-white rounded-lg"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? <ChevronLeft className="w-6 h-6 transition-opacity hover:opacity-80" /> : <ChevronRight className="w-6 h-6 transition-opacity hover:opacity-80" />}
          </button>
        </div>
      )}

      {/* Bottom Section */}
      <div className="border-t border-white/10 space-y-2 p-3">
        <button 
          onClick={handleSignOut} 
          disabled={isSigningOut}
          className={`flex items-center gap-3 ${
            (isMobile || isTablet) && !isExpanded ? 'justify-start px-3' : 'px-3'
          } py-3 rounded-lg text-sm font-medium text-red-400 w-full ${
            isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <LogOut className={`${(isMobile || isTablet) && !isExpanded ? 'w-6 h-6' : 'w-5 h-5'} transition-opacity hover:opacity-80`} />
          {!((isMobile || isTablet) && !isExpanded) && (
            <span className="whitespace-nowrap">
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </span>
          )}
        </button>
      </div>
    </div>

    {/* Mobile overlay - only show when sidebar is expanded on mobile */}
    {isMobile && isExpanded && (
      <div className="fixed inset-0 bg-black/50 z-30" onClick={handleToggleExpanded} />
    )}
    </>
  );
}

