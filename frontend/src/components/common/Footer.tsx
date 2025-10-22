import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const homeLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'How it works', href: '/#how-it-works' },
    { name: 'Benefits', href: '/#benefits' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Testimonials', href: '/#testimonials' },
    { name: 'FAQs', href: '/#faqs' },
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
            <Link to="/" className="inline-block">
              <img
                src="/logo.svg"
                alt="NOLMT.ai"
                className="h-10 w-auto"
              />
            </Link>
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
            <h3 className="text-white font-semibold text-[15px] mb-4">Home</h3>
            <div className="space-y-1">
              {homeLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-400 hover:text-[#8A3FFC]  font-medium gap-3  text-sm block transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Contact Us */}
          <div>
            <h3 className="text-white font-semibold text-[15px] mb-4">Contact Us</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="mailto:help@NOLMT.com" className="text-gray-400 hover:text-[#8A3FFC]  font-medium gap-3  text-sm block transition-colors">
                  help@NOLMT.com
                </a>
              </li>
              <li>
                <a href="mailto:sales@NOLMT.com" className="text-gray-400 hover:text-[#8A3FFC]  font-medium gap-3  text-sm block transition-colors">
                  sales@NOLMT.com
                </a>
              </li>
              <li>
                <a href="mailto:careers@NOLMT.com" className="text-gray-400 hover:text-[#8A3FFC]  font-medium gap-3  text-sm block transition-colors">
                  careers@NOLMT.com
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