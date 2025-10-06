// Frontend client that calls our backend text-to-video API

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || ""; // leave empty to use same-origin/proxy

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

export interface TextToVideoRequest {
  aspect_ratio: string;
  camera_fixed: boolean;
  duration: number;
  prompt: string;
  seed?: number;
}

export interface TextToVideoCreateResponse {
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
    timings: { inference: number };
    urls: { get: string };
  };
}

export interface TextToVideoResultResponse {
  code: number;
  message: string;
  data: {
    created_at: string;
    error: string;
    executionTime: number;
    has_nsfw_contents: any[];
    id: string;
    model: string;
    outputs: string[]; // should contain video URL(s)
    status: string;
    timings: { inference: number };
  };
}

// Step 1: Create the text-to-video generation job via backend
export const createTextToVideoJob = async (
  requestBody: TextToVideoRequest
): Promise<TextToVideoCreateResponse> => {
  const url = `${BACKEND_BASE_URL}/api/text-to-video`;
  const token = getSupabaseAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  console.log('Frontend: Text-to-Video create URL:', url);
  console.log('Frontend: Text-to-Video headers set:', Object.keys(headers));

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Backend request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = (await response.json()) as TextToVideoCreateResponse;
  if (!data?.data?.urls?.get) {
    throw new Error("Invalid backend response: missing result URL");
  }
  return data;
};

// Backward-compatible alias used by existing components
export const callTextToVideoAPI = (
  requestBody: TextToVideoRequest
): Promise<TextToVideoCreateResponse> => createTextToVideoJob(requestBody);

// Step 2: Poll the result via backend (backend calls provider)
export const getTextToVideoResult = async (
  resultUrl: string,
  maxAttempts = 40,
  intervalMs = 6000
): Promise<TextToVideoResultResponse> => {
  console.log('Frontend: Starting text-to-video result polling');
  console.log('Frontend: Result URL:', resultUrl);
  console.log('Frontend: Max attempts:', maxAttempts, 'Interval:', intervalMs, 'ms');
  let attempts = 0;

  while (attempts < maxAttempts) {
    const url = `${BACKEND_BASE_URL}/api/text-to-video/result?url=${encodeURIComponent(
      resultUrl
    )}`;

    const token = getSupabaseAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    console.log(`Frontend: Poll attempt ${attempts + 1}/${maxAttempts}`);
    console.log('Frontend: Polling URL:', url);
    const response = await fetch(url, { method: "GET", headers, credentials: "include" });
    console.log(`Frontend: Poll attempt ${attempts + 1} response status:`, response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Backend result failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as any;
    const status = data?.data?.status;
    console.log(`Frontend: Poll attempt ${attempts + 1}/${maxAttempts} - Status: ${status}`);
    console.log('Frontend: Poll response data:', JSON.stringify(data, null, 2));

    if (status === "succeeded" || status === "completed") {
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
        } as TextToVideoResultResponse;
      }
      
      // Original AI provider response format
      return data as TextToVideoResultResponse;
    }
    if (status === "failed") {
      const err = data?.data?.error || "Unknown error";
      console.error('Frontend: Text-to-video generation failed:', err);
      throw new Error(`Text-to-video generation failed: ${err}`);
    }

    console.log(`Frontend: Text-to-video still ${status}, waiting ${intervalMs}ms before next check...`);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  console.error('Frontend: Text-to-video generation timed out - maximum attempts reached');
  throw new Error("Text-to-video generation timed out - maximum attempts reached");
};
