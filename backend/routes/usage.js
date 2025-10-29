const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const { supabase, supabaseAdmin } = require("../utils/supabase");
const { getUserCredits } = require("../services/creditService");

// GET /api/usage/summary - per-user usage counts grouped by endpoint
router.get("/summary", auth, async (req, res) => {
  try {
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user._id);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const client = supabaseAdmin || supabase;
    if (!client) {
      return res.status(500).json({ error: "Supabase client not initialized" });
    }

    // Optional time filters
    const { from, to } = req.query;
    let query = client
      .from('api_usage')
      .select('endpoint, model_id');

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query.eq('user_id', userId);
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const counts = {};
    for (const row of data || []) {
      let key = row.endpoint;
      if (!key && row.model_id) {
        // Fallback categorization by model category when endpoint is null
        // Note: to avoid an extra join per row, leave as 'unknown' if endpoint missing.
        key = 'unknown';
      }
      key = key || 'unknown';
      counts[key] = (counts[key] || 0) + 1;
    }

    // ========================================
    // ENHANCED: Get credit usage breakdown
    // ========================================
    
    // Get current credit balance
    let creditBalance = null;
    try {
      creditBalance = await getUserCredits(userId);
    } catch (credErr) {
    }

    // Get credit transactions (spent only) grouped by generation type
    let creditQuery = client
      .from('credit_transactions')
      .select('type, amount, description, created_at')
      .eq('user_id', userId)
      .eq('type', 'spent');

    if (from) creditQuery = creditQuery.gte('created_at', from);
    if (to) creditQuery = creditQuery.lte('created_at', to);

    const { data: creditTransactions, error: creditError } = await creditQuery.order('created_at', { ascending: false });

    // Group credits by generation type
    const creditsByType = {
      text_to_image: 0,
      image_to_image: 0,
      text_to_video: 0,
      image_to_video: 0,
      other: 0
    };

    let totalCreditsSpent = 0;

    for (const tx of creditTransactions || []) {
      totalCreditsSpent += tx.amount;
      
      // Parse generation type from description
      const desc = tx.description?.toLowerCase() || '';
      if (desc.includes('text_to_image') || desc.includes('text-to-image')) {
        creditsByType.text_to_image += tx.amount;
      } else if (desc.includes('image_to_image') || desc.includes('image-to-image')) {
        creditsByType.image_to_image += tx.amount;
      } else if (desc.includes('text_to_video') || desc.includes('text-to-video')) {
        creditsByType.text_to_video += tx.amount;
      } else if (desc.includes('image_to_video') || desc.includes('image-to-video')) {
        creditsByType.image_to_video += tx.amount;
      } else {
        creditsByType.other += tx.amount;
      }
    }

    // Get generation counts by type (more accurate than API usage)
    // NOTE: The field is 'generation_type' in the database, not 'category'
    let genQuery = client
      .from('generations')
      .select('generation_type, credits_used, status, created_at')
      .eq('user_id', userId);

    if (from) genQuery = genQuery.gte('created_at', from);
    if (to) genQuery = genQuery.lte('created_at', to);

    const { data: generations, error: genError } = await genQuery;


    const generationStats = {
      'text-to-image': { count: 0, credits: 0, successful: 0, failed: 0 },
      'image-to-image': { count: 0, credits: 0, successful: 0, failed: 0 },
      'text-to-video': { count: 0, credits: 0, successful: 0, failed: 0 },
      'image-to-video': { count: 0, credits: 0, successful: 0, failed: 0 }
    };

    for (const gen of generations || []) {
      const genType = gen.generation_type; // Use generation_type, not category
      if (generationStats[genType]) {
        generationStats[genType].count += 1;
        generationStats[genType].credits += gen.credits_used || 0;
        
        if (gen.status === 'completed') {
          generationStats[genType].successful += 1;
        } else if (gen.status === 'failed') {
          generationStats[genType].failed += 1;
        }
      }
    }


    return res.status(200).json({ 
      user_id: userId, 
      from: from || null, 
      to: to || null, 
      counts, // Legacy API counts
      credit_balance: creditBalance ? {
        current: creditBalance.balance,
        lifetime_earned: creditBalance.lifetime_earned,
        lifetime_spent: creditBalance.lifetime_spent
      } : null,
      credits_spent_by_type: creditsByType,
      total_credits_spent: totalCreditsSpent,
      generation_stats: generationStats
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to fetch usage summary' });
  }
});

module.exports = router;


