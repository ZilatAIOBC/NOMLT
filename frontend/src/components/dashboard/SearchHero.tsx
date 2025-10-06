import React from 'react';
import { Sparkles } from 'lucide-react';

type Props = {
  onGenerate?: () => void;
};

const SearchHero: React.FC<Props> = ({ onGenerate }) => {
  return (
    <div className="mb-8">
      <div className="rounded-2xl p-4 sm:p-8 lg:p-16 bg-gradient-to-r from-[#0D131E] to-[#7D3CEA] w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Describe your ideas and generate</h1>
          <p className="text-white text-sm sm:text-base lg:text-lg">
            Transform your words into visual masterpieces: Leverage AI technology to craft breathtaking videos.
          </p>
        </div>
        <div className="bg-[#1A1A1A57] backdrop-blur-sm rounded-3xl p-2 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto">
          <img src="/promot.svg" alt="prompt" className="w-8 h-8 sm:w-10 sm:h-10" />
          <input
            placeholder="Write a prompt to generate"
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base sm:text-lg py-2"
          />
          <button
            onClick={onGenerate}
            className="w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 rounded-lg bg-[#7D3CEA] text-white hover:bg-[#7D3CEA]/90 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchHero;


