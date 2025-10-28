const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../utils/supabase');
const { cancelSubscription, reactivateSubscription, changeSubscriptionPlan } = require('../services/stripeService');

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

// GET /api/billing/subscription - Get user's subscription status
router.get('/subscription', async (req, res) => {
  try {
    const userId = await getUserId(req);
    
    const client = supabaseAdmin || supabase;
    
    // Get user's active subscription with plan details
    // Order by updated_at to get the most recently modified subscription
    const { data: subscription, error } = await client
      .from('subscriptions')
      .select(`
        *,
        plans:plan_id (
          id,
          name,
          display_name,
          price_monthly,
          price_yearly
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return res.status(404).json({ message: 'No active subscription found' });
      }
      throw error;
    }

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Log what we're returning

    res.json({
      id: subscription.id,
      plan_id: subscription.plan_id,
      plan_name: subscription.plans?.name || 'Unknown',
      display_name: subscription.plans?.display_name || 'Unknown Plan',
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      stripe_subscription_id: subscription.stripe_subscription_id,
      stripe_customer_id: subscription.stripe_customer_id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/billing/data - Get complete billing information
router.get('/data', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const client = supabaseAdmin || supabase;

    // Get subscription data
    let subscription = null;
    try {
      const subscriptionRes = await client
        .from('subscriptions')
        .select(`
          *,
          plans:plan_id (
            id,
            name,
            display_name,
            price_monthly,
            price_yearly
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subscriptionRes.data) {
        subscription = {
          id: subscriptionRes.data.id,
          plan_id: subscriptionRes.data.plan_id,
          plan_name: subscriptionRes.data.plans?.name || 'Unknown',
          display_name: subscriptionRes.data.plans?.display_name || 'Unknown Plan',
          status: subscriptionRes.data.status,
          current_period_start: subscriptionRes.data.current_period_start,
          current_period_end: subscriptionRes.data.current_period_end,
          cancel_at_period_end: subscriptionRes.data.cancel_at_period_end,
          stripe_subscription_id: subscriptionRes.data.stripe_subscription_id,
          stripe_customer_id: subscriptionRes.data.stripe_customer_id
        };
      }
    } catch (subError) {
    }

    // Get payment transactions - Generate mock data from subscription
    let transactions = [];
    
    // If user has a subscription, create mock transaction data
    if (subscription && subscription.id) {
      const periodStart = new Date(subscription.current_period_start);
      const periodEnd = new Date(subscription.current_period_end);
      const periodLength = periodEnd - periodStart;
      const isYearly = periodLength > 365 * 24 * 60 * 60 * 1000;
      
      // Get plan details to show price
      const { data: plan } = await client
        .from('plans')
        .select('display_name, price_monthly, price_yearly')
        .eq('id', subscription.plan_id)
        .single();
      
      const price = isYearly ? (plan?.price_yearly || 0) : (plan?.price_monthly || 0);
      const planName = plan?.display_name || 'Subscription';
      
      // Create mock transaction for current period
      transactions = [
        {
          id: subscription.id,
          date: periodStart.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          description: `${planName} ${isYearly ? '(Yearly)' : '(Monthly)'}`,
          amount: `$${price.toFixed(2)}`,
          status: 'paid'
        }
      ];
    }

    res.json({
      subscription,
      payment_method: null, // TODO: Implement payment method fetching from Stripe
      transactions
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/billing/subscription/cancel - Cancel subscription at period end
router.post('/subscription/cancel', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const client = supabaseAdmin || supabase;

    // Get user's active subscription
    const { data: subscription, error: fetchError } = await client
      .from('subscriptions')
      .select('id, stripe_subscription_id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !subscription) {
      return res.status(404).json({ 
        error: 'No active subscription found',
        details: fetchError?.message 
      });
    }

    if (!subscription.stripe_subscription_id) {
      return res.status(400).json({ 
        error: 'Subscription missing Stripe ID' 
      });
    }

    // Cancel the subscription at period end in Stripe
    const canceledSubscription = await cancelSubscription(subscription.stripe_subscription_id);

    // Update subscription in database with current dates from Stripe
    const { error: updateError } = await client
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
        current_period_start: canceledSubscription.current_period_start 
          ? new Date(canceledSubscription.current_period_start * 1000).toISOString() 
          : null,
        current_period_end: canceledSubscription.current_period_end 
          ? new Date(canceledSubscription.current_period_end * 1000).toISOString() 
          : null,
        status: canceledSubscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      // Don't fail the request since Stripe was updated successfully
    }

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      subscription: {
        id: subscription.id,
        cancel_at_period_end: true,
        current_period_end: canceledSubscription.current_period_end 
          ? new Date(canceledSubscription.current_period_end * 1000).toISOString() 
          : null
      }
    });

  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Failed to cancel subscription' 
    });
  }
});

