import React from 'react';

type IdeaChipsProps = {
  ideas: string[];
  onSelect: (idea: string) => void;
  className?: string;
};

const IdeaChips: React.FC<IdeaChipsProps> = ({ ideas, onSelect, className }) => {
  return (
    <div className={"flex flex-wrap gap-2 " + (className ?? '')}>
      {ideas.map((idea, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idea)}
          className="px-3 py-1.5 text-xs sm:text-sm rounded-full border border-gray-700 bg-[#0D131F] text-gray-300 hover:text-white hover:border-gray-500 hover:bg-[#151b27] transition-colors shadow-sm"
        >
          {idea}
        </button>
      ))}
    </div>
  );
};

export default IdeaChips;


