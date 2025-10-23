import React, { useEffect, useRef, useState } from "react";
import SimpleVideoPlayer from "../common/SimpleVideoPlayer";

const VideoSection: React.FC = () => {
  // 4K Project Demo Video - 1 minute
  // Creative animated video perfect for AI/tech platforms
  const demoVideoUrl = "/video.mp4";

    // const demoVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";
  // Alternative options for different themes:
  // Futuristic tech: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  // Creative animation: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  // Your own hosted video: "https://your-bucket.s3.amazonaws.com/videos/demo-4k.mp4"
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const sectionMiddle = rect.top + rect.height / 2;
      const screenMiddle = windowHeight / 2;

      // Calculate distance from screen center
      const distance = Math.abs(sectionMiddle - screenMiddle);
      const maxDistance = windowHeight;

      // Responsive scaling based on screen size
      let scaleValue = 1; // Default no scaling for mobile/tablet
      
      if (windowWidth >= 1024 && windowWidth < 1280) { // Laptop screens
        const maxScale = 1.2; // Moderate scaling for laptops
        scaleValue = 1 + (1 - Math.min(distance / maxDistance, 1)) * (maxScale - 1);
      } else if (windowWidth >= 1280) { // Large screens and above
        const maxScale = 1.6; // Full scaling for large screens
        scaleValue = 1 + (1 - Math.min(distance / maxDistance, 1)) * (maxScale - 1);
      }
      
      // Calculate opacity (0 to 1) - visible when in viewport
      const opacityValue = Math.max(0, Math.min(1, 1 - distance / maxDistance));

      setScale(scaleValue);
      setOpacity(opacityValue);
    };

    // Initial check
    handleScroll();

    // Add scroll and resize listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="w-full bg-black py-16 sm:py-20 md:py-24 lg:py-32 flex items-center justify-center overflow-hidden"
    >
      <div 
        className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 sm:px-6 md:px-8 lg:px-6 transition-all duration-700 ease-out"
        style={{
          transform: `scale(${scale})`,
          opacity: opacity,
        }}
      >
        <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
          <SimpleVideoPlayer
            src={demoVideoUrl}
            className="w-full h-[240px] sm:h-[320px] md:h-[400px] lg:h-[480px] object-cover"
            muted={true}
            autoPlay={true}
            loop={true}
          />
        </div>
      </div>
    </section>
  );
};

export default VideoSection;


