const cron = require('node-cron');
const { getGenerationsOlderThan, deleteAllGenerationsForUser } = require('../models/Generation');
const { deleteFromS3 } = require('../services/s3Service');

function scheduleGenerationRetention(days = 7) {
  // Run daily at 00:20
  cron.schedule('20 0 * * *', async () => {
    try {
      const old = await getGenerationsOlderThan(days);
      if (!old.length) {
        return;
      }

      // Group by user to leverage DB bulk deletes per user
      const userIdToIds = new Map();
      await Promise.all(old.map(async (g) => {
        if (g.s3_key) {
          try { await deleteFromS3(g.s3_key); } catch (_) {}
        }
        if (!userIdToIds.has(g.user_id)) userIdToIds.set(g.user_id, 0);
      }));

      // DB cleanup: delete all older-than entries per user
      // Supabase doesn't support conditional bulk delete by created_at per user in one call here
      // so do a global delete by created_at threshold.
      try {
        // Re-run deletion at DB level using service role
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
        await supabase.from('generations').delete().lt('created_at', cutoff);
      } catch (_) {}
    } catch (_) {
    }
  });
}

module.exports = { scheduleGenerationRetention };


