const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../utils/supabase');
const { auth, requireAdmin } = require('../middleware/auth');
const { changeSubscriptionPlan } = require('../services/stripeService');

/**
 * POST /api/admin/billing/change-plan
 * Admin-only: immediately change a user's active subscription plan
 * Body: { userId: string, newPlanId: string, interval: 'monthly' | 'yearly' }
 */
router.post('/change-plan', auth, requireAdmin, async (req, res) => {
    try {
        const { userId, newPlanId, interval } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        if (!newPlanId) {
            return res.status(400).json({ error: 'newPlanId is required' });
        }
        if (!interval || !['monthly', 'yearly'].includes(interval)) {
            return res.status(400).json({ error: 'Valid interval (monthly/yearly) is required' });
        }

        const client = supabaseAdmin || supabase;

        // 1) Get user's active subscription
        const { data: currentSubscription, error: fetchError } = await client
            .from('subscriptions')
            .select('id, user_id, stripe_subscription_id, plan_id, status, current_period_end')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (fetchError || !currentSubscription) {
            return res.status(404).json({
                error: 'No active subscription found for this user',
                details: fetchError?.message || null
            });
        }

        if (currentSubscription.plan_id === newPlanId) {
            return res.status(400).json({ error: 'User is already on this plan' });
        }

        // 2) Get the new plan (must be active)
        const { data: newPlan, error: planError } = await client
            .from('plans')
            .select('id, name, display_name, stripe_price_id_monthly, stripe_price_id_yearly')
            .eq('id', newPlanId)
            .eq('is_active', true)
            .single();

        if (planError || !newPlan) {
            return res.status(404).json({
                error: 'New plan not found or inactive',
                details: planError?.message || null
            });
        }

        // 3) Resolve Stripe price ID
        const newPriceId =
            interval === 'yearly'
                ? newPlan.stripe_price_id_yearly
                : newPlan.stripe_price_id_monthly;

        if (!newPriceId) {
            return res.status(400).json({
                error: `Plan "${newPlan.display_name}" is not configured for ${interval} billing`
            });
        }

        // 4) Immediate change on Stripe
        const updatedStripeSubscription = await changeSubscriptionPlan(
            currentSubscription.stripe_subscription_id,
            newPriceId
            // Optionally pass proration params here if your stripeService supports it
            // e.g., { proration_behavior: 'create_prorations' }
        );

        // 5) Persist locally (clear any pending fields)
        const { error: updateError } = await client
            .from('subscriptions')
            .update({
                plan_id: newPlanId,
                // Include interval if you store it; otherwise remove this line
                billing_interval: interval,
                current_period_start: updatedStripeSubscription.current_period_start
                    ? new Date(updatedStripeSubscription.current_period_start * 1000).toISOString()
                    : null,
                current_period_end: updatedStripeSubscription.current_period_end
                    ? new Date(updatedStripeSubscription.current_period_end * 1000).toISOString()
                    : null,
                status: updatedStripeSubscription.status,
                cancel_at_period_end: updatedStripeSubscription.cancel_at_period_end || false,
                // Clear any previously scheduled changes
                pending_plan_id: null,
                pending_interval: null,
                pending_change_type: null,
                pending_requested_at: null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', currentSubscription.id);

        if (updateError) {
            return res.status(500).json({ error: 'Failed to update subscription record' });
        }

        return res.json({
            success: true,
            message: `Changed plan to ${newPlan.display_name} (${interval})`,
            subscription: {
                id: currentSubscription.id,
                user_id: userId,
                plan_id: newPlanId,
                plan_name: newPlan.display_name,
                status: updatedStripeSubscription.status,
                current_period_start: updatedStripeSubscription.current_period_start
                    ? new Date(updatedStripeSubscription.current_period_start * 1000).toISOString()
                    : null,
                current_period_end: updatedStripeSubscription.current_period_end
                    ? new Date(updatedStripeSubscription.current_period_end * 1000).toISOString()
                    : null,
                cancel_at_period_end: !!updatedStripeSubscription.cancel_at_period_end,
            }
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message || 'Failed to change subscription plan'
        });
    }
});

module.exports = router;
