/**
 * =====================================================
 * AI MODELS API ROUTES
 * =====================================================
 * 
 * Endpoints for AI model information including credit costs
 */

const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const {
  getAllModelCosts,
  getModelsByCategory,
  getModelCreditCost,
  updateModelCreditCost
} = require('../services/modelCreditService');

/**
 * GET /api/models
 * Get all active AI models with their credit costs
 * Public endpoint - no auth required
 */
router.get('/', async (req, res) => {
  try {
    const models = await getAllModelCosts();
    
    res.status(200).json({
      success: true,
      data: models
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI models',
      message: error.message
    });
  }
});

/**
 * GET /api/models/category/:category
 * Get models by category
 * Categories: text_to_image, image_to_image, text_to_video, image_to_video
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const validCategories = ['text_to_image', 'image_to_image', 'text_to_video', 'image_to_video'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    const models = await getModelsByCategory(category);
    
    res.status(200).json({
      success: true,
      data: models,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models',
      message: error.message
    });
  }
});

/**
 * GET /api/models/:modelName/cost
 * Get credit cost for a specific model
 */
router.get('/:modelName/cost', async (req, res) => {
  try {
    const { modelName } = req.params;
    
    const cost = await getModelCreditCost(modelName);
    
    if (cost === null) {
      return res.status(404).json({
        success: false,
        error: 'Model not found',
        message: `Model "${modelName}" not found or inactive`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        model: modelName,
        cost
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch model cost',
      message: error.message
    });
  }
});

/**
 * PUT /api/models/:modelName/cost
 * Update credit cost for a specific model (Admin only)
 */
router.put('/:modelName/cost', auth, requireAdmin, async (req, res) => {
  try {
    const { modelName } = req.params;
    const { cost } = req.body;

    if (typeof cost !== 'number' || cost < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cost',
        message: 'Cost must be a positive number'
      });
    }

    const success = await updateModelCreditCost(modelName, cost);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Failed to update model cost',
        message: 'Model not found or update failed'
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully updated ${modelName} cost to ${cost} credits`,
      data: {
        model: modelName,
        cost
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update model cost',
      message: error.message
    });
  }
});

module.exports = router;


