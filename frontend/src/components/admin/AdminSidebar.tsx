import { Link, useLocation } from 'react-router-dom';
import { useEffect, useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Removed unused SidebarItem to simplify and avoid lints

export default function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsExpanded(width >= 1024);
    };
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  const isCollapsible = isMobile || isTablet;

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

  return (
    <>
    <div
      className={`fixed top-0 left-0 h-screen bg-[#0F0F0F] border-r border-white/10 flex flex-col transition-all duration-300 z-40 ${
        isCollapsible ? (isExpanded ? 'w-64' : 'w-16') : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/admin/dashboard" className={`flex items-center ${isCollapsible ? 'justify-center' : 'justify-start'}`}>
          <img
            src={isCollapsible ? '/videogenerations.svg' : '/logo.svg'}
            alt="NOLMT.AI"
            className={`${isCollapsible ? 'h-12 w-12' : 'h-10'}`}
            style={{ width: isCollapsible ? '48px' : 'auto', height: isCollapsible ? '48px' : '40px' }}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsible && !isExpanded ? 'px-2' : 'px-4'} py-6 space-y-2`}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
              currentPath === item.path
                ? 'bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] text-white'
                : 'text-white hover:bg-white/5'
            } ${isCollapsible && !isExpanded ? 'justify-center px-2 py-3' : 'px-3 py-3'}`}
            title={isCollapsible && !isExpanded ? item.label : undefined}
          >
            <img
              src={item.iconSrc}
              alt={item.label}
              className={` ${isCollapsible && !isExpanded ? 'w-6 h-6' : 'w-5 h-5'} ${
                currentPath === item.path ? 'brightness-0 invert' : ''
              }`}
            />
            {(!isCollapsible || isExpanded) && <span className="whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Toggle (only on mobile/tablet) */}
      {isCollapsible && (
        <div className="border-t border-white/10 p-4 flex justify-center">
          <button
            onClick={handleToggleExpanded}
            className="p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* Footer removed per design consistency */}
    </div>

    {/* Mobile overlay */}
    {isMobile && isExpanded && (
      <div className="fixed inset-0 bg-black/50 z-30" onClick={handleToggleExpanded} />
    )}
    </>
  );
}

