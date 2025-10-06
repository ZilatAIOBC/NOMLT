
// Service for fetching actual generations from database
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

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

export interface GenerationFromDB {
  id: string;
  user_id: string;
  generation_type: string;
  s3_key: string;
  s3_url: string; // This is the old signed URL - we'll get fresh ones
  prompt: string;
  settings: any;
  file_size: number;
  content_type: string;
  created_at: string;
  updated_at: string;
}

export interface GenerationsResponse {
  success: boolean;
  count: number;
  generations: GenerationFromDB[];
}

export interface SignedUrlResponse {
  success: boolean;
  signedUrl: string;
  expiresIn: number;
}

// Get user's generations from database
export const getUserGenerations = async (
  type?: string,
  limit: number = 50,
  offset: number = 0
): Promise<GenerationsResponse> => {
  const url = `${BACKEND_BASE_URL}/api/generations`;
  
  const token = getSupabaseAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const params = new URLSearchParams();
  if (type) params.append('type', type);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const fullUrl = `${url}?${params.toString()}`;
  
  console.log('Frontend: Fetching generations from:', fullUrl);
  console.log('Frontend: Using token:', token ? 'YES' : 'NO');

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  console.log('Frontend: Response status:', response.status);
  console.log('Frontend: Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Frontend: Failed to fetch generations:', errorText);
    console.error('Frontend: Response status:', response.status, response.statusText);
    
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (response.status === 403) {
      throw new Error('Access denied. You may not have permission to view generations.');
    } else {
      throw new Error(`Failed to fetch generations: ${response.status} ${response.statusText} - ${errorText}`);
    }
  }

  const data = await response.json() as GenerationsResponse;
  console.log(`Frontend: Successfully fetched ${data.count} generations:`, data);
  
  return data;
};

// Get fresh signed URL for a generation
export const getGenerationSignedUrl = async (generationId: string): Promise<string> => {
  const url = `${BACKEND_BASE_URL}/api/generations/${generationId}/signed-url`;
  
  const token = getSupabaseAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  console.log('Frontend: Getting fresh signed URL for generation:', generationId);

  const response = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Frontend: Failed to get signed URL:', errorText);
    throw new Error(`Failed to get signed URL: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json() as SignedUrlResponse;
  console.log('Frontend: Got fresh signed URL:', data.signedUrl);
  
  return data.signedUrl;
};

// Transform database generation to frontend format
export const transformGeneration = (dbGen: GenerationFromDB) => {
  return {
    id: dbGen.id,
    type: dbGen.generation_type.replace('-', '-') as any,
    thumbnail: dbGen.s3_url, // We'll replace with fresh signed URL when displaying
    prompt: dbGen.prompt || 'No prompt provided',
    isVideo: dbGen.content_type?.includes('video') || dbGen.generation_type.includes('video'),
    s3Key: dbGen.s3_key,
    fileSize: dbGen.file_size,
    createdAt: dbGen.created_at,
    settings: dbGen.settings,
  };
};
