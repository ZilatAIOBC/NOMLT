import React, { useState } from 'react';
import VideoPlayer from '../../components/image-to-video/VideoPlayer';
import TopHeader from '../../components/dashboard/TopHeader';
import HeaderBar from '../../components/dashboard/HeaderBar';
import ExamplesGrid from '../../components/dashboard/ExamplesGrid';
import { Sparkles, RefreshCw, Info, Mic, Video, Wand2 } from 'lucide-react';
import IdeaChips from '../../components/common/IdeaChips';
import { callTextToVideoAPI, getTextToVideoResult, TextToVideoRequest } from '../../services/textToVideoService';
import { fetchUsageSummary } from '../../services/usageService';

const TextToVideo: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [duration, setDuration] = useState(5);
  const [cameraFixed, setCameraFixed] = useState(false);
  const [seed, setSeed] = useState(-1);
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed'>('idle');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState('');

  const handleRun = async () => {
    if (!prompt) {
      setError('Please enter a prompt');
      return;
    }

    setStatus('generating');
    setError(null);
    setGenerationProgress('Creating text-to-video job...');

    try {
      // Step 1: Prepare request body with correct structure
      const requestBody: TextToVideoRequest = {
        aspect_ratio: aspectRatio,
        camera_fixed: cameraFixed,
        duration: duration,
        prompt: prompt,
        seed: seed === -1 ? undefined : seed
      };
      
      console.log('Text-to-Video Request Body:', JSON.stringify(requestBody, null, 2));
      
      // Step 2: Create the text-to-video generation job
      const createResult = await callTextToVideoAPI(requestBody);
      
      // Check if we got the dynamic result URL
      if (!createResult.data.urls?.get) {
        throw new Error('No result URL found in API response');
      }
      
      console.log('Text-to-Video Result URL:', createResult.data.urls.get);
      setGenerationProgress('Text-to-video generation in progress...');
      
      // Step 3: Get the result using the dynamic URL from first API response
      // This will poll until the video is ready
      const result = await getTextToVideoResult(createResult.data.urls.get);
      
      // Step 4: Extract video URL
      if (result.data.outputs && result.data.outputs.length > 0) {
        console.log('Text-to-Video Final URL:', result.data.outputs[0]);
        console.log('Text-to-Video Full Response:', result);
        
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
        // Fetch and log usage summary for the current user (text-to-video key will be included)
        try {
          const summary = await fetchUsageSummary();
          console.log('Usage summary after text-to-video generation:', summary);
        } catch (e) {
          console.warn('Failed to fetch usage summary:', e);
        }
      } else {
        throw new Error('No video URL found in result outputs');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate video');
      setStatus('idle');
      setGenerationProgress('');
    }
  };


  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const aspectRatioOptions = [
    { label: '1:1', value: '1:1' },
    { label: '16:9', value: '16:9' },
    { label: '4:3', value: '4:3' },
    { label: '3:4', value: '3:4' },
    { label: '9:16', value: '9:16' },
    { label: '21:9', value: '21:9' },
    { label: '9:21', value: '9:21' },
  ];

  return (
    <div className="ml-16 lg:ml-64 h-screen overflow-y-auto transition-all duration-300">
      <HeaderBar>
        <TopHeader />
      </HeaderBar>
      
      <div className="flex flex-col xl:flex-row min-h-[calc(100vh-80px)] pt-24">
        {/* Left Panel - Input and Controls */}
        <div className="p-4 sm:p-6 pt-6 w-full xl:w-auto xl:flex-shrink-0">
          <div className="w-full xl:max-w-md xl:mx-0 space-y-6">
          <h1 className="text-2xl font-bold text-white mb-6">Text to Video AI</h1>
          
           {/* Main Card Container - Fixed height with scroll on mobile */}
           <div className="border border-[#25202D] rounded-lg p-4 space-y-6 h-[60vh] xl:h-auto overflow-y-auto xl:overflow-visible">
            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={200}
                className="w-full h-32 xl:h-56 px-3 py-2 bg-[#0D131F] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                style={{ '--tw-ring-color': '#8A3FFC' } as React.CSSProperties}
                placeholder="What do you want to create?"
              />
              <div className="flex justify-end mt-2">
                <span className="text-xs text-gray-400">{prompt.length}/200</span>
              </div>
            </div>

            {/* Ideas */}
            <div>
              <p className="text-sm text-gray-300 mb-2">Ideas:</p>
              <IdeaChips
                ideas={['Nighttime Musician', 'Mountain Dog', 'City Cat', 'Blooming Blur']}
                onSelect={setPrompt}
              />
            </div>
            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {aspectRatioOptions.map((option) => {
                  const [width, height] = option.value.split(':').map(Number);
                  const isSelected = aspectRatio === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setAspectRatio(option.value)}
                      className={`px-3 py-3 text-sm rounded-lg border transition-colors flex flex-col items-center justify-center gap-2 ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500 text-white'
                          : 'border-gray-600 bg-[#0D131F] text-gray-300 hover:border-gray-500 hover:text-white'
                      }`}
                    >
                      <div 
                        className={`rounded-sm ${
                          isSelected ? 'bg-white' : 'bg-gray-400'
                        }`}
                        style={{
                          width: `${Math.min(width * 3, 20)}px`,
                          height: `${Math.min(height * 3, 20)}px`
                        }}
                      ></div>
                      <span className="text-xs">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Duration *
              </label>
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
                  onClick={() => setDuration(10)}
                  className={`px-4 py-3 text-sm rounded-lg border transition-colors ${
                    duration === 10
                      ? 'text-white'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: duration === 10 ? '#8A3FFC' : 'transparent',
                    borderColor: duration === 10 ? '#8A3FFC' : undefined
                  }}
                >
                  10s
                </button>
              </div>
            </div>

            {/* Camera Fixed */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Camera_fixed
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cameraFixed"
                  checked={cameraFixed}
                  onChange={(e) => setCameraFixed(e.target.checked)}
                  className="w-4 h-4 bg-gray-800 border-gray-600 rounded focus:ring-2"
                  style={{ 
                    color: '#8A3FFC',
                    '--tw-ring-color': '#8A3FFC'
                  } as React.CSSProperties}
                />
                <label htmlFor="cameraFixed" className="text-sm text-gray-300">
                  Whether to fix the camera position.
                </label>
              </div>
            </div>

            {/* Seed */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Seed
              </label>
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

            {/* Credits Required */}
            <div className="flex items-center justify-between text-sm text-white">
              <div className="flex items-center gap-2">
                <img src="/credit.svg" alt="Credits" className="w-4 h-4" />
                <span>Credits required:</span>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-white font-semibold">3 Credits</span>
            </div>

            {/* Create Button */}
            <div className="pt-4 pb-10">
              <button
                onClick={handleRun}
                disabled={status === 'generating' || !prompt}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:bg-gray-600"
                style={{
                  backgroundColor: status === 'generating' || !prompt ? '#6B7280' : '#8A3FFC'
                }}
                onMouseEnter={(e) => {
                  if (status !== 'generating' && prompt) {
                    e.currentTarget.style.backgroundColor = '#7C3AED';
                  }
                }}
                onMouseLeave={(e) => {
                  if (status !== 'generating' && prompt) {
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

            {/* Video Player */}+
            <div className="flex-1">
              <VideoPlayer
                videoUrl={generatedVideo}
                status={status}
                duration={duration}
              />
            </div>

            {/* Scrollable bottom section on mobile */}
            <div className="space-y-4 overflow-y-auto xl:overflow-visible">
              {/* Cost Information */}
              <div className="bg-[#0D131F] border border-gray-700 rounded-lg p-4">
                <div className="text-sm text-white space-y-1">
                  <p>Your request will cost <span className="font-semibold" style={{ color: '#8A3FFC' }}>$0.3</span> per run.</p>
                  <p>For $10 you can run this model approximately <span className="font-semibold" style={{ color: '#8A3FFC' }}>33</span> times.</p>
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
      </div>

      {/* Examples Section */}
      <ExamplesGrid />
    </div>
  );
};

export default TextToVideo;
