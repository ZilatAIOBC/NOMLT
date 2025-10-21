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
    <section className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header - Matching Figma exactly */}
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="w-16 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F]  to-[#9333EA]"></div>
            <h3 className="text-white text-sm font-medium tracking-[0.1em]  uppercase">
              Testimonials
            </h3>
            <div className="w-16 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
          </div>
          <h2 className="text-white text-5xl md:text-6xl font-bold leading-tight">
            About NOLMT AI Generator
          </h2>
        </div>

      </div>

      {/* Full-bleed marquee rows (no side gutters) */}
      <div className="-mx-6">
        {/* Marquee Container */}
        <div className="relative overflow-hidden mb-6 py-2">
          
          {/* First Row - Left to Right */}
          <div className="flex animate-marquee space-x-6">
            {/* First set of cards */}
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="group relative bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] transition-all duration-300 ease-out hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:border-[#9333EA] hover:scale-105 cursor-pointer w-80 flex-shrink-0 flex flex-col transform"
              >
                {/* Twitter Icon - Top right corner */}
                <div className="absolute top-4 right-4 z-10">
                  <img src="/twitter.svg" alt="Twitter" className="w-6 h-6 text-white/50 hover:text-white/80 transition-colors" />
                </div>

                {/* Quote Mark - SVG */}
                <div className="absolute top-4 left-4 z-10 mb-4 leading-none opacity-80">
                  <img src="/quote.svg" alt="Quote" className="w-8 h-8 text-white" />
                </div>

                {/* Testimonial Text - Compact */}
                <p className="text-white text-sm leading-relaxed mb-6 flex-grow line-clamp-4 font-normal mt-8">
                  {testimonial.text}
                </p>

                {/* White Separator */}
                <div className="w-full h-px bg-white opacity-20 mb-4"></div>

                {/* Profile Section - Bottom aligned */}
                <div className="flex items-center space-x-3 mt-auto">
                  {/* Avatar - Smaller */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333EA] to-[#7C3AED] flex items-center justify-center text-white text-lg flex-shrink-0">
                    {testimonial.icon}
                  </div>
                  
                  {/* Name and Handle - Compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 mb-1">
                      <p className="text-white text-sm font-semibold truncate">
                        {testimonial.name}
                      </p>
                      {/* Verified Badge */}
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <p className="text-white/60 text-xs truncate">
                        {testimonial.handle}
                      </p>
                      <img src="/twitter.svg" alt="Twitter" className="w-3 h-3 text-white/60" />
                    </div>
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
                className="group relative bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] transition-all duration-300 ease-out hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:border-[#9333EA] hover:scale-105 cursor-pointer w-80 flex-shrink-0 flex flex-col transform"
              >
                {/* Twitter Icon - Top right corner */}
                <div className="absolute top-4 right-4 z-10">
                  <img src="/twitter.svg" alt="Twitter" className="w-6 h-6 text-white/50 hover:text-white/80 transition-colors" />
                </div>

                {/* Quote Mark - SVG */}
                <div className="absolute top-4 left-4 z-10 mb-4 leading-none opacity-80">
                  <img src="/quote.svg" alt="Quote" className="w-8 h-8 text-white" />
                </div>

                {/* Testimonial Text - Compact */}
                <p className="text-white text-sm leading-relaxed mb-6 flex-grow line-clamp-4 font-normal mt-8">
                  {testimonial.text}
                </p>

                {/* White Separator */}
                <div className="w-full h-px bg-white opacity-20 mb-4"></div>

                {/* Profile Section - Bottom aligned */}
                <div className="flex items-center space-x-3 mt-auto">
                  {/* Avatar - Smaller */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333EA] to-[#7C3AED] flex items-center justify-center text-white text-lg flex-shrink-0">
                    {testimonial.icon}
                  </div>
                  
                  {/* Name and Handle - Compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 mb-1">
                      <p className="text-white text-sm font-semibold truncate">
                        {testimonial.name}
                      </p>
                      {/* Verified Badge */}
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <p className="text-white/60 text-xs truncate">
                        {testimonial.handle}
                      </p>
                      <img src="/twitter.svg" alt="Twitter" className="w-3 h-3 text-white/60" />
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay - Purple glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#9333EA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Second Row - Right to Left */}
        <div className="relative overflow-hidden py-2">
          
          {/* Second Row - Right to Left */}
          <div className="flex animate-marquee-reverse space-x-6">
            {/* First set of cards */}
            {testimonials.map((testimonial) => (
              <div
                key={`row2-${testimonial.id}`}
                className="group relative bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] transition-all duration-300 ease-out hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:border-[#9333EA] hover:scale-105 cursor-pointer w-80 flex-shrink-0 flex flex-col transform"
              >
                {/* Twitter Icon - Top right corner */}
                <div className="absolute top-4 right-4 z-10">
                  <img src="/twitter.svg" alt="Twitter" className="w-6 h-6 text-white/50 hover:text-white/80 transition-colors" />
                </div>

                {/* Quote Mark - SVG */}
                <div className="absolute top-4 left-4 z-10 mb-4 leading-none opacity-80">
                  <img src="/quote.svg" alt="Quote" className="w-8 h-8 text-white" />
                </div>

                {/* Testimonial Text - Compact */}
                <p className="text-white text-sm leading-relaxed mb-6 flex-grow line-clamp-4 font-normal mt-8">
                  {testimonial.text}
                </p>

                {/* White Separator */}
                <div className="w-full h-px bg-white opacity-20 mb-4"></div>

                {/* Profile Section - Bottom aligned */}
                <div className="flex items-center space-x-3 mt-auto">
                  {/* Avatar - Smaller */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333EA] to-[#7C3AED] flex items-center justify-center text-white text-lg flex-shrink-0">
                    {testimonial.icon}
                  </div>
                  
                  {/* Name and Handle - Compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 mb-1">
                      <p className="text-white text-sm font-semibold truncate">
                        {testimonial.name}
                      </p>
                      {/* Verified Badge */}
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <p className="text-white/60 text-xs truncate">
                        {testimonial.handle}
                      </p>
                      <img src="/twitter.svg" alt="Twitter" className="w-3 h-3 text-white/60" />
                    </div>
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
                className="group relative bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] transition-all duration-300 ease-out hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:border-[#9333EA] hover:scale-105 cursor-pointer w-80 flex-shrink-0 flex flex-col transform"
              >
                {/* Twitter Icon - Top right corner */}
                <div className="absolute top-4 right-4 z-10">
                  <img src="/twitter.svg" alt="Twitter" className="w-6 h-6 text-white/50 hover:text-white/80 transition-colors" />
                </div>

                {/* Quote Mark - SVG */}
                <div className="absolute top-4 left-4 z-10 mb-4 leading-none opacity-80">
                  <img src="/quote.svg" alt="Quote" className="w-8 h-8 text-white" />
                </div>

                {/* Testimonial Text - Compact */}
                <p className="text-white text-sm leading-relaxed mb-6 flex-grow line-clamp-4 font-normal mt-8">
                  {testimonial.text}
                </p>

                {/* White Separator */}
                <div className="w-full h-px bg-white opacity-20 mb-4"></div>

                {/* Profile Section - Bottom aligned */}
                <div className="flex items-center space-x-3 mt-auto">
                  {/* Avatar - Smaller */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333EA] to-[#7C3AED] flex items-center justify-center text-white text-lg flex-shrink-0">
                    {testimonial.icon}
                  </div>
                  
                  {/* Name and Handle - Compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 mb-1">
                      <p className="text-white text-sm font-semibold truncate">
                        {testimonial.name}
                      </p>
                      {/* Verified Badge */}
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <p className="text-white/60 text-xs truncate">
                        {testimonial.handle}
                      </p>
                      <img src="/twitter.svg" alt="Twitter" className="w-3 h-3 text-white/60" />
                    </div>
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



// import React from "react";
// import { Card, CardContent } from "../../../../components/ui/card";

// const testimonialsData = [
//   {
//     text: "NOLMT Best AI creation tool for fast speed Anime\nStyle!",
//     avatar: "/---.png",
//     name: "Rockzheart.AI.ART",
//     handle: "@RockzAiLab",
//     featured: false,
//     hasQuoteIcon: false,
//   },
//   {
//     text: "NOLMT brings us something new and really\ninteresting: the Multi Entity Consistency.",
//     avatar: "/---1.png",
//     name: "RoyalKongZ (Laurent)",
//     handle: "@RoyalKongz",
//     featured: false,
//     hasQuoteIcon: false,
//   },
//   {
//     text: "NOLMT Multi-Entity Consistency. Give NOLMT 2/3\nimages and it'll turn them into a video—it's pure\nmagic! Your own characters interacting with objects\nand in the exact environment you want! Ads,",
//     avatar: "/---2.png",
//     name: "Hungry Donk-E",
//     handle: "@hungrydonke",
//     featured: true,
//     hasQuoteIcon: false,
//   },
//   {
//     text: "I'm testing a new AI tool named NOLMT. The quality is really superb!",
//     avatar: "/---3.png",
//     name: "Naegiko | AI Animator",
//     handle: "@naegiko",
//     featured: false,
//     hasQuoteIcon: false,
//   },
//   {
//     text: "I'm gonna keep claiming NOLMT is THE BEST ai videogenerator for Anime. This is just sick.",
//     avatar: "/---4.png",
//     name: "Nikola|imakegames&music",
//     handle: "@patriciostar_",
//     featured: false,
//     hasQuoteIcon: false,
//   },
//   {
//     text: "NOLMT is the best AI creation tool you can find, with impressive speed!",
//     avatar: "/---5.png",
//     name: 'Kathleen "Melody Prism"',
//     handle: "@Lars_pragmata",
//     featured: false,
//     hasQuoteIcon: false,
//   },
//   {
//     text: "NOLMT AI's Reference to Video model is NEXT-LEVEL..Take 3 images, and AI generates a smooth,\ncinematic sequence with perfect character\nconsistency. The future of AI filmmaking is",
//     avatar: "/---6.png",
//     name: "Future AI World",
//     handle: "@FutureVibesAi",
//     featured: false,
//     hasQuoteIcon: false,
//   },
//   {
//     text: "This is crazy! Big studios might spend over a week\ncreating this scene... but with NOLMT, it's done in no time! NOLMT is the best AI creation tool you can find—unbelievably fast, insanely impressive.",
//     avatar: "/---7.png",
//     name: "Edixo",
//     handle: "@BloodyR64240",
//     featured: false,
//     hasQuoteIcon: false,
//   },
//   {
//     text: "Experience a dynamic array of futuristic scenes that\nshowcase the groundbreaking capabilities of the\nNOLMT AI generation tool. Video created using NOLMTAI. Thanks for this video making technology.",
//     avatar: "/---8.png",
//     name: "JollyNutlet | AI Video Clips",
//     handle: "",
//     featured: false,
//     hasQuoteIcon: true,
//   },
//   {
//     text: "NOLMT Best AI creation tool for fast speed Anime\nStyle!",
//     avatar: "/---9.png",
//     name: "Rockzheart.AI.ART",
//     handle: "",
//     featured: false,
//     hasQuoteIcon: true,
//   },
// ];

// export const SectionWrapperSubsection = (): JSX.Element => {
//   return (
//     <section className="relative w-full py-16">
//       <div className="flex flex-col items-center gap-8">
//         <div className="flex items-center gap-2.5 opacity-60">
//           <div className="w-10 h-px rounded-[60px] bg-[linear-gradient(270deg,rgba(138,63,252,1)_0%,rgba(255,255,255,0)_100%)]" />
//           <div className="font-bold text-white text-base [font-family:'Inter',Helvetica] whitespace-nowrap">
//             Testimonials
//           </div>
//           <div className="w-10 h-px rounded-[60px] rotate-180 bg-[linear-gradient(270deg,rgba(138,63,252,1)_0%,rgba(255,255,255,0)_100%)]" />
//         </div>

//         <h2 className="[font-family:'Inter',Helvetica] font-semibold text-white text-[40px] text-center leading-[44px] whitespace-nowrap">
//           About NOLMT AI&nbsp;&nbsp;Generator
//         </h2>

//         <div className="w-full overflow-hidden">
//           <div
//             className="flex gap-2 animate-marquee"
//             style={{ "--duration": "60s" } as React.CSSProperties}
//           >
//             {[...testimonialsData, ...testimonialsData].map(
//               (testimonial, index) => (
//                 <Card
//                   key={`testimonial-${index}`}
//                   className={`flex-shrink-0 w-[400px] ${
//                     testimonial.featured
//                       ? "h-[251px] bg-[linear-gradient(317deg,rgba(138,63,252,1)_0%,rgba(17,17,17,1)_84%)] border-none"
//                       : "h-[211px] border-[#ffffff14] bg-[linear-gradient(180deg,rgba(153,153,153,0.08)_0%,rgba(255,255,255,0.08)_100%)]"
//                   } rounded-xl`}
//                 >
//                   <CardContent className="p-0 flex flex-col gap-4 h-full">
//                     <div className="flex items-start justify-between px-[25px] pt-[25px]">
//                       {testimonial.hasQuoteIcon ? (
//                         <>
//                           <div className="bg-[url(/quote.png)] w-8 h-8 bg-cover bg-[50%_50%]" />
//                           <div className="w-8 h-8 bg-[#ffffff1f] rounded-lg" />
//                         </>
//                       ) : (
//                         <img
//                           className="w-[350px] h-8"
//                           alt="Container"
//                           src="/container.svg"
//                         />
//                       )}
//                     </div>

//                     <div className="px-[25px] flex-1">
//                       <p className="[font-family:'Microsoft_YaHei-Regular',Helvetica] font-normal text-white text-sm leading-5 whitespace-pre-line">
//                         {testimonial.text}
//                       </p>
//                     </div>

//                     <div className="px-[25px]">
//                       <div className="h-px border-b border-white opacity-10" />
//                     </div>

//                     <div className="px-[25px] pb-6 flex items-center gap-1">
//                       {!testimonial.hasQuoteIcon && <div className="flex-1" />}
//                       <div
//                         className="w-6 h-6 rounded-full bg-cover bg-[50%_50%]"
//                         style={{
//                           backgroundImage: `url(${testimonial.avatar})`,
//                         }}
//                       />
//                       <div className="[font-family:'Microsoft_YaHei-Regular',Helvetica] font-normal text-white text-sm leading-5 whitespace-nowrap">
//                         {testimonial.name}
//                       </div>
//                       {testimonial.handle && (
//                         <>
//                           <img
//                             className="w-[18px] h-[18px]"
//                             alt="Svg"
//                             src="/svg.svg"
//                           />
//                           <div className="[font-family:'Microsoft_YaHei-Regular',Helvetica] font-normal text-white text-xs leading-5 whitespace-nowrap">
//                             {testimonial.handle}
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ),
//             )}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };
