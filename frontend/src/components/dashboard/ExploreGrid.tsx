import React, { useState, useEffect } from 'react';
import { getUserGenerations, transformGeneration } from '../../services/generationsService';


type Generation = {
  id: string;
  type: 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video';
  thumbnail: string;
  prompt: string;
  isVideo?: boolean;
  s3Key?: string;
  fileSize?: number;
  createdAt?: string;
  settings?: any;
};

type ExploreGridProps = {
  showHeader?: boolean;
  showTitle?: boolean;
};

const ExploreGrid: React.FC<ExploreGridProps> = ({ showHeader = true, showTitle = true }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch generations from database
  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('ExploreGrid: Fetching generations from database...');
        const type = activeTab === 'all' ? undefined : activeTab;
        const response = await getUserGenerations(type, 100, 0);
        
        console.log('ExploreGrid: Got generations:', response);
        const transformedGenerations = response.generations.map(transformGeneration);
        setGenerations(transformedGenerations);
        
      } catch (err) {
        console.error('ExploreGrid: Error fetching generations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load generations');
      } finally {
        setLoading(false);
      }
    };

    fetchGenerations();
  }, [activeTab]);

  // No fallback data - only show real generations from database

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'text-to-image', label: 'Text To Image' },
    { id: 'image-to-image', label: 'Image To Image' },
    { id: 'text-to-video', label: 'Text To Video' },
    { id: 'image-to-video', label: 'Image To Video' },
  ];

  // Function to get appropriate message based on active tab
  const getEmptyStateMessage = (tab: string) => {
    switch (tab) {
      case 'all':
        return 'Go to Text-to-Image, Text-to-Video, Image-to-Video, or Image-to-Image to get started';
      case 'text-to-image':
        return 'Go to Text-to-Image tool to create AI images from text descriptions';
      case 'image-to-image':
        return 'Go to Image-to-Image tool to transform existing images';
      case 'text-to-video':
        return 'Go to Text-to-Video tool to create AI videos from text descriptions';
      case 'image-to-video':
        return 'Go to Image-to-Video tool to animate existing images into videos';
      default:
        return 'Start creating content to see it here';
    }
  };

  const filteredGenerations = generations; // Only show real generations, no fallback

  // Show loading state
  if (loading) {
    return (
      <div className="mb-8">
        {showHeader && (
          <div className="mb-6">
            {showTitle && (
              <h2 className="text-2xl font-bold text-white mb-4">Your Generations</h2>
            )}
            {/* Show tabs even when loading */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-4 sm:w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full sm:w-auto px-3 sm:px-5 py-2 sm:py-3 rounded-3xl text-xs sm:text-sm font-medium transition-colors text-center ${
                    activeTab === tab.id
                      ? 'bg-gray-500 text-white font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col justify-center items-center min-h-[500px] py-16">
          <div className="relative">
            {/* Loading Spinner */}
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          </div>
          <p className="text-white font-medium text-lg mb-2">Loading your generations</p>
          <p className="text-white/70 text-sm font-medium">Discovering your creative content</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-8">
        {showHeader && (
          <div className="mb-6">
            {showTitle && (
              <h2 className="text-2xl font-bold text-white mb-4">Your Generations</h2>
            )}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-4 sm:w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full sm:w-auto px-3 sm:px-5 py-2 sm:py-3 rounded-3xl text-xs sm:text-sm font-medium transition-colors text-center ${
                    activeTab === tab.id
                      ? 'bg-gray-500 text-white font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col justify-center items-center min-h-[500px] py-16">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-white text-xl font-semibold mb-2">Failed to load generations</h3>
          <p className="text-white/70 text-sm mb-6 text-center max-w-md">{error}</p>
          
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Header */}
      {showHeader && (
        <div className="mb-6">
              {showTitle && (
                <h2 className="text-2xl font-bold text-white mb-2">Your Generations</h2>
              )}

          {/* Tabs */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-4 sm:w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full sm:w-auto px-3 sm:px-5 py-2 sm:py-3 rounded-3xl text-xs sm:text-sm font-medium transition-colors text-center ${
                  activeTab === tab.id
                    ? 'bg-gray-500 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {generations.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-80 py-12">
          {/* Icon */}
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          
          {/* Main Heading */}
          <h3 className="text-white text-2xl font-semibold mb-3">
            {activeTab === 'all' ? 'No generations yet' : `No ${activeTab.replace('-', ' ')} generations yet`}
          </h3>
          
          {/* Subheading */}
          <p className="text-white/80 text-base mb-6 text-center max-w-md">
            {activeTab === 'all' 
              ? 'Start creating to see your AI-generated content here'
              : `Create your first ${activeTab.replace('-', ' ')} to see it here`
            }
          </p>
          
          {/* Simple Guide Message */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm text-center">
              {getEmptyStateMessage(activeTab)}
            </p>
          </div>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filteredGenerations.map((generation) => (
          <div
            key={generation.id}
            className="group relative break-inside-avoid rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
            style={{
              height: `${Math.floor(Math.random() * 200) + 300}px`
            }}
          >
            {generation.isVideo ? (
              <div className="w-full h-full relative bg-black rounded-lg overflow-hidden">
                {/* Custom Video Player for Grid */}
                <video
                  src={generation.thumbnail}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  controls
                  controlsList="nodownload noremoteplayback"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gray-800 text-white text-sm">
                        Video not available
                      </div>
                    `;
                  }}
                />
                {/* Hide volume control with CSS */}
                <style>
                  {`
                    video::-webkit-media-controls-volume-slider {
                      display: none !important;
                    }
                    video::-webkit-media-controls-mute-button {
                      display: none !important;
                    }
                    video::-webkit-media-controls-volume-control-container {
                      display: none !important;
                    }
                  `}
                </style>
              </div>
            ) : (
              <img
                src={generation.thumbnail}
                alt={generation.prompt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=Image+Not+Found';
                }}
              />
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset- bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
              <div className="p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs line-clamp-2">{generation.prompt}</p>
                {generation.createdAt && (
                  <p className="text-gray-300 text-xs mt-1">
                    {new Date(generation.createdAt).toLocaleDateString()}
                  </p>
                )}
                {generation.fileSize && (
                  <p className="text-gray-300 text-xs">
                    {(generation.fileSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default ExploreGrid;
