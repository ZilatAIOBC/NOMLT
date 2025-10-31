import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Play, Image as ImageIcon, Trash2, Download } from 'lucide-react';
import { getUserGenerations, getGenerationSignedUrl, deleteGeneration, GenerationFromDB } from '../../services/generationsService';
import ConfirmationModal from '../common/ConfirmationModal';
import ImageLightbox from '../common/ImageLightbox';

interface RecentGenerationsProps {
  generationType: 'text-to-video' | 'text-to-image' | 'image-to-video' | 'image-to-image';
  limit?: number;
}

const RecentGenerations: React.FC<RecentGenerationsProps> = ({ 
  generationType,
  limit: _limit = 10
}) => {
  const [generations, setGenerations] = useState<GenerationFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [heights] = useState<Record<string, number>>(() => ({}));
  const [page, setPage] = useState(1);
  const pageSize = 50; // fixed page size for consistency
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');

  const getPaginationPages = (currentPage: number, pagesCount: number): (number | string)[] => {
    const pages: (number | string)[] = [];
    const add = (v: number | string) => pages.push(v);
    if (pagesCount <= 7) {
      for (let i = 1; i <= pagesCount; i++) add(i);
    } else {
      add(1);
      if (currentPage > 4) add('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(pagesCount - 1, currentPage + 1);
      for (let i = start; i <= end; i++) add(i);
      if (currentPage < pagesCount - 3) add('...');
      add(pagesCount);
    }
    return pages;
  };

  useEffect(() => {
    fetchRecentGenerations();
  }, [generationType, page]);

  useEffect(() => {
    setPage(1);
  }, [generationType]);

  const fetchRecentGenerations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const offset = (page - 1) * pageSize;
      const response = await getUserGenerations(generationType, pageSize, offset);
      setGenerations(response.generations || []);
      setTotalCount(response.count || 0);
      
      // Fetch fresh signed URLs for all generations
      if (response.generations && response.generations.length > 0) {
        const urlPromises = response.generations.map(async (gen) => {
          try {
            const freshUrl = await getGenerationSignedUrl(gen.id);
            return { id: gen.id, url: freshUrl };
          } catch (err) {
            return { id: gen.id, url: gen.s3_url }; // Fallback to old URL
          }
        });
        
        const urls = await Promise.all(urlPromises);
        const urlMap: Record<string, string> = {};
        urls.forEach(({ id, url }) => {
          urlMap[id] = url;
        });
        setSignedUrls(urlMap);
        
        // Initialize heights for new generations only
        response.generations.forEach(gen => {
          if (!heights[gen.id]) {
            heights[gen.id] = Math.floor(Math.random() * 200) + 300;
          }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load recent generations');
    } finally {
      setLoading(false);
    }
  };

  const isVideoGeneration = (type: string) => {
    return type.includes('video');
  };

  const handleDownload = async (generation: GenerationFromDB, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = await getGenerationSignedUrl(generation.id, { download: true });
      const filename = generation.s3_key ? generation.s3_key.split('/').pop() || `generation-${generation.id}` : `generation-${generation.id}`;
      const resp = await fetch(url);
      const blob = await resp.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
      toast.success('Download started');
    } catch (err) {
      toast.error('Failed to download. Please try again.');
    }
  };

  const handleDeleteClick = (generationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setDeletingId(generationId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      await deleteGeneration(deletingId);
      // Remove from local state
      setGenerations(prev => prev.filter(gen => gen.id !== deletingId));
      // Remove from signedUrls
      setSignedUrls(prev => {
        const updated = { ...prev };
        delete updated[deletingId];
        return updated;
      });
      setDeleteModalOpen(false);
      setDeletingId(null);
    } catch (error) {
      toast.error('Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Generations</h2>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <div className="text-sm text-white/80">Loading recent generations...</div>
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
          <div className="flex flex-col justify-center items-center h-80 py-12">
            {/* Icon */}
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
              {isVideoGeneration(generationType) ? (
                <Play className="w-8 h-8 text-white/60" />
              ) : (
                <ImageIcon className="w-8 h-8 text-white/60" />
              )}
            </div>
            
            {/* Main Heading */}
            <h3 className="text-white text-2xl font-semibold mb-3">
              No recent generations yet
            </h3>
            
            {/* Subheading */}
            <p className="text-white/80 text-base mb-6 text-center max-w-md">
              Start creating to see your AI-generated {isVideoGeneration(generationType) ? 'videos' : 'images'} here
            </p>
            
            {/* Simple Guide Message */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white/80 text-sm text-center">
                Create your first {generationType.replace('-', ' ')} to see it here
              </p>
            </div>
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
                  height: `${heights[generation.id] || 400}px`
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
                    onClick={() => {
                      setLightboxSrc(url);
                      setLightboxAlt(generation.prompt || 'Preview');
                      setLightboxOpen(true);
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=Image+Not+Found';
                    }}
                  />
                )}
                
                {/* Action buttons on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={(e) => handleDownload(generation, e)}
                    className="bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(generation.id, e)}
                    className="bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                    title="Delete generation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              className="px-3 py-2 rounded-md bg-white/10 text-white disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            {getPaginationPages(page, totalPages).map((p, idx) => (
              typeof p === 'number' ? (
                <button
                  key={`p-${p}-${idx}`}
                  className={`px-3 py-2 rounded-md text-sm ${p === page ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ) : (
                <span key={`e-${idx}`} className="px-2 text-white/60">{p}</span>
              )
            ))}
            <button
              className="px-3 py-2 rounded-md bg-white/10 text-white disabled:opacity-50"
              onClick={() => setPage(p => (p < Math.ceil(totalCount / pageSize) ? p + 1 : p))}
              disabled={page >= Math.ceil(totalCount / pageSize)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Generation?"
        message="This action cannot be undone. The file will be permanently deleted from both your account and storage."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        type="danger"
      />

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        src={lightboxSrc}
        alt={lightboxAlt}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};

export default RecentGenerations;

