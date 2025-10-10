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
    console.log('🕐 CRON: Starting daily usage summary creation...');
    console.log(`🕐 Time: ${new Date().toISOString()}`);

    try {
      const result = await createDailySummariesForAllUsers();
      
      console.log(`✅ CRON: Daily summaries created successfully`);
      console.log(`📊 Created: ${result.created}, Errors: ${result.errors}`);
      
    } catch (error) {
      console.error('❌ CRON: Failed to create daily summaries:', error);
    }
  });

  console.log('✅ Daily usage summary cron job scheduled (runs at midnight)');
}

/**
 * Manual trigger for testing
 * Call this to create summaries immediately without waiting for cron
 */
async function runDailySummaryNow() {
  console.log('🔧 Manual trigger: Creating daily summaries NOW...');
  
  try {
    const result = await createDailySummariesForAllUsers();
    console.log(`✅ Manual run complete: Created ${result.created}, Errors: ${result.errors}`);
    return result;
  } catch (error) {
    console.error('❌ Manual run failed:', error);
    throw error;
  }
}

module.exports = {
  scheduleDailyUsageSummary,
  runDailySummaryNow
};

