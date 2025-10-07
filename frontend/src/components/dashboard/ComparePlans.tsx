import React from 'react';

const ComparePlans: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto mt-12 space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2 text-white text-sm md:text-base bg-transparent mx-auto my-2 md:my-3">
          Explore plans
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Compare plans & features</h2>
      </div>

      {/* Top summary bar */}
      <div className="rounded-2xl border border-white/10 bg-[#121212] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
        <div className="flex flex-col lg:grid lg:grid-cols-4">
          {/* Free */}
          <div className="p-5 md:p-6 border-b lg:border-b-0 border-white/10">
            <div className="flex items-end gap-2">
              <span className="text-2xl md:text-3xl font-semibold text-white">$0</span>
              <span className="text-xs text-white/60 mb-1">/mo</span>
            </div>
            <div className="text-sm text-white/70 mt-1">Free</div>
            <button className="mt-4 inline-flex items-center px-5 py-2 rounded-full text-white/90 text-sm border border-white/15 bg-transparent hover:bg-white/5">Free</button>
          </div>

          {/* Basic */}
          <div className="p-5 md:p-6 border-b lg:border-b-0 border-white/10">
            <div className="flex items-end gap-2">
              <span className="text-2xl md:text-3xl font-semibold text-white">$ 4.25</span>
              <span className="text-xs text-white/60 mb-1">/mo</span>
            </div>
            <div className="text-sm text-white/70 mt-1">Basic</div>
            <button className="mt-4 inline-flex items-center px-5 py-2 rounded-full text-white/90 text-sm border border-white/15 bg-[#0D131F] hover:border-white/25">Get Started</button>
          </div>

          {/* Standard */}
          <div className="p-5 md:p-6 border-b lg:border-b-0 border-white/10">
            <div className="flex items-end gap-2">
              <span className="text-2xl md:text-3xl font-semibold text-green-400">$ 14.17</span>
              <span className="text-xs text-white/60 mb-1">/mo</span>
            </div>
            <div className="text-sm text-white/70 mt-1">Standard</div>
            <button className="mt-4 inline-flex items-center px-5 py-2 rounded-full text-white/90 text-sm border border-white/15 bg-[#0D131F] hover:border-white/25">Get Started</button>
          </div>

          {/* Ultimate */}
          <div className="p-5 md:p-6 border-b lg:border-b-0 border-white/10">
            <div className="flex items-end gap-2">
              <span className="text-2xl md:text-3xl font-semibold text-blue-400">$ 70.82</span>
              <span className="text-xs text-white/60 mb-1">/mo</span>
            </div>
            <div className="text-sm text-white/70 mt-1">Pro</div>
            <button className="mt-4 inline-flex items-center px-5 py-2 rounded-full text-white/90 text-sm border border-white/15 bg-[#0D131F] hover:border-white/25">Get Started</button>
          </div>

     
        </div>

        {/* Plan names strip - hidden on mobile, shown on desktop */}
        <div className="hidden lg:block mx-4 my-3 rounded-xl bg-[#0B1324] text-sm relative px-4 py-3">
          {/* Absolute label so it does not affect column widths */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 whitespace-nowrap">Plan names:</div>
          <div className="grid grid-cols-4 w-full">
            <div className="px-8" />
            <div className="px-10 text-left text-white font-medium">Basic</div>
            <div className="px-10 text-left text-green-400 font-medium">Standard</div>
            <div className="px-14 text-left text-blue-400 font-medium">Pro</div>
          </div>
        </div>
      </div>

      {/* Tables */}
      {[{
        title: 'Video Generations',
        rows: [
          ['Text to Video', '141', '283', '472'],
          ['Image to Video', '141', '283', '472'],
          ['Video Effects', '70', '141', '236'],
        ]
      }, {
        title: 'Image Generations',
        rows: [
          ['Text to Image', '849', '1699', '2833'],
          ['Edit Image', '236', '472', '788'],
        ]
      }].map((section, idx) => (
        <div key={idx} className="rounded-xl border border-white/10 overflow-hidden">
          <div className="bg-[#0C111C] px-6 py-4 text-white/90 text-sm md:text-base font-medium flex items-center gap-3">
            {section.title === 'Video Generations' && (
              <img src="/videogenerations.svg" alt="Video Generations" className="h-5 w-5" />
            )}
            {section.title === 'Image Generations' && (
              <img src="/imagegenerations.svg" alt="Image Generations" className="h-5 w-5" />
            )}
            <span>{section.title}</span>
          </div>
          <div className="overflow-x-auto">
            {section.rows.map((row, rIdx) => (
              <div 
                key={rIdx} 
                className="grid grid-cols-4 border-t border-white/10 text-sm text-white/80"
              >
                <div className="px-6 py-4 text-white/70">{row[0]}</div>
                <div className="px-14 py-4 text-white">{row[1]}</div>
                <div className="px-12 py-4 text-white">{row[2]}</div>
                <div className="px-14 py-4 text-white">{row[3]}</div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 text-[14px] text-white/80 border-t border-white/10">
            * These generations are derived from minimum standard factors. Any fine-tuning or customizations beyond these parameters will affect the number of generations outlined in this table.
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComparePlans;


