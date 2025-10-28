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
    try {
      const result = await processExpiredBonuses();
    } catch (error) {
    }
  });

}

module.exports = { scheduleCreditExpirationJob };


