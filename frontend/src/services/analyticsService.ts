import { authHelper } from '../utils/authHelper';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface DashboardStats {
  total_users: number;
  active_subscriptions: number;
  total_credits_used: number;
  total_revenue: number;  // All-time revenue
  mrr: number;  // Monthly Recurring Revenue
}

export interface FeatureUsageData {
  name: string;
  count: number;
  credits: number;
  percentage: string;
}

export interface FeatureUsageResponse {
  features: FeatureUsageData[];
  total_credits: number;
}

export interface TopUser {
  user_id: string;
  email: string;
  name: string;
  credits_balance: number;
  total_generations: number;
  total_credits_spent: number;
  most_used_feature: string;
  plan_name: string;
  plan_price: number;
  created_at: string;
}

export interface TopUsersResponse {
  top_users: TopUser[];
  sorted_by: string;
  limit: number;
}

export interface CostPerFeature {
  name: string;
  category: string;
  usage_count: number;
  cost_per_generation: number;
  total_credits: number;
  total_cost_usd: number;
}

export interface CostPerFeatureResponse {
  features: CostPerFeature[];
  total_cost_usd: number;
  conversion_rate: {
    dollars: number;
    credits: number;
    dollars_per_credit: number;
  };
}

export interface MonthlyTrends {
  revenue_growth: number;
  user_growth: number;
  usage_growth: number;
  current_month: {
    revenue: number;
    users: number;
    credits: number;
  };
  previous_month: {
    revenue: number;
    users: number;
    credits: number;
  };
}

export interface DailyTrend {
  date: string;
  total_generations: number;
  total_credits_spent: number;
  total_credits_earned: number;
  active_users: number;
}

export interface DailyTrendsResponse {
  days: number;
  trends: DailyTrend[];
}

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await authHelper.authFetch(
      `${API_BASE_URL}/api/analytics/admin/dashboard-stats`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Request failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    // Removed console for production
    throw error;
  }
};

/**
 * Get feature usage statistics for admin dashboard
 */
export const getFeatureUsageStats = async (): Promise<FeatureUsageResponse> => {
  try {
    const response = await authHelper.authFetch(
      `${API_BASE_URL}/api/analytics/admin/feature-usage`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Request failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    // Removed console for production
    throw error;
  }
};

/**
 * Get top users by usage (admin only)
 */
export const getTopUsers = async (limit: number = 4, sortBy: string = 'credits'): Promise<TopUsersResponse> => {
  try {
    const response = await authHelper.authFetch(
      `${API_BASE_URL}/api/analytics/admin/top-users?limit=${limit}&sortBy=${sortBy}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Request failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    // Removed console for production
    throw error;
  }
};

/**
 * Get cost per feature statistics (admin only)
 * Calculates total cost based on usage × AI model pricing
 */
export const getCostPerFeature = async (): Promise<CostPerFeatureResponse> => {
  try {
    const response = await authHelper.authFetch(
      `${API_BASE_URL}/api/analytics/admin/cost-per-feature`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Request failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    // Removed console for production
    throw error;
  }
};

/**
 * Get monthly trends (admin only)
 * Returns month-over-month growth for revenue, users, and usage
 */
export const getMonthlyTrends = async (): Promise<MonthlyTrends> => {
  try {
    const response = await authHelper.authFetch(
      `${API_BASE_URL}/api/analytics/admin/monthly-trends`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Request failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    // Removed console for production
    throw error;
  }
};

/**
 * Get daily trends (admin only)
 * Returns daily credit usage from usage_summaries table
 */
export const getDailyTrends = async (days: number = 30): Promise<DailyTrendsResponse> => {
  try {
    const response = await authHelper.authFetch(
      `${API_BASE_URL}/api/analytics/admin/daily-trends?days=${days}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Request failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    // Removed console for production
    throw error;
  }
};
