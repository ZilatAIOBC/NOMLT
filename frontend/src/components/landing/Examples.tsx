import React, { useState } from 'react';
import { Play, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../common/Button';

const Examples: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const examples = [
    {
      title: 'Transform Words into Visual Masterpieces',
      subtitle: 'Text to Image Generation',
      description: 'Simply describe what you want to see, and watch as our AI creates stunning, high-resolution images that match your vision perfectly. From photorealistic portraits to abstract art, the possibilities are endless.',
      features: ['High-resolution output', 'Multiple art styles', 'Instant generation', 'Commercial license'],
      image: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      type: 'image'
    },
    {
      title: 'Bring Your Stories to Life with AI Video',
      subtitle: 'Text to Video Creation',
      description: 'Turn your scripts and ideas into captivating videos. Our AI understands context, emotion, and visual storytelling to create engaging video content from your text descriptions.',
      features: ['4K video quality', 'Custom duration', 'Voice synthesis', 'Scene transitions'],
      image: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      type: 'video'
    },
    {
      title: 'Enhance & Reimagine Your Images',
      subtitle: 'Image to Image Transformation',
      description: 'Upload your existing images and watch them transform into new artistic visions. Change styles, enhance quality, or completely reimagine your photos with AI-powered modifications.',
      features: ['Style transfer', 'Quality enhancement', 'Object replacement', 'Background removal'],
      image: 'https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      type: 'image'
    },
    {
      title: 'Animate Your Photos with AI',
      subtitle: 'Image to Video Animation',
      description: 'Breathe life into your static images by converting them into dynamic videos. Perfect for creating engaging social media content, presentations, or artistic animations.',
      features: ['Smooth animations', 'Multiple effects', 'Custom timing', 'HD export'],
      image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      type: 'video'
    }
  ];

  return (
    <section id="examples" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">See It In Action</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Incredible AI Generations
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explore real examples of what our AI can create. From stunning visuals to dynamic videos, 
            see the quality and creativity that awaits you.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {examples.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === index
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Example {index + 1}
            </button>
          ))}
        </div>

        {/* Active Example */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <div className="text-blue-400 text-sm font-semibold mb-2 uppercase tracking-wider">
                {examples[activeTab].subtitle}
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                {examples[activeTab].title}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {examples[activeTab].description}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {examples[activeTab].features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              className="group"
            >
              Try This Feature
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={examples[activeTab].image}
                alt={examples[activeTab].title}
                className="w-full h-[400px] object-cover"
              />
              
              {/* Video Play Button Overlay */}
              {examples[activeTab].type === 'video' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group cursor-pointer hover:bg-black/40 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              
              {/* Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
                {examples[activeTab].type === 'video' ? 'Video' : 'Image'} Generated by AI
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Examples;