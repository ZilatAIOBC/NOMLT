const express = require('express');
const router = express.Router();
const { getStripeClient } = require('../config/stripe');
const { supabase, supabaseAdmin } = require('../utils/supabase');
const { addCredits, resetCredits } = require('../services/creditService');
const { scheduleUpgradeBonusExpiration } = require('../services/creditExpirationService');
const { updateUsageSummaryAfterCreditsAdded } = require('../services/usageSummaryService');

// Stripe webhook endpoint - this handles events from Stripe
// POST /api/webhooks/stripe
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    const stripe = getStripeClient();
    
    // Now we have raw body available from the middleware
    // Verify the webhook signature for security
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (sigErr) {
      return res.status(400).send(`Webhook Error: ${sigErr.message}`);
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }


  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        // Retrieve full invoice with expanded fields to ensure we have all data
        const stripe = getStripeClient();
        const fullInvoice = await stripe.invoices.retrieve(event.data.object.id, {
          expand: ['subscription', 'lines.data.subscription']
        });
        await handleInvoicePaymentSucceeded(fullInvoice);
        break;
      case 'invoice.upcoming':
        await handleInvoiceUpcoming(event.data.object);
        break;
        
      // Additional event handlers - NEW FEATURES
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
        
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object);
        break;
        
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
        break;
        
      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object);
        break;
        
      // Additional important subscription events
      case 'customer.subscription.trial_will_end':
        await handleSubscriptionTrialWillEnd(event.data.object);
        break;
        
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object);
        break;
        
      case 'invoice.updated':
        await handleInvoiceUpdated(event.data.object);
        break;
        
      case 'invoice.payment_action_required':
        await handleInvoicePaymentActionRequired(event.data.object);
        break;
        
      default:
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function handleCheckoutSessionCompleted(session) {
  
  const client = supabaseAdmin || supabase;
  
  try {
    // Branch: credit top-up payments (mode=payment)
    if (session.mode === 'payment' && session.metadata?.purpose === 'credit_topup') {
      console.log('[webhook] checkout.session.completed (credit_topup) received');
      const userId = session.metadata?.user_id;
      const credits = Number(session.metadata?.credits || '0');
      const paymentIntentId = session.payment_intent;
      console.log('[webhook] topup params:', { userId, credits, paymentIntentId });
      const amountTotal = session.amount_total; // in smallest unit (e.g., cents)
      const currency = session.currency; // e.g., 'usd'

      if (!userId || !credits || !paymentIntentId) {
        console.warn('[webhook] missing params for topup');
        return;
      }

      // Idempotency: check by reference_id (if schema allows) OR description containing paymentIntentId
      let alreadyRecorded = false;
      try {
        const { data: existingByRef } = await client
          .from('credit_transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('reference_id', paymentIntentId)
          .eq('reference_type', 'credit_topup')
          .maybeSingle();
        if (existingByRef) alreadyRecorded = true;
      } catch {}

      if (!alreadyRecorded) {
        try {
          const { data: existingByDesc } = await client
            .from('credit_transactions')
            .select('id, description')
            .eq('user_id', userId)
            .eq('type', 'purchased')
            .ilike('description', `%${paymentIntentId}%`)
            .maybeSingle();
          if (existingByDesc) alreadyRecorded = true;
        } catch {}
      }

      if (alreadyRecorded) {
        console.log('[webhook] topup already recorded, skipping');
        return;
      }

      try {
        const priceLabel = typeof amountTotal === 'number' && currency
          ? `$${(amountTotal / 100).toFixed(2)} ${String(currency).toUpperCase()}`
          : null;

        const result = await addCredits(
          userId,
          credits,
          'purchased',
          priceLabel
            ? `Credit top-up ${priceLabel} - ${credits.toLocaleString()} credits (payment_intent: ${paymentIntentId})`
            : `Credit top-up purchase (payment_intent: ${paymentIntentId})`,
          null,
          'credit_topup'
        );
        console.log('[webhook] credits added for topup:', { userId, credits, result });

        // Log the latest purchased transaction row for debugging/verification
        try {
          const { data: latestTx } = await client
            .from('credit_transactions')
            .select('id,user_id,type,amount,balance_after,description,reference_id,reference_type,metadata,created_at')
            .eq('user_id', userId)
            .eq('type', 'purchased')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (latestTx) {
            console.log('[webhook] latest purchased transaction:', JSON.stringify([latestTx]));
          } else {
            console.warn('[webhook] no purchased transaction row found after credit add');
          }
        } catch (txErr) {
          console.warn('[webhook] failed to read latest purchased transaction:', txErr?.message || txErr);
        }
      } catch (_) {
        console.warn('[webhook] failed to add credits for topup');
      }

      return;
    }

    // Default branch: subscription checkout (mode=subscription)
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Extract user ID and plan ID from session metadata, fallback to subscription metadata
    const userId = session.metadata?.user_id || subscription.metadata?.user_id;
    const planId = session.metadata?.plan_id || subscription.metadata?.plan_id;
    const isUpgrade = session.metadata?.is_upgrade === 'true' || subscription.metadata?.is_upgrade === 'true';
    const oldSubscriptionId = session.metadata?.old_subscription_id || subscription.metadata?.old_subscription_id;
    
    if (!userId || !planId) {
      return;
    }

    // Prepare subscription data for database
    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    };

    // DEBUG: Log what we're saving to database

    if (isUpgrade && oldSubscriptionId) {
      // This is an upgrade - update existing subscription record and cancel old Stripe subscription
      
      // Update the existing subscription record in database
      const { error: updateError } = await client
        .from('subscriptions')
        .update({
          ...subscriptionData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('stripe_subscription_id', oldSubscriptionId);

      if (updateError) {
        // Still try to save new subscription as fallback
        await client.from('subscriptions').insert(subscriptionData);
      }

      // Cancel the old subscription in Stripe
      try {
        await stripe.subscriptions.cancel(oldSubscriptionId);
      } catch (cancelError) {
        // Don't throw - the new subscription is already created
      }

    } else {
      // This is a new subscription - insert new record
      const { error } = await client
        .from('subscriptions')
        .insert(subscriptionData);

      if (error) {
        throw error;
      }

    }

    // ========================================
    // CREDIT ALLOCATION - NEW SUBSCRIPTION
    // ========================================
    
    try {
      // Get plan details to find credits_included
      
      const { data: plan, error: planError } = await client
        .from('plans')
        .select('credits_included, display_name, name')
        .eq('id', planId)
        .single();


      if (planError) {
      } else if (plan && plan.credits_included) {
        
        // Add credits to user (rollover strategy - they accumulate)
        const creditResult = await addCredits(
          userId,
          plan.credits_included,
          'purchased', // Using 'purchased' type for subscription credits
          `Credits from ${plan.display_name} subscription (${subscription.id})`,
          null, // reference_id must be UUID, but subscription.id is a Stripe string
          'subscription'
        );

        
        // Update usage summary to track credit additions
        updateUsageSummaryAfterCreditsAdded(userId, plan.credits_included, 'purchased')
          .catch(() => {});
        
      } else {
      }
    } catch (creditError) {
      // Don't throw - subscription is already created
    }

  } catch (error) {
    throw error;
  }
}

async function handleSubscriptionCreated(subscription) {
  // This is handled by checkout.session.completed, but we can add additional logic here if needed
}

async function handleSubscriptionUpdated(subscription) {
  
  const client = supabaseAdmin || supabase;
  
  try {
    // Check if subscription exists first
    const { data: existingSubscription, error: fetchError } = await client
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!existingSubscription) {
      return;
    }

    // Log what Stripe sent us

    // Build update object - only include fields that exist
    const updateData = {
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    };

    // Only update dates if they exist in the webhook (don't overwrite with null)
    if (subscription.current_period_start) {
      updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
    }
    if (subscription.current_period_end) {
      updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
    }
    if (subscription.canceled_at) {
      updateData.canceled_at = new Date(subscription.canceled_at * 1000).toISOString();
    }


    const { error } = await client
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      throw error;
    }


    // ========================================
    // CREDIT ALLOCATION - PLAN CHANGE (UPGRADE/DOWNGRADE)
    // ========================================
    // Check if plan changed (upgrade or downgrade)
    try {
      const { data: currentSub, error: subError } = await client
        .from('subscriptions')
        .select('plan_id, user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (subError || !currentSub) {
        return;
      }

      // Check if subscription items changed (plan change)
      if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
        const newStripePriceId = subscription.items.data[0].price.id;
        
        // Find the plan that matches this price ID
        const { data: newPlan, error: planError } = await client
          .from('plans')
          .select('id, credits_included, display_name, stripe_price_id_monthly, stripe_price_id_yearly')
          .or(`stripe_price_id_monthly.eq.${newStripePriceId},stripe_price_id_yearly.eq.${newStripePriceId}`)
          .single();

        if (!planError && newPlan && newPlan.id !== currentSub.plan_id) {
          // Plan changed! Get the old plan details
          const { data: oldPlan } = await client
            .from('plans')
            .select('credits_included, display_name')
            .eq('id', currentSub.plan_id)
            .single();


          // Calculate credit difference
          const creditDifference = newPlan.credits_included - (oldPlan?.credits_included || 0);

          if (creditDifference > 0) {
            // UPGRADE - Add the extra credits as bonus with expiration at trial_end or current_period_end
            const description = `Upgrade bonus: ${oldPlan?.display_name} → ${newPlan.display_name} (${subscription.id})`;
            const creditResult = await addCredits(
              currentSub.user_id,
              creditDifference,
              'bonus',
              description,
              null,
              'subscription'
            );

            // Determine expiry = trial_end || current_period_end
            const expiresAtEpoch = subscription.trial_end || subscription.current_period_end;
            if (expiresAtEpoch) {
              const expiresAt = new Date(expiresAtEpoch * 1000).toISOString();
              try {
                await scheduleUpgradeBonusExpiration(currentSub.user_id, creditDifference, expiresAt, {
                  stripe_subscription_id: subscription.id,
                  old_plan_id: currentSub.plan_id,
                  new_plan_id: newPlan.id,
                  description
                });
              } catch (e) {
              }
            } else {
            }

            // Update usage summary
            updateUsageSummaryAfterCreditsAdded(currentSub.user_id, creditDifference, 'bonus')
              .catch(() => {});
          } else if (creditDifference < 0) {
            // DOWNGRADE - Keep existing credits (Option B: Rollover)
          }

          // Update the plan_id in subscriptions table
          await client
            .from('subscriptions')
            .update({ plan_id: newPlan.id })
            .eq('stripe_subscription_id', subscription.id);

        }
      }
    } catch (creditError) {
      // Don't throw - subscription update is already done
    }

  } catch (error) {
    // Don't throw error to prevent webhook retries for non-critical updates
  }
}

