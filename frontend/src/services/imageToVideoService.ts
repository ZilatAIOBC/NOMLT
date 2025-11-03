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
  audio?: string; // Optional audio URL or data URL
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
  
  

  const token = getSupabaseAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    credentials: 'include',
  });

  

  if (!response.ok) {
    const errorText = await response.text();
    
    throw new Error(`Backend request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = (await response.json()) as ImageToVideoCreateResponse;
  
  
  if (!data?.data?.urls?.get) {
    
    throw new Error('Invalid backend response: missing result URL');
  }
  
  
  return data;
};

// Step 2: Poll the result via backend (backend calls provider)
export const getImageToVideoResult = async (
  resultUrl: string,
  maxAttempts: number = 40,
  intervalMs: number = 6000
): Promise<ImageToVideoResultResponse> => {
  // Sanitize potential stray quotes/whitespace to avoid malformed URLs
  const sanitizedResultUrl = (resultUrl || "").trim().replace(/^['"]|['"]$/g, "");
  let attempts = 0;

  while (attempts < maxAttempts) {
    const url = `${BACKEND_BASE_URL}/api/image-to-video/result?url=${encodeURIComponent(sanitizedResultUrl)}`;
    
    

    const token = getSupabaseAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { method: 'GET', headers, credentials: 'include' });

    

    if (!response.ok) {
      const errorText = await response.text();
      
      throw new Error(`Backend result failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = (await response.json()) as any;
    const status = data?.data?.status;
    
    

    if (status === 'succeeded' || status === 'completed') {
      
      
      // Check if this is our new S3 response format with generation info
      if (data.success && data.generation) {
        
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
      
      
      // Original AI provider response format
      return data as ImageToVideoResultResponse;
    }
    if (status === 'failed') {
      const err = data?.data?.error || 'Unknown error';
      
      throw new Error(`Image-to-video generation failed: ${err}`);
    }

    
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  
  throw new Error('Image-to-video generation timed out - maximum attempts reached');
};

// Backward-compatible alias for existing call sites
export const callImageToVideoAPI = (
  requestBody: ImageToVideoRequest
): Promise<ImageToVideoCreateResponse> => createImageToVideoJob(requestBody);

// Helper function to convert file to data URL for API
export const uploadImageToUrl = async (file: File): Promise<string> => {
  try {
    // Removed console for production
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Removed console for production
        // Removed console for production
        resolve(dataUrl);
      };
      
      reader.onerror = () => {
        // Removed console for production
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
    
  } catch (error) {
    // Removed console for production
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};