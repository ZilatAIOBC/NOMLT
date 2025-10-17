import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQ as FAQType } from '../../types';

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
    <section id="faq" className="py-24 bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Heading and copy */}
          <div className="lg:col-span-5">
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
          <div className="lg:col-span-7">
            <div className="space-y-2">
              {faqs.slice(0, 6).map((faq) => {
                const isOpen = openItems.includes(faq.id);

                return (
                  <div
                    key={faq.id}
                    className="rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <button
                      onClick={() => toggleItem(faq.id)}
                      aria-expanded={isOpen}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 text-left flex items-center justify-between gap-4 rounded-xl bg-[#8A3FFC0D] hover:bg-[#8A3FFC1A] transition-colors"
                    >
                      <h3 className="text-[15px] sm:text-base font-medium text-white pr-4">
                        {faq.question}
                      </h3>
                      <span className="flex-shrink-0 inline-flex items-center justify-center rounded-md border border-white/10 w-6 h-6">
                        {isOpen ? (
                          <Minus className="w-4 h-4 text-white" />
                        ) : (
                          <Plus className="w-4 h-4 text-white/80" />
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6">
                        <div className="border-t border-white/5 pt-4">
                          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

       
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;