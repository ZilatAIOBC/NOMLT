import React, { useEffect, useState } from 'react';
import VideoPlayer from '../../components/image-to-video/VideoPlayer';
import AudioUpload from '../../components/image-to-video/AudioUpload';
import TopHeader from '../../components/dashboard/TopHeader';
import HeaderBar from '../../components/dashboard/HeaderBar';
import RecentGenerations from '../../components/dashboard/RecentGenerations';
import { Sparkles, RefreshCw, Info } from 'lucide-react';
import IdeaChips from '../../components/common/IdeaChips';
import InsufficientCreditsModal from '../../components/dashboard/InsufficientCreditsModal';
import { callTextToVideoAPI, getTextToVideoResult, TextToVideoRequest } from '../../services/textToVideoService';
import { fetchUsageSummary } from '../../services/usageService';
import { useCreditCost } from '../../hooks/useCreditCost';
import { getCreditBalance } from '../../services/creditsService';

const TextToVideo: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<'832x480' | '480x832'>('832x480');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const duration = 5;
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
  const { cost: CREDIT_COST } = useCreditCost('text_to_video');

  // Current credits and approx runs
  const [currentCredits, setCurrentCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getCreditBalance();
        setCurrentCredits(data.balance);
      } catch {
        setCurrentCredits(0);
      }
    };
    fetchBalance();
  }, [creditRefreshTrigger]);

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
      // Optional audio upload
      let audioUrl: string | undefined = undefined;
      if (audioFile) {
        setGenerationProgress('Uploading audio...');
        const { uploadImageToUrl } = await import('../../services/imageToVideoService');
        audioUrl = await uploadImageToUrl(audioFile);
      }

      const requestBody: TextToVideoRequest = {
        duration: 5,
        enable_prompt_expansion: false,
        prompt: prompt,
        seed: seed === -1 ? undefined : seed,
        size: resolution,
        audio: audioUrl
      };
      
      // Step 2: Create the text-to-video generation job
      const createResult = await callTextToVideoAPI(requestBody);
      
      // Check if we got the dynamic result URL
      if (!createResult.data.urls?.get) {
        throw new Error('No result URL found in API response');
      }
      
      setGenerationProgress('Text-to-video generation in progress...');
      
      // Step 3: Get the result using the dynamic URL from first API response
      // This will poll until the video is ready
      const result = await getTextToVideoResult(createResult.data.urls.get);
      
      // Step 4: Extract video URL
      if (result.data.outputs && result.data.outputs.length > 0) {
        setGeneratedVideo(result.data.outputs[0]);
        setStatus('completed');
        setGenerationProgress('');
        
        // Refresh credit balance after successful generation
        setCreditRefreshTrigger(prev => prev + 1);
        
        // Fetch usage summary
        try {
          await fetchUsageSummary();
        } catch (e) {
          // Silently fail
        }
      } else {
        throw new Error('No video URL found in result outputs');
      }
    } catch (error: any) {
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

  const resolutionOptions = [
    { label: '832 x 480', value: '832x480' },
    { label: '480 x 832', value: '480x832' },
  ];

  return (
    <div className="ml-16 lg:ml-64 h-screen overflow-y-auto transition-all duration-300">
      <HeaderBar>
        <TopHeader creditRefreshTrigger={creditRefreshTrigger} />
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
                maxLength={2000}
                className="w-full h-32 xl:h-56 px-3 py-2 bg-[#0D131F] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none overflow-y-auto"
                style={{ '--tw-ring-color': '#8A3FFC' } as React.CSSProperties}
                placeholder="What do you want to create?"
              />
              <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-400">{prompt.length}/2000 characters</span>
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
            {/* Audio (Optional) */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Audio (Optional)</label>
              <div className="mt-2">
                <AudioUpload
                  file={audioFile}
                  onFileChange={(file) => setAudioFile(file)}
                  placeholder="https://example.com/audio.mp3"
                />
              </div>
            </div>

            {/* Resolution (WAN 2.5) */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Resolution
              </label>
              <div className="grid grid-cols-2 gap-2">
                {resolutionOptions.map((option) => {
                  const isSelected = resolution === (option.value as '832x480' | '480x832');
                  return (
                    <button
                      key={option.value}
                      onClick={() => setResolution(option.value as '832x480' | '480x832')}
                      className={`px-3 py-3 text-sm rounded-lg border transition-colors flex items-center justify-center ${
                        isSelected
                          ? 'text-white'
                          : 'border-gray-600 bg-[#0D131F] text-gray-300 hover:border-gray-500 hover:text-white'
                      }`}
                      style={{
                        backgroundColor: isSelected ? '#8A3FFC' : 'transparent',
                        borderColor: isSelected ? '#8A3FFC' : undefined
                      }}
                    >
                      <span className="text-xs">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration fixed to 5 seconds (hidden control) */}
            <input type="hidden" value={duration} readOnly />

            {/* Camera_fixed not supported/needed for WAN 2.5 */}

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
              <span className="text-white font-semibold">{CREDIT_COST} Credits</span>
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

            {/* Video Player */}
            <div className="flex-1">
              <VideoPlayer
                videoUrl={generatedVideo}
                status={status}
                duration={duration}
              />
            </div>

            {/* Scrollable bottom section on mobile */}
            <div className="space-y-4 overflow-y-auto xl:overflow-visible">
              {/* Cost Information (credits-based) */}
              <div className="bg-[#0D131F] border border-gray-700 rounded-lg p-4">
                <div className="text-sm text-white space-y-1">
                  <p>Your request will cost <span className="font-semibold" style={{ color: '#8A3FFC' }}>{CREDIT_COST}</span> credits.</p>
                  <p>
                    With <span className="font-semibold" style={{ color: '#8A3FFC' }}>{currentCredits?.toLocaleString() ?? '--'}</span> credits you can run this model approximately{' '}
                    <span className="font-semibold" style={{ color: '#8A3FFC' }}>
                      {currentCredits != null && CREDIT_COST > 0 ? Math.floor(currentCredits / CREDIT_COST).toLocaleString() : '--'}
                    </span>{' '}times.
                  </p>
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </div>

      {/* Recent Generations Section */}
      <RecentGenerations generationType="text-to-video" limit={10} />

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={insufficientCreditsModal.isOpen}
        onClose={() => setInsufficientCreditsModal({ ...insufficientCreditsModal, isOpen: false })}
        required={insufficientCreditsModal.required}
        current={insufficientCreditsModal.current}
        shortfall={insufficientCreditsModal.shortfall}
        generationType="text_to_video"
      />
    </div>
  );
};

export default TextToVideo;
