import React, { useEffect, useRef, useState } from "react";
import SimpleVideoPlayer from "../common/SimpleVideoPlayer";

const VideoSection: React.FC = () => {
  // Dummy video for landing preview - short 1 minute video
  const demoVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionMiddle = rect.top + rect.height / 2;
      const screenMiddle = windowHeight / 2;

      // Calculate distance from screen center
      const distance = Math.abs(sectionMiddle - screenMiddle);
      const maxDistance = windowHeight;

      // Calculate scale (1.0 to 1.6) - much bigger when centered
      const scaleValue = 1 + (1 - Math.min(distance / maxDistance, 1)) * 0.6;
      
      // Calculate opacity (0 to 1) - visible when in viewport
      const opacityValue = Math.max(0, Math.min(1, 1 - distance / maxDistance));

      setScale(scaleValue);
      setOpacity(opacityValue);
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="w-full bg-black py-32 flex items-center justify-center"
    >
      <div 
        className="w-full max-w-6xl px-6 transition-all duration-700 ease-out"
        style={{
          transform: `scale(${scale})`,
          opacity: opacity,
        }}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          <SimpleVideoPlayer
            src={demoVideoUrl}
            className="w-full h-[480px] object-cover"
            muted={true}
          />
        </div>
      </div>
    </section>
  );
};

export default VideoSection;


