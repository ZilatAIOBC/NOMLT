/**
 * =====================================================
 * MODEL CREDIT SERVICE
 * =====================================================
 * 
 * Enhanced credit service that can fetch costs from AI models table
 * This provides flexibility to have different costs per model
 */

const { supabase, supabaseAdmin } = require('../utils/supabase');
const { getCreditCost: getStaticCreditCost } = require('../config/creditPricing');

/**
 * Get credit cost for a specific AI model from database
 * @param {string} modelId - Model ID or name
 * @returns {Promise<number>} Credit cost for the model
 */
async function getModelCreditCost(modelId) {
  try {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('ai_models')
      .select('cost_per_generation, name, display_name, category')
      .eq('name', modelId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Fallback to static pricing based on category
      return null;
    }

    return data.cost_per_generation;
  } catch (error) {
    return null;
  }
}

/**
 * Get credit cost for a generation type, with optional model-specific pricing
 * @param {string} generationType - Type of generation (text_to_image, etc.)
 * @param {string} modelName - Optional specific model name
 * @returns {Promise<number>} Credit cost
 */
async function getCreditCostForGeneration(generationType, modelName = null) {
  // If a specific model is requested, try to get its cost from database
  if (modelName) {
    const modelCost = await getModelCreditCost(modelName);
    if (modelCost !== null) {
      return modelCost;
    }
  }

  // Fallback to static pricing from config
  return getStaticCreditCost(generationType);
}

/**
 * Get all active AI models with their credit costs
 * @returns {Promise<Array>} Array of models with costs
 */
async function getAllModelCosts() {
  try {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('ai_models')
      .select('id, name, display_name, category, cost_per_generation, is_premium, is_active')
      .eq('is_active', true)
      .order('category')
      .order('sort_order');

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

/**
 * Get models by category with their costs
 * @param {string} category - Category (text_to_image, text_to_video, etc.)
 * @returns {Promise<Array>} Array of models in that category
 */
async function getModelsByCategory(category) {
  try {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('ai_models')
      .select('id, name, display_name, description, cost_per_generation, is_premium, max_dimensions')
      .eq('category', category)
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

/**
 * Update model credit cost in database
 * @param {string} modelName - Model name
 * @param {number} newCost - New credit cost
 * @returns {Promise<boolean>} Success status
 */
async function updateModelCreditCost(modelName, newCost) {
  try {
    const client = supabaseAdmin || supabase;
    
    const { error } = await client
      .from('ai_models')
      .update({ 
        cost_per_generation: newCost,
        updated_at: new Date().toISOString()
      })
      .eq('name', modelName);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  getModelCreditCost,
  getCreditCostForGeneration,
  getAllModelCosts,
  getModelsByCategory,
  updateModelCreditCost
};


