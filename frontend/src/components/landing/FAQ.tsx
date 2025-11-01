import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQ as FAQType } from '../../types';

// Accordion Item Component with animations
const AccordionItem: React.FC<{
  faq: FAQType;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ faq, isOpen, onToggle }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);

  return (
    <div className="rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:scale-[1.02]">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full px-4 sm:px-5 py-3 sm:py-4 text-left flex items-center justify-between gap-4 rounded-xl bg-[#8A3FFC0D] hover:bg-[#8A3FFC1A] transition-all duration-300"
      >
        <h3 className="text-[15px] sm:text-base font-medium text-white pr-4">
          {faq.question}
        </h3>
        <span className="flex-shrink-0 inline-flex items-center justify-center rounded-md border border-white/10 w-6 h-6 transition-transform duration-300">
          <Plus 
            className={`w-4 h-4 text-white/80 transition-all duration-300 ${
              isOpen ? 'rotate-45 opacity-0' : 'rotate-0 opacity-100'
            }`} 
          />
          <Minus 
            className={`w-4 h-4 text-white absolute transition-all duration-300 ${
              isOpen ? 'rotate-0 opacity-100' : '-rotate-45 opacity-0'
            }`} 
          />
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          height: isOpen ? `${contentHeight}px` : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div 
          ref={contentRef}
          className="px-5 sm:px-6 pb-6"
        >
          <div className="border-t border-white/5 pt-4">
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const faqs: FAQType[] = [
    {
      id: '1',
      question: 'What is NOLMT?',
      answer: 'NOLMT is an AI platform for creating images and videos. It offers text‑to‑image/video, image‑to‑image, and image‑to‑video tools with high‑quality outputs and fast generation.'
    },
    {
      id: '2',
      question: 'What is the use of NOLMT AI?',
      answer: 'Use NOLMT to ideate visuals, generate content for social and marketing, prototype concepts, and produce assets for design, ads, and storytelling—without manual design work.'
    },
    {
      id: '3',
      question: "What's the difference between NOLMT Reference to Video and Image to Video?",
      answer: 'Reference to Video lets you guide motion using a reference style or subject; Image to Video animates a single input image. Reference provides style/identity consistency; Image to Video focuses on animating the provided frame.'
    },
    {
      id: '4',
      question: 'Is NOLMT AI free to use?',
      answer: 'You can start for free with limited credits. For heavier use and priority generation, paid plans unlock higher limits and advanced features.'
    },
    {
      id: '5',
      question: 'Is NOLMT AI safe to use?',
      answer: 'Yes. We apply content safeguards, encrypted transport, and secure storage. Abuse‑prevention and policy checks help keep generations compliant and safe.'
    },
    {
      id: '6',
      question: 'How can I reach out if I have more questions about NOLMT?',
      answer: 'Contact us via the support section on the site or email support. For billing or account issues, include your account email and any relevant order IDs.'
    }
  ];

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section id="faqs" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section - Centered on mobile/tablet */}
        <div className="text-center lg:hidden mb-12">
          {/* Decorative lines with "FAQ" */}
          <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 md:gap-6 mb-4">
            <div className="w-8 sm:w-12 md:w-16 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F] to-[#9333EA]"></div>
            <h3 className="text-white text-xs sm:text-sm md:text-sm font-medium tracking-[0.1em] uppercase">
              FAQ
            </h3>
            <div className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            <span className="block leading-none mb-1 md:mb-3">Frequently</span>
            <span className="block leading-none mb-1 md:mb-3">Asked</span>
            <span className="block leading-none">Questions</span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-gray-400 max-w-sm mx-auto lg:mx-0">
            Find answers to common questions about NOLMT AI including features, usage,
            pricing, safety, and how to get support.
          </p>
        </div>

        {/* Desktop Layout - Two Column Grid */}
        <div className="hidden lg:grid grid-cols-12 gap-16 items-start">
          {/* Left: Heading and copy */}
          <div className="col-span-5">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              <span className="block leading-none mb-1 md:mb-3">Frequently</span>
              <span className="block leading-none mb-1 md:mb-3">Asked</span>
              <span className="block leading-none">Questions</span>
            </h2>
            <p className="mt-6 text-base md:text-lg text-gray-400 max-w-sm">
              Find answers to common questions about NOLMT AI including features, usage,
              pricing, safety, and how to get support.
            </p>
          </div>

          {/* Right: Accordion */}
          <div className="col-span-7">
            <div className="space-y-2">
              {faqs.slice(0, 6).map((faq) => {
                const isOpen = openItems.includes(faq.id);
                return (
                  <AccordionItem
                    key={faq.id}
                    faq={faq}
                    isOpen={isOpen}
                    onToggle={() => toggleItem(faq.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Single Column */}
        <div className="lg:hidden">
          <div className="space-y-2">
            {faqs.slice(0, 6).map((faq) => {
              const isOpen = openItems.includes(faq.id);
              return (
                <AccordionItem
                  key={faq.id}
                  faq={faq}
                  isOpen={isOpen}
                  onToggle={() => toggleItem(faq.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;