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
    name: "Nikola|imakegames&music",
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
    text: "Experience a dynamic array of futuristic scenes that showcase the groundbreaking capabilities of the NOLMT AI generation tool. Video created using NOLMTAI. Thanks for this video making technology.",
    name: "JollyNutlet | AI Video Clips",
    handle: "@JollyNutlet",
    icon: "🎯"
  }
];

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <div className="group relative bg-gradient-to-b from-[rgba(153,153,153,0.08)] to-[rgba(255,255,255,0.08)] rounded-xl p-[25px] border border-[#ffffff14] transition-all duration-300 ease-out cursor-pointer w-[400px] h-[211px] flex-shrink-0 flex flex-col overflow-hidden">
    {/* Hover gradient overlay */}
<div className="absolute inset-0 bg-gradient-to-tl from-[rgba(138,63,252,0.4)] via-[rgba(0,0,0,0.88)] to-[rgba(49, 47, 47, 0.95)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none rounded-xl"></div>

    
    {/* Content wrapper with relative positioning */}
    <div className="relative z-10 flex flex-col h-full">
      {/* Top row - Quote icon left, Twitter icon right */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-8 h-8 flex items-center justify-center">
          <img src="/quote.svg" alt="Quote" className="w-16 h-16" />
        </div>
        <div className="w-8 h-8 bg-[#ffffff1f] rounded-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
      </div>

      {/* Testimonial Text */}
      <p className="text-white text-sm leading-5 mb-4 font-normal overflow-hidden" style={{maxHeight: '120px'}}>
        {testimonial.text}
      </p>

      {/* Separator */}
      <div className="w-full h-px bg-white opacity-10 mb-4 flex-shrink-0"></div>

      {/* Profile Section */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8A3FFC] to-[#6B21A8] flex items-center justify-center text-sm flex-shrink-0">
          {testimonial.icon}
        </div>
        
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <p className="text-white text-sm font-normal truncate">
            {testimonial.name}
          </p>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#60A5FA" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {testimonial.handle && (
            <p className="text-white text-xs font-normal truncate">
              {testimonial.handle}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-16 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header - Matching Figma exactly */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-6 opacity-60">
            <div className="w-10 h-px rounded-full bg-gradient-to-r from-[#8A3FFC] to-transparent"></div>
            <h3 className="text-white text-base font-bold">
              Testimonials
            </h3>
            <div className="w-10 h-px rounded-full bg-gradient-to-l from-[#8A3FFC] to-transparent"></div>
          </div>
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-semibold leading-tight sm:leading-[44px] text-center px-4">
            About NOLMT AI Generator
          </h2>
        </div>
      </div>

      {/* Full-bleed marquee container with 2 rows */}
      <div className="w-full overflow-hidden">
        {/* First row - scrolling left to right with staggered layout */}
        <div className="relative h-[280px]">
          <div className="flex gap-2 animate-marquee-ltr items-center">
            {/* First set */}
            {testimonials.slice(0, 5).map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`${index % 2 === 0 ? 'mt-0' : 'mt-12'}`}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {testimonials.slice(0, 5).map((testimonial, index) => (
              <div 
                key={`duplicate-${testimonial.id}`}
                className={`${index % 2 === 0 ? 'mt-0' : 'mt-12'}`}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>

        {/* Second row - scrolling right to left with staggered layout */}
        <div className="relative h-[280px]">
          <div className="flex gap-4 animate-marquee-rtl items-center">
            {/* First set */}
            {testimonials.slice(5).map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`${index % 2 === 0 ? 'mt-0' : 'mt-12'}`}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {testimonials.slice(5).map((testimonial, index) => (
              <div 
                key={`duplicate-${testimonial.id}`}
                className={`${index % 2 === 0 ? 'mt-0' : 'mt-12'}`}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee-ltr {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes marquee-rtl {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-marquee-ltr {
          animation: marquee-ltr 40s linear infinite;
        }

        .animate-marquee-rtl {
          animation: marquee-rtl 40s linear infinite;
        }
        
        .animate-marquee-ltr:hover,
        .animate-marquee-rtl:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;