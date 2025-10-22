import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Animated diagonal lines component
type LineDirection = 'down-right' | 'down-left';
const AnimatedLines: React.FC<{ direction?: LineDirection }> = ({ direction = 'down-right' }) => {
  const lines = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    height: Math.random() * 120 + 60,
    rotation: Math.random() * 15 + 12,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 8,
  }));

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        '--startX': direction === 'down-right' ? '-10vw' : '10vw',
        '--endX': direction === 'down-right' ? '10vw' : '-10vw',
      } as React.CSSProperties}
    >
      <style>{`
        @keyframes slideDiag {
          0% {
            transform: translate(var(--startX), -200px, 200px) rotate(var(--rotation));
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translate(var(--endX), calc(100vh + 150px)) rotate(var(--rotation));
            opacity: 0;
          }
        }
        .animated-line { animation: slideDiag linear infinite; }
      `}</style>
      {lines.map((line) => (
        <div
          key={line.id}
          className="animated-line absolute w-[2px] bg-gradient-to-b from-transparent via-white/30 to-transparent"
          style={{
            left: `${line.left}%`,
            height: `${line.height}px`,
            '--rotation': `${line.rotation}deg`,
            transform: `rotate(${line.rotation}deg)`,
            animationDelay: `${line.delay}s`,
            animationDuration: `${line.duration}s`,
            top: '-150px',
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

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
      {/* Background SVG */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/herobg2.svg" 
          alt="Hero background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Animated Lines */}
      <div className="absolute inset-0 z-1">
        <AnimatedLines />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        {/* Main Content */}
        <div className="space-y-8 mb-16">
          {/* Tagline with decorative lines */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
            <div className="w-20 sm:w-16 md:w-20 lg:w-24 xl:w-28 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F] to-[#9333EA]"></div>
            <p className="text-lg sm:text-xl md:text-xl text-white/90 font-medium leading-tight">
              Underground AI From China With Almost No Boundaries?
            </p>
            <div className="w-20 sm:w-16 md:w-20 lg:w-24 xl:w-28 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
          </div>
          
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
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2 text-lg mt-8 md:mt-10"
        >
          Get started now
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Features Section */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-10 sm:px-6 lg:px-8 pb-20 mt-20 md:mt-24">
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