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

  const token = getSupabaseAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  console.log('Frontend: Fetching usage summary from:', url);

  const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
  console.log('Frontend: Usage summary status:', res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text();
    console.error('Frontend: Failed to fetch usage summary:', text);
    throw new Error(`Failed to fetch usage summary: ${res.status} ${res.statusText} - ${text}`);
  }

  const data = (await res.json()) as UsageSummaryResponse;
  console.log('Frontend: Usage summary data:', JSON.stringify(data, null, 2));
  return data;
};


