/**
 * =====================================================
 * CREDITS API ROUTES
 * =====================================================
 * 
 * Handles credit-related operations:
 * - Get credit costs for different generation types
 * - Get user's current credit balance
 * - Get credit transaction history
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../utils/supabase');
const {
  getAllCreditCosts,
  getCreditCost,
  getGenerationTypeName,
  isValidGenerationType
} = require('../config/creditPricing');

// =====================================================
// PUBLIC ROUTES (No authentication required)
// =====================================================

/**
 * GET /api/credits/costs
 * Get credit costs for all generation types
 * This is public so users can see costs before signing up
 */
router.get('/costs', async (req, res) => {
  try {
    const costs = await getAllCreditCosts();
    
    // Add human-readable names
    const costsWithNames = Object.entries(costs).map(([type, cost]) => ({
      type,
      name: getGenerationTypeName(type),
      cost
    }));

    res.status(200).json({
      success: true,
      data: {
        costs: costs, // Raw object for easy lookup
        details: costsWithNames // Array with names for display
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit costs',
      message: error.message
    });
  }
});

/**
 * GET /api/credits/costs/:generationType
 * Get credit cost for a specific generation type
 */
router.get('/costs/:generationType', async (req, res) => {
  try {
    const { generationType } = req.params;

    if (!(await isValidGenerationType(generationType))) {
      const allCosts = await getAllCreditCosts();
      return res.status(400).json({
        success: false,
        error: 'Invalid generation type',
        message: `Valid types are: ${Object.keys(allCosts).join(', ')}`
      });
    }

    const cost = await getCreditCost(generationType);
    const name = getGenerationTypeName(generationType);

    res.status(200).json({
      success: true,
      data: {
        type: generationType,
        name,
        cost
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to fetch credit cost',
      message: error.message
    });
  }
});

// =====================================================
// PROTECTED ROUTES (Authentication required)
// =====================================================

/**
 * GET /api/credits/balance
 * Get current user's credit balance
 */
router.get('/balance', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const client = supabaseAdmin || supabase;

    // Get user's credit balance
    const { data, error } = await client
      .from('user_credits')
      .select('balance, lifetime_earned, lifetime_spent, updated_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no credits record exists, create one
      if (error.code === 'PGRST116') {
        const { data: newCredit, error: createError } = await client
          .from('user_credits')
          .insert({
            user_id: userId,
            balance: 0,
            lifetime_earned: 0,
            lifetime_spent: 0
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        return res.status(200).json({
          success: true,
          data: {
            balance: 0,
            lifetime_earned: 0,
            lifetime_spent: 0,
            updated_at: newCredit.updated_at
          }
        });
      }
      
      throw error;
    }

    res.status(200).json({
      success: true,
      data: {
        balance: data.balance,
        lifetime_earned: data.lifetime_earned,
        lifetime_spent: data.lifetime_spent,
        updated_at: data.updated_at
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit balance',
      message: error.message
    });
  }
});

/**
 * GET /api/credits/transactions
 * Get user's credit transaction history
 * Query params:
 * - limit: number of transactions to return (default: 50)
 * - offset: offset for pagination (default: 0)
 * - type: filter by transaction type (earned, spent, purchased, bonus, refund)
 */
router.get('/transactions', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, offset = 0, type } = req.query;
    const client = supabaseAdmin || supabase;

    // Build query
    let query = client
      .from('credit_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Add type filter if provided
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data: {
        transactions: data || [],
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit transactions',
      message: error.message
    });
  }
});

/**
 * GET /api/credits/summary
 * Get comprehensive credit summary for user
 * Includes balance, recent transactions, and cost information
 */
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const client = supabaseAdmin || supabase;

    // Get credit balance
    const { data: credits, error: creditsError } = await client
      .from('user_credits')
      .select('balance, lifetime_earned, lifetime_spent, updated_at')
      .eq('user_id', userId)
      .single();

    if (creditsError && creditsError.code !== 'PGRST116') {
      throw creditsError;
    }

    // Get recent transactions (last 10)
    const { data: recentTransactions } = await client
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get generation costs
    const costs = getAllCreditCosts();

    // Calculate how many generations user can afford
    const balance = credits?.balance || 0;
    const affordableGenerations = Object.entries(costs).reduce((acc, [type, cost]) => {
      acc[type] = Math.floor(balance / cost);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        balance: credits?.balance || 0,
        lifetime_earned: credits?.lifetime_earned || 0,
        lifetime_spent: credits?.lifetime_spent || 0,
        updated_at: credits?.updated_at || new Date().toISOString(),
        recent_transactions: recentTransactions || [],
        generation_costs: costs,
        affordable_generations: affordableGenerations
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit summary',
      message: error.message
    });
  }
});

module.exports = router;

