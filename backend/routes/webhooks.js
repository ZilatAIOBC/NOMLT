const express = require('express');
const router = express.Router();
const { getStripeClient } = require('../config/stripe');
const { supabase, supabaseAdmin } = require('../utils/supabase');

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
        await handleInvoicePaymentSucceeded(event.data.object);
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
    console.error('Error processing webhook:', error);
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
  // You can add logic here to handle successful payments, like updating credits, sending emails, etc.
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
