// Frontend client that calls our backend image-to-image API
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

export interface ImageToImageRequest {
  enable_base64_output: boolean;
  enable_sync_mode: boolean;
  images: string[]; // Array of image URLs
  prompt: string;
  size: string; // Size in format "width*height" (e.g., "2227*3183")
}

export interface ImageToImageCreateResponse {
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

export interface ImageToImageResultResponse {
  code: number;
  message: string;
  data: {
    created_at: string;
    error: string;
    executionTime: number;
    has_nsfw_contents: any[];
    id: string;
    model: string;
    outputs: string[]; // This should contain the image URL
    status: string;
    timings: {
      inference: number;
    };
  };
}

// Step 1: Create the image-to-image generation job via backend
export const createImageToImageJob = async (
  requestBody: ImageToImageRequest
): Promise<ImageToImageCreateResponse> => {
  const url = `${BACKEND_BASE_URL}/api/image-to-image`;
  
  // Removed console for production
  // Removed console for production
  // Removed console for production

  const token = getSupabaseAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    credentials: 'include',
  });

  // Removed console for production

  if (!response.ok) {
    const errorText = await response.text();
    // Removed console for production
    throw new Error(`Backend request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = (await response.json()) as ImageToImageCreateResponse;
  // Removed console for production
  
  if (!data?.data?.urls?.get) {
    // Removed console for production
    throw new Error('Invalid backend response: missing result URL');
  }
  
  // Removed console for production
  return data;
};

// Step 2: Poll the result via backend (backend calls provider)
export const getImageToImageResult = async (
  resultUrl: string,
  maxAttempts: number = 40,
  intervalMs: number = 6000
): Promise<ImageToImageResultResponse> => {
  // Sanitize potential stray quotes/whitespace to avoid malformed URLs
  const sanitizedResultUrl = (resultUrl || "").trim().replace(/^['"]|['"]$/g, "");
  
  let attempts = 0;

  while (attempts < maxAttempts) {
    const url = `${BACKEND_BASE_URL}/api/image-to-image/result?url=${encodeURIComponent(sanitizedResultUrl)}`;
    
    // Removed console for production
    // Removed console for production

    const token = getSupabaseAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { method: 'GET', headers, credentials: 'include' });

    // Removed console for production

    if (!response.ok) {
      const errorText = await response.text();
      // Removed console for production
      throw new Error(`Backend result failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = (await response.json()) as any;
    const status = data?.data?.status;
    
    // Removed console for production
    // Removed console for production

    if (status === 'succeeded' || status === 'completed') {
      // Removed console for production
      
      // Check if this is our new S3 response format with generation info
      if (data.success && data.generation) {
        // Removed console for production
        // Transform our S3 response to match expected format
        return {
          code: data.code || 200,
          message: data.message || 'Success',
          data: {
            ...data.data,
            // Convert single output to outputs array for compatibility
            outputs: data.data.output ? [data.data.output] : []
          }
        } as ImageToImageResultResponse;
      }
      
      // Removed console for production
      // Original AI provider response format
      return data as ImageToImageResultResponse;
    }
    if (status === 'failed') {
      const err = data?.data?.error || 'Unknown error';
      // Removed console for production
      throw new Error(`Image-to-image generation failed: ${err}`);
    }

    // Removed console for production
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  // Removed console for production
  throw new Error('Image-to-image generation timed out - maximum attempts reached');
};

// Backward-compatible alias for existing call sites
export const callImageToImageAPI = (
  requestBody: ImageToImageRequest
): Promise<ImageToImageCreateResponse> => createImageToImageJob(requestBody);

// Helper function to convert file to base64
export const convertFileToBase64 = async (file: File): Promise<string> => {
  // Removed console for production
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      // Removed console for production
      resolve(base64);
    };
    
    reader.onerror = () => {
      // Removed console for production
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

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
