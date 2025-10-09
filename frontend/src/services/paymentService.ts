import { apiBaseUrl } from './index';

export type Interval = 'monthly' | 'yearly';

export async function createCheckoutSession(params: { 
  planId: string; 
  interval: Interval; 
  userId: string;
  isUpgrade?: boolean;
}) {
  const res = await fetch(`${apiBaseUrl}/api/payments/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${apiBaseUrl}/api/payments/checkout-session?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Failed to retrieve checkout session');
  }
  return res.json() as Promise<{ session: any }>;
}


