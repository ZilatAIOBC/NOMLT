import React from 'react';
import { Image, Video, Wand2, Palette, Zap, Shield } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Image,
      title: 'Text to Image',
      description: 'Transform your words into stunning visual masterpieces with our advanced AI models.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Palette,
      title: 'Image to Image',
      description: 'Enhance and reimagine your existing images with AI-powered transformations.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Video,
      title: 'Text to Video',
      description: 'Bring your stories to life with AI-generated videos from simple text descriptions.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Wand2,
      title: 'Image to Video',
      description: 'Animate your static images and create dynamic video content effortlessly.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Generate high-quality content in seconds with our optimized AI infrastructure.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Your data and creations are protected with enterprise-grade security measures.',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Powerful AI Features
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover the cutting-edge capabilities that make LMT.ai the premier choice 
            for AI-powered content generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;