import { apiBaseUrl } from './index';
import { authHelper } from '../utils/authHelper';

export type Interval = 'monthly' | 'yearly';

export async function createCheckoutSession(params: { 
  planId: string; 
  interval: Interval; 
  userId: string;
  isUpgrade?: boolean;
}) {
  const res = await authHelper.authFetch(`${apiBaseUrl}/api/payments/create-checkout-session`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Failed to create checkout session');
  }
  return res.json() as Promise<{ url: string }>;
}

export async function retrieveCheckoutSession(sessionId: string) {
  const res = await authHelper.authFetch(`${apiBaseUrl}/api/payments/checkout-session?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Failed to retrieve checkout session');
  }
  return res.json() as Promise<{ session: any }>;
}

export type TopupPackId = 'small' | 'medium' | 'large';

export async function createTopupSession(params: {
  packId: TopupPackId;
  userId: string;
}): Promise<{ url: string }> {
  console.log('[frontend][topup] POST /payments/topup/session', params);
  const res = await authHelper.authFetch(`${apiBaseUrl}/api/payments/topup/session`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const msg = await res.text();
    console.warn('[frontend][topup] topup/session failed', { status: res.status, msg });
    throw new Error(msg || 'Failed to create top-up session');
  }
  const json = (await res.json()) as { url: string };
  console.log('[frontend][topup] topup/session success', json);
  return json;
}


