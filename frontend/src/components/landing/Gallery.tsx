import React, { useEffect, useRef } from 'react';

const Gallery: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Gallery organized in rows matching the design layout
  const galleryRows = [
    // Row 1
    [
      { url: '/11.jpg', alt: 'AI Generated 1', width: 'w-[15%]' },
      { url: '/12.png', alt: 'AI Generated 2', width: 'w-[15%]' },
      { url: '/13.png', alt: 'AI Generated 3', width: 'w-[15%]' },
      { url: '/14.jpg', alt: 'AI Generated 4', width: 'w-[18%]' },
      { url: '/15.jpg', alt: 'AI Generated 5', width: 'w-[17%]' },
      { url: '/16.png', alt: 'AI Generated 6', width: 'w-[18%]' },
    ],
    // Row 2
    [
      { url: '/17.png', alt: 'AI Generated 7', width: 'w-[15%]' },
      { url: '/18.png', alt: 'AI Generated 8', width: 'w-[18%]' },
      { url: '/19.png', alt: 'AI Generated 9', width: 'w-[17%]' },
      { url: '/20.png', alt: 'AI Generated 10', width: 'w-[20%]' },
      { url: '/21.png', alt: 'AI Generated 11', width: 'w-[15%]' },
      { url: '/22.png', alt: 'AI Generated 12', width: 'w-[13%]' },
    ],
    // Row 3
    [
      { url: '/23.png', alt: 'AI Generated 13', width: 'w-[12%]' },
      { url: '/24.png', alt: 'AI Generated 14', width: 'w-[22%]' },
      { url: '/11.jpg', alt: 'AI Generated 15', width: 'w-[20%]' },
      { url: '/12.png', alt: 'AI Generated 16', width: 'w-[18%]' },
      { url: '/13.png', alt: 'AI Generated 17', width: 'w-[14%]' },
      { url: '/14.jpg', alt: 'AI Generated 18', width: 'w-[12%]' },
    ],
    // Row 4
    [
      { url: '/15.jpg', alt: 'AI Generated 19', width: 'w-[16%]' },
      { url: '/16.png', alt: 'AI Generated 20', width: 'w-[19%]' },
      { url: '/17.png', alt: 'AI Generated 21', width: 'w-[17%]' },
      { url: '/18.png', alt: 'AI Generated 22', width: 'w-[15%]' },
      { url: '/19.png', alt: 'AI Generated 23', width: 'w-[18%]' },
      { url: '/20.png', alt: 'AI Generated 24', width: 'w-[13%]' },
    ],
    // Row 5
    [
      { url: '/21.png', alt: 'AI Generated 25', width: 'w-[14%]' },
      { url: '/22.png', alt: 'AI Generated 26', width: 'w-[20%]' },
      { url: '/23.png', alt: 'AI Generated 27', width: 'w-[16%]' },
      { url: '/24.png', alt: 'AI Generated 28', width: 'w-[18%]' },
      { url: '/11.jpg', alt: 'AI Generated 29', width: 'w-[15%]' },
      { url: '/12.png', alt: 'AI Generated 30', width: 'w-[15%]' },
    ],
    // Row 6
    [
      { url: '/13.png', alt: 'AI Generated 31', width: 'w-[13%]' },
      { url: '/14.jpg', alt: 'AI Generated 32', width: 'w-[21%]' },
      { url: '/15.jpg', alt: 'AI Generated 33', width: 'w-[17%]' },
      { url: '/16.png', alt: 'AI Generated 34', width: 'w-[19%]' },
      { url: '/17.png', alt: 'AI Generated 35', width: 'w-[14%]' },
      { url: '/18.png', alt: 'AI Generated 36', width: 'w-[14%]' },
    ],
    // Row 7
    [
      { url: '/19.png', alt: 'AI Generated 37', width: 'w-[15%]' },
      { url: '/20.png', alt: 'AI Generated 38', width: 'w-[18%]' },
      { url: '/21.png', alt: 'AI Generated 39', width: 'w-[20%]' },
      { url: '/22.png', alt: 'AI Generated 40', width: 'w-[16%]' },
      { url: '/23.png', alt: 'AI Generated 41', width: 'w-[17%]' },
      { url: '/24.png', alt: 'AI Generated 42', width: 'w-[12%]' },
    ],
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !galleryRef.current) return;

      const section = sectionRef.current;
      const gallery = galleryRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate scroll progress through the section
      const scrollDistance = windowHeight + sectionHeight;
      const currentScroll = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / scrollDistance));

      // Calculate gallery internal scroll progress
      // When section enters viewport, start scrolling gallery content
      // When section exits viewport, gallery scroll should be complete
      const galleryScrollDistance = gallery.scrollHeight - gallery.clientHeight;
      const galleryScroll = Math.min(progress * galleryScrollDistance, galleryScrollDistance);
      
      // Apply the scroll to the gallery container
      gallery.scrollTop = galleryScroll;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="gallery" ref={sectionRef} className="py-20 md:py-24 px-4 bg-black relative overflow-hidden w-full">
        <div className="w-full">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          {/* Decorative lines with "Gallery" */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-4">
            <div className="w-8 sm:w-12 md:w-16 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F] to-[#9333EA]"></div>
            <h3 className="text-white text-xs sm:text-sm md:text-sm font-medium tracking-[0.1em] uppercase">
              Gallery
            </h3>
            <div className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
          </div>
          
          <h2 className="text-white text-3xl md:text-5xl font-bold mb-4">
            NOLMT GALLERY
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto">
            NOLMT AI Video Generator delivers what others can't - trusted by millions worldwide.
          </p>
        </div>

        {/* Gallery Rows */}
        <div 
          ref={galleryRef}
          className="h-[500px] overflow-y-auto hide-scrollbar relative w-full"
        >
          <div className="space-y-2 min-h-full">
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
      </div>
    </section>
  );
};

export default Gallery;

