import React, { useEffect, useRef, useState } from 'react';

const Gallery: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Gallery organized in rows matching the design layout
  const galleryRows = [
    // Row 1
    [
      { url: 'https://images.pexels.com/photos/7194730/pexels-photo-7194730.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 1', width: 'w-[15%]' },
      { url: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 2', width: 'w-[15%]' },
      { url: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 3', width: 'w-[15%]' },
      { url: 'https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 4', width: 'w-[18%]' },
      { url: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 5', width: 'w-[17%]' },
      { url: 'https://images.pexels.com/photos/4974920/pexels-photo-4974920.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 6', width: 'w-[18%]' },
    ],
    // Row 2
    [
      { url: 'https://images.pexels.com/photos/6899260/pexels-photo-6899260.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 7', width: 'w-[15%]' },
      { url: 'https://images.pexels.com/photos/7194730/pexels-photo-7194730.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 8', width: 'w-[18%]' },
      { url: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 9', width: 'w-[17%]' },
      { url: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 10', width: 'w-[20%]' },
      { url: 'https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 11', width: 'w-[15%]' },
      { url: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 12', width: 'w-[13%]' },
    ],
    // Row 3
    [
      { url: 'https://images.pexels.com/photos/4974920/pexels-photo-4974920.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 13', width: 'w-[12%]' },
      { url: 'https://images.pexels.com/photos/6899260/pexels-photo-6899260.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 14', width: 'w-[22%]' },
      { url: 'https://images.pexels.com/photos/7194730/pexels-photo-7194730.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 15', width: 'w-[20%]' },
      { url: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 16', width: 'w-[18%]' },
      { url: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 17', width: 'w-[14%]' },
      { url: 'https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'AI Generated 18', width: 'w-[12%]' },
    ],
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate scroll progress through the section
      // When section enters viewport (rect.top = windowHeight) progress = 0
      // When section exits viewport (rect.top = -sectionHeight) progress = 1
      const scrollDistance = windowHeight + sectionHeight;
      const currentScroll = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / scrollDistance));

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="py-20 md:py-24 px-4 bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-white text-3xl md:text-5xl font-bold mb-4">
            NOLMT GALLERY
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto">
            NOLMT AI Video Generator delivers what others can't - trusted by millions worldwide.
          </p>
        </div>

        {/* Gallery Rows */}
        <div className="space-y-2">
          {galleryRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 w-full">
              {row.map((image, imgIndex) => (
                <div
                  key={imgIndex}
                  className={`${image.width} relative group cursor-pointer overflow-hidden transition-all duration-300`}
                >
                  <div className="relative w-full h-48 md:h-56 lg:h-64">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    
                    {/* Subtle hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;

