import React from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    'Text to Image',
    'Image to Image', 
    'Text to Video',
    'Image to Video'
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">Next-Gen AI Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
              Unleash Your Creativity
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                with AI
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into stunning visuals and videos instantly. 
              Generate anything with the power of advanced AI technology.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/signup')}
              className="text-lg px-8 py-4 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105"
            >
              Start Generation
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/signin')}
              className="text-lg px-8 py-4"
            >
              View Examples
            </Button>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all duration-300"
              >
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 font-medium text-sm sm:text-base">{feature}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-8 border-t border-gray-700/50">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">10M+</div>
              <div className="text-gray-400 text-sm">Generations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">500K+</div>
              <div className="text-gray-400 text-sm">Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;