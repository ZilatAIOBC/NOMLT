/**
 * =====================================================
 * ADMIN MODELS API ROUTES
 * =====================================================
 * 
 * Admin endpoints for managing AI models and their pricing
 */

const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../utils/supabase');
const { auth, requireAdmin } = require('../middleware/auth');
const { invalidateCreditCostsCache } = require('../config/creditPricing');

/**
 * GET /api/admin/models/category-pricing
 * Get pricing grouped by category (feature)
 * Returns the average/common pricing for each feature type
 */
router.get('/category-pricing', auth, requireAdmin, async (req, res) => {
  try {

    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('ai_models')
      .select('category, cost_per_generation, display_name, is_active')
      .eq('is_active', true)
      .order('category')
      .order('sort_order');

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch category pricing',
        details: error.message
      });
    }

    // Group by category and get the most common cost per category
    const categoryPricing = {};
    const categories = ['text_to_image', 'image_to_image', 'text_to_video', 'image_to_video'];
    
    categories.forEach(category => {
      const modelsInCategory = data.filter(m => m.category === category);
      if (modelsInCategory.length > 0) {
        // Use the first model's cost as the category cost (or you can use min/max/average)
        categoryPricing[category] = {
          cost_per_generation: modelsInCategory[0].cost_per_generation,
          model_count: modelsInCategory.length,
          models: modelsInCategory
        };
      }
    });

    res.status(200).json({
      success: true,
      data: categoryPricing
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * PUT /api/admin/models/category-pricing/:category
 * Update pricing for ALL models in a specific category
 * This ensures consistent pricing across all models in the same feature
 */
router.put('/category-pricing/:category', auth, requireAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    const { cost_per_generation } = req.body;


    // Validate category
    const validCategories = ['text_to_image', 'image_to_image', 'text_to_video', 'image_to_video'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        details: `Valid categories are: ${validCategories.join(', ')}`
      });
    }

    // Validate cost
    if (typeof cost_per_generation !== 'number' || cost_per_generation < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cost_per_generation. Must be a non-negative number.'
      });
    }

    const client = supabaseAdmin || supabase;
    
    // Update ALL models in this category
    const { data, error } = await client
      .from('ai_models')
      .update({
        cost_per_generation,
        updated_at: new Date().toISOString()
      })
      .eq('category', category)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update category pricing',
        details: error.message
      });
    }

    // Invalidate the pricing cache so new prices take effect immediately
    invalidateCreditCostsCache();

    
    res.status(200).json({
      success: true,
      data: {
        category,
        cost_per_generation,
        models_updated: data?.length || 0,
        updated_models: data
      },
      message: `Updated ${data?.length || 0} models in ${category} to ${cost_per_generation} credits`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * PATCH /api/admin/models/bulk-category-pricing
 * Bulk update pricing for multiple categories at once
 */
router.patch('/bulk-category-pricing', auth, requireAdmin, async (req, res) => {
  try {
    const { updates } = req.body; 
    // Expected format: { text_to_image: 30, text_to_video: 80, ... }


    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid updates format. Expected object with category: cost pairs.'
      });
    }

    const client = supabaseAdmin || supabase;
    const results = [];
    const errors = [];
    const validCategories = ['text_to_image', 'image_to_image', 'text_to_video', 'image_to_video'];

    // Process each category update
    for (const [category, cost_per_generation] of Object.entries(updates)) {
      if (!validCategories.includes(category)) {
        errors.push({ category, error: 'Invalid category' });
        continue;
      }

      if (typeof cost_per_generation !== 'number' || cost_per_generation < 0) {
        errors.push({ category, error: 'Invalid cost' });
        continue;
      }

      const { data, error } = await client
        .from('ai_models')
        .update({
          cost_per_generation,
          updated_at: new Date().toISOString()
        })
        .eq('category', category)
        .select('id, category, display_name, cost_per_generation');

      if (error) {
        errors.push({ category, error: error.message });
      } else {
        results.push({
          category,
          cost_per_generation,
          models_updated: data?.length || 0
        });
      }
    }

    // Invalidate cache
    invalidateCreditCostsCache();


    res.status(200).json({
      success: errors.length === 0,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Updated ${results.length} categories${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/models
 * Get all models with their pricing (for detailed management)
 */
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('ai_models')
      .select('*')
      .order('category')
      .order('sort_order');

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch models',
        details: error.message
      });
    }

    res.status(200).json({
      success: true,
      data: data || []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * PUT /api/admin/models/:modelId
 * Update a specific model's pricing
 */
router.put('/:modelId', auth, requireAdmin, async (req, res) => {
  try {
    const { modelId } = req.params;
    const { cost_per_generation, display_name, description, is_active } = req.body;

    const client = supabaseAdmin || supabase;
    
    const updateData = { updated_at: new Date().toISOString() };
    if (cost_per_generation !== undefined) updateData.cost_per_generation = cost_per_generation;
    if (display_name !== undefined) updateData.display_name = display_name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await client
      .from('ai_models')
      .update(updateData)
      .eq('id', modelId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update model',
        details: error.message
      });
    }

    // Invalidate cache
    invalidateCreditCostsCache();

    res.status(200).json({
      success: true,
      data: data,
      message: 'Model updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;

