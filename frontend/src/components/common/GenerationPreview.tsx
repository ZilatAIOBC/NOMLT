import React from 'react';

interface GenerationPreviewProps {
  thumbnailSrc?: string;
  prompt: string;
  onGenerate?: () => void;
  className?: string;
}

const GenerationPreview: React.FC<GenerationPreviewProps> = ({
  thumbnailSrc = "/texttoimage.png", // Default thumbnail
  prompt,
  onGenerate,
  className = ""
}) => {
  return (
    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 ${className}`}>
      <div className="bg-black/95 backdrop-blur-sm rounded-2xl px-3 py-3 flex items-center gap-2 min-w-[320px] max-w-[530px] shadow-2xl border border-gray-700/50">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <img 
            src={thumbnailSrc} 
            alt="Generation preview" 
            className="w-10 h-10 rounded-lg object-cover border border-gray-600/50 shadow-lg"
          />
        </div>
        
        {/* Prompt text */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-normal leading-tight">
            {prompt}
          </p>
        </div>
        
        {/* Generate button - Visual only, not clickable */}
        <div className="flex-shrink-0 bg-purple-600 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg">
          Generate
        </div>
      </div>
    </div>
  );
};

export default GenerationPreview;
