import React from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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
        
        {/* Generate button - navigates to signup by default */}
        <button
          type="button"
          onClick={() => (onGenerate ? onGenerate() : navigate('/signup'))}
          className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg transition-colors"
          aria-label="Generate - Sign up to start"
        >
          Generate
        </button>
      </div>
    </div>
  );
};

export default GenerationPreview;
