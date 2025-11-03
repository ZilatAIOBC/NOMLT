// Frontend client that calls our backend text-to-image API
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || ""; // same-origin by default

function getSupabaseAccessToken(): string | undefined {
  try {
    // Prefer dynamic Supabase key: sb-<project-ref>-auth-token
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (/^sb-.*-auth-token$/.test(key)) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.access_token) return parsed.access_token as string;
      }
    }
    // Fallbacks if above not found
    const sbSimple = localStorage.getItem('sb-access-token');
    if (sbSimple) return sbSimple;
    const custom = localStorage.getItem('accessToken');
    if (custom) return custom;
  } catch (_) {}
  return undefined;
}

export interface TextToImageRequest {
  enable_base64_output: boolean;
  enable_sync_mode: boolean;

  prompt: string;
  width?: number;
  height?: number;
  size?: string; // e.g., "1628*2048"
}

export interface TextToImageCreateResponse {
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

export interface TextToImageResultResponse {
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

// Step 1: Create the text-to-image generation job
export const createTextToImageJob = async (
  requestBody: TextToImageRequest
): Promise<TextToImageCreateResponse> => {
  const url = `${BACKEND_BASE_URL}/api/text-to-image`;

  // Attach Supabase session token if available
  const token = getSupabaseAccessToken();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Removed console for production
  // Removed console for production

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

  const data = (await response.json()) as TextToImageCreateResponse;
  if (!data?.data?.urls?.get) {
    throw new Error('Invalid backend response: missing result URL');
  }
  return data;
};

// Step 2: Get the result using the dynamic URL from the first API response
export const getTextToImageResult = async (
  resultUrl: string,
  maxAttempts: number = 40,
  intervalMs: number = 6000
): Promise<TextToImageResultResponse> => {
  // Sanitize potential stray quotes/whitespace to avoid malformed URLs
  const sanitizedResultUrl = (resultUrl || "").trim().replace(/^['"]|['"]$/g, "");
  let attempts = 0;

  // Attach Supabase session token for authentication
  const token = getSupabaseAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  while (attempts < maxAttempts) {
    const url = `${BACKEND_BASE_URL}/api/text-to-image/result?url=${encodeURIComponent(sanitizedResultUrl)}`;
    // Removed console for production
    // Removed console for production

    const response = await fetch(url, { 
      method: 'GET', 
      headers,
      credentials: 'include' 
    });
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
        } as TextToImageResultResponse;
      }
      
      // Original AI provider response format
      return data as TextToImageResultResponse;
    }
    if (status === 'failed') {
      const err = data?.data?.error || 'Unknown error';
      // Removed console for production
      throw new Error(`Text-to-image generation failed: ${err}`);
    }

    // Removed console for production
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  // Removed console for production
  throw new Error('Text-to-image generation timed out - maximum attempts reached');
};

// Backward-compatible alias for existing call sites
export const callTextToImageAPI = (
  requestBody: TextToImageRequest
): Promise<TextToImageCreateResponse> => createTextToImageJob(requestBody);
