import React from 'react';
import { Download, Eye, Trash2, Clock, Image, Video } from 'lucide-react';
import { Generation } from '../../types';
import Button from '../common/Button';

interface GenerationGridProps {
  generations: Generation[];
}

const GenerationGrid: React.FC<GenerationGridProps> = ({ generations }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTypeIcon = (type: Generation['type']) => {
    switch (type) {
      case 'text-to-image':
      case 'image-to-image':
        return Image;
      case 'text-to-video':
      case 'image-to-video':
        return Video;
      default:
        return Image;
    }
  };

  const getTypeLabel = (type: Generation['type']) => {
    switch (type) {
      case 'text-to-image':
        return 'Text → Image';
      case 'image-to-image':
        return 'Image → Image';
      case 'text-to-video':
        return 'Text → Video';
      case 'image-to-video':
        return 'Image → Video';
      default:
        return 'Unknown';
    }
  };

  if (generations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Image className="w-12 h-12 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No generations yet</h3>
        <p className="text-gray-400 mb-6">
          Start creating amazing content with our AI tools
        </p>
        <Button variant="primary">
          Create Your First Generation
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {generations.map((generation) => {
        const TypeIcon = getTypeIcon(generation.type);
        
        return (
          <div
            key={generation.id}
            className="group bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105"
          >
            {/* Thumbnail */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={generation.thumbnail}
                alt="Generated content"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex gap-2">
                  <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                    <Eye className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                    <Download className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 bg-red-500/20 backdrop-blur-sm rounded-lg hover:bg-red-500/30 transition-colors">
                    <Trash2 className="w-5 h-5 text-red-300" />
                  </button>
                </div>
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
                <div className="flex items-center gap-1">
                  <TypeIcon className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-medium">
                    {getTypeLabel(generation.type)}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium text-sm truncate">
                  {generation.prompt || 'Generated Content'}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Clock className="w-3 h-3" />
                <span>{formatDate(generation.timestamp)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GenerationGrid;