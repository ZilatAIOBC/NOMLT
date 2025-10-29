/**
 * =====================================================
 * DAILY USAGE SUMMARY CRON JOB
 * =====================================================
 * 
 * Creates daily snapshots of usage summaries for all users
 * Run this at midnight every day
 * 
 * Setup:
 * 1. Install node-cron: npm install node-cron
 * 2. Import this file in app.js
 * 3. Job will run automatically
 */

const cron = require('node-cron');
const { createDailySummariesForAllUsers } = require('../services/usageSummaryService');

/**
 * Schedule daily usage summary creation
 * Runs every day at 00:00 (midnight)
 */
function scheduleDailyUsageSummary() {
  // Run at midnight every day
  cron.schedule('0 0 * * *', async () => {

    try {
      const result = await createDailySummariesForAllUsers();
      
      
    } catch (error) {
    }
  });

}

/**
 * Manual trigger for testing
 * Call this to create summaries immediately without waiting for cron
 */
async function runDailySummaryNow() {
  
  try {
    const result = await createDailySummariesForAllUsers();
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  scheduleDailyUsageSummary,
  runDailySummaryNow
};

