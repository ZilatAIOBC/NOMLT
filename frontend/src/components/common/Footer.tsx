import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Handle navigation
const handleLinkClick = (id: string, location: any) => {
  if (location.pathname !== '/') {
    // If not on home page, navigate to home page first
    window.location.href = '/';
  } else {
    // If on home page, scroll smoothly to section
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const homeLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Features', href: '#features', id: 'features' },
    { name: 'How it works', href: '#how-it-works', id: 'how-it-works' },
    { name: 'Pricing', href: '#pricing', id: 'pricing' },
    { name: 'Testimonials', href: '#testimonials', id: 'testimonials' },
    { name: 'FAQs', href: '#faqs', id: 'faqs' },
    { name: 'Contact Us', href: '#contact', id: 'contact' },
  ];

  return (
    <footer
      className=""
      style={{
        background:
          'linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.75) 30%, rgba(32,0,64,0.45) 50%, rgba(98,40,200,0.28) 65%, rgba(138,63,252,0.22) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 md:[grid-template-columns:2.6fr_0.4fr_0.4fr] items-start gap-10 md:gap-16 lg:gap-20">
          {/* Left: Logo + Disclaimer */}
          <div className="space-y-4 md:pr-6">
            <button
              onClick={() => handleLinkClick('home', location)}
              className="inline-block cursor-pointer"
            >
              <img
                src="/logo.svg"
                alt="NOLMT.ai"
                className="h-10 w-auto"
              />
            </button>
            <div className="text-gray-400 text-[13px] leading-6 max-w-2xl">
              <p>
                <span className="text-white">Disclaimer.</span> By accessing or subscribing to this service, you
                acknowledge and agree that all content generated through the platform is created by third-party AI models.
                We act solely as a wrapper and interface, and we neither design nor control the underlying systems. We are
                not responsible for the nature, accuracy, legality, or realism of any generations. You are solely liable for
                how outputs are used, shared, or distributed. It is your responsibility to comply with all applicable laws in
                your jurisdiction. By continuing, you accept full responsibility for any consequences arising from use of this
                service.
              </p>
            </div>
          </div>

          {/* Middle: Home links */}
          <div>
            <h3 className="text-white font-semibold text-[15px] mb-4">Quick Links</h3>
            <div className="space-y-1">
              {homeLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.id, location)}
                  className="text-gray-400 hover:text-[#8A3FFC] font-medium gap-3 text-sm block transition-colors text-left w-full"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Contact Us */}
          <div>
            <h3 className="text-white font-semibold text-[15px] mb-4">Contact Us</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="mailto:contact@nolmt.ai" className="text-gray-400 hover:text-[#8A3FFC]  font-medium gap-3  text-sm block transition-colors">
                  contact@nolmt.ai
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link
                to="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#8A3FFC] text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#8A3FFC] text-sm transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>
            <p className="text-gray-400 text-sm text-center">
              © NOLMTai {currentYear}. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;