// Frontend client that calls our backend image-to-video API
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || ""; // same-origin by default

function getSupabaseAccessToken(): string | undefined {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (/^sb-.*-auth-token$/.test(key)) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.access_token) return parsed.access_token as string;
      }
    }
    const sbSimple = localStorage.getItem('sb-access-token');
    if (sbSimple) return sbSimple;
    const custom = localStorage.getItem('accessToken');
    if (custom) return custom;
  } catch (_) {}
  return undefined;
}

export interface ImageToVideoRequest {
  duration: number;
  image: string;
  last_image: string;
  negative_prompt: string;
  prompt: string;
  seed: number;
}

export interface ImageToVideoCreateResponse {
  code: number;
  message: string;
  data: {
    created_at: string;
    error: string;
    executionTime: number;
    has_nsfw_contents: any[];
    id: string;
    model: string;
    outputs: any[];
    status: string;
    timings: {
      inference: number;
    };
    urls: {
      get: string; // Dynamic URL from API response
    };
  };
}

export interface ImageToVideoResultResponse {
  code: number;
  message: string;
  data: {
    created_at: string;
    error: string;
    executionTime: number;
    has_nsfw_contents: any[];
    id: string;
    model: string;
    outputs: string[]; // This should contain the video URL
    status: string;
    timings: {
      inference: number;
    };
  };
}

// Step 1: Create the image-to-video generation job via backend
export const createImageToVideoJob = async (
  requestBody: ImageToVideoRequest
): Promise<ImageToVideoCreateResponse> => {
  const url = `${BACKEND_BASE_URL}/api/image-to-video`;
  
  console.log('Frontend: Creating image-to-video job via backend');
  console.log('Frontend: Request URL:', url);
  console.log('Frontend: Request body:', JSON.stringify(requestBody, null, 2));

  const token = getSupabaseAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  console.log('Frontend: Image-to-Video headers set:', Object.keys(headers));

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    credentials: 'include',
  });

  console.log('Frontend: Backend response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Frontend: Backend request failed:', errorText);
    throw new Error(`Backend request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = (await response.json()) as ImageToVideoCreateResponse;
  console.log('Frontend: Backend create job response:', JSON.stringify(data, null, 2));
  
  if (!data?.data?.urls?.get) {
    console.error('Frontend: Invalid backend response structure:', data);
    throw new Error('Invalid backend response: missing result URL');
  }
  
  console.log('Frontend: Result URL received:', data.data.urls.get);
  return data;
};

// Step 2: Poll the result via backend (backend calls provider)
export const getImageToVideoResult = async (
  resultUrl: string,
  maxAttempts: number = 40,
  intervalMs: number = 6000
): Promise<ImageToVideoResultResponse> => {
  console.log('Frontend: Starting image-to-video result polling');
  console.log('Frontend: Result URL:', resultUrl);
  console.log('Frontend: Max attempts:', maxAttempts, 'Interval:', intervalMs, 'ms');
  
  let attempts = 0;

  while (attempts < maxAttempts) {
    const url = `${BACKEND_BASE_URL}/api/image-to-video/result?url=${encodeURIComponent(resultUrl)}`;
    
    console.log(`Frontend: Poll attempt ${attempts + 1}/${maxAttempts}`);
    console.log('Frontend: Polling URL:', url);

    const token = getSupabaseAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { method: 'GET', headers, credentials: 'include' });

    console.log(`Frontend: Poll attempt ${attempts + 1} response status:`, response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Frontend: Poll attempt ${attempts + 1} failed:`, errorText);
      throw new Error(`Backend result failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = (await response.json()) as any;
    const status = data?.data?.status;
    
    console.log(`Frontend: Poll attempt ${attempts + 1} - Status: ${status}`);
    console.log('Frontend: Poll response data:', JSON.stringify(data, null, 2));

    if (status === 'succeeded' || status === 'completed') {
      console.log('Frontend: Image-to-video generation completed successfully!');
      
      // Check if this is our new S3 response format with generation info
      if (data.success && data.generation) {
        console.log('Frontend: Received S3-enhanced response');
        // Transform our S3 response to match expected format
        return {
          code: data.code || 200,
          message: data.message || 'Success',
          data: {
            ...data.data,
            // Convert single output to outputs array for compatibility
            outputs: data.data.output ? [data.data.output] : []
          }
        } as ImageToVideoResultResponse;
      }
      
      console.log('Frontend: Final outputs:', data.data.outputs);
      // Original AI provider response format
      return data as ImageToVideoResultResponse;
    }
    if (status === 'failed') {
      const err = data?.data?.error || 'Unknown error';
      console.error('Frontend: Image-to-video generation failed:', err);
      throw new Error(`Image-to-video generation failed: ${err}`);
    }

    console.log(`Frontend: Image-to-video still ${status}, waiting ${intervalMs}ms before next check...`);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  console.error('Frontend: Image-to-video generation timed out - maximum attempts reached');
  throw new Error('Image-to-video generation timed out - maximum attempts reached');
};

// Backward-compatible alias for existing call sites
export const callImageToVideoAPI = (
  requestBody: ImageToVideoRequest
): Promise<ImageToVideoCreateResponse> => createImageToVideoJob(requestBody);

// Helper function to convert file to data URL for API
export const uploadImageToUrl = async (file: File): Promise<string> => {
  try {
    console.log('Frontend: Converting file to data URL:', file.name, file.size, 'bytes');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const dataUrl = reader.result as string;
        console.log('Frontend: Image converted to data URL (first 100 chars):', dataUrl.substring(0, 100) + '...');
        console.log('Frontend: Data URL length:', dataUrl.length);
        resolve(dataUrl);
      };
      
      reader.onerror = () => {
        console.error('Frontend: Failed to read file:', file.name);
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
    
  } catch (error) {
    console.error('Frontend: Image upload failed:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};