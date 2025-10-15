import { apiBaseUrl } from './index';
import { authHelper } from '../utils/authHelper';

export interface SubscriptionData {
  id: string;
  plan_id: string;
  plan_name: string;
  display_name: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string;
  stripe_customer_id: string;
}

export interface PaymentMethodData {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface BillingData {
  subscription: SubscriptionData | null;
  payment_method: PaymentMethodData | null;
  transactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    status: string;
  }>;
}

export async function getBillingData(): Promise<BillingData> {
  const res = await authHelper.authFetch(`${apiBaseUrl}/api/billing/data`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Failed to fetch billing data');
  }

  return res.json();
}

export async function getSubscriptionStatus(): Promise<SubscriptionData | null> {
  // Get user ID from localStorage
  const userData = authHelper.getCurrentUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  const userId = userData.id;
  
  if (!userId) {
    throw new Error('User ID not found');
  }

  const res = await authHelper.authFetch(`${apiBaseUrl}/api/billing/subscription?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null; // No active subscription
    }
    const msg = await res.text();
    throw new Error(msg || 'Failed to fetch subscription status');
  }

  return res.json();
}

export interface TransactionData {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  subscription_id: string;
  created_at: string;
}

export async function getTransactionHistory(): Promise<TransactionData[]> {
  // Get user ID from localStorage
  const userData = authHelper.getCurrentUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  const userId = userData.id;
  
  if (!userId) {
    throw new Error('User ID not found');
  }

  const res = await authHelper.authFetch(`${apiBaseUrl}/api/transactions?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Failed to fetch transaction history');
  }

  return res.json();
}

/**
 * Cancel subscription at the end of the current billing period
 */
export async function cancelSubscription(): Promise<{ success: boolean; message: string }> {
  // Get user ID from localStorage
  const userData = authHelper.getCurrentUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  const userId = userData.id;
  
  if (!userId) {
    throw new Error('User ID not found');
  }

  const res = await authHelper.authFetch(`${apiBaseUrl}/api/billing/subscription/cancel`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to cancel subscription' }));
    throw new Error(errorData.error || 'Failed to cancel subscription');
  }

  return res.json();
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(): Promise<{ success: boolean; message: string }> {
  // Get user ID from localStorage
  const userData = authHelper.getCurrentUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  const userId = userData.id;
  
  if (!userId) {
    throw new Error('User ID not found');
  }

  const res = await authHelper.authFetch(`${apiBaseUrl}/api/billing/subscription/reactivate`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to reactivate subscription' }));
    throw new Error(errorData.error || 'Failed to reactivate subscription');
  }

  return res.json();
}

/**
 * Change subscription plan (upgrade/downgrade)
 */
export async function changeSubscriptionPlan(
  newPlanId: string,
  interval: 'monthly' | 'yearly'
): Promise<{ success: boolean; message: string }> {
  // Get user ID from localStorage
  const userData = authHelper.getCurrentUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  const userId = userData.id;
  
  if (!userId) {
    throw new Error('User ID not found');
  }

  const res = await authHelper.authFetch(`${apiBaseUrl}/api/billing/subscription/change-plan`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ userId, newPlanId, interval }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to change subscription plan' }));
    throw new Error(errorData.error || 'Failed to change subscription plan');
  }

  return res.json();
}
