const express = require("express");
const router = express.Router();
const { supabase, supabaseAdmin } = require("../utils/supabase");
const { auth, requireAdmin } = require("../middleware/auth");

// GET /api/plans - Get all active subscription plans
router.get("/", async (req, res) => {
  try {

    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('plans')
      .select(`
        id,
        name,
        display_name,
        description,
        price_monthly,
        price_yearly,
        stripe_price_id_monthly,
        stripe_price_id_yearly,
        stripe_product_id,
        credits_included,
        max_generations_per_month,
        features,
        badge,
        badge_color,
        cta,
        concurrent_image_generations,
        concurrent_video_generations,
        image_visibility,
        priority_support,
        priority_queue,
        seedream_unlimited,
        is_active,
        is_popular,
        sort_order,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription plans',
        details: error.message
      });
    }

    
    res.set('Cache-Control', 'no-store');
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

// GET /api/plans/admin - Get all plans including inactive ones (Admin only)
router.get("/admin", auth, requireAdmin, async (req, res) => {
  try {

    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('plans')
      .select(`
        id,
        name,
        display_name,
        description,
        price_monthly,
        price_yearly,
        stripe_price_id_monthly,
        stripe_price_id_yearly,
        stripe_product_id,
        credits_included,
        max_generations_per_month,
        features,
        badge,
        badge_color,
        cta,
        concurrent_image_generations,
        concurrent_video_generations,
        image_visibility,
        priority_support,
        priority_queue,
        seedream_unlimited,
        is_active,
        is_popular,
        sort_order,
        created_at,
        updated_at
      `)
      .order('sort_order');

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch plans',
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

// GET /api/plans/:id - Get a specific plan by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('plans')
      .select(`
        id,
        name,
        display_name,
        description,
        price_monthly,
        price_yearly,
        stripe_price_id_monthly,
        stripe_price_id_yearly,
        stripe_product_id,
        credits_included,
        max_generations_per_month,
        features,
        badge,
        badge_color,
        cta,
        concurrent_image_generations,
        concurrent_video_generations,
        image_visibility,
        priority_support,
        priority_queue,
        seedream_unlimited,
        is_active,
        is_popular,
        sort_order,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found',
        details: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    
    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// GET /api/plans/popular - Get the most popular plan
router.get("/popular", async (req, res) => {
  try {

    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('plans')
      .select(`
        id,
        name,
        display_name,
        description,
        price_monthly,
        price_yearly,
        stripe_price_id_monthly,
        stripe_price_id_yearly,
        stripe_product_id,
        credits_included,
        max_generations_per_month,
        features,
        badge,
        badge_color,
        cta,
        concurrent_image_generations,
        concurrent_video_generations,
        image_visibility,
        priority_support,
        priority_queue,
        seedream_unlimited,
        is_active,
        is_popular,
        sort_order,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .eq('is_popular', true)
      .order('sort_order')
      .limit(1)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'No popular plan found',
        details: error.message
      });
    }

    
    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// =====================================================
// ADMIN ROUTES - Protected by admin authentication
// =====================================================

// PUT /api/plans/:id - Update a specific plan (Admin only)
router.put("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    

    // Validate required fields
    const allowedFields = [
      'display_name',
      'price_monthly',
      'price_yearly',
      'credits_included',
      'max_generations_per_month',
      'features',
      'badge',
      'badge_color',
      'cta',
      'concurrent_image_generations',
      'concurrent_video_generations',
      'image_visibility',
      'priority_support',
      'priority_queue',
      'seedream_unlimited',
      'is_popular',
      'sort_order'
    ];

    // Filter only allowed fields
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Normalize features: allow string (comma/newline separated) or array of strings
    if (filteredUpdates.features !== undefined) {
      let normalizedFeatures = filteredUpdates.features;

      if (typeof normalizedFeatures === 'string') {
        // Split by newlines; do not split by commas to preserve number formatting like 5,000
        normalizedFeatures = normalizedFeatures
          .split(/\n/)
          .map(item => (item || '').trim())
          .filter(item => item.length > 0);
      }

      if (Array.isArray(normalizedFeatures)) {
        // Ensure all are strings, trimmed, unique, preserve order of first occurrence
        const seen = new Set();
        normalizedFeatures = normalizedFeatures
          .map(item => String(item || '').trim())
          .filter(item => item.length > 0 && !seen.has(item) && (seen.add(item), true));
      } else {
        // If invalid type, drop features from update to avoid bad data

        delete filteredUpdates.features;
      }

      if (normalizedFeatures) {
        filteredUpdates.features = normalizedFeatures;
      }
    }

    // If credits_included is being updated, also update or insert the credits line in features
    if (filteredUpdates.credits_included !== undefined) {
      const creditsLine = `${filteredUpdates.credits_included.toLocaleString()} credits per month`;

      if (Array.isArray(filteredUpdates.features)) {
        // Update in provided features list
        let found = false;
        const updated = filteredUpdates.features.map(f => {
          if (typeof f === 'string' && f.toLowerCase().includes('credits per month')) {
            found = true;
            return creditsLine;
          }
          return f;
        });
        if (!found) {
          updated.unshift(creditsLine);
        }
        filteredUpdates.features = updated;
      } else {
        // Fetch current features and update there
        const { data: currentPlan } = await (supabaseAdmin || supabase)
          .from('plans')
          .select('features')
          .eq('id', id)
          .single();

        if (currentPlan && Array.isArray(currentPlan.features)) {
          let found = false;
          const updated = currentPlan.features.map(feature => {
            if (typeof feature === 'string' && feature.toLowerCase().includes('credits per month')) {
              found = true;
              return creditsLine;
            }
            return feature;
          });
          if (!found) {
            updated.unshift(creditsLine);
          }
          filteredUpdates.features = updated;
        } else {
          filteredUpdates.features = [creditsLine];
        }
      }
    }


    // Add updated_at timestamp
    filteredUpdates.updated_at = new Date().toISOString();

    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('plans')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update plan',
        details: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    
    res.status(200).json({
      success: true,
      data: data,
      message: 'Plan updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// POST /api/plans - Create a new plan (Admin only)
router.post("/", auth, requireAdmin, async (req, res) => {
  try {
    const planData = req.body;
    

    // Validate required fields
    const requiredFields = ['name', 'display_name', 'price_monthly', 'price_yearly', 'credits_included'];
    const missingFields = requiredFields.filter(field => !planData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: `Required: ${missingFields.join(', ')}`
      });
    }

    // Set defaults for optional fields
    const newPlan = {
      ...planData,
      is_active: true,
      is_popular: false,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('plans')
      .insert(newPlan)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create plan',
        details: error.message
      });
    }

    
    res.status(201).json({
      success: true,
      data: data,
      message: 'Plan created successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// DELETE /api/plans/:id - Delete a plan (Admin only)
router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    

    const client = supabaseAdmin || supabase;
    
    // Instead of hard delete, we'll deactivate the plan
    const { data, error } = await client
      .from('plans')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to delete plan',
        details: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    
    res.status(200).json({
      success: true,
      data: data,
      message: 'Plan deactivated successfully'
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
