// services/censorshipService.js

const { NSFW_WORDS } = require('../config/nsfwWords');
const { supabase, supabaseAdmin } = require('../utils/supabase');

const client = supabaseAdmin || supabase;

// Plan names that should be censored by default
const CENSORED_PLANS = ['basic', 'standard'];
// Plan names that should be uncensored by default
const UNFILTERED_PLANS = ['pro'];

// ⚠️ Make sure you add a boolean column `censored_enabled` to `subscriptions`
// with default TRUE. Admin can toggle it manually per user.

/**
 * Check whether the user is currently in Censored Mode or Unfiltered Mode.
 *
 * Rules:
 *  - If subscription.censored_enabled === false → Unfiltered Mode (even for Basic/Standard)
 *  - If plan display_name is Pro → Unfiltered Mode
 *  - Otherwise (Basic/Standard/none) → Censored Mode
 */
async function getUserCensorshipStatus(userId) {
  if (!userId) {
    return {
      isCensoredMode: true,
      reason: 'no_user',
      planName: null,
      subscription: null,
    };
  }

  const { data, error } = await client
    .from('subscriptions')
    .select(
      `
        id,
        user_id,
        status,
        current_period_start,
        current_period_end,
        censored_enabled,
        plan_id,
        plans:plan_id (
          display_name
        )
      `
    )
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // On error, fall back to safe behavior (Censored Mode)
    return {
      isCensoredMode: true,
      reason: 'db_error',
      planName: null,
      subscription: null,
    };
  }

  if (!data) {
    // No subscription → treat as censored
    return {
      isCensoredMode: true,
      reason: 'no_subscription',
      planName: null,
      subscription: null,
    };
  }

  const planNameRaw = data.plans?.display_name || '';
  const planName = planNameRaw.toLowerCase().trim();
  const censoredEnabled = data.censored_enabled;

  // Admin override via `censored_enabled`:
  // If explicitly false → UNFILTERED
  if (censoredEnabled === false) {
    return {
      isCensoredMode: false,
      reason: 'admin_override_unfiltered',
      planName: planNameRaw,
      subscription: data,
    };
  }

  // Pro plan → Unfiltered Mode by default
  if (UNFILTERED_PLANS.includes(planName)) {
    return {
      isCensoredMode: false,
      reason: 'pro_plan_unfiltered',
      planName: planNameRaw,
      subscription: data,
    };
  }

  // Basic / Standard → Censored Mode
  if (CENSORED_PLANS.includes(planName)) {
    return {
      isCensoredMode: true,
      reason: 'basic_or_standard',
      planName: planNameRaw,
      subscription: data,
    };
  }

  // Any other unknown plan → be safe, keep censored
  return {
    isCensoredMode: true,
    reason: 'unknown_plan',
    planName: planNameRaw,
    subscription: data,
  };
}


function detectNSFWWords(text) {
  if (!text || typeof text !== 'string') {
    return { matched: false, word: null };
  }

  const lower = text.toLowerCase();

  for (const word of NSFW_WORDS) {
    if (!word) continue;
    if (lower.includes(word.toLowerCase())) {
      return { matched: true, word };
    }
  }

  return { matched: false, word: null };
}

module.exports = {
  getUserCensorshipStatus,
  detectNSFWWords,
};
