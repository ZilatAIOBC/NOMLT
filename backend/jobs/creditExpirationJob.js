/**
 * =====================================================
 * CREDIT EXPIRATION CRON JOB
 * =====================================================
 */

const cron = require('node-cron');
const { processExpiredBonuses } = require('../services/creditExpirationService');

function scheduleCreditExpirationJob() {
  // Run every day at 00:10
  cron.schedule('10 0 * * *', async () => {
    console.log('🕐 CRON: Processing expired upgrade bonus credits...');
    try {
      const result = await processExpiredBonuses();
      console.log(`✅ CRON: Credit expiration processed. Records handled: ${result.processed}`);
    } catch (error) {
      console.error('❌ CRON: Failed processing expired bonuses:', error);
    }
  });

  console.log('✅ Credit expiration cron job scheduled (runs daily at 00:10)');
}

module.exports = { scheduleCreditExpirationJob };


