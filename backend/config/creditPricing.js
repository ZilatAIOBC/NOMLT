/**
 * =====================================================
 * CREDIT PRICING CONFIGURATION
 * =====================================================
 * 
 * This file provides credit cost functions for different AI generation types.
 * These costs are now stored in the database and fetched dynamically.
 * 
 * Fallback Strategy:
 * - Primary: Fetch from credit_pricing table in database
 * - Fallback: Use hardcoded defaults if database is unavailable
 * 
 * Credit Cost Strategy:
 * - Image generations (faster, less compute): 30 credits (default)
 * - Video generations (slower, more compute): 80 credits (default)
 */

const { supabase, supabaseAdmin } = require('../utils/supabase');

// =====================================================
// FALLBACK CREDIT COSTS (used when DB is unavailable)
// =====================================================

/**
 * Fallback credit costs for each generation type
 * Only used when database fetch fails
 * @constant {Object} FALLBACK_CREDIT_COSTS
 */
const FALLBACK_CREDIT_COSTS = {
  text_to_image: 30,    // Text → Image generation
  image_to_image: 30,   // Image → Image transformation
  text_to_video: 80,    // Text → Video generation
  image_to_video: 80,   // Image → Video generation
};

/**
 * In-memory cache for credit costs
 * Reduces database queries for frequently accessed pricing
 */
let creditCostsCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

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
 * Fetch credit costs from ai_models database table
 * Gets the first active model cost for each category
 * @returns {Promise<Object>} Object with generation types as keys and costs as values
 */
async function fetchCreditCostsFromDB() {
  try {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('ai_models')
      .select('category, cost_per_generation')
      .eq('is_active', true)
      .order('category')
      .order('sort_order');

    if (error) {
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Group by category and use the first model's cost for each category
    const costs = {};
    const categories = ['text_to_image', 'image_to_image', 'text_to_video', 'image_to_video'];
    
    categories.forEach(category => {
      const modelInCategory = data.find(m => m.category === category);
      if (modelInCategory) {
        costs[category] = modelInCategory.cost_per_generation;
      }
    });

    // If we didn't find all categories, return null to use fallback
    if (Object.keys(costs).length < 4) {
      return null;
    }

    return costs;
  } catch (error) {
    return null;
  }
}

/**
 * Get all credit costs with caching
 * @returns {Promise<Object>} Object with generation types as keys and costs as values
 */
async function getAllCreditCostsWithCache() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (creditCostsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
    return creditCostsCache;
  }

  // Fetch fresh data from database
  const dbCosts = await fetchCreditCostsFromDB();
  
  if (dbCosts) {
    // Update cache
    creditCostsCache = dbCosts;
    cacheTimestamp = now;
    return dbCosts;
  }

  // Fallback to hardcoded costs
  return FALLBACK_CREDIT_COSTS;
}

/**
 * Get credit cost for a specific generation type
 * Fetches from database with fallback to hardcoded values
 * @param {string} generationType - The type of generation (text_to_image, image_to_image, text_to_video, image_to_video)
 * @returns {Promise<number>} The credit cost for the generation type
 * @throws {Error} If generation type is invalid
 */
async function getCreditCost(generationType) {
  if (!generationType) {
    throw new Error('Generation type is required');
  }

  const costs = await getAllCreditCostsWithCache();
  const cost = costs[generationType];
  
  if (cost === undefined) {
    throw new Error(
      `Invalid generation type: ${generationType}. ` +
      `Valid types are: ${Object.keys(costs).join(', ')}`
    );
  }
  
  return cost;
}

/**
 * Invalidate the credit costs cache
 * Call this after updating pricing in the database
 */
function invalidateCreditCostsCache() {
  creditCostsCache = null;
  cacheTimestamp = null;
}

/**
 * Check if a generation type is valid
 * @param {string} generationType - The type of generation to validate
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
async function isValidGenerationType(generationType) {
  if (!generationType) return false;
  const costs = await getAllCreditCostsWithCache();
  return costs.hasOwnProperty(generationType);
}

/**
 * Get all credit costs from database
 * @returns {Promise<Object>} Object containing all generation types and their costs
 */
async function getAllCreditCosts() {
  const costs = await getAllCreditCostsWithCache();
  return { ...costs };
}

/**
 * Get all valid generation types
 * @returns {Promise<Array<string>>} Array of valid generation type names
 */
async function getValidGenerationTypes() {
  const costs = await getAllCreditCostsWithCache();
  return Object.keys(costs);
}

/**
 * Calculate total credits needed for multiple generations
 * @param {Array<{type: string, count: number}>} generations - Array of generation requests
 * @returns {Promise<number>} Total credit cost
 * @example
 * calculateTotalCost([
 *   { type: 'text_to_image', count: 3 },
 *   { type: 'text_to_video', count: 1 }
 * ]) // Returns 170 (30*3 + 80*1)
 */
async function calculateTotalCost(generations) {
  if (!Array.isArray(generations)) {
    throw new Error('Generations must be an array');
  }

  let total = 0;
  for (const gen of generations) {
    if (!gen.type || typeof gen.count !== 'number') {
      throw new Error('Each generation must have type and count properties');
    }
    const cost = await getCreditCost(gen.type);
    total += cost * gen.count;
  }
  return total;
}

/**
 * Check if a user has enough credits for a generation
 * @param {number} userBalance - User's current credit balance
 * @param {string} generationType - The type of generation
 * @returns {Promise<Object>} Object with hasEnough boolean and shortfall if any
 */
async function checkSufficientCredits(userBalance, generationType) {
  const cost = await getCreditCost(generationType);
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
  CREDIT_COSTS: FALLBACK_CREDIT_COSTS, // For backward compatibility
  MINIMUM_CREDITS,
  MAX_CREDITS,
  
  // Functions
  getCreditCost,
  isValidGenerationType,
  getAllCreditCosts,
  getValidGenerationTypes,
  calculateTotalCost,
  checkSufficientCredits,
  getGenerationTypeName,
  invalidateCreditCostsCache,
  
  // Internal functions (for testing/debugging)
  fetchCreditCostsFromDB,
  getAllCreditCostsWithCache
};

