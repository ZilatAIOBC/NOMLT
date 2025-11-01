import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeroBackground from '../common/HeroBackground';



const Hero: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '/contents.svg',
      title: 'No Content Restrictions',
      description:
        'Create adult content freely without censorship or filters blocking your creative vision.'
    },
    {
      icon: '/Video.svg',
      title: 'Professional Quality',
      description:
        '278B-parameter model delivers cinematic quality with smooth motion and realistic physics.'
    },
    {
      icon: '/generations.svg',
      title: 'Ultra-Fast Generation',
      description:
        '3–6 second videos generated in minutes, not hours. Perfect for rapid content creation.'
    }
  ];

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Custom Background */}
      <HeroBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28 sm:pt-32 md:pt-36 flex flex-col items-center justify-center text-center">
        {/* Main Content */}
        <div className="space-y-8 ">
          {/* Tagline with decorative lines */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
            <div className="w-20 sm:w-16 md:w-20 lg:w-24 xl:w-28 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F] to-[#9333EA]"></div>
            <p className="text-lg sm:text-xl md:text-lg text-white/90 font-medium leading-tight text-center">
              Underground AI From China With Almost No Boundaries?
            </p>
            <div className="w-20 sm:w-16 md:w-20 lg:w-24 xl:w-28 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
          </div>
          
          {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-8xl 2xl:text-8xl font-bold text-white leading-tight sm:leading-snug md:leading-normal mt-4 tracking-wider md:tracking-widest">
              MEET NOLMT.ai
            </h1>
          
          {/* Disclaimer */}
          <p className="text-base sm:text-lg md:text-xl text-white/80 font-normal leading-relaxed max-w-2xl mx-auto text-center">
            Check the local laws in your area before you proceed
          </p>
        </div>

      </div>

      {/* Features Section (cards) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-10 sm:px-6 lg:px-8 pb-12 mt-12 md:mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm hover:border-purple-500/40 transition-colors duration-300 p-6 md:p-7 lg:p-8 h-full"
            >
              <div className="flex flex-col items-center text-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/20 border border-white/10">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <h3 className="text-white text-lg sm:text-xl font-semibold leading-tight">
                  {feature.title}
                </h3>
              </div>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA Button (moved after feature cards) */}
      <div className="relative z-10 w-full flex items-center justify-center pb-12">
        <div className="flex flex-col items-center">
          <button
            onClick={() => navigate('/signup')}
            className="rounded-full  bg-gradient-to-r from-[#843FF5] via-[#6E56F4] to-[#8341F6] hover:from-[#843FF5] hover:via-[#6E56F4] hover:to-[#8341F6]   text-white font-medium px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2 text-lg mt-8 md:mt-10"
          >
            Get started now
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Assurance badges under CTA */}
          <div className="mt-12 md:mt-16 flex flex-wrap items-center justify-center gap-x-28 md:gap-x-40 gap-y-10 text-sm md:text-base text-white/80">
            <div className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              <span className="opacity-80">Open-Source Model</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              <span className="opacity-80">Private & Secure</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              <span className="opacity-80">No Data Collection</span>
            </div>
          </div>
        </div>
      </div>
    </section>

  );
};

export default Hero;