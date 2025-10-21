
import { Separator } from "../ui/separator";
import { useEffect, useState } from "react";

interface FeatureData {
  id: string;
  title: string;
  description: string;
}

const featuresData: FeatureData[] = [
  {
    id: "imageToImage",
    title: "Image to Image",
    description: "Take any picture and push it further than you thought possible. Subtitle edits? Perfectly lifelike. Radical remaining? Just as convincing."
  },
  {
    id: "imageToVideo",
    title: "Image to Video",
    description: "Transform static images into dynamic videos with advanced AI technology. Add motion, effects, and cinematic quality to your visuals."
  },
  {
    id: "textToImage",
    title: "Text to Image",
    description: "Transform your ideas into stunning visuals with AI-powered text-to-image generation. Create unique artwork and designs effortlessly."
  },
  {
    id: "textToVideo",
    title: "Text to Video",
    description: "Bring your stories to life with AI-generated videos from text descriptions. Create dynamic content, animations, and visual narratives effortlessly."
  }
];

const Features = (): JSX.Element => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
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

  // Autoplay: advance every 5s, pause when hovered
  useEffect(() => {
    if (isHovered) return;
    const intervalId = setInterval(() => {
      setActiveFeature((prev) => (prev === featuresData.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(intervalId);
  }, [isHovered]);

  // Manual nav removed; autoplay handles progression

  return (
    <section id="features" className="flex flex-col w-full items-center pt-48 pb-32 px-20 bg-black">
      {/* Our Features heading with decorative arrows */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="w-16 h-px opacity-50 bg-gradient-to-r from-[#0F0F0F] to-[#9333EA]"></div>
        <h3 className="text-white text-sm font-medium tracking-[0.1em] uppercase">
          Our Features
        </h3>
        <div className="w-16 h-px bg-gradient-to-l from-[#0F0F0F] to-[#9333EA]"></div>
      </div>

      <div className="inline-flex flex-col items-start pt-0 pb-8 px-0">
        <div className="inline-flex items-center justify-center gap-10">
          <div className="inline-flex flex-col items-start">
            <h2 className="[font-family:'Microsoft_YaHei-Regular',Helvetica] font-normal text-white text-[47.6px] tracking-[0] leading-[72px] whitespace-nowrap">
              {currentFeature.title}
            </h2>
          </div>

          <Separator
            orientation="vertical"
            className="w-0.5 h-[50px] bg-white opacity-[0.24]"
          />

          <div className="flex flex-col w-[405px] items-start opacity-65">
            <p className="w-[390px] [font-family:'Microsoft_YaHei-Regular',Helvetica] font-normal text-white text-base tracking-[0] leading-[22px]">
              {currentFeature.description}
            </p>
          </div>
        </div>
      </div>

      <div
        className="relative w-[1000px] overflow-visible"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        {/* Main image varies by active feature */}
        <img className="w-full rounded-lg" alt={currentFeature.title} src={mainImageSrc} />
        
        {/* Bottom badge varies by feature (we2 for textToImage/textToVideo) */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <img src={badgeImageSrc} alt="Badge" className="h-32 w-auto" />
        </div>
      </div>
    </section>
  );
};

export default Features;