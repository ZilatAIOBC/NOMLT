import React from 'react';

interface HeroBackgroundProps {
  className?: string;
}

const HeroBackground: React.FC<HeroBackgroundProps> = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Main dark background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Centered purple gradient - matching Figma design */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(147, 51, 234, 0.5) 0%, rgba(147, 51, 234, 0.25) 28%, rgba(147, 51, 234, 0.15) 45%, transparent 65%)'
        }}
      ></div>
      
      {/* Additional subtle gradient overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(147, 51, 234, 0.1) 0%, transparent 40%, rgba(0, 0, 0, 0.75) 100%)'
        }}
      ></div>
      
      {/* Particle effects - small dots scattered across */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        ))}
      </div>
      
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default HeroBackground;
