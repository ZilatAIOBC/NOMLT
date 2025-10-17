import React from 'react';

interface Testimonial {
  id: number;
  text: string;
  name: string;
  handle: string;
  icon: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "NOLMT Best AI creation tool for fast speed Anime Style!",
    name: "Rockzheart.AI.ART",
    handle: "@RockzAiLab",
    icon: "❤️"
  },
  {
    id: 2,
    text: "NOLMT Multi-Entity Consistency. Give NOLMT 2/3 images and it'll turn them into a video—it's pure magic! Your own characters interacting with objects and in the exact environment you want! Ads,",
    name: "Hungry Donk-E",
    handle: "@hungrydonke",
    icon: "🐴"
  },
  {
    id: 3,
    text: "I'm gonna keep claiming NOLMT is THE BEST ai videogenerator for Anime. This is just sick.",
    name: "Nikolajimakegames&music",
    handle: "@patriciostar_",
    icon: "🎮"
  },
  {
    id: 4,
    text: "NOLMT brings us something new and really interesting: the Multi Entity Consistency.",
    name: "RoyalKongZ (Laurent)",
    handle: "@RoyalKongz",
    icon: "🦍"
  },
  {
    id: 5,
    text: "I'm testing a new AI tool named NOLMT. The quality is really superb!",
    name: "Naegiko | AI Animator",
    handle: "@naegiko",
    icon: "🎨"
  },
  {
    id: 6,
    text: "NOLMT is the best AI creation tool you can find, with impressive speed!",
    name: "Kathleen \"Melody Prism\"",
    handle: "@Lars_pragmata",
    icon: "💎"
  },
  {
    id: 7,
    text: "NOLMT AI's Reference to Video model is NEXT-LEVEL. Take 3 images, and AI generates a smooth, cinematic sequence with perfect character consistency. The future of AI filmmaking is",
    name: "Future AI World",
    handle: "@FutureVibesAi",
    icon: "🌍"
  },
  {
    id: 8,
    text: "This is crazy! Big studios might spend over a week creating this scene... but with NOLMT, it's done in no time! NOLMT is the best AI creation tool you can find—unbelievably fast, insanely impressive.",
    name: "Edixo",
    handle: "@BloodyR64240",
    icon: "🎬"
  },
  {
    id: 9,
    text: "Experience a dynamic array of fut showcase the groundbreaking ca NOLMT AI generation tool. Videc NOLMTAI. Thanks for this video r",
    name: "JollyNutlet | AI Video",
    handle: "@JollyNutlet",
    icon: "🎯"
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto">
        {/* Header - Matching Figma exactly */}
        <div className="text-center mb-20">
          <h3 className="text-white text-sm font-medium mb-3 tracking-[0.1em] uppercase">
            Testimonials
          </h3>
          <h2 className="text-white text-5xl md:text-6xl font-bold leading-tight">
            About NOLMT AI Generator
          </h2>
        </div>

        {/* Marquee Container with Faded Sides */}
        <div className="relative overflow-hidden mb-12">
          {/* Left Fade Gradient */}
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-[#0F0F0F] to-transparent z-10 pointer-events-none" />
          
          {/* Right Fade Gradient */}
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#0F0F0F] to-transparent z-10 pointer-events-none" />
          
          {/* First Row - Left to Right */}
          <div className="flex animate-marquee space-x-6">
            {/* First set of cards */}
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="group relative bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:border-[#9333EA] hover:transform hover:scale-[1.02] cursor-pointer w-80 flex-shrink-0 flex flex-col"
              >
                {/* Close Button - Top right corner */}
                <button className="absolute top-4 right-4 text-white/50 hover:text-white/80 transition-colors z-10">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Quote Mark - Smaller */}
                <div className="text-white text-3xl font-serif mb-4 leading-none opacity-80">
                  "
                </div>

                {/* Testimonial Text - Compact */}
                <p className="text-white text-sm leading-relaxed mb-6 flex-grow line-clamp-4 font-normal">
                  {testimonial.text}
                </p>

                {/* Profile Section - Bottom aligned */}
                <div className="flex items-center space-x-3 mt-auto">
                  {/* Avatar - Smaller */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333EA] to-[#7C3AED] flex items-center justify-center text-white text-lg flex-shrink-0">
                    {testimonial.icon}
                  </div>
                  
                  {/* Name and Handle - Compact */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate mb-1">
                      {testimonial.name}
                    </p>
                    <p className="text-white/60 text-xs truncate">
                      {testimonial.handle}
                    </p>
                  </div>
                </div>

                {/* Hover Effect Overlay - Purple glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#9333EA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {testimonials.map((testimonial) => (
              <div
                key={`duplicate-${testimonial.id}`}
                className="group relative bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:border-[#9333EA] hover:transform hover:scale-[1.02] cursor-pointer w-80 flex-shrink-0 flex flex-col"
              >
                {/* Close Button - Top right corner */}
                <button className="absolute top-4 right-4 text-white/50 hover:text-white/80 transition-colors z-10">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Quote Mark - Smaller */}
                <div className="text-white text-3xl font-serif mb-4 leading-none opacity-80">
                  "
                </div>

                {/* Testimonial Text - Compact */}
                <p className="text-white text-sm leading-relaxed mb-6 flex-grow line-clamp-4 font-normal">
                  {testimonial.text}
                </p>

                {/* Profile Section - Bottom aligned */}
                <div className="flex items-center space-x-3 mt-auto">
                  {/* Avatar - Smaller */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333EA] to-[#7C3AED] flex items-center justify-center text-white text-lg flex-shrink-0">
                    {testimonial.icon}
                  </div>
                  
                  {/* Name and Handle - Compact */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate mb-1">
                      {testimonial.name}
                    </p>
                    <p className="text-white/60 text-xs truncate">
                      {testimonial.handle}
                    </p>
                  </div>
                </div>

                {/* Hover Effect Overlay - Purple glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#9333EA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Second Row - Right to Left */}
        <div className="relative overflow-hidden">
          {/* Left Fade Gradient */}
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-[#0F0F0F] to-transparent z-10 pointer-events-none" />
          
          {/* Right Fade Gradient */}
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#0F0F0F] to-transparent z-10 pointer-events-none" />
          
          {/* Second Row - Right to Left */}
          <div className="flex animate-marquee-reverse space-x-6">
            {/* First set of cards */}
            {testimonials.map((testimonial) => (
              <div
                key={`row2-${testimonial.id}`}
                className="group relative bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:border-[#9333EA] hover:transform hover:scale-[1.02] cursor-pointer w-80 flex-shrink-0 flex flex-col"
              >
                {/* Close Button - Top right corner */}
                <button className="absolute top-4 right-4 text-white/50 hover:text-white/80 transition-colors z-10">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Quote Mark - Smaller */}
                <div className="text-white text-3xl font-serif mb-4 leading-none opacity-80">
                  "
                </div>

                {/* Testimonial Text - Compact */}
                <p className="text-white text-sm leading-relaxed mb-6 flex-grow line-clamp-4 font-normal">
                  {testimonial.text}
                </p>

                {/* Profile Section - Bottom aligned */}
                <div className="flex items-center space-x-3 mt-auto">
                  {/* Avatar - Smaller */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333EA] to-[#7C3AED] flex items-center justify-center text-white text-lg flex-shrink-0">
                    {testimonial.icon}
                  </div>
                  
                  {/* Name and Handle - Compact */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate mb-1">
                      {testimonial.name}
                    </p>
                    <p className="text-white/60 text-xs truncate">
                      {testimonial.handle}
                    </p>
                  </div>
                </div>

                {/* Hover Effect Overlay - Purple glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#9333EA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {testimonials.map((testimonial) => (
              <div
                key={`row2-duplicate-${testimonial.id}`}
                className="group relative bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:border-[#9333EA] hover:transform hover:scale-[1.02] cursor-pointer w-80 flex-shrink-0 flex flex-col"
              >
                {/* Close Button - Top right corner */}
                <button className="absolute top-4 right-4 text-white/50 hover:text-white/80 transition-colors z-10">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Quote Mark - Smaller */}
                <div className="text-white text-3xl font-serif mb-4 leading-none opacity-80">
                  "
                </div>

                {/* Testimonial Text - Compact */}
                <p className="text-white text-sm leading-relaxed mb-6 flex-grow line-clamp-4 font-normal">
                  {testimonial.text}
                </p>

                {/* Profile Section - Bottom aligned */}
                <div className="flex items-center space-x-3 mt-auto">
                  {/* Avatar - Smaller */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333EA] to-[#7C3AED] flex items-center justify-center text-white text-lg flex-shrink-0">
                    {testimonial.icon}
                  </div>
                  
                  {/* Name and Handle - Compact */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate mb-1">
                      {testimonial.name}
                    </p>
                    <p className="text-white/60 text-xs truncate">
                      {testimonial.handle}
                    </p>
                  </div>
                </div>

                {/* Hover Effect Overlay - Purple glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#9333EA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
