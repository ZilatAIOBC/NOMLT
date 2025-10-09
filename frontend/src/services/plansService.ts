// Plans service for fetching subscription plans from the backend API

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export interface PlanFeature {
  currency: string;
  amount: string;
  cadenceLabel: string;
  billedLabel: string;
}

export interface PlanPriceByCycle {
  monthly: PlanFeature;
  quarterly: PlanFeature;
  yearly: PlanFeature;
}

export interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_quarterly: number;
  price_yearly: number;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  stripe_product_id?: string;
  credits_included: number;
  max_generations_per_month: number;
  features: string[];
  badge?: string;
  badge_color?: string;
  cta: string;
  concurrent_image_generations: number;
  concurrent_video_generations: number;
  image_visibility: 'public' | 'private';
  priority_support: boolean;
  priority_queue: boolean;
  seedream_unlimited: boolean;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlanWithPricing extends Omit<Plan, 'price_monthly' | 'price_quarterly' | 'price_yearly'> {
  priceByCycle: PlanPriceByCycle;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: string;
}

class PlansService {
  private baseUrl: string;

  constructor() {
    // Use the same backend URL as other services
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  /**
   * Fetch all active subscription plans from the backend API
   */
  async getPlans(): Promise<Plan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  /**
   * Transform database plans to frontend format with pricing cycles
   */
  async getPlansWithPricing(): Promise<PlanWithPricing[]> {
    try {
      const plans = await this.getPlans();
      
      return plans.map(plan => ({
        ...plan,
        priceByCycle: {
          monthly: {
            currency: 'USD',
            amount: plan.price_monthly.toString(),
            cadenceLabel: '/ month',
            billedLabel: 'billed monthly'
          },
          quarterly: {
            currency: 'USD',
            amount: plan.price_quarterly.toString(),
            cadenceLabel: '/ quarter',
            billedLabel: 'billed quarterly'
          },
          yearly: {
            currency: 'USD',
            amount: plan.price_yearly.toString(),
            cadenceLabel: '/ year',
            billedLabel: 'billed yearly'
          }
        }
      }));
    } catch (error) {
      console.error('Error in getPlansWithPricing:', error);
      throw error;
    }
  }

  /**
   * Get a specific plan by ID
   */
  async getPlanById(planId: string): Promise<Plan | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans/${planId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Plan> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching plan by ID:', error);
      return null;
    }
  }

  /**
   * Get the most popular plan
   */
  async getPopularPlan(): Promise<Plan | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans/popular`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Plan> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch popular plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching popular plan:', error);
      return null;
    }
  }

  /**
   * Calculate savings percentage for different billing cycles
   */
  calculateSavings(monthlyPrice: number, cyclePrice: number): number {
    if (monthlyPrice === 0) return 0;
    return Math.round(((monthlyPrice * 3 - cyclePrice) / (monthlyPrice * 3)) * 100);
  }

  /**
   * Format price for display
   */
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }
}

export const plansService = new PlansService();
export default plansService;
