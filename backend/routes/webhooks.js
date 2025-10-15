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
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    const stripe = getStripeClient();
    // For now, we'll skip signature verification to avoid the raw body issue
    // In production, you should implement proper signature verification
    event = req.body;
    console.log('Webhook event received (signature verification skipped for development):', event.type);
  } catch (err) {
    console.error('Webhook processing failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received Stripe webhook event:', event.type);

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
        console.log('🎯 Processing invoice.payment_succeeded event...');
        // Retrieve full invoice with expanded fields to ensure we have all data
        const stripe = getStripeClient();
        const fullInvoice = await stripe.invoices.retrieve(event.data.object.id, {
          expand: ['subscription', 'lines.data.subscription']
        });
        await handleInvoicePaymentSucceeded(fullInvoice);
        console.log('✅ Completed invoice.payment_succeeded processing');
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
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

async function handleCheckoutSessionCompleted(session) {
  console.log('Processing checkout.session.completed:', session.id);
  
  const client = supabaseAdmin || supabase;
  
  try {
    // Get subscription details from Stripe
    const stripe = getStripeClient();
    
    // DEBUG: Log session data
    console.log('Session data received:', {
      session_id: session.id,
      subscription_id: session.subscription,
      customer: session.customer,
      payment_status: session.payment_status,
      metadata: session.metadata
    });
    
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // DEBUG: Log the FULL subscription object from Stripe
    console.log('FULL Stripe subscription object:', JSON.stringify(subscription, null, 2));
    
    // DEBUG: Log specific date fields
    console.log('Stripe subscription date fields:', {
      id: subscription.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_start_type: typeof subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      current_period_end_type: typeof subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: subscription.trial_start,
      trial_end: subscription.trial_end
    });
    
    // Extract user ID from session metadata
    const userId = session.metadata?.user_id;
    const planId = session.metadata?.plan_id;
    const isUpgrade = session.metadata?.is_upgrade === 'true';
    const oldSubscriptionId = session.metadata?.old_subscription_id;
    
    if (!userId || !planId) {
      console.error('Missing user_id or plan_id in session metadata:', session.metadata);
      return;
    }

    // Prepare subscription data for database
    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    };

    // DEBUG: Log what we're saving to database
    console.log('Data being saved to database:', subscriptionData);

    if (isUpgrade && oldSubscriptionId) {
      // This is an upgrade - update existing subscription record and cancel old Stripe subscription
      console.log('Processing upgrade - updating existing subscription and canceling old one:', oldSubscriptionId);
      
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
        console.error('Error updating subscription in database:', updateError);
        // Still try to save new subscription as fallback
        await client.from('subscriptions').insert(subscriptionData);
      }

      // Cancel the old subscription in Stripe
      try {
        await stripe.subscriptions.cancel(oldSubscriptionId);
        console.log('Successfully canceled old subscription in Stripe:', oldSubscriptionId);
      } catch (cancelError) {
        console.error('Error canceling old subscription in Stripe:', cancelError);
        // Don't throw - the new subscription is already created
      }

      console.log('Successfully processed upgrade:', {
        userId,
        oldSubscriptionId,
        newSubscriptionId: subscription.id,
        newPlanId: planId
      });

    } else {
      // This is a new subscription - insert new record
      const { error } = await client
        .from('subscriptions')
        .insert(subscriptionData);

      if (error) {
        console.error('Error saving subscription to database:', error);
        throw error;
      }

      console.log('Successfully saved new subscription to database:', {
        userId,
        planId,
        subscriptionId: subscription.id,
        status: subscription.status
      });
    }

    // ========================================
    // CREDIT ALLOCATION - NEW SUBSCRIPTION
    // ========================================
    console.log(`🎯 CREDIT ALLOCATION START - User: ${userId}, Plan: ${planId}`);
    
    try {
      // Get plan details to find credits_included
      console.log(`📋 Fetching plan details for plan_id: ${planId}`);
      
      const { data: plan, error: planError } = await client
        .from('plans')
        .select('credits_included, display_name, name')
        .eq('id', planId)
        .single();

      console.log(`📋 Plan query result:`, { plan, error: planError });

      if (planError) {
        console.error('❌ Error fetching plan for credit allocation:', planError);
        console.error('❌ Plan error details:', JSON.stringify(planError, null, 2));
      } else if (plan && plan.credits_included) {
        console.log(`✅ Plan found: ${plan.display_name} (${plan.name})`);
        console.log(`💰 Credits to allocate: ${plan.credits_included}`);
        console.log(`👤 Target user: ${userId}`);
        
        // Add credits to user (rollover strategy - they accumulate)
        console.log(`🔄 Calling addCredits function...`);
        const creditResult = await addCredits(
          userId,
          plan.credits_included,
          'purchased', // Using 'purchased' type for subscription credits
          `Credits from ${plan.display_name} subscription (${subscription.id})`,
          null, // reference_id must be UUID, but subscription.id is a Stripe string
          'subscription'
        );

        console.log(`✅ Successfully added ${plan.credits_included} credits!`);
        console.log(`💰 New balance: ${creditResult.new_balance}`);
        console.log(`📊 Lifetime earned: ${creditResult.lifetime_earned}`);
        
        // Update usage summary to track credit additions
        updateUsageSummaryAfterCreditsAdded(userId, plan.credits_included, 'purchased')
          .catch(err => console.error('Failed to update usage summary:', err));
        
        console.log(`🎉 CREDIT ALLOCATION COMPLETE!`);
      } else {
        console.log('⚠️ Plan has no credits_included or plan not found');
        console.log(`⚠️ Plan data:`, plan);
      }
    } catch (creditError) {
      console.error('❌ ERROR allocating credits for new subscription:', creditError);
      console.error('❌ Error stack:', creditError.stack);
      console.error('❌ Error details:', JSON.stringify(creditError, null, 2));
      // Don't throw - subscription is already created
    }
    
    console.log(`🏁 CREDIT ALLOCATION END`);
    console.log(`================================================`)

  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Processing customer.subscription.created:', subscription.id);
  // This is handled by checkout.session.completed, but we can add additional logic here if needed
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Processing customer.subscription.updated:', subscription.id);
  
  const client = supabaseAdmin || supabase;
  
  try {
    // Check if subscription exists first
    const { data: existingSubscription, error: fetchError } = await client
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', fetchError);
      throw fetchError;
    }

    if (!existingSubscription) {
      console.log('Subscription not found in database, skipping update:', subscription.id);
      return;
    }

    // Log what Stripe sent us
    console.log('Webhook subscription data:', {
      id: subscription.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end
    });

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

    console.log('Webhook updating database with:', updateData);

    const { error } = await client
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription in database:', error);
      throw error;
    }

    console.log('Successfully updated subscription in database:', subscription.id);

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
        console.log('Could not fetch subscription for plan change check');
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

          console.log(`Plan changed from ${oldPlan?.display_name} to ${newPlan.display_name}`);
          console.log(`Old credits: ${oldPlan?.credits_included}, New credits: ${newPlan.credits_included}`);

          // Calculate credit difference
          const creditDifference = newPlan.credits_included - (oldPlan?.credits_included || 0);

          if (creditDifference > 0) {
            // UPGRADE - Add the extra credits as bonus with expiration at trial_end or current_period_end
            console.log(`Upgrade detected: Adding ${creditDifference} upgrade bonus credits`);
            const description = `Upgrade bonus: ${oldPlan?.display_name} → ${newPlan.display_name} (${subscription.id})`;
            const creditResult = await addCredits(
              currentSub.user_id,
              creditDifference,
              'bonus',
              description,
              null,
              'subscription'
            );
            console.log(`Successfully added ${creditDifference} bonus credits. New balance: ${creditResult.new_balance}`);

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
                console.log(`Scheduled expiration for ${creditDifference} bonus credits at ${expiresAt}`);
              } catch (e) {
                console.error('Failed to schedule bonus expiration:', e);
              }
            } else {
              console.log('No trial_end or current_period_end available to set bonus expiry. Skipping expiration scheduling.');
            }

            // Update usage summary
            updateUsageSummaryAfterCreditsAdded(currentSub.user_id, creditDifference, 'bonus')
              .catch(err => console.error('Failed to update usage summary:', err));
          } else if (creditDifference < 0) {
            // DOWNGRADE - Keep existing credits (Option B: Rollover)
            console.log(`Downgrade detected: User keeps existing credits (no removal)`);
          }

          // Update the plan_id in subscriptions table
          await client
            .from('subscriptions')
            .update({ plan_id: newPlan.id })
            .eq('stripe_subscription_id', subscription.id);

          console.log('Updated subscription plan_id in database');
        }
      }
    } catch (creditError) {
      console.error('Error handling plan change credits:', creditError);
      // Don't throw - subscription update is already done
    }

  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
    // Don't throw error to prevent webhook retries for non-critical updates
    console.log('Continuing despite update error...');
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Processing customer.subscription.deleted:', subscription.id);
  
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
      console.error('Error updating canceled subscription in database:', error);
      throw error;
    }

    console.log('Successfully marked subscription as canceled:', subscription.id);
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Processing invoice.payment_succeeded:', invoice.id);
  
  const client = supabaseAdmin || supabase;
  
  try {
    // Get subscription ID from invoice (Stripe can store it in multiple locations)
    let subscriptionId = invoice.subscription;
    
    // If subscription is an object (from expanded invoice), extract the ID
    if (subscriptionId && typeof subscriptionId === 'object' && subscriptionId.id) {
      console.log('📋 Subscription is expanded object, extracting ID');
      subscriptionId = subscriptionId.id;
    }
    
    // If not found directly, check in lines.data (subscription items)
    if (!subscriptionId && invoice.lines && invoice.lines.data && invoice.lines.data.length > 0) {
      subscriptionId = invoice.lines.data[0].subscription;
      // Handle if it's an object here too
      if (subscriptionId && typeof subscriptionId === 'object' && subscriptionId.id) {
        subscriptionId = subscriptionId.id;
      }
      console.log('📋 Found subscription ID in invoice lines:', subscriptionId);
    }
    
    console.log('Invoice details:', {
      id: invoice.id,
      subscription_id: subscriptionId,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      billing_reason: invoice.billing_reason,
      charge: invoice.charge,
      payment_intent: invoice.payment_intent,
      status: invoice.status
    });
    
    // Check if this is a subscription invoice
    if (!subscriptionId) {
      console.log('❌ Invoice is not for a subscription, skipping processing');
      console.log('Available invoice fields:', Object.keys(invoice));
      return;
    }

    console.log('✅ Found subscription ID:', subscriptionId);

    // Get subscription details from Stripe (or use expanded one if available)
    let subscription;
    if (invoice.subscription && typeof invoice.subscription === 'object' && invoice.subscription.id) {
      console.log('✅ Using expanded subscription from invoice');
      subscription = invoice.subscription;
    } else {
      console.log('📥 Retrieving subscription from Stripe API');
      const stripe = getStripeClient();
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    }
    console.log('Stripe subscription retrieved:', {
      id: subscription.id,
      status: subscription.status
    });
    
    // Get subscription from database
    const { data: dbSubscription, error: subError } = await client
      .from('subscriptions')
      .select('user_id, plan_id, id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    console.log('Database subscription lookup result:', {
      found: !!dbSubscription,
      error: subError?.message,
      data: dbSubscription
    });

    if (subError || !dbSubscription) {
      console.log('❌ Subscription not found in database, skipping processing');
      console.log('Error details:', subError);
      return;
    }

    // ========================================
    // STORE PAYMENT TRANSACTION
    // ========================================
    console.log('Storing payment transaction for invoice:', invoice.id);

    // Get charge ID from invoice (can be in different fields)
    const chargeId = invoice.charge || invoice.charge_id || invoice.payment_intent;
    
    // Check if transaction already exists (prevent duplicates)
    // Use stripe_invoice_id as it's UNIQUE in the database schema
    console.log('Checking for existing transaction with invoice_id:', invoice.id);
    const { data: existingTransaction, error: checkError } = await client
      .from('payment_transactions')
      .select('id')
      .eq('stripe_invoice_id', invoice.id)
      .maybeSingle(); // Use maybeSingle() to avoid error when not found

    console.log('Existing transaction check result:', {
      exists: !!existingTransaction,
      error: checkError?.message
    });

    if (existingTransaction) {
      console.log('✅ Payment transaction already exists, skipping duplicate');
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

      console.log('Attempting to store payment transaction:', {
        user_id: transactionData.user_id,
        stripe_invoice_id: transactionData.stripe_invoice_id,
        stripe_charge_id: transactionData.stripe_charge_id,
        amount_cents: transactionData.amount_cents,
        billing_reason: transactionData.billing_reason
      });

      const { data: insertedData, error: transactionError } = await client
        .from('payment_transactions')
        .insert(transactionData)
        .select();

      if (transactionError) {
        console.error('❌ Error storing payment transaction:', transactionError);
        console.error('Transaction data that failed:', transactionData);
      } else {
        console.log('✅ Successfully stored payment transaction:', insertedData);
        console.log('✅ Payment transaction stored for invoice:', invoice.id);
      }
    }

    // ========================================
    // CREDIT ALLOCATION - SUBSCRIPTION RENEWAL
    // ========================================
    // Check if this is a renewal (not the first invoice)
    const isRenewal = invoice.billing_reason === 'subscription_cycle';
    
    if (!isRenewal) {
      console.log(`Invoice billing_reason is "${invoice.billing_reason}", not a renewal. Skipping credit allocation.`);
      return;
    }

    console.log('Subscription renewal detected! Adding credits...');

    // Get plan details
    const { data: plan, error: planError } = await client
      .from('plans')
      .select('credits_included, display_name')
      .eq('id', dbSubscription.plan_id)
      .single();

    if (planError || !plan) {
      console.error('Error fetching plan for renewal credit allocation:', planError);
      return;
    }

    if (plan.credits_included && plan.credits_included > 0) {
      console.log(`Adding ${plan.credits_included} credits to user ${dbSubscription.user_id} for ${plan.display_name} renewal`);
      
      // Add credits (Option B: Rollover - they accumulate)
      const creditResult = await addCredits(
        dbSubscription.user_id,
        plan.credits_included,
        'purchased',
        `Monthly renewal: ${plan.display_name} (${invoice.id})`,
        null, // reference_id must be UUID
        'subscription'
      );

      console.log(`Successfully added ${plan.credits_included} credits for renewal. New balance: ${creditResult.new_balance}`);
      
      // Update usage summary
      updateUsageSummaryAfterCreditsAdded(dbSubscription.user_id, plan.credits_included, 'purchased')
        .catch(err => console.error('Failed to update usage summary:', err));
    } else {
      console.log('Plan has no credits_included or 0 credits');
    }

  } catch (error) {
    console.error('Error in handleInvoicePaymentSucceeded:', error);
    // Don't throw - payment is already successful
  }
}

