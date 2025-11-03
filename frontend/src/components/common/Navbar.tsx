import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import Button from './Button';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Features', href: '#features', id: 'features' },
    { name: 'How it works', href: '#how-it-works', id: 'how-it-works' },
    { name: 'Pricing', href: '#pricing', id: 'pricing' },
    { name: 'FAQs', href: '#faqs', id: 'faqs' },
    { name: 'Contact Us', href: '#contact', id: 'contact' },
  ];

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setIsOpen(false);
  };

  // Active section detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.id);
      const scrollPosition = window.scrollY + 150; // Offset for navbar height

      let currentSection = 'home'; // Default to home

      // Find the section that's currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          currentSection = sections[i];
          break;
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // removed scroll state: background remains constant across scroll

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-colors bg-transparent pt-2 sm:pt-0`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className={`${isOpen ? 'mt-2 sm:mt-4 mb-[-3px]' : 'mt-2 sm:mt-4 mb-4'}` }>
          <div className={`flex items-center justify-between h-14 rounded-2xl border border-[#8A3FFC66] bg-[#111215B2] backdrop-blur-md px-3 sm:px-4 lg:px-6 ${isOpen ? 'rounded-b-none border-b-0 shadow-none' : 'shadow-[0_0_0_1px_rgba(255,255,255,0.05)]'}` }>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo.svg"
              alt="NOLMT.AI"
              className="h-8 w-auto"
            />
   
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-6 lg:ml-10 flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.id)}
                  className={`px-1 py-2 text-sm font-medium transition-colors ${
                    activeSection === link.id
                      ? 'text-[#8A3FFC]'
                      : 'text-white hover:text-[#8A3FFC]'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/signup')}
              className="rounded-full px-5 py-2 bg-gradient-to-r from-[#843FF5] via-[#6E56F4] to-[#8341F6] hover:from-[#843FF5] hover:via-[#6E56F4] hover:to-[#8341F6] text-white"
              icon={ArrowRight as any}
            >
              Get started now
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </div>
            </button>
          </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden pb-0">
            <div className="-mt-[3px] rounded-2xl rounded-t-none border border-t-0 border-[#8A3FFC66] bg-[#111215B2] backdrop-blur-md px-2 pt-4 pb-3 sm:px-3">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.id)}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    activeSection === link.id
                      ? 'text-[#8A3FFC]'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              <div className="flex flex-col space-y-2 mt-2 px-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => { setIsOpen(false); navigate('/signup'); }}
                className="rounded-full w-full bg-gradient-to-r from-[#843FF5] via-[#6E56F4] to-[#8341F6] hover:from-[#843FF5] hover:via-[#6E56F4] hover:to-[#8341F6] text-white"
                  icon={ArrowRight as any}
                >
                  Get started now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;