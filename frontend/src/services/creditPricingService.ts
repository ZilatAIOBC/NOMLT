/**
 * =====================================================
 * CREDIT PRICING SERVICE
 * =====================================================
 * 
 * Frontend service for managing dynamic credit pricing via AI models
 * Uses the existing ai_models table, grouped by category (feature)
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface CategoryPricing {
  cost_per_generation: number;
  model_count: number;
  models: Array<{
    display_name: string;
    cost_per_generation: number;
    is_active: boolean;
  }>;
}

export interface CategoryPricingData {
  text_to_image?: CategoryPricing;
  image_to_image?: CategoryPricing;
  text_to_video?: CategoryPricing;
  image_to_video?: CategoryPricing;
}

export interface CategoryUpdate {
  [category: string]: number; // category: cost_per_generation
}

/**
 * Get category-based pricing (Admin only)
 * Groups AI models by category and returns pricing info
 */
export const getCategoryPricing = async (): Promise<CategoryPricingData> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await axios.get(`${API_URL}/api/admin/models/category-pricing`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    // Removed console for production
    throw new Error(error.response?.data?.error || 'Failed to fetch category pricing');
  }
};

/**
 * Update pricing for a specific category (Admin only)
 * Updates ALL models in that category to the same price
 */
export const updateCategoryPricing = async (
  category: string,
  cost_per_generation: number
): Promise<{
  category: string;
  cost_per_generation: number;
  models_updated: number;
}> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await axios.put(
      `${API_URL}/api/admin/models/category-pricing/${category}`,
      { cost_per_generation },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    // Removed console for production
    throw new Error(error.response?.data?.error || 'Failed to update category pricing');
  }
};

/**
 * Bulk update multiple categories at once (Admin only)
 */
export const bulkUpdateCategoryPricing = async (
  updates: CategoryUpdate
): Promise<{
  success: boolean;
  data: Array<{
    category: string;
    cost_per_generation: number;
    models_updated: number;
  }>;
  errors?: Array<{ category: string; error: string }>;
  message: string;
}> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await axios.patch(
      `${API_URL}/api/admin/models/bulk-category-pricing`,
      { updates },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    // Removed console for production
    throw new Error(error.response?.data?.error || 'Failed to bulk update category pricing');
  }
};

const creditPricingService = {
  getCategoryPricing,
  updateCategoryPricing,
  bulkUpdateCategoryPricing,
};

export default creditPricingService;

