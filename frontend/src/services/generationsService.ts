import { authHelper } from '../utils/authHelper';

// Service for fetching actual generations from database
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

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
  
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const fullUrl = `${url}?${params.toString()}`;

  const response = await authHelper.authFetch(fullUrl, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (response.status === 403) {
      throw new Error('Access denied. You may not have permission to view generations.');
    } else {
      throw new Error(`Failed to fetch generations: ${response.status} ${response.statusText} - ${errorText}`);
    }
  }

  const data = await response.json() as GenerationsResponse;
  
  return data;
};

// Get fresh signed URL for a generation
export const getGenerationSignedUrl = async (
  generationId: string,
  options?: { download?: boolean; expiresInSeconds?: number }
): Promise<string> => {
  const params = new URLSearchParams();
  if (options?.download) params.append('download', '1');
  if (options?.expiresInSeconds) params.append('expiresIn', String(options.expiresInSeconds));
  const url = `${BACKEND_BASE_URL}/api/generations/${generationId}/signed-url${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await authHelper.authFetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get signed URL: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json() as SignedUrlResponse;
  
  return data.signedUrl;
};

// Delete a generation
export const deleteGeneration = async (generationId: string): Promise<void> => {
  const url = `${BACKEND_BASE_URL}/api/generations/${generationId}`;

  const response = await authHelper.authFetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete generation: ${response.status} ${response.statusText} - ${errorText}`);
  }
};

// Delete all generations for current user
export const deleteAllGenerations = async (): Promise<number> => {
  const url = `${BACKEND_BASE_URL}/api/generations`;

  const response = await authHelper.authFetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete all generations: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json() as { success: boolean; deleted: number };
  return data.deleted || 0;
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
