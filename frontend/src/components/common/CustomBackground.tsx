import React from 'react';

interface CustomBackgroundProps {
  className?: string;
}

const CustomBackground: React.FC<CustomBackgroundProps> = ({ className = "" }) => {
  return (
    <div className={`fixed inset-0 ${className}`}>
      {/* Main dark background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Purple gradient slightly above center - custom spread */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center 35%, rgba(138, 63, 252, 0.3) 0%, rgba(138, 63, 252, 0.1) 30%, transparent 50%)'
        }}
      ></div>
      
      {/* Additional subtle gradient overlay - custom spread */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center 35%, rgba(138, 63, 252, 0.05) 0%, transparent 40%, rgba(0, 0, 0, 0.9) 100%)'
        }}
      ></div>
    </div>
  );
};

export default CustomBackground;
