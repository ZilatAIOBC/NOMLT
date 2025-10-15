import React, { useState } from 'react';
import ImageUpload from '../../components/image-to-video/ImageUpload';
import VideoPlayer from '../../components/image-to-video/VideoPlayer';

import TopHeader from '../../components/dashboard/TopHeader';
import HeaderBar from '../../components/dashboard/HeaderBar';
import RecentGenerations from '../../components/dashboard/RecentGenerations';
import { RefreshCw, Sparkles, Mic, Video, Wand2, Info } from 'lucide-react';
import IdeaChips from '../../components/common/IdeaChips';
import InsufficientCreditsModal from '../../components/dashboard/InsufficientCreditsModal';
import { callImageToVideoAPI, getImageToVideoResult, uploadImageToUrl, ImageToVideoRequest } from '../../services/imageToVideoService';
import { fetchUsageSummary } from '../../services/usageService';
import { useCreditCost } from '../../hooks/useCreditCost';

const ImageToVideo: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt] = useState('');
  const [lastImage] = useState('');
  const [duration, setDuration] = useState(5);
  const [seed, setSeed] = useState(-1);
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed'>('idle');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState('');
  
  // Credit system states
  const [creditRefreshTrigger, setCreditRefreshTrigger] = useState(0);
  const [insufficientCreditsModal, setInsufficientCreditsModal] = useState<{
    isOpen: boolean;
    required: number;
    current: number;
    shortfall: number;
  }>({
    isOpen: false,
    required: 0,
    current: 0,
    shortfall: 0
  });

  // Fetch dynamic credit cost from database
  const { cost: CREDIT_COST } = useCreditCost('image_to_video');

  const handleRun = async () => {
    if (!imageFile || !prompt) {
      setError('Please upload an image and enter a prompt');
      return;
    }

    setStatus('generating');
    setError(null);
    setGenerationProgress('Uploading image...');

    try {
      // Step 1: Upload image and get URL
      const imageUrl = await uploadImageToUrl(imageFile);
      setGenerationProgress('Image uploaded, creating video job...');
      
      // Step 2: Prepare request body with correct structure
      const requestBody: ImageToVideoRequest = {
        duration: duration,
        image: imageUrl,
        last_image: lastImage,
        negative_prompt: negativePrompt,
        prompt: prompt,
        seed: seed === -1 ? Math.floor(Math.random() * 1000000) : seed
      };
      console.log('Image-to-Video Request Body:', JSON.stringify(requestBody, null, 2));
      
      // Step 3: Create the video generation job
      const createResult = await callImageToVideoAPI(requestBody);
      
      // Check if we got the dynamic result URL
      if (!createResult.data.urls?.get) {
        throw new Error('No result URL found in API response');
      }
      
      console.log('Image-to-Video Result URL:', createResult.data.urls.get);
      setGenerationProgress('Video generation in progress...');
      
      // Step 4: Get the result using the dynamic URL from first API response
      // This will poll until the video is ready
      const result = await getImageToVideoResult(createResult.data.urls.get);
      
      // Step 5: Extract video URL
      if (result.data.outputs && result.data.outputs.length > 0) {
        console.log('Image-to-Video Final URL:', result.data.outputs[0]);
        console.log('Image-to-Video Full Response:', result);
        
        // Check if we got S3 generation info (optional logging)
        const s3Info = (result as any).generation;
        if (s3Info) {
          console.log('S3 Generation Info:', s3Info);
          console.log('S3 URL:', s3Info.s3Url);
          console.log('Generation ID:', s3Info.id);
        }
        
        setGeneratedVideo(result.data.outputs[0]);
        setStatus('completed');
        setGenerationProgress('');
        
        // Refresh credit balance after successful generation
        setCreditRefreshTrigger(prev => prev + 1);
        
        // Fetch and log enhanced usage summary
        try {
          const summary = await fetchUsageSummary();
          console.log('📊 Usage Summary (Image-to-Video):', summary);
          console.log('💰 Credit Balance:', summary.credit_balance);
          console.log('📈 Credits Spent by Type:', summary.credits_spent_by_type);
    
       
        } catch (e) {
          console.warn('Failed to fetch usage summary:', e);
        }
      } else {
        throw new Error('No video URL found in result outputs');
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      
      // Handle insufficient credits error (402)
      if (error.response?.status === 402 || error.message?.includes('Insufficient credits')) {
        const errorData = error.response?.data;
        setInsufficientCreditsModal({
          isOpen: true,
          required: errorData?.details?.required || CREDIT_COST,
          current: errorData?.details?.currentBalance || 0,
          shortfall: errorData?.details?.shortfall || CREDIT_COST
        });
        setError('');
      } else {
        setError(error instanceof Error ? error.message : 'Failed to generate video');
      }
      
      setStatus('idle');
      setGenerationProgress('');
    }
  };

  

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  return (
    <>
    <div className="ml-16 lg:ml-64 h-screen overflow-y-auto transition-all duration-300">
      <HeaderBar>
        <TopHeader creditRefreshTrigger={creditRefreshTrigger} />
      </HeaderBar>

      <div className="flex flex-col xl:flex-row min-h-[calc(100vh-80px)] pt-24">
        {/* Left Panel - Input and Controls */}
        <div className="p-4 sm:p-6 pt-6 w-full xl:w-auto xl:flex-shrink-0">
          <div className="w-full xl:max-w-md xl:mx-0 space-y-6">
            <h1 className="text-2xl font-bold text-white mb-6">Image to Video</h1>
            
            {/* Main Card Container - Fixed height with scroll on mobile */}
            <div className="border border-[#25202D] rounded-lg p-4 space-y-6 h-[60vh] xl:h-auto overflow-y-auto xl:overflow-visible">
              {/* Image Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Image *</label>
                <ImageUpload
                  file={imageFile}
                  onFileChange={setImageFile}
                  placeholder="https://d1q70pf5vjeyhc.cloudfront.net/media/fb8f67"
                />
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Prompt *</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={200}
                  className="w-full h-32 xl:h-56 px-3 py-2 bg-[#0D131F] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  style={{ '--tw-ring-color': '#8A3FFC' } as React.CSSProperties}
                  placeholder="Describe the motion and scene for your video"
                />
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-gray-400">{prompt.length}/200</span>
                </div>
                {/* Ideas */}
                <div className="mt-3">
                  <p className="text-sm text-gray-300 mb-2">Ideas:</p>
                  <IdeaChips
                    ideas={["A drone flying over mountains", "City timelapse at night", "Ocean waves close-up", "Running dog in park"]}
                    onSelect={setPrompt}
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Duration *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDuration(5)}
                    className={`px-4 py-3 text-sm rounded-lg border transition-colors ${
                      duration === 5
                        ? 'text-white'
                        : 'border-gray-600 bg-[#0D131F] text-gray-300 hover:border-gray-500 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: duration === 5 ? '#8A3FFC' : 'transparent',
                      borderColor: duration === 5 ? '#8A3FFC' : undefined
                    }}
                  >
                    5s
                  </button>
                  <button
                    onClick={() => setDuration(8)}
                    className={`px-4 py-3 text-sm rounded-lg border transition-colors ${
                      duration === 8
                        ? 'text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: duration === 8 ? '#8A3FFC' : 'transparent',
                      borderColor: duration === 8 ? '#8A3FFC' : undefined
                    }}
                  >
                    8s
                  </button>
                </div>
              </div>

              {/* Seed */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Seed</label>
                <div className="relative">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0D131F] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#8A3FFC' } as React.CSSProperties}
                  />
                  <button
                    onClick={generateRandomSeed}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Credits Required */}
              <div className="flex items-center justify-between text-sm text-white">
                <div className="flex items-center gap-2">
                  <img src="/credit.svg" alt="Credits" className="w-4 h-4" />
                  <span>Credits required:</span>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-white font-semibold">{CREDIT_COST} Credits</span>
              </div>

              {/* Action Buttons */}
              <div className="flex pt-2">
                <button
                  onClick={handleRun}
                  disabled={status === 'generating' || !imageFile || !prompt}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:bg-gray-600"
                  style={{
                    backgroundColor: status === 'generating' || !imageFile || !prompt ? '#6B7280' : '#8A3FFC'
                  }}
                  onMouseEnter={(e) => {
                    if (!(status === 'generating' || !imageFile || !prompt)) {
                      e.currentTarget.style.backgroundColor = '#7C3AED';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(status === 'generating' || !imageFile || !prompt)) {
                      e.currentTarget.style.backgroundColor = '#8A3FFC';
                    }
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                  {status === 'generating' ? 'Generating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Video Output */}
        <div className="flex-1 p-4 sm:p-6 pt-6 xl:pt-20 w-full h-[40vh] xl:h-auto">
          <div className="max-w-2xl mx-auto xl:max-w-none xl:mx-0 space-y-6 border border-[#25202D] rounded-lg p-4 h-full flex flex-col">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg overflow-hidden">
                <p className="text-red-400 text-sm break-words">{error}</p>
              </div>
            )}

            {/* Generation Progress */}
            {generationProgress && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg overflow-hidden">
                <p className="text-purple-400 text-sm break-words">{generationProgress}</p>
              </div>
            )}

            {/* Video Player */}
            <div className="flex-1">
              <VideoPlayer
                videoUrl={generatedVideo}
                status={status}
                duration={duration}
              />
            </div>

            {/* Cost Information */}
            <div className="bg-[#0D131F] border border-gray-700 rounded-lg p-4">
              <div className="text-sm text-white space-y-1">
                <p>Your request will cost <span className="font-semibold" style={{ color: '#8A3FFC' }}>$0.15</span> per run.</p>
                <p>For $10 you can run this model approximately <span className="font-semibold" style={{ color: '#8A3FFC' }}>66</span> times.</p>
              </div>
            </div>

          {/* Separator Line */}
          <div className="border-t border-gray-700"></div>

          {/* One More Thing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">One More Thing:</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
                style={{ backgroundColor: '#8A3FFC' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8A3FFC'}
              >
                <Mic className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Add Sound</span>
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
                style={{ backgroundColor: '#8A3FFC' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8A3FFC'}
              >
                <Video className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Video Upscaler</span>
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
                style={{ backgroundColor: '#8A3FFC' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8A3FFC'}
              >
                <Wand2 className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Video Upscaler Pro</span>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Recent Generations Section */}
      <RecentGenerations generationType="image-to-video" limit={10} />

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={insufficientCreditsModal.isOpen}
        onClose={() => setInsufficientCreditsModal({ ...insufficientCreditsModal, isOpen: false })}
        required={insufficientCreditsModal.required}
        current={insufficientCreditsModal.current}
        shortfall={insufficientCreditsModal.shortfall}
        generationType="image_to_video"
      />
    </div>
    </>
  );
};

export default ImageToVideo;

