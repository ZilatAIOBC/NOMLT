import React from 'react';

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header - Matching Figma exactly */}
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="w-16 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F] to-[#9333EA]"></div>
            <h3 className="text-white text-sm font-medium tracking-[0.1em] uppercase">
              How It Works
            </h3>
            <div className="w-16 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-4">
            How to Create NSFW Videos with NOLMT.ai
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Simple workflow from prompt to professional NSFW video in minutes.
          </p>
        </div>

        {/* Three-Step Process */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Step 1 - Describe Your Scene */}
          <div className="bg-[#8A3FFC]/5 border border-purple-500/10 rounded-3xl p-8 relative overflow-hidden">
            {/* Step Number */}
            <div className="absolute top-6 left-6 text-6xl font-bold text-gray-300/20 leading-none">1</div>
            
            {/* Content */}
            <div className="relative z-10  ml-8">
              <h3 className="text-white text-2xl font-bold mb-4">
                 Describe Your Scene
              </h3>
              <p className="text-gray-300 leading-relaxed mb-8">
                Write detailed prompts describing the action, characters, and setting. WAN 2.2 understands complex adult scenarios and anatomical descriptions.
              </p>
              
              {/* Visual Elements - Using 1card.svg */}
              <div className="relative w-full h-74 flex items-center justify-center">
                <img 
                  src="/1card.svg" 
                  alt="Describe Your Scene" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full opacity-10 blur-xl"></div>
          </div>

          {/* Steps 2 & 3 - Right Column */}
          <div className="space-y-8">
            
            {/* Step 2 - Customize Settings */}
            <div className="bg-[#8A3FFC]/5 border border-purple-500/10 rounded-3xl p-8 relative overflow-hidden">
              {/* Step Number */}
              <div className="absolute top-6 left-6 text-6xl font-bold text-gray-300/20 leading-none">2</div>
              
              {/* Content */}
              <div className="relative z-10  ml-8">
                <h3 className="text-white text-2xl font-bold mb-4">
                   Customize Settings
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Choose resolution, duration, and fine-tune parameters. Add specific LoRAs for enhanced body movements or particular styles.
                </p>
                
                {/* Visual Elements - Using 2card.svg */}
                <div className="relative w-full h-32 flex items-center justify-center">
                  <img 
                    src="/2card.svg" 
                    alt="Customize Settings" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-10 blur-xl"></div>
            </div>

            {/* Step 3 - Generate & Download */}
            <div className="bg-[#8A3FFC]/5 border border-purple-500/10 rounded-3xl p-8 relative overflow-hidden">
              {/* Step Number */}
              <div className="absolute top-6 left-6 text-6xl font-bold text-gray-300/20 leading-none">3</div>
              
              {/* Content */}
              <div className="relative z-10  ml-8">
                <h3 className="text-white text-2xl font-bold mb-4">
                   Generate & Download
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Click generate and watch your NSFW video come to life. Download in high quality or iterate with different prompts.
                </p>
                
                {/* Visual Elements - Using 3card.svg */}
                <div className="relative w-full h-32 flex items-center justify-center">
                  <img 
                    src="/3card.svg" 
                    alt="Generate & Download" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full opacity-10 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
