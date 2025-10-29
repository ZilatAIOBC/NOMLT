
import { Separator } from "../ui/separator";
import { useEffect, useState, useRef } from "react";
import GenerationPreview from "../common/GenerationPreview";

interface FeatureData {
  id: string;
  title: string;
  description: string;
  prompt: string;
  thumbnailSrc: string;
}

const featuresData: FeatureData[] = [
  {
    id: "imageToImage",
    title: "Image to Image",
    description: "Take any picture and push it further than you thought possible. Subtitle edits? Perfectly lifelike. Radical remaining? Just as convincing.",
    prompt: "Transform this image into a cyberpunk cityscape",
    thumbnailSrc: "/imagetoimage.png"
  },
  {
    id: "imageToVideo",
    title: "Image to Video",
    description: "Transform static images into dynamic videos with advanced AI technology. Add motion, effects, and cinematic quality to your visuals.",
    prompt: "Create a cinematic video from this landscape",
    thumbnailSrc: "/imagetovideo.png"
  },
  {
    id: "textToImage",
    title: "Text to Image",
    description: "Transform your ideas into stunning visuals with AI-powered text-to-image generation. Create unique artwork and designs effortlessly.",
    prompt: "A rabbit warrior slowly raises his sharp sword winks at camera",
    thumbnailSrc: "/texttoimage.png"
  },
  {
    id: "textToVideo",
    title: "Text to Video",
    description: "Bring your stories to life with AI-generated videos from text descriptions. Create dynamic content, animations, and visual narratives effortlessly.",
    prompt: "A magical forest with glowing fireflies dancing in the moonlight",
    thumbnailSrc: "/texttovideo.png"
  }
];

const Features = (): JSX.Element => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  const currentFeature = featuresData[activeFeature];

  // Map each feature id to its corresponding main illustration in /public
  const featureImages: Record<string, string> = {
    textToImage: "/text-to-image.svg",
    imageToImage: "/image-to-image.svg",
    textToVideo: "/text-to-video.svg",
    imageToVideo: "/image-to-video.svg",
  };
  const mainImageSrc = featureImages[currentFeature.id] ?? "/image-to-image.svg";
  const badgeImageSrc =
    currentFeature.id === "textToImage" || currentFeature.id === "textToVideo"
      ? "/we2.png"
      : "/we.svg";

  // Intersection Observer to detect when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: '0px 0px -100px 0px' // Start animation slightly before fully visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Autoplay: advance every 2s, only pause when not visible
  useEffect(() => {
    if (!isVisible) return;
    
    const intervalId = setInterval(() => {
      setActiveFeature((prev) => (prev === featuresData.length - 1 ? 0 : prev + 1));
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [isVisible]);

  // Manual nav removed; autoplay handles progression

  return (
    <section 
      ref={sectionRef}
      id="features" 
      className="flex flex-col w-full items-center pt-24 sm:pt-32 md:pt-48 pb-16 sm:pb-24 md:pb-32 px-4 sm:px-8 md:px-20 bg-black"
    >
      {/* Our Features heading with decorative arrows */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-4">
        <div className="w-8 sm:w-12 md:w-16 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F] to-[#9333EA]"></div>
        <h3 className="text-white text-xs sm:text-sm md:text-sm font-medium tracking-[0.1em] uppercase">
          Our Features
        </h3>
        <div className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
      </div>

      <div className="inline-flex flex-col items-start pt-0 pb-6 sm:pb-7 md:pb-8 px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center md:inline-flex md:items-center md:justify-center gap-4 sm:gap-6 md:gap-10">
          <div className="inline-flex flex-col items-start">
            <h2 className="[font-family:'Microsoft_YaHei-Regular',Helvetica] font-normal text-white text-2xl sm:text-3xl md:text-4xl lg:text-[47.6px] tracking-[0] leading-8 sm:leading-10 md:leading-12 lg:leading-[72px]">
              {currentFeature.title}
            </h2>
          </div>

          <Separator
            orientation="vertical"
            className="hidden sm:block w-0.5 h-[40px] sm:h-[45px] md:h-[50px] bg-white opacity-[0.24]"
          />

          <div className="flex flex-col w-full sm:w-[350px] md:w-[405px] items-start opacity-65">
            <p className="w-full sm:w-[350px] md:w-[390px] [font-family:'Microsoft_YaHei-Regular',Helvetica] font-normal text-white text-sm sm:text-base md:text-base tracking-[0] leading-5 sm:leading-6 md:leading-[22px]">
              {currentFeature.description}
            </p>
          </div>
        </div>
      </div>

      <div
        className="relative w-full max-w-[90vw] sm:max-w-[85vw] md:w-[1000px] overflow-visible"
      >

        {/* Main image varies by active feature */}
        <img className="w-full rounded-lg" alt={currentFeature.title} src={mainImageSrc} />
        
        {/* Generation Preview Component - Only for Text-to-Image and Text-to-Video */}
        {(currentFeature.id === "textToImage" || currentFeature.id === "textToVideo") && (
          <GenerationPreview
            thumbnailSrc={currentFeature.thumbnailSrc}
            prompt={currentFeature.prompt}
          />
        )}
        
        {/* Original badge for Image-to-Image and Image-to-Video */}
        {(currentFeature.id === "imageToImage" || currentFeature.id === "imageToVideo") && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <img src={badgeImageSrc} alt="Badge" className="h-20 sm:h-24 md:h-32 w-auto" />
          </div>
        )}
      </div>
    </section>
  );
};

export default Features;