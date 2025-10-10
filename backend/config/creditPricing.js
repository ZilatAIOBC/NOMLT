/**
 * =====================================================
 * CREDIT PRICING CONFIGURATION
 * =====================================================
 * 
 * This file defines the credit costs for different AI generation types.
 * These costs are used throughout the application to:
 * - Check if users have enough credits before generation
 * - Deduct credits after successful generation
 * - Display costs to users in the frontend
 * 
 * Credit Cost Strategy:
 * - Image generations (faster, less compute): 30 credits
 * - Video generations (slower, more compute): 80 credits
 */

// =====================================================
// CREDIT COSTS CONFIGURATION
// =====================================================

/**
 * Credit costs for each generation type
 * @constant {Object} CREDIT_COSTS
 */
const CREDIT_COSTS = {
  text_to_image: 30,    // Text → Image generation
  image_to_image: 30,   // Image → Image transformation
  text_to_video: 80,    // Text → Video generation
  image_to_video: 80,   // Image → Video generation
};

/**
 * Minimum credit balance required to use the platform
 * @constant {number}
 */
const MINIMUM_CREDITS = 0;

/**
 * Maximum credits a user can have (to prevent overflow)
 * Set to null for unlimited
 * @constant {number|null}
 */
const MAX_CREDITS = 1000000;

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get credit cost for a specific generation type
 * @param {string} generationType - The type of generation (text_to_image, image_to_image, text_to_video, image_to_video)
 * @returns {number} The credit cost for the generation type
 * @throws {Error} If generation type is invalid
 */
function getCreditCost(generationType) {
  if (!generationType) {
    throw new Error('Generation type is required');
  }

  const cost = CREDIT_COSTS[generationType];
  
  if (cost === undefined) {
    throw new Error(
      `Invalid generation type: ${generationType}. ` +
      `Valid types are: ${Object.keys(CREDIT_COSTS).join(', ')}`
    );
  }
  
  return cost;
}

/**
 * Check if a generation type is valid
 * @param {string} generationType - The type of generation to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidGenerationType(generationType) {
  return generationType && CREDIT_COSTS.hasOwnProperty(generationType);
}

/**
 * Get all credit costs
 * @returns {Object} Object containing all generation types and their costs
 */
function getAllCreditCosts() {
  return { ...CREDIT_COSTS };
}

/**
 * Get all valid generation types
 * @returns {Array<string>} Array of valid generation type names
 */
function getValidGenerationTypes() {
  return Object.keys(CREDIT_COSTS);
}

/**
 * Calculate total credits needed for multiple generations
 * @param {Array<{type: string, count: number}>} generations - Array of generation requests
 * @returns {number} Total credit cost
 * @example
 * calculateTotalCost([
 *   { type: 'text_to_image', count: 3 },
 *   { type: 'text_to_video', count: 1 }
 * ]) // Returns 170 (30*3 + 80*1)
 */
function calculateTotalCost(generations) {
  if (!Array.isArray(generations)) {
    throw new Error('Generations must be an array');
  }

  return generations.reduce((total, gen) => {
    if (!gen.type || typeof gen.count !== 'number') {
      throw new Error('Each generation must have type and count properties');
    }
    const cost = getCreditCost(gen.type);
    return total + (cost * gen.count);
  }, 0);
}

/**
 * Check if a user has enough credits for a generation
 * @param {number} userBalance - User's current credit balance
 * @param {string} generationType - The type of generation
 * @returns {Object} Object with hasEnough boolean and shortfall if any
 */
function checkSufficientCredits(userBalance, generationType) {
  const cost = getCreditCost(generationType);
  const hasEnough = userBalance >= cost;
  
  return {
    hasEnough,
    required: cost,
    current: userBalance,
    shortfall: hasEnough ? 0 : cost - userBalance
  };
}

/**
 * Get human-readable generation type name
 * @param {string} generationType - The generation type
 * @returns {string} Human-readable name
 */
function getGenerationTypeName(generationType) {
  const names = {
    text_to_image: 'Text to Image',
    image_to_image: 'Image to Image',
    text_to_video: 'Text to Video',
    image_to_video: 'Image to Video'
  };
  return names[generationType] || generationType;
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  // Constants
  CREDIT_COSTS,
  MINIMUM_CREDITS,
  MAX_CREDITS,
  
  // Functions
  getCreditCost,
  isValidGenerationType,
  getAllCreditCosts,
  getValidGenerationTypes,
  calculateTotalCost,
  checkSufficientCredits,
  getGenerationTypeName
};