// POST /api/billing/subscription/reactivate - Reactivate a canceled subscription
router.post('/subscription/reactivate', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const client = supabaseAdmin || supabase;

    // Get user's subscription that's marked for cancellation
    const { data: subscription, error: fetchError } = await client
      .from('subscriptions')
      .select('id, stripe_subscription_id, status, cancel_at_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('cancel_at_period_end', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !subscription) {
      return res.status(404).json({ 
        error: 'No canceled subscription found to reactivate',
        details: fetchError?.message 
      });
    }

    if (!subscription.stripe_subscription_id) {
      return res.status(400).json({ 
        error: 'Subscription missing Stripe ID' 
      });
    }

    // Reactivate the subscription in Stripe
    const reactivatedStripeSubscription = await reactivateSubscription(subscription.stripe_subscription_id);

    // Log the Stripe response for debugging

    // Prepare update data
    const updateData = {
      cancel_at_period_end: false,
      canceled_at: null,
      status: reactivatedStripeSubscription.status,
      updated_at: new Date().toISOString(),
    };

    // Add dates if they exist
    if (reactivatedStripeSubscription.current_period_start) {
      updateData.current_period_start = new Date(reactivatedStripeSubscription.current_period_start * 1000).toISOString();
    }
    if (reactivatedStripeSubscription.current_period_end) {
      updateData.current_period_end = new Date(reactivatedStripeSubscription.current_period_end * 1000).toISOString();
    }


    // Update subscription in database with current period dates from Stripe
    const { error: updateError } = await client
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscription.id);

    if (updateError) {
      throw updateError;
    }

    // Verify the update
    const { data: updatedSub } = await client
      .from('subscriptions')
      .select('current_period_start, current_period_end, cancel_at_period_end')
      .eq('id', subscription.id)
      .single();
    

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: {
        id: subscription.id,
        cancel_at_period_end: false,
        current_period_end: reactivatedStripeSubscription.current_period_end 
          ? new Date(reactivatedStripeSubscription.current_period_end * 1000).toISOString() 
          : null
      }
    });

  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Failed to reactivate subscription' 
    });
  }
});

// POST /api/billing/subscription/change-plan - Change subscription plan (upgrade/downgrade)
router.post('/subscription/change-plan', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { newPlanId, interval, scheduleAtPeriodEnd = true } = req.body; // interval: 'monthly' or 'yearly'

    if (!newPlanId) {
      return res.status(400).json({ error: 'New plan ID is required' });
    }

    if (!interval || !['monthly', 'yearly'].includes(interval)) {
      return res.status(400).json({ error: 'Valid interval (monthly/yearly) is required' });
    }

    const client = supabaseAdmin || supabase;

    // Get user's active subscription
    const { data: currentSubscription, error: fetchError } = await client
      .from('subscriptions')
      .select('id, stripe_subscription_id, plan_id, status, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !currentSubscription) {
      return res.status(404).json({ 
        error: 'No active subscription found',
        details: fetchError?.message 
      });
    }

    if (currentSubscription.plan_id === newPlanId) {
      return res.status(400).json({ 
        error: 'You are already subscribed to this plan' 
      });
    }

    // Get the new plan details
    const { data: newPlan, error: planError } = await client
      .from('plans')
      .select('id, name, display_name, stripe_price_id_monthly, stripe_price_id_yearly')
      .eq('id', newPlanId)
      .eq('is_active', true)
      .single();

    if (planError || !newPlan) {
      return res.status(404).json({ 
        error: 'New plan not found or inactive',
        details: planError?.message 
      });
    }

    // Get the new Stripe price ID based on interval
    const newPriceId = interval === 'yearly' 
      ? newPlan.stripe_price_id_yearly 
      : newPlan.stripe_price_id_monthly;

    if (!newPriceId) {
      return res.status(400).json({ 
        error: `Plan ${newPlan.display_name} is not configured for ${interval} billing` 
      });
    }

    if (scheduleAtPeriodEnd) {
      // Schedule a pending downgrade to be applied at the next renewal
      const { error: updateError } = await client
        .from('subscriptions')
        .update({
          pending_plan_id: newPlanId,
          pending_interval: interval,
          pending_change_type: 'downgrade',
          pending_requested_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSubscription.id);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to schedule downgrade' });
      }

      const effectiveIso = currentSubscription.current_period_end || null;
      const effectiveDisplay = effectiveIso
        ? new Date(effectiveIso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'the end of the current period';

      return res.json({
        success: true,
        message: `Your plan will downgrade to ${newPlan.display_name} on  the end of the current period ${effectiveDisplay}`,
        subscription: {
          id: currentSubscription.id,
          pending_plan_id: newPlanId,
          pending_plan_name: newPlan.display_name,
          pending_interval: interval,
          effective_date: effectiveIso
        }
      });
    } else {
      // Immediate change (upgrade path typically). Proceed to Stripe now
      const updatedStripeSubscription = await changeSubscriptionPlan(
        currentSubscription.stripe_subscription_id, 
        newPriceId
      );

      const { error: updateError } = await client
        .from('subscriptions')
        .update({
          plan_id: newPlanId,
          current_period_start: updatedStripeSubscription.current_period_start 
            ? new Date(updatedStripeSubscription.current_period_start * 1000).toISOString() 
            : null,
          current_period_end: updatedStripeSubscription.current_period_end 
            ? new Date(updatedStripeSubscription.current_period_end * 1000).toISOString() 
            : null,
          status: updatedStripeSubscription.status,
          cancel_at_period_end: updatedStripeSubscription.cancel_at_period_end || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSubscription.id);

      if (updateError) {
      }

      return res.json({
        success: true,
        message: `Successfully changed plan to ${newPlan.display_name}`,
        subscription: {
          id: currentSubscription.id,
          plan_id: newPlanId,
          plan_name: newPlan.display_name,
          current_period_end: updatedStripeSubscription.current_period_end 
            ? new Date(updatedStripeSubscription.current_period_end * 1000).toISOString() 
            : null
        }
      });
    }

  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Failed to change subscription plan' 
    });
  }
});

module.exports = router;
