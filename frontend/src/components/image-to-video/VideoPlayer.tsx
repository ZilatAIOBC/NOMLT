import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string | null;
  status: 'idle' | 'generating' | 'completed';
  duration: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, status, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset when URL changes
    setVideoReady(false);

    // Configure for preloading
    video.preload = 'auto';

    const updateTime = () => setCurrentTime(video.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
    };

    // Only show video when it can play through completely
    const handleCanPlayThrough = () => {
      setVideoReady(true);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    const video = videoRef.current;
    if (video && !isMuted) {
      video.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden aspect-video"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {status === 'generating' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-sm">Generating video...</p>
          </div>
        </div>
      ) : status === 'completed' && videoUrl ? (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            style={{ opacity: videoReady ? 1 : 0 }}
          />
          {!videoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-white text-sm">Loading video...</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Play className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">No video generated yet</p>
            <p className="text-gray-500 text-xs mt-1">Upload an image and click Run to generate</p>
          </div>
        </div>
      )}

      {/* Video Controls Overlay */}
      {status === 'completed' && videoUrl && videoReady && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="p-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={videoDuration || duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${videoDuration ? (currentTime / videoDuration) * 100 : 0}%, #4b5563 ${videoDuration ? (currentTime / videoDuration) * 100 : 0}%, #4b5563 100%)`
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-1 text-white hover:bg-white/20 rounded transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(videoDuration || duration)}
                </span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VideoPlayer;
