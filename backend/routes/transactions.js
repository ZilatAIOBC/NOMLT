const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../utils/supabase');

// Helper function to get user ID from request
async function getUserId(req) {
  // Try to get from Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        return user.id;
      }
    } catch (err) {
    }
  }

  // Fallback: try to get from localStorage data in request body or query
  const userId = req.body?.userId || req.query?.userId;
  if (userId) {
    return userId;
  }

  throw new Error('User not authenticated');
}

// GET /api/transactions - Get user's transaction history
router.get('/', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const client = supabaseAdmin || supabase;
    
    // Get user's subscriptions to generate mock transaction data
    const { data: subscriptions, error } = await client
      .from('subscriptions')
      .select(`
        id,
        created_at,
        status,
        current_period_start,
        current_period_end,
        plans:plan_id (
          display_name,
          price_monthly,
          price_yearly
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform subscription data into transaction format
    const transactions = (subscriptions || []).map(sub => {
      // Determine the price based on billing period
      const periodStart = new Date(sub.current_period_start);
      const periodEnd = new Date(sub.current_period_end);
      const periodLength = periodEnd - periodStart;
      const isYearly = periodLength > 365 * 24 * 60 * 60 * 1000; // More than 365 days
      
      const price = isYearly ? sub.plans?.price_yearly : sub.plans?.price_monthly;
      const description = `${sub.plans?.display_name || 'Subscription'} ${isYearly ? '(Yearly)' : '(Monthly)'}`;
      
      return {
        id: sub.id,
        date: new Date(sub.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        description: description,
        amount: `$${price || '0.00'}`,
        status: sub.status === 'active' ? 'paid' : sub.status,
        subscription_id: sub.id,
        created_at: sub.created_at
      };
    });

    res.json(transactions);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