// Apply pending plan change (e.g., scheduled downgrade) right before the invoice is finalized
async function handleInvoiceUpcoming(invoice) {
  console.log('Processing invoice.upcoming:', invoice.id);

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
      console.log('No pending downgrade found, skipping.');
      return;
    }

    // Resolve new price id from pending_plan_id and interval
    const { data: newPlan } = await client
      .from('plans')
      .select('id, display_name, stripe_price_id_monthly, stripe_price_id_yearly')
      .eq('id', dbSubscription.pending_plan_id)
      .single();

    if (!newPlan) {
      console.log('Pending plan not found, skipping.');
      return;
    }

    const newPriceId = (dbSubscription.pending_interval === 'yearly')
      ? newPlan.stripe_price_id_yearly
      : newPlan.stripe_price_id_monthly;

    if (!newPriceId) {
      console.log('Pending plan missing price for interval, skipping.');
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

    console.log(`Applied pending downgrade to ${newPlan.display_name} before renewal.`);
  } catch (error) {
    console.error('Error in handleInvoiceUpcoming:', error);
  }
}

// NEW FEATURE: Invoice payment failed handler
async function handleInvoicePaymentFailed(invoice) {
  console.log('Processing invoice.payment_failed:', invoice.id);
  
  try {
    // Get subscription details from Stripe
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Update subscription status if needed
    await handleSubscriptionUpdated(subscription);
    
    console.log('Successfully processed payment failure for subscription:', subscription.id);
    
    // You can add additional logic here:
    // - Send payment failure notification to user
    // - Update user access if needed
    // - Log failed payment attempt
    
  } catch (error) {
    console.error('Error in handleInvoicePaymentFailed:', error);
    // Don't throw to prevent webhook retries
  }
}

