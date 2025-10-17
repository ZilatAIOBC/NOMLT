import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '/contents.svg',
      title: 'No Content Restrictions',
    },
    {
      icon: '/Video.svg',
      title: 'Professional Quality',
    },
    {
      icon: '/generations.svg',
      title: 'Ultra-Fast Generation',
    }
  ];

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Background with subtle lines and glowing dots */}
      <div className="absolute inset-0">
        {/* Custom gradient: very dark with subtle purple glow */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 800px 500px at center, rgba(138, 63, 252, 0.08) 0%, rgba(138, 63, 252, 0.03) 30%, rgba(0,0,0,0.9) 60%, #000000 100%)'
        }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        {/* Main Content */}
        <div className="space-y-8 mb-16">
          {/* Tagline */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium leading-tight">
            Underground AI From China With Almost No Boundaries?
          </p>
          
          {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-relaxed mt-4 tracking-widest">
              MEET NOLMT.ai
            </h1>
          
          {/* Disclaimer */}
          <p className="text-base sm:text-lg md:text-xl text-white/80 font-normal leading-relaxed max-w-2xl mx-auto">
            Check the local laws in your area before you proceed
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/signup')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2 text-lg"
        >
          Get started now
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Features Section */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-4"
            >
              <img 
                src={feature.icon} 
                alt={feature.title}
                className="w-12 h-12 object-contain"
              />
              <h3 className="text-lg sm:text-xl font-medium text-white leading-tight" style={{ fontFamily: 'Monotype Corsiva, cursive' }}>
                {feature.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;