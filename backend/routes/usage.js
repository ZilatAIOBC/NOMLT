const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const { supabase, supabaseAdmin } = require("../utils/supabase");

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

    return res.status(200).json({ user_id: userId, from: from || null, to: to || null, counts });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to fetch usage summary' });
  }
});

module.exports = router;


