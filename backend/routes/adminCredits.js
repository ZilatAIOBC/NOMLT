/**
 * =====================================================
 * ADMIN CREDIT MANAGEMENT ROUTES
 * =====================================================
 * 
 * Admin-only endpoints for credit management and recovery
 */

const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../utils/supabase');
const { 
  addCredits, 
  deductCredits, 
  refundCredits, 
  handleGenerationFailure 
} = require('../services/creditService');

/**
 * POST /api/admin/credits/manual-adjust
 * Manually adjust user credits (admin only)
 */
router.post('/manual-adjust', auth, requireAdmin, async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;

    if (!userId || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'userId and amount (number) are required'
      });
    }

    const validTypes = ['earned', 'purchased', 'bonus', 'refund'];
    const adjustmentType = type || 'bonus';

    if (!validTypes.includes(adjustmentType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type',
        message: `Type must be one of: ${validTypes.join(', ')}`
      });
    }

    const result = await addCredits(
      userId,
      Math.abs(amount),
      adjustmentType,
      description || `Manual adjustment by admin ${req.user._id}`,
      null,
      'admin'
    );

    res.status(200).json({
      success: true,
      message: `Successfully adjusted credits for user ${userId}`,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to adjust credits',
      message: error.message
    });
  }
});

/**
 * GET /api/admin/credits/failed-generations
 * Get generations that failed but have credits deducted
 */
router.get('/failed-generations', auth, requireAdmin, async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    const { limit = 50 } = req.query;

    // Find failed generations with credits_used > 0 but no refund
    const { data: failedGens, error } = await client
      .from('generations')
      .select(`
        id,
        user_id,
        category,
        status,
        credits_used,
        error_message,
        created_at
      `)
      .eq('status', 'failed')
      .gt('credits_used', 0)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    // Check which ones already have refunds
    const generationsWithRefundStatus = await Promise.all(
      (failedGens || []).map(async (gen) => {
        const { data: refund } = await client
          .from('credit_transactions')
          .select('id, amount, created_at')
          .eq('reference_id', gen.id)
          .eq('type', 'refund')
          .maybeSingle();

        return {
          ...gen,
          has_refund: !!refund,
          refund_info: refund
        };
      })
    );

    const needsRefund = generationsWithRefundStatus.filter(g => !g.has_refund);

    res.status(200).json({
      success: true,
      data: {
        total_failed: generationsWithRefundStatus.length,
        needs_refund: needsRefund.length,
        already_refunded: generationsWithRefundStatus.length - needsRefund.length,
        generations: generationsWithRefundStatus
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch failed generations',
      message: error.message
    });
  }
});

/**
 * POST /api/admin/credits/refund-failed
 * Refund credits for a failed generation
 */
router.post('/refund-failed/:generationId', auth, requireAdmin, async (req, res) => {
  try {
    const { generationId } = req.params;
    const { reason } = req.body;
    const client = supabaseAdmin || supabase;

    // Get generation details
    const { data: generation, error: genError } = await client
      .from('generations')
      .select('user_id, category, credits_used, status')
      .eq('id', generationId)
      .single();

    if (genError || !generation) {
      return res.status(404).json({
        success: false,
        error: 'Generation not found'
      });
    }

    if (!generation.credits_used || generation.credits_used === 0) {
      return res.status(400).json({
        success: false,
        error: 'No credits to refund',
        message: 'This generation has no credits deducted'
      });
    }

    // Refund the credits
    const result = await refundCredits(
      generation.user_id,
      generation.credits_used,
      generation.category,
      generationId,
      reason || 'Manual refund by admin'
    );

    res.status(200).json({
      success: true,
      message: `Successfully refunded ${generation.credits_used} credits`,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to refund credits',
      message: error.message
    });
  }
});

/**
 * POST /api/admin/credits/bulk-refund-failed
 * Bulk refund all failed generations without refunds
 */
router.post('/bulk-refund-failed', auth, requireAdmin, async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;

    // Find all failed generations with credits but no refund
    const { data: failedGens, error } = await client
      .from('generations')
      .select('id, user_id, category, credits_used')
      .eq('status', 'failed')
      .gt('credits_used', 0)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const results = {
      total: failedGens?.length || 0,
      refunded: 0,
      already_refunded: 0,
      errors: []
    };

    for (const gen of failedGens || []) {
      try {
        // Check if already refunded
        const { data: existingRefund } = await client
          .from('credit_transactions')
          .select('id')
          .eq('reference_id', gen.id)
          .eq('type', 'refund')
          .maybeSingle();

        if (existingRefund) {
          results.already_refunded++;
          continue;
        }

        // Refund the credits
        await refundCredits(
          gen.user_id,
          gen.credits_used,
          gen.category,
          gen.id,
          'Bulk refund by admin'
        );

        results.refunded++;
      } catch (refundError) {
        results.errors.push({
          generation_id: gen.id,
          error: refundError.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk refund complete: ${results.refunded} refunded, ${results.already_refunded} already refunded`,
      data: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Bulk refund failed',
      message: error.message
    });
  }
});

/**
 * GET /api/admin/credits/stats
 * Get credit system statistics
 */
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;

    // Total credits in circulation
    const { data: totalCredits } = await client
      .from('user_credits')
      .select('balance, lifetime_earned, lifetime_spent');

    const stats = {
      total_balance: 0,
      total_earned: 0,
      total_spent: 0,
      total_users: totalCredits?.length || 0
    };

    totalCredits?.forEach(user => {
      stats.total_balance += user.balance || 0;
      stats.total_earned += user.lifetime_earned || 0;
      stats.total_spent += user.lifetime_spent || 0;
    });

    // Recent transactions
    const { data: recentTransactions } = await client
      .from('credit_transactions')
      .select('type, amount, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    // Group by type
    const transactionsByType = {
      spent: 0,
      purchased: 0,
      refund: 0,
      bonus: 0,
      earned: 0
    };

    recentTransactions?.forEach(tx => {
      if (transactionsByType.hasOwnProperty(tx.type)) {
        transactionsByType[tx.type] += tx.amount;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        transactions_by_type: transactionsByType,
        recent_transaction_count: recentTransactions?.length || 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit statistics',
      message: error.message
    });
  }
});

module.exports = router;

