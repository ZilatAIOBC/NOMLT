import React, { useEffect } from 'react';

interface ImageLightboxProps {
  isOpen: boolean;
  src: string | null;
  alt?: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, src, alt = 'Preview', onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdrop}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 z-[61] w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center"
      >
        <span className="text-xl leading-none">×</span>
      </button>
      <div className="max-w-[98vw] max-h-[95vh]">
        <img
          src={src}
          alt={alt}
          className="object-contain max-w-[98vw] max-h-[95vh] w-auto h-auto sm:rounded-lg sm:border sm:border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ImageLightbox;