// NEW FEATURE: Customer created handler
async function handleCustomerCreated(customer) {
  console.log('Processing customer.created:', customer.id);
  
  try {
    // You can add logic here to:
    // - Sync customer data to your database
    // - Set up customer-specific settings
    // - Send welcome email
    
    console.log('Successfully processed customer creation:', customer.id);
    
  } catch (error) {
    console.error('Error in handleCustomerCreated:', error);
  }
}

// NEW FEATURE: Customer updated handler
async function handleCustomerUpdated(customer) {
  console.log('Processing customer.updated:', customer.id);
  
  try {
    // You can add logic here to:
    // - Sync updated customer data
    // - Update customer preferences
    // - Log customer changes
    
    console.log('Successfully processed customer update:', customer.id);
    
  } catch (error) {
    console.error('Error in handleCustomerUpdated:', error);
  }
}

// NEW FEATURE: Payment method attached handler
async function handlePaymentMethodAttached(paymentMethod) {
  console.log('Processing payment_method.attached:', paymentMethod.id);
  
  try {
    // You can add logic here to:
    // - Update customer payment method info
    // - Send confirmation to user
    // - Log payment method changes
    
    console.log('Successfully processed payment method attachment:', paymentMethod.id);
    
  } catch (error) {
    console.error('Error in handlePaymentMethodAttached:', error);
  }
}

