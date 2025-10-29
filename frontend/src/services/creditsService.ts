/**
 * =====================================================
 * CREDITS SERVICE
 * =====================================================
 * 
 * Frontend service for interacting with credit-related APIs
 */

import { authHelper } from '../utils/authHelper';

const API_BASE_URL = import.meta.env.VITE_API_URL|| import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Types
export interface CreditCosts {
  text_to_image: number;
  image_to_image: number;
  text_to_video: number;
  image_to_video: number;
}

export interface CreditCostDetail {
  type: string;
  name: string;
  cost: number;
}

export interface CreditBalance {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: 'earned' | 'spent' | 'purchased' | 'bonus' | 'refund';
  amount: number;
  balance_after: number;
  description: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: any;
  created_at: string;
}

export interface CreditSummary {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  updated_at: string;
  recent_transactions: CreditTransaction[];
  generation_costs: CreditCosts;
  affordable_generations: {
    [key: string]: number;
  };
}


/**
 * Get credit costs for all generation types
 * No authentication required
 */
export async function getCreditCosts(): Promise<{
  costs: CreditCosts;
  details: CreditCostDetail[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/credits/costs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch credit costs: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get credit cost for a specific generation type
 * No authentication required
 */
export async function getCreditCostByType(generationType: string): Promise<CreditCostDetail> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/credits/costs/${generationType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch credit cost: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get current user's credit balance
 * Requires authentication
 */
export async function getCreditBalance(): Promise<CreditBalance> {
  try {
    const response = await authHelper.authFetch(`${API_BASE_URL}/api/credits/balance`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch credit balance: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get user's credit transaction history
 * Requires authentication
 */
export async function getCreditTransactions(
  limit: number = 50,
  offset: number = 0,
  type?: string
): Promise<{
  transactions: CreditTransaction[];
  total: number;
  limit: number;
  offset: number;
}> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (type) {
      params.append('type', type);
    }

    const response = await authHelper.authFetch(`${API_BASE_URL}/api/credits/transactions?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch credit transactions: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get comprehensive credit summary
 * Requires authentication
 */
export async function getCreditSummary(): Promise<CreditSummary> {
  try {
    const response = await authHelper.authFetch(`${API_BASE_URL}/api/credits/summary`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch credit summary: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Format credit amount with thousands separator
 */
export function formatCredits(amount: number): string {
  return amount.toLocaleString();
}

/**
 * Get generation type display name
 */
export function getGenerationTypeName(type: string): string {
  const names: { [key: string]: string } = {
    text_to_image: 'Text to Image',
    image_to_image: 'Image to Image',
    text_to_video: 'Text to Video',
    image_to_video: 'Image to Video',
  };
  return names[type] || type;
}

/**
 * Calculate how many generations a user can afford
 */
export function calculateAffordableGenerations(
  balance: number,
  costs: CreditCosts
): { [key: string]: number } {
  return {
    text_to_image: Math.floor(balance / costs.text_to_image),
    image_to_image: Math.floor(balance / costs.image_to_image),
    text_to_video: Math.floor(balance / costs.text_to_video),
    image_to_video: Math.floor(balance / costs.image_to_video),
  };
}

