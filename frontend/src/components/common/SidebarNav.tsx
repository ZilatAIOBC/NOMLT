import React, { useState } from 'react';

interface SidebarNavProps {
  sections: Array<{
    id: string;
    title: string;
    subsections?: Array<{
      id: string;
      title: string;
    }>;
  }>;
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ 
  sections, 
  activeSection, 
  onSectionClick 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile & Tablet Navigation (fixed under navbar) */}
      <div className="lg:hidden fixed top-20 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black/50 backdrop-blur-md rounded-xl border border-[#8A3FFC66] p-2 shadow-xl">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-between w-full px-4 py-3 bg-black/50 rounded-lg text-white text-sm font-medium"
        >
          <span>ON THIS PAGE</span>
          <svg
            className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-2 bg-black/60 backdrop-blur-md rounded-lg p-2">
            <nav className="space-y-1">
              {sections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      onSectionClick?.(section.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left py-2 px-3 rounded-md text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] text-white'
                        : 'text-white hover:bg-white/5'
                    }`}
                  >
                    {section.title}
                  </button>
                </div>
              ))}
            </nav>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Spacer to offset fixed mobile nav height */}
      <div className="lg:hidden h-20"></div>


     {/* Desktop Sidebar */}
     <div className="hidden lg:block w-64 pl-8 sticky top-24 h-fit">
        <h3 className="text-white font-semibold text-sm mt-12 mb-6 text-lg uppercase tracking-wide">
          ON THIS PAGE
        </h3>
        <nav className="relative pt-3">
          {/* Continuous vertical white line - starts at first heading */}
          <div className="absolute left-0 top-3 bottom-0 w-0.5 bg-white"></div>
          
          {/* Navigation items */}
          <div className="space-y-0">
            {sections.map((section) => (
              <div key={section.id} className="relative">
                {/* Purple highlight line for active section */}
                {activeSection === section.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500"></div>
                )}
                
                <button
                  onClick={() => onSectionClick?.(section.id)}
                  className={`relative block w-full text-left py-3 pl-6 pr-0 text-sm transition-colors ${
                    activeSection === section.id
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="leading-relaxed">{section.title}</span>
                </button>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default SidebarNav;
