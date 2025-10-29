/**
 * =====================================================
 * CREDIT CHECK MIDDLEWARE
 * =====================================================
 * 
 * Middleware to check if user has enough credits before generation
 * Runs BEFORE calling external AI APIs to prevent wasted API calls
 * 
 * Usage:
 *   router.post("/", auth, checkCredits('text_to_image'), async (req, res) => { ... })
 */

const { checkCreditsForGeneration } = require('../services/creditService');
const { getCreditCost, getGenerationTypeName } = require('../config/creditPricing');

/**
 * Create middleware to check credits for a specific generation type
 * @param {string} generationType - Type of generation (text_to_image, text_to_video, etc.)
 * @returns {Function} Express middleware function
 */
function checkCredits(generationType) {
  return async (req, res, next) => {
    try {
      // 1. Verify user is authenticated (should be set by auth middleware)
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to generate content'
        });
      }

      const userId = req.user._id;

      // 2. Get credit cost for this generation type (now fetches from database)
      let cost;
      try {
        cost = await getCreditCost(generationType);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid generation type',
          message: error.message
        });
      }


      // 3. Check if user has enough credits
      let creditCheck;
      try {
        creditCheck = await checkCreditsForGeneration(userId, generationType);
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Failed to check credits',
          message: 'Could not verify credit balance. Please try again.'
        });
      }

      // 4. If insufficient credits, return 402 Payment Required
      if (!creditCheck.hasEnough) {
        
        return res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          message: `You need ${creditCheck.required} credits to generate ${getGenerationTypeName(generationType)}, but you only have ${creditCheck.currentBalance} credits.`,
          details: {
            generationType,
            generationName: getGenerationTypeName(generationType),
            currentBalance: creditCheck.currentBalance,
            required: creditCheck.required,
            shortfall: creditCheck.shortfall
          }
        });
      }

      // 5. User has enough credits - attach info to request and continue
      
      // Attach credit information to request for use in route handler
      req.creditInfo = {
        generationType,
        cost: creditCheck.required,
        currentBalance: creditCheck.currentBalance,
        balanceAfter: creditCheck.balanceAfter
      };

      // Continue to next middleware (generation route)
      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Credit check failed',
        message: 'An unexpected error occurred while checking credits'
      });
    }
  };
}

/**
 * Optional: Middleware to check credits with custom cost
 * Useful for operations with variable costs
 * @param {number} customCost - Custom credit cost
 * @returns {Function} Express middleware function
 */
function checkCreditsWithCustomCost(customCost) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const userId = req.user._id;
      const { getUserCredits } = require('../services/creditService');


      // Get user's current balance
      const credits = await getUserCredits(userId);

      // Check if user has enough
      if (credits.balance < customCost) {
        
        return res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          message: `You need ${customCost} credits for this operation, but you only have ${credits.balance} credits.`,
          details: {
            currentBalance: credits.balance,
            required: customCost,
            shortfall: customCost - credits.balance
          }
        });
      }

      // Attach credit info
      req.creditInfo = {
        cost: customCost,
        currentBalance: credits.balance,
        balanceAfter: credits.balance - customCost
      };

      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Credit check failed',
        message: error.message
      });
    }
  };
}

/**
 * Middleware to skip credit check for admin users
 * Useful for testing or admin operations
 */
function skipCreditsForAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    req.creditInfo = {
      cost: 0,
      currentBalance: Infinity,
      balanceAfter: Infinity,
      adminBypass: true
    };
    return next();
  }
  next();
}

module.exports = {
  checkCredits,
  checkCreditsWithCustomCost,
  skipCreditsForAdmin
};

