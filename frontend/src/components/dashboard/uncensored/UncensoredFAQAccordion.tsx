// src/components/dashboard/uncensored/UncensoredFAQAccordion.tsx

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const UncensoredFAQAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "What exactly is Uncensored Mode?",
      answer:
        "Uncensored Mode is an optional, one-time add-on that relaxes many of the standard content filters. It’s designed for mature users who need more freedom for creative, stylized, and adult-themed generations within supported tools.",
    },
    {
      question: "Does Uncensored Mode mean there are no rules?",
      answer:
        "No. Even with Uncensored Mode enabled, we still enforce applicable laws and core platform safety rules. Some content categories—such as harmful, abusive, or extremely unsafe material—may remain restricted or blocked.",
    },
    {
      question: "Is this a monthly subscription?",
      answer:
        "No. Uncensored Mode is a one-time purchase. Pay once, and the unlock stays attached to your NOLIMITT account as long as your account remains in good standing.",
    },
    {
      question: "Which tools does Uncensored Mode affect?",
      answer:
        "Uncensored Mode primarily impacts Text to Video, Image to Video, Image to Image, and Text to Image flows. Over time, we may extend support to new models and tools that are compatible with the unlock.",
    },
    {
      question: "Can I turn Uncensored Mode off after I buy it?",
      answer:
        "Yes. You’ll still own the unlock, but you can choose to disable Uncensored behavior in your settings or inside specific workflows if you prefer a more filtered experience for certain projects.",
    },
    {
      question: "Is there a refund if I change my mind?",
      answer:
        "Because Uncensored Mode is a digital unlock, refunds may be limited or unavailable depending on your region and our current refund policy. Please review the policy on the checkout page before completing your purchase.",
    },
    {
      question: "Does this affect how my existing content is handled?",
      answer:
        "Your existing projects remain the same. Uncensored Mode only changes how new generations behave in supported tools after the unlock is active on your account.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full text-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Section - Title */}
          <div className="lg:sticky lg:top-8">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Your
              <br />
              uncensored
              <br />
              questions,
              <br />
              answered!
            </h2>
          </div>

          {/* Right Section - FAQ Items */}
          <div className="space-y-2">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="border-b border-gray-800 last:border-b-0"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between py-5 px-2 text-left hover:bg-gray-900/30 transition-colors duration-200 group"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-sm sm:text-base md:text-lg pr-4 text-gray-200 group-hover:text-white transition-colors">
                    {item.question}
                  </span>
                  <div
                    className={`relative flex-shrink-0 w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center transition-colors duration-300 ${
                      openIndex === index ? "bg-gray-800 border-gray-500" : ""
                    }`}
                  >
                    <Plus
                      className={`w-4 h-4 text-gray-400 transition-all duration-300 transform ${
                        openIndex === index
                          ? "opacity-0 scale-75 rotate-90"
                          : "opacity-100 scale-100 rotate-0"
                      }`}
                    />
                    <Minus
                      className={`w-4 h-4 text-gray-300 transition-all duration-300 transform absolute ${
                        openIndex === index
                          ? "opacity-100 scale-100 rotate-0"
                          : "opacity-0 scale-75 -rotate-90"
                      }`}
                    />
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-2 pb-5 text-sm sm:text-base text-gray-400 leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UncensoredFAQAccordion;
