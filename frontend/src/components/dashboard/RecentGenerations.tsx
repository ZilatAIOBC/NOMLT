import React, { useState, useEffect } from 'react';
import { Play, Image as ImageIcon } from 'lucide-react';
import { getUserGenerations, getGenerationSignedUrl, GenerationFromDB } from '../../services/generationsService';

interface RecentGenerationsProps {
  generationType: 'text-to-video' | 'text-to-image' | 'image-to-video' | 'image-to-image';
  limit?: number;
}

const RecentGenerations: React.FC<RecentGenerationsProps> = ({ 
  generationType,
  limit = 10
}) => {
  const [generations, setGenerations] = useState<GenerationFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRecentGenerations();
  }, [generationType]);

  const fetchRecentGenerations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getUserGenerations(generationType, limit, 0);
      setGenerations(response.generations || []);
      
      // Fetch fresh signed URLs for all generations
      if (response.generations && response.generations.length > 0) {
        const urlPromises = response.generations.map(async (gen) => {
          try {
            const freshUrl = await getGenerationSignedUrl(gen.id);
            return { id: gen.id, url: freshUrl };
          } catch (err) {
            console.warn(`Failed to get signed URL for generation ${gen.id}:`, err);
            return { id: gen.id, url: gen.s3_url }; // Fallback to old URL
          }
        });
        
        const urls = await Promise.all(urlPromises);
        const urlMap: Record<string, string> = {};
        urls.forEach(({ id, url }) => {
          urlMap[id] = url;
        });
        setSignedUrls(urlMap);
      }
    } catch (err: any) {
      console.error('Failed to fetch recent generations:', err);
      setError(err.message || 'Failed to load recent generations');
    } finally {
      setLoading(false);
    }
  };

  const isVideoGeneration = (type: string) => {
    return type.includes('video');
  };


  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Generations</h2>
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Generations</h2>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!generations || generations.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Generations</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              {isVideoGeneration(generationType) ? (
                <Play className="w-8 h-8 text-gray-400" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-gray-400 text-base sm:text-lg mb-2">No recent generations yet</p>
            <p className="text-gray-500 text-sm">
              Start creating amazing {isVideoGeneration(generationType) ? 'videos' : 'images'} and they'll appear here!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Generations</h2>
        
        {/* Generations grid - responsive masonry layout like View Generations */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {generations.map((generation) => {
            const url = signedUrls[generation.id] || generation.s3_url;
            const isVideo = isVideoGeneration(generation.generation_type);
            
            return (
              <div
                key={generation.id}
                className="group relative break-inside-avoid rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                style={{
                  height: `${Math.floor(Math.random() * 200) + 300}px`
                }}
              >
                {isVideo ? (
                  <div className="w-full h-full relative bg-black rounded-lg overflow-hidden">
                    {/* Custom Video Player for Grid */}
                    <video
                      src={url}
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
                    src={url}
                    alt={generation.prompt || 'Generated image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=Image+Not+Found';
                    }}
                  />
                )}
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentGenerations;

