import React from "react";

interface SimpleVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  src,
  poster,
  className,
  autoPlay = false,
  muted = true,
  loop = false,
}) => {
  return (
    <video
      className={className}
      src={src}
      poster={poster}
      controls
      playsInline
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
    />
  );
};

export default SimpleVideoPlayer;