async function handleSubscriptionDeleted(subscription) {
  
  const client = supabaseAdmin || supabase;
  
  try {
    const { error } = await client
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      throw error;
    }

  } catch (error) {
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  
  const client = supabaseAdmin || supabase;
  
  try {
    // Get subscription ID from invoice (Stripe can store it in multiple locations)
    let subscriptionId = invoice.subscription;
    
    // If subscription is an object (from expanded invoice), extract the ID
    if (subscriptionId && typeof subscriptionId === 'object' && subscriptionId.id) {
      subscriptionId = subscriptionId.id;
    }
    
    // If not found directly, check in lines.data (subscription items)
    if (!subscriptionId && invoice.lines && invoice.lines.data && invoice.lines.data.length > 0) {
      subscriptionId = invoice.lines.data[0].subscription;
      // Handle if it's an object here too
      if (subscriptionId && typeof subscriptionId === 'object' && subscriptionId.id) {
        subscriptionId = subscriptionId.id;
      }
    }

    // Check if this is a subscription invoice
    if (!subscriptionId) {
      return;
    }


    // Get subscription details from Stripe (or use expanded one if available)
    let subscription;
    if (invoice.subscription && typeof invoice.subscription === 'object' && invoice.subscription.id) {
      subscription = invoice.subscription;
    } else {
      const stripe = getStripeClient();
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    }

    // Get subscription from database
    const { data: dbSubscription, error: subError } = await client
      .from('subscriptions')
      .select('user_id, plan_id, id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (subError || !dbSubscription) {
      return;
    }

    // ========================================
    // STORE PAYMENT TRANSACTION
    // ========================================

    // Get charge ID from invoice (can be in different fields)
    const chargeId = invoice.charge || invoice.charge_id || invoice.payment_intent;
    
    // Check if transaction already exists (prevent duplicates)
    // Use stripe_invoice_id as it's UNIQUE in the database schema
    const { data: existingTransaction, error: checkError } = await client
      .from('payment_transactions')
      .select('id')
      .eq('stripe_invoice_id', invoice.id)
      .maybeSingle(); // Use maybeSingle() to avoid error when not found

    if (existingTransaction) {
    } else {
      // Store payment transaction matching actual database schema
      const transactionData = {
        user_id: dbSubscription.user_id,
        subscription_id: dbSubscription.id,
        stripe_invoice_id: invoice.id, // REQUIRED field
        stripe_payment_intent_id: invoice.payment_intent,
        stripe_charge_id: chargeId,
        amount_cents: invoice.amount_paid, // Store in cents, not dollars
        currency: invoice.currency,
        status: 'succeeded',
        billing_reason: invoice.billing_reason,
        invoice_number: invoice.number,
        description: invoice.description || `Payment for ${subscription.plan?.nickname || 'subscription'}`,
        metadata: {
          stripe_subscription_id: subscription.id,
          plan_id: dbSubscription.plan_id,
          invoice_period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
          invoice_period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
          hosted_invoice_url: invoice.hosted_invoice_url,
          invoice_pdf: invoice.invoice_pdf
        }
      };

      const { data: insertedData, error: transactionError } = await client
        .from('payment_transactions')
        .insert(transactionData)
        .select();

      if (transactionError) {
      } else {
      }
    }

    // ========================================
    // CREDIT ALLOCATION - SUBSCRIPTION RENEWAL
    // ========================================
    // Check if this is a renewal (not the first invoice)
    const isRenewal = invoice.billing_reason === 'subscription_cycle';
    
    if (!isRenewal) {
      return;
    }


    // Get plan details
    const { data: plan, error: planError } = await client
      .from('plans')
      .select('credits_included, display_name')
      .eq('id', dbSubscription.plan_id)
      .single();

    if (planError || !plan) {
      return;
    }

    if (plan.credits_included && plan.credits_included > 0) {
      
      // Add credits (Option B: Rollover - they accumulate)
      const creditResult = await addCredits(
        dbSubscription.user_id,
        plan.credits_included,
        'purchased',
        `Monthly renewal: ${plan.display_name} (${invoice.id})`,
        null, // reference_id must be UUID
        'subscription'
      );

      
      // Update usage summary
      updateUsageSummaryAfterCreditsAdded(dbSubscription.user_id, plan.credits_included, 'purchased')
        .catch(() => {});
    } else {
    }

  } catch (error) {
    // Don't throw - payment is already successful
  }
}

