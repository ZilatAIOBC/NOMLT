// services/stripeService.js
const { getStripeClient } = require('../config/stripe');
const { supabase, supabaseAdmin } = require('../utils/supabase');
const { getCreditPack, CURRENCY } = require('../config/creditPacks');

async function getOrCreateCustomerForUser(userId, email) {
  const client = supabaseAdmin || supabase;
  const stripe = getStripeClient();
  
  const { data: userProfile, error: fetchError } = await client
    .from('profiles')
    .select('id, stripe_customer_id, email')
    .eq('id', userId)
    .single();
  if (fetchError) {
    throw new Error(`Failed to fetch user profile: ${fetchError.message}`);
  }

  // If we have a stored customer ID, validate it exists in Stripe
  if (userProfile && userProfile.stripe_customer_id) {
    try {
      // Try to retrieve the customer from Stripe to verify it exists
      await stripe.customers.retrieve(userProfile.stripe_customer_id);
      return userProfile.stripe_customer_id;
    } catch (stripeError) {
      // If customer doesn't exist or is invalid, create a new one
      console.warn(`Stripe customer ${userProfile.stripe_customer_id} not found or invalid, creating new customer for user ${userId}`);
    }
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email: email || userProfile?.email,
    metadata: { user_id: userId }
  });

  // Update the database with the new customer ID
  const { error: updateError } = await client
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);
  if (updateError) {
    throw new Error(`Failed to persist stripe_customer_id: ${updateError.message}`);
  }
  return customer.id;
}

async function createCheckoutSession({ userId, planId, interval, successUrl, cancelUrl, isUpgrade = false }) {
  if (!['monthly', 'yearly'].includes(interval)) {
    throw new Error('Invalid interval');
  }

  const client = supabaseAdmin || supabase;

  const { data: plan, error: planError } = await client
    .from('plans')
    .select('id, display_name, stripe_price_id_monthly, stripe_price_id_yearly')
    .eq('id', planId)
    .single();
  if (planError || !plan) {
    throw new Error(`Plan not found: ${planError?.message || ''}`);
  }

  const priceId = interval === 'monthly' ? plan.stripe_price_id_monthly : plan.stripe_price_id_yearly;
  if (!priceId) {
    throw new Error('Stripe price ID not configured for plan/interval');
  }

  const stripe = getStripeClient();
  const customerId = await getOrCreateCustomerForUser(userId);

  // Check if user has existing subscription for upgrade scenario
  let sessionConfig = {
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    subscription_data: {
      metadata: { user_id: userId, plan_id: planId, interval, is_upgrade: isUpgrade ? 'true' : 'false' }
    },
    metadata: { user_id: userId, plan_id: planId, interval, is_upgrade: isUpgrade ? 'true' : 'false' }
  };

  // If it's an upgrade, we need to cancel the old subscription after the new one is created
  if (isUpgrade) {
    // Get existing subscription
    const { data: existingSubscription } = await client
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingSubscription?.stripe_subscription_id) {
      // Add old subscription ID to metadata so webhook can cancel it
      sessionConfig.subscription_data.metadata.old_subscription_id = existingSubscription.stripe_subscription_id;
      sessionConfig.metadata.old_subscription_id = existingSubscription.stripe_subscription_id;
    }
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return session;
}

async function retrieveCheckoutSession(sessionId) {
  const stripe = getStripeClient();
  return await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription', 'customer'] });
}

/**
 * Create a one-time Checkout Session for credit top-up using inline price_data
 * @param {Object} params
 * @param {string} params.userId - Authenticated user ID
 * @param {string} params.packId - Credit pack key from config
 * @param {string} params.successUrl - Success redirect URL
 * @param {string} params.cancelUrl - Cancel redirect URL
 * @returns {Promise<object>} Stripe Checkout Session
 */
async function createTopupCheckoutSession({ userId, packId, successUrl, cancelUrl }) {
  const pack = getCreditPack(packId);
  if (!pack) {
    throw new Error('Invalid credit pack');
  }

  const stripe = getStripeClient();

  // Ensure Stripe customer exists
  const customerId = await getOrCreateCustomerForUser(userId);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          unit_amount: pack.unitAmount,
          product_data: {
            name: pack.name,
          },
        },
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      purpose: 'credit_topup',
      user_id: userId,
      pack_id: packId,
      credits: String(pack.credits),
    },
  });

  return session;
}

/**
 * Cancel a subscription at the end of the current period
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<object>} Updated subscription object
 */
async function cancelSubscription(subscriptionId) {
  const stripe = getStripeClient();
  
  // Cancel at period end to allow user to keep using until paid period expires
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
  
  return subscription;
}

/**
 * Reactivate a canceled subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<object>} Updated subscription object
 */
async function reactivateSubscription(subscriptionId) {
  const stripe = getStripeClient();
  
  // Remove the cancel_at_period_end flag
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false
  });
  
  return subscription;
}

/**
 * Change a subscription to a different plan
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {string} newPriceId - New Stripe price ID
 * @param {boolean} prorationBehavior - How to handle proration (default: 'always_invoice')
 * @returns {Promise<object>} Updated subscription object
 */
async function changeSubscriptionPlan(subscriptionId, newPriceId, prorationBehavior = 'always_invoice') {
  const stripe = getStripeClient();
  
  // First, retrieve the subscription to get the current subscription item
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  if (!subscription || !subscription.items || !subscription.items.data || subscription.items.data.length === 0) {
    throw new Error('Subscription or subscription items not found');
  }
  
  // Get the subscription item ID (usually there's only one)
  const subscriptionItemId = subscription.items.data[0].id;
  
  // Update the subscription with the new price
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscriptionItemId,
      price: newPriceId,
    }],
    proration_behavior: prorationBehavior,
  });
  
  return updatedSubscription;
}

/**
 * Get subscription details from Stripe
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<object>} Subscription object
 */
async function getSubscription(subscriptionId) {
  const stripe = getStripeClient();
  return await stripe.subscriptions.retrieve(subscriptionId);
}

module.exports = {
  getOrCreateCustomerForUser,
  createCheckoutSession,
  retrieveCheckoutSession,
  createTopupCheckoutSession,
  cancelSubscription,
  reactivateSubscription,
  changeSubscriptionPlan,
  getSubscription,
};


