import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Props = {
  onGenerate?: () => void;
};

const RANDOM_PROMPTS = [
  'A serene mountain landscape at sunset with purple and orange skies',
  'A futuristic cityscape with flying vehicles and neon lights',
  'A cute cat playing in a garden filled with flowers',
  'An abstract art piece with vibrant colors and geometric shapes',
  'A magical forest with glowing mushrooms and fairy lights',
  'A vintage car on a coastal road during golden hour',
  'A space station orbiting Earth with the Milky Way in the background',
  'A bustling street market in Japan with colorful lanterns',
  'A peaceful lake reflecting snow-capped mountains',
  'A steam-punk robot in a Victorian-style workshop',
  'A beautiful sunset over the ocean with palm trees',
  'A mystical castle floating in the clouds',
  'A dragon flying over a medieval kingdom',
  'A coffee shop interior with cozy lighting and plants',
  'A cyberpunk alley with neon signs and rainy streets',
  'A sunflower field under a bright blue sky',
  'An underwater scene with colorful coral reefs and fish',
  'A winter scene with snow-covered cabins and northern lights',
  'A Zen garden with cherry blossoms and a stone bridge',
  'A retro diner from the 1950s with classic cars outside'
];

const SearchHero: React.FC<Props> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_PROMPTS.length);
    setPrompt(RANDOM_PROMPTS[randomIndex]);
  };

  const handleGenerate = () => {
    if (prompt.trim()) {
      if (onGenerate) {
        onGenerate();
      }
      // Navigate to text-to-image page with prompt in URL
      navigate(`/dashboard/text-to-image?prompt=${encodeURIComponent(prompt.trim())}`);
    }
  };

  return (
    <div className="mb-8">
      <div className="rounded-2xl p-4 sm:p-8 lg:p-16 bg-gradient-to-r from-[#0D131E] to-[#7D3CEA] w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Describe your ideas and generate</h1>
          <p className="text-white text-sm sm:text-base lg:text-lg">
            Transform your words into visual masterpieces: Leverage AI technology to craft breathtaking visuals.
          </p>
        </div>
        <div className="bg-[#1A1A1A57] backdrop-blur-sm rounded-3xl p-2 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto">
          {/* Prompt Icon Button */}
          <button
            onClick={handleRandomPrompt}
            className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center hover:bg-purple-700/30 rounded-lg transition-colors active:scale-95"
            title="Add a random prompt"
          >
            <img src="/promot.svg" alt="prompt" className="w-full h-full cursor-pointer" />
          </button>

          {/* Input Field */}
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write a prompt to generate"
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base sm:text-lg py-2"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleGenerate();
              }
            }}
          />

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 rounded-lg bg-[#7D3CEA] text-white hover:bg-[#6A2DB8] transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base cursor-pointer disabled:bg-[#7D3CEA] disabled:cursor-not-allowed disabled:hover:bg-[#7D3CEA]"
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