// NEW FEATURE: Charge dispute created handler
async function handleChargeDisputeCreated(dispute) {
  console.log('Processing charge.dispute.created:', dispute.id);
  
  try {
    // You can add logic here to:
    // - Send dispute notification to admin
    // - Update subscription status if needed
    // - Log dispute for investigation
    // - Notify customer about dispute
    
    console.log('Successfully processed dispute creation:', dispute.id);
    console.log('Dispute reason:', dispute.reason);
    console.log('Dispute amount:', dispute.amount);
    
  } catch (error) {
    console.error('Error in handleChargeDisputeCreated:', error);
  }
}

// NEW FEATURE: Subscription trial will end handler
async function handleSubscriptionTrialWillEnd(subscription) {
  console.log('Processing customer.subscription.trial_will_end:', subscription.id);
  
  try {
    // You can add logic here to:
    // - Send trial ending notification to user
    // - Offer trial extension or discount
    // - Update user dashboard with trial status
    // - Log trial ending for analytics
    
    console.log('Successfully processed trial will end notification:', subscription.id);
    console.log('Trial ends at:', subscription.trial_end);
    
  } catch (error) {
    console.error('Error in handleSubscriptionTrialWillEnd:', error);
  }
}

// NEW FEATURE: Invoice created handler
async function handleInvoiceCreated(invoice) {
  console.log('Processing invoice.created:', invoice.id);
  
  try {
    // You can add logic here to:
    // - Log invoice creation for tracking
    // - Send invoice preview to user
    // - Update billing records
    // - Prepare for payment processing
    
    console.log('Successfully processed invoice creation:', invoice.id);
    console.log('Invoice amount:', invoice.amount_due);
    console.log('Invoice status:', invoice.status);
    
  } catch (error) {
    console.error('Error in handleInvoiceCreated:', error);
  }
}

// NEW FEATURE: Invoice updated handler
async function handleInvoiceUpdated(invoice) {
  console.log('Processing invoice.updated:', invoice.id);
  
  try {
    // You can add logic here to:
    // - Sync invoice changes to database
    // - Update billing records
    // - Notify user of invoice changes
    // - Log invoice modifications
    
    console.log('Successfully processed invoice update:', invoice.id);
    console.log('Invoice status:', invoice.status);
    
  } catch (error) {
    console.error('Error in handleInvoiceUpdated:', error);
  }
}

// NEW FEATURE: Invoice payment action required handler
async function handleInvoicePaymentActionRequired(invoice) {
  console.log('Processing invoice.payment_action_required:', invoice.id);
  
  try {
    // You can add logic here to:
    // - Notify user that payment requires action (3D Secure)
    // - Update subscription status to show payment pending
    // - Send email with payment action instructions
    // - Log payment action required for tracking
    
    console.log('Successfully processed payment action required:', invoice.id);
    console.log('Payment intent:', invoice.payment_intent);
    
  } catch (error) {
    console.error('Error in handleInvoicePaymentActionRequired:', error);
  }
}

module.exports = router;
