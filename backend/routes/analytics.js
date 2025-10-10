/**
 * =====================================================
 * ANALYTICS API ROUTES
 * =====================================================
 * 
 * Endpoints for usage analytics and trends
 * Uses usage_summaries table for fast queries
 */

const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const { 
  getUserUsageSummary,
  getUserUsageTrend,
  getAggregatedStats,
  recalculateUsageSummary
} = require('../services/usageSummaryService');
const { supabase, supabaseAdmin } = require('../utils/supabase');

/**
 * GET /api/analytics/summary
 * Get user's overall usage summary (from table, fast!)
 */
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'all_time' } = req.query;

    const summary = await getUserUsageSummary(userId, period);

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'No usage summary found',
        message: 'Generate some content to see statistics'
      });
    }

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics summary',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/trends
 * Get usage trends over time
 */
router.get('/trends', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'daily', limit = 30 } = req.query;

    const validPeriods = ['daily', 'weekly', 'monthly'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid period',
        message: `Period must be one of: ${validPeriods.join(', ')}`
      });
    }

    const trends = await getUserUsageTrend(userId, period, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        period,
        limit: parseInt(limit),
        trends: trends.reverse() // Oldest first for chart display
      }
    });

  } catch (error) {
    console.error('Error fetching analytics trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/stats
 * Get detailed user statistics
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const client = supabaseAdmin || supabase;

    // Get all_time summary
    const allTimeSummary = await getUserUsageSummary(userId, 'all_time');

    // Get last 7 days trend
    const last7Days = await getUserUsageTrend(userId, 'daily', 7);

    // Calculate additional metrics
    const stats = {
      overall: allTimeSummary,
      last_7_days: {
        total_generations: last7Days.reduce((sum, d) => sum + (d.total_generations || 0), 0),
        total_credits_spent: last7Days.reduce((sum, d) => sum + (d.total_credits_spent || 0), 0),
        daily_average: last7Days.length > 0 
          ? (last7Days.reduce((sum, d) => sum + (d.total_credits_spent || 0), 0) / last7Days.length).toFixed(2)
          : 0
      },
      most_used_feature: allTimeSummary?.most_used_feature || 'None',
      success_rate: allTimeSummary 
        ? ((allTimeSummary.total_successful_generations / (allTimeSummary.total_generations || 1)) * 100).toFixed(2)
        : 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

/**
 * POST /api/analytics/recalculate
 * Recalculate usage summary from scratch (for data correction)
 */
router.post('/recalculate', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    console.log(`🔄 User ${userId} requested usage summary recalculation`);

    const stats = await recalculateUsageSummary(userId, 'all_time');

    res.status(200).json({
      success: true,
      message: 'Usage summary recalculated successfully',
      data: stats
    });

  } catch (error) {
    console.error('Error recalculating summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to recalculate summary',
      message: error.message
    });
  }
});

// =====================================================
// ADMIN ROUTES
// =====================================================

/**
 * GET /api/analytics/admin/platform-stats
 * Get platform-wide statistics (admin only)
 */
router.get('/admin/platform-stats', auth, requireAdmin, async (req, res) => {
  try {
    const { period = 'all_time', periodStart = null } = req.query;

    console.log(`📊 Admin requesting platform stats for ${period}`);

    const stats = await getAggregatedStats(period, periodStart);

    // Add additional calculations
    stats.average_credits_per_user = stats.total_users > 0 
      ? (stats.total_credits_spent / stats.total_users).toFixed(2)
      : 0;
    
    stats.success_rate = stats.total_generations > 0
      ? ((stats.total_successful / stats.total_generations) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/admin/top-users
 * Get top users by usage (admin only)
 */
router.get('/admin/top-users', auth, requireAdmin, async (req, res) => {
  try {
    const { limit = 10, sortBy = 'credits' } = req.query;
    const client = supabaseAdmin || supabase;

    const validSortFields = {
      credits: 'total_credits_spent',
      generations: 'total_generations',
      balance: 'credits_balance'
    };

    const sortField = validSortFields[sortBy] || 'total_credits_spent';

    const { data: topUsers, error } = await client
      .from('usage_summaries')
      .select(`
        user_id,
        credits_balance,
        total_generations,
        total_credits_spent,
        most_used_feature,
        profiles:user_id (email, username, created_at)
      `)
      .eq('period_type', 'all_time')
      .order(sortField, { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data: {
        top_users: topUsers || [],
        sorted_by: sortBy,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching top users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top users',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/admin/daily-trends
 * Get daily platform trends (admin only)
 */
router.get('/admin/daily-trends', auth, requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const client = supabaseAdmin || supabase;

    // Get daily summaries for all users
    const { data: dailySummaries, error } = await client
      .from('usage_summaries')
      .select('period_start, total_generations, total_credits_spent, credits_earned_in_period')
      .eq('period_type', 'daily')
      .gte('period_start', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('period_start', { ascending: true });

    if (error) {
      throw error;
    }

    // Group by date
    const trendsByDate = {};
    
    for (const summary of dailySummaries || []) {
      const date = summary.period_start.split('T')[0];
      
      if (!trendsByDate[date]) {
        trendsByDate[date] = {
          date,
          total_generations: 0,
          total_credits_spent: 0,
          total_credits_earned: 0,
          active_users: 0
        };
      }

      trendsByDate[date].total_generations += summary.total_generations || 0;
      trendsByDate[date].total_credits_spent += summary.total_credits_spent || 0;
      trendsByDate[date].total_credits_earned += summary.credits_earned_in_period || 0;
      trendsByDate[date].active_users += 1;
    }

    const trends = Object.values(trendsByDate);

    res.status(200).json({
      success: true,
      data: {
        days: parseInt(days),
        trends
      }
    });

  } catch (error) {
    console.error('Error fetching daily trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily trends',
      message: error.message
    });
  }
});

module.exports = router;

