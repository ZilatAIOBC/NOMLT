import { authHelper } from '../utils/authHelper';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

export interface GenerationTypeStats {
  count: number;
  credits: number;
  successful: number;
  failed: number;
}

export interface UsageSummaryResponse {
  user_id: string;
  from: string | null;
  to: string | null;
  counts: Record<string, number>;
  credit_balance: {
    current: number;
    lifetime_earned: number;
    lifetime_spent: number;
  } | null;
  credits_spent_by_type: {
    text_to_image: number;
    image_to_image: number;
    text_to_video: number;
    image_to_video: number;
    other: number;
  };
  total_credits_spent: number;
  generation_stats: {
    'text-to-image': GenerationTypeStats;
    'image-to-image': GenerationTypeStats;
    'text-to-video': GenerationTypeStats;
    'image-to-video': GenerationTypeStats;
  };
}

export const fetchUsageSummary = async (): Promise<UsageSummaryResponse> => {
  const url = `${BACKEND_BASE_URL}/api/usage/summary`;

  // Removed console for production

  const res = await authHelper.authFetch(url, { 
    method: 'GET', 
    credentials: 'include' 
  });
  
  // Removed console for production

  if (!res.ok) {
    const text = await res.text();
    // Removed console for production
    throw new Error(`Failed to fetch usage summary: ${res.status} ${res.statusText} - ${text}`);
  }

  const data = (await res.json()) as UsageSummaryResponse;
  // Removed console for production
  return data;
};


