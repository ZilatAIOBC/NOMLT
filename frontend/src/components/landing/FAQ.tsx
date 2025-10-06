import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQ as FAQType } from '../../types';

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const faqs: FAQType[] = [
    {
      id: '1',
      question: 'How does LMT.ai work?',
      answer: 'LMT.ai uses advanced machine learning models to generate high-quality images and videos from text descriptions. Simply provide a text prompt describing what you want to create, and our AI will generate stunning visual content in seconds.'
    },
    {
      id: '2',
      question: 'What types of content can I generate?',
      answer: 'You can generate various types of content including images from text descriptions, videos from text prompts, image-to-image transformations, and image-to-video animations. Our platform supports multiple art styles, resolutions, and formats.'
    },
    {
      id: '3',
      question: 'Is there a limit to how many generations I can create?',
      answer: 'The number of generations depends on your subscription plan. Free users get a limited number of generations per month, while premium plans offer unlimited or significantly higher limits. Check our pricing page for detailed information.'
    },
    {
      id: '4',
      question: 'Can I use the generated content commercially?',
      answer: 'Yes! All content generated on LMT.ai comes with commercial licensing rights. You can use your creations for business purposes, marketing materials, social media, and more without additional licensing fees.'
    },
    {
      id: '5',
      question: 'How long does it take to generate content?',
      answer: 'Most generations complete within 10-30 seconds, depending on the complexity and type of content. Simple images generate faster, while high-resolution videos may take a bit longer. We continuously optimize our systems for speed.'
    },
    {
      id: '6',
      question: 'What image and video formats are supported?',
      answer: 'We support popular formats including PNG, JPEG for images, and MP4, GIF for videos. You can also choose different resolutions ranging from standard web sizes to high-resolution formats suitable for print and professional use.'
    },
    {
      id: '7',
      question: 'Is my data and generated content secure?',
      answer: 'Absolutely. We use enterprise-grade security measures to protect your data and generated content. All communications are encrypted, and your creations are stored securely with optional privacy settings.'
    },
    {
      id: '8',
      question: 'Can I integrate LMT.ai with other tools?',
      answer: 'Yes, we offer API access and integrations with popular design tools, social media platforms, and content management systems. Our API allows developers to integrate our AI generation capabilities into their own applications.'
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
    <section id="faq" className="py-20 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get answers to common questions about LMT.ai and our AI generation capabilities.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openItems.includes(faq.id);
            
            return (
              <div
                key={faq.id}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600/50 transition-colors"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white pr-8">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-blue-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-700/50 pt-4">
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Still have questions? We're here to help.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Contact Support
            <ChevronDown className="w-4 h-4 rotate-270" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;