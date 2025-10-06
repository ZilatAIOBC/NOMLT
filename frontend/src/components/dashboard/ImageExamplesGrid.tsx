import React from 'react';

interface Example {
  id: string;
  thumbnail: string;
  alt: string;
}

interface ImageExamplesGridProps {
  title?: string;
  examples?: Example[];
}

const ImageExamplesGrid: React.FC<ImageExamplesGridProps> = ({ 
  title = "Examples",
  examples = defaultExamples 
}) => {
  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">{title}</h2>
        
        {/* Examples grid - responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {examples.map((example) => (
            <div
              key={example.id}
              className="group relative bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer rounded-lg overflow-hidden"
              style={{ height: '250px' }}
            >
              <img
                src={example.thumbnail}
                alt={example.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=Image+Not+Found';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Default examples data for image-to-image
const defaultExamples: Example[] = [
  {
    id: '1',
    thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    alt: 'Mountain runners at sunset'
  },
  {
    id: '2',
    thumbnail: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
    alt: 'Green frog puppet at tea table'
  },
  {
    id: '3',
    thumbnail: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400&h=700&fit=crop',
    alt: 'Fashion model in neon environment'
  },
  {
    id: '4',
    thumbnail: 'https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg?auto=compress&cs=tinysrgb&w=400&h=550&fit=crop',
    alt: 'Sci-fi android with glowing heart'
  },
  {
    id: '5',
    thumbnail: 'https://images.pexels.com/photos/1040883/pexels-photo-1040883.jpeg?auto=compress&cs=tinysrgb&w=400&h=650&fit=crop',
    alt: 'Violinist in cosmic background'
  }
];

export default ImageExamplesGrid;
