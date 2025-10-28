/**
 * =====================================================
 * USAGE SUMMARY SERVICE
 * =====================================================
 * 
 * Manages usage_summaries table for fast analytics
 * Updates in real-time and creates periodic snapshots
 */

const { supabase, supabaseAdmin } = require('../utils/supabase');

/**
 * Get or create usage summary for a user and period
 * @param {string} userId - User ID
 * @param {string} periodType - 'all_time', 'daily', 'weekly', 'monthly'
 * @param {Date} periodStart - Start of the period
 * @returns {Promise<Object>} Usage summary record
 */
async function getOrCreateUsageSummary(userId, periodType = 'all_time', periodStart = null) {
  try {
    const client = supabaseAdmin || supabase;
    
    // For all_time, use user's creation date
    if (periodType === 'all_time' && !periodStart) {
      const { data: profile } = await client
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();
      
      periodStart = profile?.created_at || new Date().toISOString();
    }
    
    // For daily/weekly/monthly, use provided date or today
    if (!periodStart) {
      periodStart = new Date().toISOString();
    }

    // Try to get existing summary
    const { data: existing, error } = await client
      .from('usage_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', periodType)
      .eq('period_start', periodStart)
      .maybeSingle();

    if (existing) {
      return existing;
    }

    // Create new summary
    const { data: newSummary, error: createError } = await client
      .from('usage_summaries')
      .insert({
        user_id: userId,
        period_type: periodType,
        period_start: periodStart,
        period_end: periodType === 'all_time' ? null : new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create usage summary: ${createError.message}`);
    }

    return newSummary;

  } catch (error) {
    throw error;
  }
}

/**
 * Update usage summary after a generation
 * Updates both all_time and daily summaries
 * @param {string} userId - User ID
 * @param {Object} generationData - Generation data
 */
async function updateUsageSummaryAfterGeneration(userId, generationData) {
  try {
    const {
      generationType, // 'text-to-image', etc.
      creditsUsed,
      status, // 'completed' or 'failed'
      createdAt
    } = generationData;


    const client = supabaseAdmin || supabase;

    // Get current credits
    const { data: userCredits } = await client
      .from('user_credits')
      .select('balance, lifetime_earned, lifetime_spent')
      .eq('user_id', userId)
      .single();

    // Prepare field names (convert text-to-image → text_to_image)
    const typeKey = generationType.replace(/-/g, '_');
    const countField = `${typeKey}_count`;
    const creditsField = `${typeKey}_credits`;
    const successField = `${typeKey}_successful`;
    const failedField = `${typeKey}_failed`;

    // Update all_time summary
    await updateSummaryRecord(userId, 'all_time', null, {
      [countField]: 1,
      [creditsField]: creditsUsed,
      [successField]: status === 'completed' ? 1 : 0,
      [failedField]: status === 'failed' ? 1 : 0,
      total_generations: 1,
      total_credits_spent: creditsUsed,
      total_successful_generations: status === 'completed' ? 1 : 0,
      total_failed_generations: status === 'failed' ? 1 : 0,
      total_api_calls: 1, // Count this API call
      credits_balance: userCredits?.balance || 0,
      lifetime_credits_earned: userCredits?.lifetime_earned || 0,
      lifetime_credits_spent: userCredits?.lifetime_spent || 0,
      credits_spent_in_period: creditsUsed
    });

    // Update daily summary (NO lifetime fields for daily!)
    // Use UTC to avoid timezone issues - get the date in UTC
    const createdDate = createdAt ? new Date(createdAt) : new Date();
    const todayUTC = new Date(Date.UTC(
      createdDate.getUTCFullYear(),
      createdDate.getUTCMonth(),
      createdDate.getUTCDate(),
      0, 0, 0, 0
    ));
    
    
    await updateSummaryRecord(userId, 'daily', todayUTC.toISOString(), {
      [countField]: 1,
      [creditsField]: creditsUsed,
      [successField]: status === 'completed' ? 1 : 0,
      [failedField]: status === 'failed' ? 1 : 0,
      total_generations: 1,
      total_credits_spent: creditsUsed,
      total_successful_generations: status === 'completed' ? 1 : 0,
      total_failed_generations: status === 'failed' ? 1 : 0,
      total_api_calls: 1, // Count this API call
      credits_balance: userCredits?.balance || 0,
      credits_spent_in_period: creditsUsed
      // Note: lifetime_* fields are ONLY for all_time records
    });


  } catch (error) {
    // Don't throw - generation already succeeded
  }
}

/**
 * Update a summary record (increment counters)
 * @param {string} userId - User ID
 * @param {string} periodType - Period type
 * @param {string} periodStart - Period start date
 * @param {Object} increments - Fields to increment
 */
async function updateSummaryRecord(userId, periodType, periodStart, increments) {
  try {
    const client = supabaseAdmin || supabase;

    // Get or create the summary
    const summary = await getOrCreateUsageSummary(userId, periodType, periodStart);

    // Build update object (increment existing values)
    const updates = {
      updated_at: new Date().toISOString()
    };

    for (const [field, value] of Object.entries(increments)) {
      // For balance fields, set directly (not increment)
      if (field === 'credits_balance' || field === 'lifetime_credits_earned' || field === 'lifetime_credits_spent') {
        updates[field] = value;
      } else {
        // For counters, increment
        updates[field] = (summary[field] || 0) + value;
      }
    }

    // Calculate average
    if (updates.total_generations && updates.total_credits_spent) {
      updates.average_credits_per_generation = 
        (updates.total_credits_spent / updates.total_generations).toFixed(2);
    }

    // Determine most used feature
    const counts = {
      'text-to-image': updates.text_to_image_count || 0,
      'image-to-image': updates.image_to_image_count || 0,
      'text-to-video': updates.text_to_video_count || 0,
      'image-to-video': updates.image_to_video_count || 0
    };
    const mostUsed = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    updates.most_used_feature = mostUsed[1] > 0 ? mostUsed[0] : null;

    // Update the record
    const { error } = await client
      .from('usage_summaries')
      .update(updates)
      .eq('id', summary.id);

    if (error) {
      throw new Error(`Failed to update usage summary: ${error.message}`);
    }

  } catch (error) {
    throw error;
  }
}

/**
 * Update summary when credits are added (subscription, purchase)
 * @param {string} userId - User ID
 * @param {number} amount - Credits added
 * @param {string} type - Transaction type
 */
async function updateUsageSummaryAfterCreditsAdded(userId, amount, type) {
  try {

    const client = supabaseAdmin || supabase;

    // Get current credits
    const { data: userCredits } = await client
      .from('user_credits')
      .select('balance, lifetime_earned, lifetime_spent')
      .eq('user_id', userId)
      .single();

    // Update all_time summary
    await updateSummaryRecord(userId, 'all_time', null, {
      credits_earned_in_period: amount,
      credits_balance: userCredits?.balance || 0,
      lifetime_credits_earned: userCredits?.lifetime_earned || 0,
      lifetime_credits_spent: userCredits?.lifetime_spent || 0
    });

    // Update today's summary - use UTC to avoid timezone issues
    const now = new Date();
    const todayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    
    await updateSummaryRecord(userId, 'daily', todayUTC.toISOString(), {
      credits_earned_in_period: amount,
      credits_balance: userCredits?.balance || 0
    });

  } catch (error) {
    // Don't throw - credits already added
  }
}

/**
 * Create daily snapshot for all active users
 * Run this via cron job at midnight
 */
async function createDailySummariesForAllUsers() {
  try {
    
    const client = supabaseAdmin || supabase;
    // Use UTC to avoid timezone issues
    const now = new Date();
    const today = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));

    // Get all users with activity in last 30 days
    const { data: activeUsers } = await client
      .from('user_credits')
      .select('user_id');

    let created = 0;
    let errors = 0;

    for (const user of activeUsers || []) {
      try {
        // This will create a daily snapshot
        await getOrCreateUsageSummary(user.user_id, 'daily', today.toISOString());
        created++;
      } catch (error) {
        errors++;
      }
    }

    return { created, errors };

  } catch (error) {
    throw error;
  }
}

/**
 * Get usage summary for a user
 * @param {string} userId - User ID
 * @param {string} periodType - Period type
 * @param {Date} periodStart - Optional period start
 * @returns {Promise<Object>} Usage summary
 */
async function getUserUsageSummary(userId, periodType = 'all_time', periodStart = null) {
  try {
    const client = supabaseAdmin || supabase;

    let query = client
      .from('usage_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', periodType);

    if (periodStart) {
      query = query.eq('period_start', periodStart);
    }

    const { data, error } = periodStart 
      ? await query.single()
      : await query.order('period_start', { ascending: false }).limit(1).maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;

  } catch (error) {
    return null;
  }
}

/**
 * Get usage trend (multiple periods)
 * @param {string} userId - User ID
 * @param {string} periodType - 'daily', 'weekly', 'monthly'
 * @param {number} limit - Number of periods to fetch
 * @returns {Promise<Array>} Array of summaries
 */
async function getUserUsageTrend(userId, periodType = 'daily', limit = 30) {
  try {
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('usage_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', periodType)
      .order('period_start', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];

  } catch (error) {
    return [];
  }
}

/**
 * Get aggregated stats for admin dashboard
 * @param {string} periodType - Period type
 * @param {Date} periodStart - Optional period start
 * @returns {Promise<Object>} Aggregated statistics
 */
async function getAggregatedStats(periodType = 'all_time', periodStart = null) {
  try {
    const client = supabaseAdmin || supabase;

    let query = client
      .from('usage_summaries')
      .select('*')
      .eq('period_type', periodType);

    if (periodStart) {
      query = query.eq('period_start', periodStart);
    }

    const { data: summaries, error } = await query;

    if (error) {
      throw error;
    }

    // Aggregate across all users
    const aggregated = {
      total_users: summaries?.length || 0,
      total_generations: 0,
      total_credits_spent: 0,
      total_credits_balance: 0,
      total_successful: 0,
      total_failed: 0,
      by_type: {
        'text-to-image': { count: 0, credits: 0, successful: 0, failed: 0 },
        'image-to-image': { count: 0, credits: 0, successful: 0, failed: 0 },
        'text-to-video': { count: 0, credits: 0, successful: 0, failed: 0 },
        'image-to-video': { count: 0, credits: 0, successful: 0, failed: 0 }
      }
    };

    for (const summary of summaries || []) {
      aggregated.total_generations += summary.total_generations || 0;
      aggregated.total_credits_spent += summary.total_credits_spent || 0;
      aggregated.total_credits_balance += summary.credits_balance || 0;
      aggregated.total_successful += summary.total_successful_generations || 0;
      aggregated.total_failed += summary.total_failed_generations || 0;

      // Aggregate by type
      aggregated.by_type['text-to-image'].count += summary.text_to_image_count || 0;
      aggregated.by_type['text-to-image'].credits += summary.text_to_image_credits || 0;
      aggregated.by_type['text-to-image'].successful += summary.text_to_image_successful || 0;
      aggregated.by_type['text-to-image'].failed += summary.text_to_image_failed || 0;

      aggregated.by_type['image-to-image'].count += summary.image_to_image_count || 0;
      aggregated.by_type['image-to-image'].credits += summary.image_to_image_credits || 0;
      aggregated.by_type['image-to-image'].successful += summary.image_to_image_successful || 0;
      aggregated.by_type['image-to-image'].failed += summary.image_to_image_failed || 0;

      aggregated.by_type['text-to-video'].count += summary.text_to_video_count || 0;
      aggregated.by_type['text-to-video'].credits += summary.text_to_video_credits || 0;
      aggregated.by_type['text-to-video'].successful += summary.text_to_video_successful || 0;
      aggregated.by_type['text-to-video'].failed += summary.text_to_video_failed || 0;

      aggregated.by_type['image-to-video'].count += summary.image_to_video_count || 0;
      aggregated.by_type['image-to-video'].credits += summary.image_to_video_credits || 0;
      aggregated.by_type['image-to-video'].successful += summary.image_to_video_successful || 0;
      aggregated.by_type['image-to-video'].failed += summary.image_to_video_failed || 0;
    }

    return aggregated;

  } catch (error) {
    throw error;
  }
}

/**
 * Recalculate usage summary from scratch (for data correction)
 * @param {string} userId - User ID
 * @param {string} periodType - Period type
 */
async function recalculateUsageSummary(userId, periodType = 'all_time') {
  try {
    
    const client = supabaseAdmin || supabase;

    // Get all generations for this user
    const { data: generations } = await client
      .from('generations')
      .select('generation_type, credits_used, status, created_at')
      .eq('user_id', userId);

    // Get current credits
    const { data: userCredits } = await client
      .from('user_credits')
      .select('balance, lifetime_earned, lifetime_spent')
      .eq('user_id', userId)
      .single();

    // Calculate stats from generations
    const stats = {
      text_to_image_count: 0,
      image_to_image_count: 0,
      text_to_video_count: 0,
      image_to_video_count: 0,
      text_to_image_credits: 0,
      image_to_image_credits: 0,
      text_to_video_credits: 0,
      image_to_video_credits: 0,
      text_to_image_successful: 0,
      text_to_image_failed: 0,
      image_to_image_successful: 0,
      image_to_image_failed: 0,
      text_to_video_successful: 0,
      text_to_video_failed: 0,
      image_to_video_successful: 0,
      image_to_video_failed: 0,
      total_generations: 0,
      total_successful_generations: 0,
      total_failed_generations: 0,
      total_credits_spent: 0
    };

    for (const gen of generations || []) {
      const typeKey = gen.generation_type?.replace(/-/g, '_');
      if (!typeKey) continue;

      stats[`${typeKey}_count`] = (stats[`${typeKey}_count`] || 0) + 1;
      stats[`${typeKey}_credits`] = (stats[`${typeKey}_credits`] || 0) + (gen.credits_used || 0);
      
      if (gen.status === 'completed') {
        stats[`${typeKey}_successful`] = (stats[`${typeKey}_successful`] || 0) + 1;
        stats.total_successful_generations++;
      } else if (gen.status === 'failed') {
        stats[`${typeKey}_failed`] = (stats[`${typeKey}_failed`] || 0) + 1;
        stats.total_failed_generations++;
      }

      stats.total_generations++;
      stats.total_credits_spent += gen.credits_used || 0;
    }

    stats.credits_balance = userCredits?.balance || 0;
    stats.lifetime_credits_earned = userCredits?.lifetime_earned || 0;
    stats.lifetime_credits_spent = userCredits?.lifetime_spent || 0;

    // Get existing summary
    const summary = await getOrCreateUsageSummary(userId, periodType);

    // Update with calculated values
    const { error } = await client
      .from('usage_summaries')
      .update({
        ...stats,
        average_credits_per_generation: stats.total_generations > 0 
          ? (stats.total_credits_spent / stats.total_generations).toFixed(2)
          : 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', summary.id);

    if (error) {
      throw new Error(`Failed to recalculate: ${error.message}`);
    }

    return stats;

  } catch (error) {
    throw error;
  }
}

module.exports = {
  getOrCreateUsageSummary,
  updateUsageSummaryAfterGeneration,
  updateUsageSummaryAfterCreditsAdded,
  updateSummaryRecord,
  getUserUsageSummary,
  getUserUsageTrend,
  getAggregatedStats,
  recalculateUsageSummary,
  createDailySummariesForAllUsers
};