// Apply pending plan change (e.g., scheduled downgrade) right before the invoice is finalized
async function handleInvoiceUpcoming(invoice) {

  const client = supabaseAdmin || supabase;
  try {
    const subscriptionId = typeof invoice.subscription === 'object' ? invoice.subscription?.id : invoice.subscription;
    if (!subscriptionId) return;

    const { data: dbSubscription } = await client
      .from('subscriptions')
      .select('id, user_id, plan_id, pending_plan_id, pending_interval, pending_change_type, stripe_subscription_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (!dbSubscription || !dbSubscription.pending_plan_id || dbSubscription.pending_change_type !== 'downgrade') {
      return;
    }

    // Resolve new price id from pending_plan_id and interval
    const { data: newPlan } = await client
      .from('plans')
      .select('id, display_name, stripe_price_id_monthly, stripe_price_id_yearly')
      .eq('id', dbSubscription.pending_plan_id)
      .single();

    if (!newPlan) {
      return;
    }

    const newPriceId = (dbSubscription.pending_interval === 'yearly')
      ? newPlan.stripe_price_id_yearly
      : newPlan.stripe_price_id_monthly;

    if (!newPriceId) {
      return;
    }

    // Change the Stripe subscription to the pending plan so renewal bills the new plan
    const stripe = getStripeClient();
    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
    if (!stripeSub?.items?.data?.length) return;
    const itemId = stripeSub.items.data[0].id;
    await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: 'none'
    });

    // Clear pending fields and set plan_id to new plan in DB
    await client
      .from('subscriptions')
      .update({
        plan_id: newPlan.id,
        pending_plan_id: null,
        pending_interval: null,
        pending_change_type: null,
        pending_requested_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', dbSubscription.id);

  } catch (error) {
  }
}

