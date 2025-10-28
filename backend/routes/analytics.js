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


    const stats = await recalculateUsageSummary(userId, 'all_time');

    res.status(200).json({
      success: true,
      message: 'Usage summary recalculated successfully',
      data: stats
    });

  } catch (error) {
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
 * GET /api/analytics/admin/dashboard-stats
 * Get main dashboard statistics (admin only)
 */
router.get('/admin/dashboard-stats', auth, requireAdmin, async (req, res) => {
  try {
    const client = supabaseAdmin; // Use admin client to avoid RLS issues


    // 1. Get total users from Supabase profiles table (excluding admins)
    const { count: totalUsers, error: usersError } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('role', 'admin');

    if (usersError && usersError.code !== 'PGRST116') {
    }

    // 2. Get all subscriptions (active and past) with plan details for revenue calculation
    const { data: allSubscriptionsData, error: subsError } = await client
      .from('subscriptions')
      .select(`
        id,
        status,
        created_at,
        current_period_start,
        current_period_end,
        canceled_at,
        plans:plan_id (
          id,
          name,
          display_name,
          price_monthly
        )
      `);

    if (subsError && subsError.code !== 'PGRST116') {
    }


    const activeSubscriptions = allSubscriptionsData?.filter(sub => sub.status === 'active').length || 0;

    // 3. Calculate all-time revenue from all subscriptions
    // This calculates total revenue collected based on how long each subscription has been active
    let totalRevenue = 0;
    
    for (const sub of allSubscriptionsData || []) {
      const planPrice = sub.plans?.price_monthly || 0;
      if (planPrice === 0) {
        continue;
      }

      const createdDate = new Date(sub.created_at);
      const now = new Date();
      
      // Determine end date (either when it ended or now if still active)
      let endDate;
      if (sub.status === 'active') {
        endDate = now;
      } else if (sub.canceled_at) {
        endDate = new Date(sub.canceled_at);
      } else {
        endDate = now;
      }

      // Calculate months active (minimum 1 month if subscription existed)
      const timeDiff = endDate - createdDate;
      let monthsDiff;
      
      if (timeDiff < 0) {
        // Subscription created in the future (test data) - treat as 1 month
        monthsDiff = 1;
      } else {
        monthsDiff = Math.max(1, Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30)));
      }
      
      const subscriptionRevenue = planPrice * monthsDiff;
      totalRevenue += subscriptionRevenue;
    }
    

    // Calculate MRR from active subscriptions only
    const mrr = allSubscriptionsData
      ?.filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + (sub.plans?.price_monthly || 0), 0) || 0;

    // 4. Get total credits used from usage_summaries (all_time period)
    const { data: usageSummaries, error: usageError } = await client
      .from('usage_summaries')
      .select('total_credits_spent')
      .eq('period_type', 'all_time');

    if (usageError) {
    }

    const totalCreditsUsed = (usageSummaries || []).reduce(
      (sum, summary) => sum + (summary.total_credits_spent || 0), 
      0
    );

    const stats = {
      total_users: totalUsers || 0,
      active_subscriptions: activeSubscriptions,
      total_credits_used: totalCreditsUsed || 0,
      total_revenue: totalRevenue || 0,  // All-time revenue
      mrr: mrr || 0  // Monthly Recurring Revenue
    };


    // Set cache control headers to prevent stale data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/admin/platform-stats
 * Get platform-wide statistics (admin only)
 */
router.get('/admin/platform-stats', auth, requireAdmin, async (req, res) => {
  try {
    const { period = 'all_time', periodStart = null } = req.query;


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
        profiles:user_id (
          email, 
          name, 
          created_at,
          role
        )
      `)
      .eq('period_type', 'all_time')
      .order(sortField, { ascending: false })
      .limit(parseInt(limit) * 2); // Fetch more to account for filtering

    if (error) {
      throw error;
    }

    // Filter out admin users and enhance with subscription/plan data
    const enhancedUsers = await Promise.all((topUsers || [])
      .filter(user => user.profiles?.role !== 'admin') // Exclude admins
      .slice(0, parseInt(limit)) // Limit to requested number after filtering
      .map(async (user) => {
      // Get active subscription with plan details
      const { data: subscription } = await client
        .from('subscriptions')
        .select(`
          id,
          status,
          plans:plan_id (
            name,
            price_monthly
          )
        `)
        .eq('user_id', user.user_id)
        .eq('status', 'active')
        .maybeSingle();

      return {
        user_id: user.user_id,
        email: user.profiles?.email || 'Unknown',
        name: user.profiles?.name || 'Unknown User',
        credits_balance: user.credits_balance || 0,
        total_generations: user.total_generations || 0,
        total_credits_spent: user.total_credits_spent || 0,
        most_used_feature: user.most_used_feature || 'None',
        plan_name: subscription?.plans?.name || 'Free',
        plan_price: subscription?.plans?.price_monthly || 0,
        created_at: user.profiles?.created_at
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        top_users: enhancedUsers,
        sorted_by: sortBy,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
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
      // Use daily total_credits_spent as the per-day usage value
      trendsByDate[date].total_credits_spent += summary.total_credits_spent || 0;
      trendsByDate[date].total_credits_earned += summary.credits_earned_in_period || 0;
      trendsByDate[date].active_users += 1;
    }

    const trends = Object.values(trendsByDate);

    // Set cache control headers to prevent stale data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: {
        days: parseInt(days),
        trends
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily trends',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/admin/feature-usage
 * Get feature usage statistics (admin only)
 */
router.get('/admin/feature-usage', auth, requireAdmin, async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;


    // Get all_time summaries from all users
    const { data: usageSummaries, error } = await client
      .from('usage_summaries')
      .select(`
        text_to_image_count,
        text_to_image_credits,
        image_to_image_count,
        image_to_image_credits,
        text_to_video_count,
        text_to_video_credits,
        image_to_video_count,
        image_to_video_credits
      `)
      .eq('period_type', 'all_time');

    if (error) {
      throw error;
    }

    // Aggregate feature usage
    const features = {
      'text-to-image': { count: 0, credits: 0 },
      'image-to-image': { count: 0, credits: 0 },
      'text-to-video': { count: 0, credits: 0 },
      'image-to-video': { count: 0, credits: 0 }
    };

    for (const summary of usageSummaries || []) {
      features['text-to-image'].count += summary.text_to_image_count || 0;
      features['text-to-image'].credits += summary.text_to_image_credits || 0;
      
      features['image-to-image'].count += summary.image_to_image_count || 0;
      features['image-to-image'].credits += summary.image_to_image_credits || 0;
      
      features['text-to-video'].count += summary.text_to_video_count || 0;
      features['text-to-video'].credits += summary.text_to_video_credits || 0;
      
      features['image-to-video'].count += summary.image_to_video_count || 0;
      features['image-to-video'].credits += summary.image_to_video_credits || 0;
    }

    // Calculate total credits for percentage calculation
    const totalCredits = Object.values(features).reduce((sum, f) => sum + f.credits, 0);

    // Format response
    const featureUsage = Object.entries(features).map(([name, data]) => ({
      name,
      count: data.count,
      credits: data.credits,
      percentage: totalCredits > 0 ? ((data.credits / totalCredits) * 100).toFixed(2) : 0
    }));

    // Sort by credits (descending)
    featureUsage.sort((a, b) => b.credits - a.credits);


    // Set cache control headers to prevent stale data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: {
        features: featureUsage,
        total_credits: totalCredits
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature usage statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/admin/cost-per-feature
 * Get cost per feature based on usage and AI model pricing (admin only)
 * Calculates costs in dollars using conversion: $4.25 = 6000 credits
 */
router.get('/admin/cost-per-feature', auth, requireAdmin, async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;


    // Conversion rate: $4.25 = 6000 credits
    const DOLLARS_PER_CREDIT = 4.25 / 6000; // $0.000708333...

    // 1. Get feature usage statistics
    const { data: usageSummaries, error: usageError } = await client
      .from('usage_summaries')
      .select(`
        text_to_image_count,
        text_to_image_credits,
        image_to_image_count,
        image_to_image_credits,
        text_to_video_count,
        text_to_video_credits,
        image_to_video_count,
        image_to_video_credits
      `)
      .eq('period_type', 'all_time');

    if (usageError) {
      throw usageError;
    }

    // 2. Get AI model pricing for each category
    const { data: aiModels, error: modelsError } = await client
      .from('ai_models')
      .select('category, cost_per_generation, display_name')
      .eq('is_active', true)
      .order('category')
      .order('sort_order');

    if (modelsError) {
      throw modelsError;
    }

    // Get the first model's cost for each category (as default pricing)
    const categoryPricing = {};
    const categories = ['text_to_image', 'image_to_image', 'text_to_video', 'image_to_video'];
    
    categories.forEach(category => {
      const modelInCategory = aiModels?.find(m => m.category === category);
      if (modelInCategory) {
        categoryPricing[category] = modelInCategory.cost_per_generation;
      }
    });

    // 3. Aggregate usage counts
    const featureUsage = {
      'text_to_image': 0,
      'image_to_image': 0,
      'text_to_video': 0,
      'image_to_video': 0
    };

    for (const summary of usageSummaries || []) {
      featureUsage.text_to_image += summary.text_to_image_count || 0;
      featureUsage.image_to_image += summary.image_to_image_count || 0;
      featureUsage.text_to_video += summary.text_to_video_count || 0;
      featureUsage.image_to_video += summary.image_to_video_count || 0;
    }

    // 4. Calculate cost per feature (usage count × cost per generation × dollar conversion)
    const costPerFeature = [];
    const featureNames = {
      'text_to_image': 'Text to Image',
      'image_to_image': 'Image to Image',
      'text_to_video': 'Text to Video',
      'image_to_video': 'Image to Video'
    };

    for (const [key, displayName] of Object.entries(featureNames)) {
      const usageCount = featureUsage[key];
      const costPerGen = categoryPricing[key] || 0;
      const totalCredits = usageCount * costPerGen;
      const totalCostDollars = totalCredits * DOLLARS_PER_CREDIT;

      costPerFeature.push({
        name: displayName,
        category: key,
        usage_count: usageCount,
        cost_per_generation: costPerGen,
        total_credits: totalCredits,
        // keep full precision; frontend will format for display
        total_cost_usd: Number(totalCostDollars)
      });
    }

    // Sort by total cost (descending)
    costPerFeature.sort((a, b) => b.total_cost_usd - a.total_cost_usd);

    const totalCostUSD = costPerFeature.reduce((sum, f) => sum + f.total_cost_usd, 0);


    // Set cache control headers to prevent stale data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: {
        features: costPerFeature,
        // keep precision here as well
        total_cost_usd: Number(totalCostUSD),
        conversion_rate: {
          dollars: 4.25,
          credits: 6000,
          dollars_per_credit: DOLLARS_PER_CREDIT
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cost per feature statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/admin/monthly-trends
 * Get month-over-month growth trends (admin only)
 * Compares current month vs previous month for revenue, users, and usage
 */
router.get('/admin/monthly-trends', auth, requireAdmin, async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;


    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);


    // 1. Calculate Revenue Growth (from subscriptions)
    const { data: allSubscriptions } = await client
      .from('subscriptions')
      .select(`
        id,
        status,
        created_at,
        current_period_start,
        plans:plan_id (
          price_monthly
        )
      `);

    // Current month revenue (active subscriptions)
    const currentMonthRevenue = (allSubscriptions || [])
      .filter(sub => {
        const createdDate = new Date(sub.created_at);
        return sub.status === 'active' || createdDate >= currentMonthStart;
      })
      .reduce((sum, sub) => sum + (sub.plans?.price_monthly || 0), 0);

    // Previous month revenue (subscriptions that were active during previous month)
    const previousMonthRevenue = (allSubscriptions || [])
      .filter(sub => {
        const createdDate = new Date(sub.created_at);
        return createdDate < currentMonthStart && createdDate >= previousMonthStart;
      })
      .reduce((sum, sub) => sum + (sub.plans?.price_monthly || 0), 0);

    const revenueGrowth = previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : currentMonthRevenue > 0 ? 100 : 0;


    // 2. Calculate User Growth
    const { count: currentMonthUsers } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', currentMonthStart.toISOString())
      .neq('role', 'admin');

    const { count: previousMonthUsers } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousMonthStart.toISOString())
      .lt('created_at', currentMonthStart.toISOString())
      .neq('role', 'admin');

    const userGrowth = previousMonthUsers > 0
      ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100
      : currentMonthUsers > 0 ? 100 : 0;


    // 3. Calculate Usage Growth (credits spent)
    // Use daily summaries and aggregate by month
    const { data: currentMonthUsage } = await client
      .from('usage_summaries')
      .select('total_credits_spent')
      .eq('period_type', 'daily')
      .gte('period_start', currentMonthStart.toISOString());

    const currentMonthCredits = (currentMonthUsage || []).reduce(
      (sum, u) => sum + (u.total_credits_spent || 0),
      0
    );

    const { data: previousMonthUsage } = await client
      .from('usage_summaries')
      .select('total_credits_spent')
      .eq('period_type', 'daily')
      .gte('period_start', previousMonthStart.toISOString())
      .lt('period_start', currentMonthStart.toISOString());

    const previousMonthCredits = (previousMonthUsage || []).reduce(
      (sum, u) => sum + (u.total_credits_spent || 0),
      0
    );

    const usageGrowth = previousMonthCredits > 0
      ? ((currentMonthCredits - previousMonthCredits) / previousMonthCredits) * 100
      : currentMonthCredits > 0 ? 100 : 0;


    const trends = {
      revenue_growth: Number(revenueGrowth.toFixed(1)),
      user_growth: Number(userGrowth.toFixed(1)),
      usage_growth: Number(usageGrowth.toFixed(1)),
      current_month: {
        revenue: currentMonthRevenue,
        users: currentMonthUsers || 0,
        credits: currentMonthCredits
      },
      previous_month: {
        revenue: previousMonthRevenue,
        users: previousMonthUsers || 0,
        credits: previousMonthCredits
      }
    };


    // Set cache control headers to prevent stale data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: trends
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch monthly trends',
      message: error.message
    });
  }
});

module.exports = router;

