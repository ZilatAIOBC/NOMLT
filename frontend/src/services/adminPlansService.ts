// Admin plans service for managing subscription plans

import { Plan } from './plansService';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: string;
  message?: string;
}

interface CreatePlanRequest {
  name: string;
  display_name: string;
  description?: string;
  price_monthly: number;
  price_quarterly: number;
  price_yearly: number;
  credits_included: number;
  max_generations_per_month?: number;
  features?: string[];
  badge?: string;
  badge_color?: string;
  cta?: string;
  concurrent_image_generations?: number;
  concurrent_video_generations?: number;
  image_visibility?: 'public' | 'private';
  priority_support?: boolean;
  priority_queue?: boolean;
  seedream_unlimited?: boolean;
  is_popular?: boolean;
  sort_order?: number;
}

interface UpdatePlanRequest {
  display_name?: string;
  description?: string;
  price_monthly?: number;
  price_quarterly?: number;
  price_yearly?: number;
  credits_included?: number;
  max_generations_per_month?: number;
  features?: string[];
  badge?: string;
  badge_color?: string;
  cta?: string;
  concurrent_image_generations?: number;
  concurrent_video_generations?: number;
  image_visibility?: 'public' | 'private';
  priority_support?: boolean;
  priority_queue?: boolean;
  seedream_unlimited?: boolean;
  is_popular?: boolean;
  sort_order?: number;
}

class AdminPlansService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get headers with authentication
   */
  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Fetch all plans including inactive ones (Admin only)
   */
  async getAllPlans(): Promise<Plan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans/admin`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Plan[]> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plans');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching all plans:', error);
      throw error;
    }
  }

  /**
   * Create a new plan (Admin only)
   */
  async createPlan(planData: CreatePlanRequest): Promise<Plan> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Plan> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing plan (Admin only)
   */
  async updatePlan(planId: string, updates: UpdatePlanRequest): Promise<Plan> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans/${planId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Plan> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  /**
   * Delete (deactivate) a plan (Admin only)
   */
  async deletePlan(planId: string): Promise<Plan> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans/${planId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Plan> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  /**
   * Validate plan data
   */
  validatePlanData(planData: Partial<CreatePlanRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!planData.display_name?.trim()) {
      errors.push('Display name is required');
    }

    if (planData.price_monthly === undefined || planData.price_monthly < 0) {
      errors.push('Monthly price must be a positive number');
    }

    if (planData.price_quarterly === undefined || planData.price_quarterly < 0) {
      errors.push('Quarterly price must be a positive number');
    }

    if (planData.price_yearly === undefined || planData.price_yearly < 0) {
      errors.push('Yearly price must be a positive number');
    }

    if (planData.credits_included === undefined || planData.credits_included < 0) {
      errors.push('Credits included must be a positive number');
    }

    // Validate pricing logic
    if (planData.price_monthly && planData.price_quarterly) {
      const expectedQuarterly = planData.price_monthly * 3 * 0.85; // 15% discount
      const tolerance = planData.price_monthly * 0.1; // 10% tolerance
      if (Math.abs(planData.price_quarterly - expectedQuarterly) > tolerance) {
        errors.push('Quarterly price should be approximately 15% less than monthly price × 3');
      }
    }

    if (planData.price_monthly && planData.price_yearly) {
      const expectedYearly = planData.price_monthly * 12 * 0.7; // 30% discount
      const tolerance = planData.price_monthly * 2; // 20% tolerance
      if (Math.abs(planData.price_yearly - expectedYearly) > tolerance) {
        errors.push('Yearly price should be approximately 30% less than monthly price × 12');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format plan for display
   */
  formatPlanForDisplay(plan: Plan) {
    return {
      ...plan,
      formattedMonthlyPrice: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(plan.price_monthly),
      formattedQuarterlyPrice: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(plan.price_quarterly),
      formattedYearlyPrice: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(plan.price_yearly),
    };
  }
}

export const adminPlansService = new AdminPlansService();
export default adminPlansService;

// Export types for use in components
export type { CreatePlanRequest, UpdatePlanRequest };