// NEW FEATURE: Invoice payment failed handler
async function handleInvoicePaymentFailed(invoice) {
  
  try {
    // Get subscription details from Stripe
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Update subscription status if needed
    await handleSubscriptionUpdated(subscription);
    
    
    // You can add additional logic here:
    // - Send payment failure notification to user
    // - Update user access if needed
    // - Log failed payment attempt
    
  } catch (error) {
    // Don't throw to prevent webhook retries
  }
}

// NEW FEATURE: Customer created handler
async function handleCustomerCreated(customer) {
  
  try {
    // You can add logic here to:
    // - Sync customer data to your database
    // - Set up customer-specific settings
    // - Send welcome email
    
    
  } catch (error) {
  }
}

// NEW FEATURE: Customer updated handler
async function handleCustomerUpdated(customer) {
  
  try {
    // You can add logic here to:
    // - Sync updated customer data
    // - Update customer preferences
    // - Log customer changes
    
    
  } catch (error) {
  }
}

// NEW FEATURE: Payment method attached handler
async function handlePaymentMethodAttached(paymentMethod) {
  
  try {
    // You can add logic here to:
    // - Update customer payment method info
    // - Send confirmation to user
    // - Log payment method changes
    
    
  } catch (error) {
  }
}

// NEW FEATURE: Charge dispute created handler
async function handleChargeDisputeCreated(dispute) {
  
  try {
    // You can add logic here to:
    // - Send dispute notification to admin
    // - Update subscription status if needed
    // - Log dispute for investigation
    // - Notify customer about dispute
    
    
  } catch (error) {
  }
}

