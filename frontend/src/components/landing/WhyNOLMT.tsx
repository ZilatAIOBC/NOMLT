import React, { useState } from 'react';

interface FeatureData {
  id: string;
  title: string;
  description: string;
  image: string;
}

const WhyNOLMT: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features: FeatureData[] = [
    {
      id: "unrestricted",
      title: "Unrestricted Content Generation",
      description: "Create adult animations, intimate scenes, and mature content without algorithmic censorship. WAN 2.2 processes your prompts exactly as intended.",
      image: "1.svg"
    },
    {
      id: "motion",
      title: "Advanced Motion Quality",
      description: "The Mixture-of-Experts architecture ensures natural body movements, realistic physics, and smooth transitions - crucial for adult content creation.",
      image: "/2.svg"
    },
    {
      id: "privacy",
      title: "Privacy First Design",
      description: "Your creations remain private. No content filtering means no scanning or analyzing of your videos. Create with complete confidentiality.",
      image: "/3.svg"
    }
  ];

  const currentFeature = features[activeFeature];

  return (
    <section className="relative bg-black flex flex-col justify-center items-center overflow-hidden py-20">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-6">
          {/* Decorative lines with "Why NOLMT" */}
          <div className="flex items-center justify-center gap-6 mb-3">
            <div className="w-16 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F] to-[#9333EA]"></div>
            <p className="text-white text-sm font-medium tracking-[0.1em] uppercase">Why NOLMT</p>
            <div className="w-16 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
          </div>
          
          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
            Why NOLMT.ai is Perfect for NSFW Content
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Unlike mainstream AI video generators that heavily censor content, WAN 2.2 gives you complete creative control
          </p>
        </div>

        {/* Main Content Container */}
        <div className="bg-[#02070d] border border-purple-500/30 rounded-3xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Side - Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className={`cursor-pointer transition-all duration-300 p-4 rounded-xl border-2 ${
                    activeFeature === index
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-transparent hover:border-purple-500/50 hover:bg-purple-500/5'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <h3 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Side - Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                <img
                  src={currentFeature.image}
                  alt={currentFeature.title}
                  className="w-full h-full object-cover transition-all duration-500"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>

     
      </div>
    </section>
  );
};

export default WhyNOLMT;
