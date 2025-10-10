import React, { useState } from 'react';
import ImageUpload from '../../components/image-to-video/ImageUpload';
import TopHeader from '../../components/dashboard/TopHeader';
import HeaderBar from '../../components/dashboard/HeaderBar';
import ImageExamplesGrid from '../../components/dashboard/ImageExamplesGrid';
import { Sparkles, Mic, Video, Wand2, Info } from 'lucide-react';
import IdeaChips from '../../components/common/IdeaChips';
import CreditCostBadge from '../../components/dashboard/CreditCostBadge';
import InsufficientCreditsModal from '../../components/dashboard/InsufficientCreditsModal';
import { callImageToImageAPI, getImageToImageResult, uploadImageToUrl, ImageToImageRequest } from '../../services/imageToImageService';
import { fetchUsageSummary } from '../../services/usageService';

const ImageToImage: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');

  // These values are always false for image-to-image conversion
  const enableBase64Output = false;
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed'>('idle');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState('');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  
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

  const CREDIT_COST = 30; // Image-to-image costs 30 credits
  
  // Minimum total pixels required by API (e.g., 921,600 = 960x960)
  const MIN_TOTAL_PIXELS = 921600;
  const MAX_SIDE = 2048;
  const STEP = 8;

  const roundToStep = (value: number) => Math.round(value / STEP) * STEP;

  const computeNormalizedSize = (w: number, h: number) => {
    // Clamp to allowed side limits first
    let newW = Math.max(256, Math.min(MAX_SIDE, roundToStep(w)));
    let newH = Math.max(256, Math.min(MAX_SIDE, roundToStep(h)));

    const total = newW * newH;
    if (total >= MIN_TOTAL_PIXELS) {
      return { width: newW, height: newH, adjusted: newW !== w || newH !== h };
    }

    // Scale up preserving aspect ratio
    const scale = Math.sqrt(MIN_TOTAL_PIXELS / (newW * newH));
    newW = Math.min(MAX_SIDE, roundToStep(newW * scale));
    newH = Math.min(MAX_SIDE, roundToStep(newH * scale));

    // If rounding caused us to dip below, ensure product meets minimum by bumping the larger side
    let attempts = 0;
    while (newW * newH < MIN_TOTAL_PIXELS && attempts < 10) {
      if (newW >= newH && newW + STEP <= MAX_SIDE) newW += STEP; else if (newH + STEP <= MAX_SIDE) newH += STEP; else break;
      attempts++;
    }

    return { width: newW, height: newH, adjusted: newW !== w || newH !== h };
  };

  const handleRun = async () => {
    if (!imageFile || !prompt) {
      setError('Please upload an image and enter a prompt');
      return;
    }

    // Validate image file type
    if (!imageFile.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setStatus('generating');
    setError(null);
    setGenerationProgress('Uploading image...');

    try {
      // Step 1: Upload image and get URL
      const imageUrl = await uploadImageToUrl(imageFile);
      setGenerationProgress('Image uploaded, creating image job...');
      
      // Normalize size to satisfy provider constraints
      const normalized = computeNormalizedSize(width, height);

      // Step 2: Prepare request body with correct structure
      const requestBody: ImageToImageRequest = {
        enable_base64_output: enableBase64Output,
        enable_sync_mode: false, // Always false as per requirements
        images: [imageUrl],
        prompt: prompt,
        size: `${normalized.width}*${normalized.height}` // Enforce minimum total pixels and step size
      };
      
      console.log('Image-to-Image Request Body:', JSON.stringify(requestBody, null, 2));
      
      // Step 3: Create the image generation job
      const createResult = await callImageToImageAPI(requestBody);
      
      // Check if we got the dynamic result URL
      if (!createResult.data.urls?.get) {
        throw new Error('No result URL found in API response');
      }
      
      setGenerationProgress('Image generation in progress...');
      
      // Step 4: Get the result using the dynamic URL from first API response
      // This will poll until the image is ready
      const result = await getImageToImageResult(createResult.data.urls.get);
      
      // Step 5: Extract image URL
      if (result.data.outputs && result.data.outputs.length > 0) {
        console.log('Final image URL:', result.data.outputs[0]);
        console.log('Image-to-Image Full Response:', result);
        
        // Check if we got S3 generation info (optional logging)
        const s3Info = (result as any).generation;
        if (s3Info) {
          console.log('S3 Generation Info:', s3Info);
          console.log('S3 URL:', s3Info.s3Url);
          console.log('Generation ID:', s3Info.id);
        }
        
        setGeneratedImage(result.data.outputs[0]);
        setStatus('completed');
        setGenerationProgress('');
        
        // Refresh credit balance after successful generation
        setCreditRefreshTrigger(prev => prev + 1);
        
        // Fetch and log enhanced usage summary
        try {
          const summary = await fetchUsageSummary();
          console.log('📊 Usage Summary (Image-to-Image):', summary);
          console.log('💰 Credit Balance:', summary.credit_balance);
          console.log('📈 Credits Spent by Type:', summary.credits_spent_by_type);
          
          
        } catch (e) {
          console.warn('Failed to fetch usage summary:', e);
        }
      } else {
        throw new Error('No image URL found in result outputs');
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
        setError(error instanceof Error ? error.message : 'Failed to generate image');
      }
      
      setStatus('idle');
      setGenerationProgress('');
    }
  };



  return (
    <div className="ml-16 lg:ml-64 h-screen overflow-y-auto transition-all duration-300">
      <HeaderBar>
        <TopHeader creditRefreshTrigger={creditRefreshTrigger} />
      </HeaderBar>

      <div className="flex flex-col xl:flex-row min-h-[calc(100vh-80px)] pt-24">
        {/* Left Panel - Input and Controls */}
        <div className="p-4 sm:p-6 pt-6 w-full xl:w-auto xl:flex-shrink-0">
          <div className="w-full xl:max-w-md xl:mx-0 space-y-6">
            <h1 className="text-2xl font-bold text-white mb-6">Image to Image</h1>
            
            {/* Main Card Container - Fixed height with scroll on mobile */}
            <div className="border border-[#25202D] rounded-lg p-4 space-y-6 h-[60vh] xl:h-auto overflow-y-auto xl:overflow-visible">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Prompt *</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={200}
                  className="w-full h-32 xl:h-56 px-3 py-2 bg-[#0D131F] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  style={{ '--tw-ring-color': '#8A3FFC' } as React.CSSProperties}
                  placeholder="Replace the stick in the girl's hand with a flame."
                />
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-gray-400">{prompt.length}/200</span>
                </div>
              </div>

              {/* Ideas */}
              <div>
                <p className="text-sm text-gray-300 mb-2">Ideas:</p>
                <IdeaChips
                  ideas={['Replace the stick with a flame', 'Change the background to sunset', 'Add magical effects', 'Transform into a painting']}
                  onSelect={setPrompt}
                />
              </div>

              {/* Image Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Image *</label>
                <ImageUpload
                  file={imageFile}
                  onFileChange={setImageFile}
                  placeholder="https://d1q70pf5vjeyhc.cloudfront.net/media/fl"
                />
              </div>

              {/* Size Controls */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Size</label>
                {/* Width row */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Width</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={256}
                      max={2048}
                      step={8}
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="flex-1 accent-purple-500 h-2"
                    />
                    <input
                      type="number"
                      className="w-24 px-2 py-1 bg-[#0D131F] border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#8A3FFC' } as React.CSSProperties}
                      min={256}
                      max={2048}
                      step={8}
                      value={width}
                      onChange={(e) => setWidth(Math.max(256, Math.min(2048, Number(e.target.value) || 0)))}
                    />
                  </div>
                </div>
                {/* Height row */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Height</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={256}
                      max={2048}
                      step={8}
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="flex-1 accent-purple-500 h-2"
                    />
                    <input
                      type="number"
                      className="w-24 px-2 py-1 bg-[#0D131F] border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#8A3FFC' } as React.CSSProperties}
                      min={256}
                      max={2048}
                      step={8}
                      value={height}
                      onChange={(e) => setHeight(Math.max(256, Math.min(2048, Number(e.target.value) || 0)))}
                    />
                  </div>
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
                <span className="text-white font-semibold">1 Credit</span>
              </div>

              {/* Credit Cost Badge */}
              <div className="flex justify-center">
                <CreditCostBadge cost={CREDIT_COST} />
              </div>

              {/* Create Button */}
              <div className="pt-4 pb-10">
                <button
                  onClick={handleRun}
                  disabled={status === 'generating' || !imageFile || !prompt}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:bg-gray-600"
                  style={{
                    backgroundColor: status === 'generating' || !imageFile || !prompt ? '#6B7280' : '#8A3FFC'
                  }}
                  onMouseEnter={(e) => {
                    if (status !== 'generating' && imageFile && prompt) {
                      e.currentTarget.style.backgroundColor = '#7C3AED';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (status !== 'generating' && imageFile && prompt) {
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

        {/* Right Panel - Image Output */}
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

            {/* Generated Image */}
            <div className="flex-1 flex items-center justify-center lg:block xl:block">
              {status === 'generating' ? (
                <div className="w-full max-w-md lg:max-w-none lg:w-full lg:h-full xl:max-w-none xl:w-full xl:h-full aspect-square lg:aspect-auto xl:aspect-auto bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-sm">Generating image...</p>
                  </div>
                </div>
              ) : status === 'completed' && generatedImage ? (
                <div className="w-full max-w-2xl lg:max-w-none xl:max-w-none">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <div className="w-full max-w-md lg:max-w-none lg:w-full lg:h-full xl:max-w-none xl:w-full xl:h-full aspect-square lg:aspect-auto xl:aspect-auto bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">No image generated yet</p>
                    <p className="text-gray-500 text-xs mt-1">Enter a prompt and click Create</p>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable bottom section on mobile */}
            <div className="space-y-4 overflow-y-auto xl:overflow-visible">
              {/* Cost Information */}
              <div className="bg-[#0D131F] border border-gray-700 rounded-lg p-4">
                <div className="text-sm text-white space-y-1">
                  <p>Your request will cost <span className="font-semibold" style={{ color: '#8A3FFC' }}>$0.038</span> per run.</p>
                  <p>For $1 you can run this model approximately <span className="font-semibold" style={{ color: '#8A3FFC' }}>26</span> times.</p>
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
      <ImageExamplesGrid />

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={insufficientCreditsModal.isOpen}
        onClose={() => setInsufficientCreditsModal({ ...insufficientCreditsModal, isOpen: false })}
        required={insufficientCreditsModal.required}
        current={insufficientCreditsModal.current}
        shortfall={insufficientCreditsModal.shortfall}
        generationType="image_to_image"
      />
    </div>
  );
};

export default ImageToImage;