// NEW FEATURE: Subscription trial will end handler
async function handleSubscriptionTrialWillEnd(subscription) {
  
  try {
    // You can add logic here to:
    // - Send trial ending notification to user
    // - Offer trial extension or discount
    // - Update user dashboard with trial status
    // - Log trial ending for analytics
    
    
  } catch (error) {
  }
}

// NEW FEATURE: Invoice created handler
async function handleInvoiceCreated(invoice) {
  
  try {
    // You can add logic here to:
    // - Log invoice creation for tracking
    // - Send invoice preview to user
    // - Update billing records
    // - Prepare for payment processing
    
    
  } catch (error) {
  }
}

// NEW FEATURE: Invoice updated handler
async function handleInvoiceUpdated(invoice) {
  
  try {
    // You can add logic here to:
    // - Sync invoice changes to database
    // - Update billing records
    // - Notify user of invoice changes
    // - Log invoice modifications
    
    
  } catch (error) {
  }
}

// NEW FEATURE: Invoice payment action required handler
async function handleInvoicePaymentActionRequired(invoice) {
  
  try {
    // You can add logic here to:
    // - Notify user that payment requires action (3D Secure)
    // - Update subscription status to show payment pending
    // - Send email with payment action instructions
    // - Log payment action required for tracking
    
    
  } catch (error) {
  }
}

module.exports = router;
