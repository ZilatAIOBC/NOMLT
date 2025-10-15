/**
 * =====================================================
 * CREDIT EXPIRATION SERVICE
 * =====================================================
 *
 * Tracks and expires time-bound credit bonuses (e.g., upgrade bonus credits).
 * Uses a simple table `credit_expirations` to store expiring lots metadata.
 */

const { supabase, supabaseAdmin } = require('../utils/supabase');
const { spendCredits } = require('./creditService');

/**
 * Create an expiration record for an upgrade bonus.
 * @param {string} userId
 * @param {number} amount
 * @param {Date|string|number} expiresAt - ISO string or ms epoch or Date
 * @param {object} context - { subscription_id, old_plan_id, new_plan_id }
 */
async function scheduleUpgradeBonusExpiration(userId, amount, expiresAt, context = {}) {
  const client = supabaseAdmin || supabase;
  const expiresIso = normalizeToIso(expiresAt);

  const payload = {
    user_id: userId,
    amount,
    expires_at: expiresIso,
    reason: 'upgrade_bonus',
    metadata: context || null,
    consumed_amount: 0,
    status: 'scheduled'
  };

  const { error } = await client.from('credit_expirations').insert(payload);
  if (error) {
    throw new Error(`Failed to schedule upgrade bonus expiration: ${error.message}`);
  }

  return { scheduled: true, expires_at: expiresIso };
}

/**
 * Process and expire any expired bonus credits.
 * For each record where expires_at <= now and status in ('scheduled','pending'),
 * compute remaining to expire = max(0, amount - consumed_amount),
 * and spend that amount as "Upgrade bonus expired" without a generation reference.
 */
async function processExpiredBonuses() {
  const client = supabaseAdmin || supabase;
  const nowIso = new Date().toISOString();

  const { data: rows, error } = await client
    .from('credit_expirations')
    .select('id, user_id, amount, consumed_amount, reason, expires_at, status')
    .lte('expires_at', nowIso)
    .in('status', ['scheduled', 'pending']);

  if (error) {
    throw new Error(`Failed fetching expired bonuses: ${error.message}`);
  }

  for (const row of rows || []) {
    const remaining = Math.max(0, (row.amount || 0) - (row.consumed_amount || 0));
    if (remaining <= 0) {
      await client.from('credit_expirations').update({ status: 'completed' }).eq('id', row.id);
      continue;
    }

    try {
      await spendCredits(row.user_id, remaining, 'Upgrade bonus expired', row.id, 'credit_expiration');
      await client
        .from('credit_expirations')
        .update({ consumed_amount: row.amount, status: 'completed', processed_at: new Date().toISOString() })
        .eq('id', row.id);
    } catch (e) {
      // Mark as failed but don't throw to continue others
      await client
        .from('credit_expirations')
        .update({ status: 'failed', error_message: e.message, processed_at: new Date().toISOString() })
        .eq('id', row.id);
    }
  }

  return { processed: (rows || []).length };
}

function normalizeToIso(input) {
  if (!input) return null;
  if (typeof input === 'string') return new Date(input).toISOString();
  if (typeof input === 'number') return new Date(input).toISOString();
  if (input instanceof Date) return input.toISOString();
  return null;
}

module.exports = {
  scheduleUpgradeBonusExpiration,
  processExpiredBonuses
};


