/**
 * =====================================================
 * CREDIT SERVICE
 * =====================================================
 * 
 * Centralized service for managing user credits
 * Uses Supabase and PostgreSQL functions to handle credit operations
 */

const { supabase, supabaseAdmin } = require('../utils/supabase');
const { getCreditCost } = require('../config/creditPricing');

/**
 * Get user's credit information
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Credit information (balance, lifetime_earned, lifetime_spent)
 */
async function getUserCredits(userId) {
  try {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('user_credits')
      .select('balance, lifetime_earned, lifetime_spent, updated_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If user has no credit record, create one with 0 balance
      if (error.code === 'PGRST116') {
        
        const { data: newCredit, error: createError } = await client
          .from('user_credits')
          .insert({
            user_id: userId,
            balance: 0,
            lifetime_earned: 0,
            lifetime_spent: 0
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create credit record: ${createError.message}`);
        }

        return {
          balance: 0,
          lifetime_earned: 0,
          lifetime_spent: 0,
          updated_at: newCredit.updated_at
        };
      }
      
      throw new Error(`Failed to fetch credits: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Check if user has enough credits for a specific amount
 * @param {string} userId - User ID
 * @param {number} amount - Amount of credits needed
 * @returns {Promise<boolean>} True if user has enough credits
 */
async function hasEnoughCredits(userId, amount) {
  try {
    const credits = await getUserCredits(userId);
    return credits.balance >= amount;
  } catch (error) {
    return false;
  }
}

/**
 * Deduct credits from user after successful generation
 * Uses PostgreSQL function update_user_credits()
 * Includes idempotency check to prevent double deductions
 * @param {string} userId - User ID
 * @param {number} amount - Amount of credits to deduct
 * @param {string} generationType - Type of generation (text_to_image, etc.)
 * @param {string} generationId - Generation ID for reference (used for idempotency)
 * @returns {Promise<Object>} Updated credit info with new balance
 */
async function deductCredits(userId, amount, generationType, generationId) {
  try {
    
    const client = supabaseAdmin || supabase;
    
    // IDEMPOTENCY CHECK: If generationId provided, check if already deducted
    if (generationId) {
      const { data: existingTransaction, error: checkError } = await client
        .from('credit_transactions')
        .select('id, amount, balance_after')
        .eq('user_id', userId)
        .eq('reference_id', generationId)
        .eq('type', 'spent')
        .maybeSingle();

      if (existingTransaction) {
        return {
          amount_deducted: existingTransaction.amount,
          new_balance: existingTransaction.balance_after,
          lifetime_spent: null,
          idempotent: true
        };
      }
    }
    
    // Call PostgreSQL function to update credits
    const { data, error } = await client.rpc('update_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_type: 'spent',
      p_description: `${generationType} generation`,
      p_reference_id: generationId,
      p_reference_type: 'generation'
    });

    if (error) {
      // Check for insufficient credits error
      if (error.message && error.message.includes('Insufficient credits')) {
        throw new Error('Insufficient credits');
      }
      throw new Error(`Failed to deduct credits: ${error.message}`);
    }

    // Get updated balance
    const updatedCredits = await getUserCredits(userId);
    
    
    return {
      amount_deducted: amount,
      new_balance: updatedCredits.balance,
      lifetime_spent: updatedCredits.lifetime_spent,
      idempotent: false
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Add credits to user (subscription, purchase, bonus, etc.)
 * Uses PostgreSQL function update_user_credits()
 * @param {string} userId - User ID
 * @param {number} amount - Amount of credits to add
 * @param {string} type - Type of credit addition (purchased, bonus, earned, subscription)
 * @param {string} description - Description of the credit addition
 * @param {string} referenceId - Optional reference ID (subscription_id, payment_id, etc.)
 * @param {string} referenceType - Optional reference type (subscription, credit_package, etc.)
 * @returns {Promise<Object>} Updated credit info with new balance
 */
async function addCredits(userId, amount, type = 'earned', description = 'Credits added', referenceId = null, referenceType = null) {
  try {
    
    const client = supabaseAdmin || supabase;
    
    // Call PostgreSQL function to update credits
    const { data, error } = await client.rpc('update_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_description: description,
      p_reference_id: referenceId,
      p_reference_type: referenceType
    });

    if (error) {
      throw new Error(`Failed to add credits: ${error.message}`);
    }

    // Get updated balance
    const updatedCredits = await getUserCredits(userId);
    
    
    return {
      amount_added: amount,
      new_balance: updatedCredits.balance,
      lifetime_earned: updatedCredits.lifetime_earned
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Spend credits for a generic reason (non-generation)
 * Uses PostgreSQL function update_user_credits()
 * @param {string} userId - User ID
 * @param {number} amount - Amount of credits to spend (positive number)
 * @param {string} description - Description for the spend (e.g., Upgrade bonus expired)
 * @param {string|null} referenceId - Optional reference ID
 * @param {string|null} referenceType - Optional reference type
 * @returns {Promise<Object>} Updated credit info
 */
async function spendCredits(userId, amount, description = 'Credits spent', referenceId = null, referenceType = null) {
  try {

    const client = supabaseAdmin || supabase;

    const { error } = await client.rpc('update_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_type: 'spent',
      p_description: description,
      p_reference_id: referenceId,
      p_reference_type: referenceType
    });

    if (error) {
      throw new Error(`Failed to spend credits: ${error.message}`);
    }

    const updatedCredits = await getUserCredits(userId);

    return {
      amount_spent: amount,
      new_balance: updatedCredits.balance,
      lifetime_spent: updatedCredits.lifetime_spent
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Refund credits to user (if generation fails or is cancelled)
 * Includes idempotency check to prevent double refunds
 * @param {string} userId - User ID
 * @param {number} amount - Amount of credits to refund
 * @param {string} generationType - Type of generation that failed
 * @param {string} generationId - Generation ID for reference
 * @param {string} reason - Reason for refund
 * @returns {Promise<Object>} Updated credit info with new balance
 */
async function refundCredits(userId, amount, generationType, generationId, reason = 'Generation failed') {
  try {
    
    const client = supabaseAdmin || supabase;
    
    // IDEMPOTENCY CHECK: Prevent double refunds for same generation
    if (generationId) {
      const { data: existingRefund, error: checkError } = await client
        .from('credit_transactions')
        .select('id, amount, balance_after')
        .eq('user_id', userId)
        .eq('reference_id', generationId)
        .eq('type', 'refund')
        .maybeSingle();

      if (existingRefund) {
        return {
          amount_refunded: existingRefund.amount,
          new_balance: existingRefund.balance_after,
          reason: reason,
          idempotent: true
        };
      }
    }
    
    // Call PostgreSQL function to update credits
    const { data, error } = await client.rpc('update_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_type: 'refund',
      p_description: `Refund: ${generationType} - ${reason}`,
      p_reference_id: generationId,
      p_reference_type: 'generation'
    });

    if (error) {
      throw new Error(`Failed to refund credits: ${error.message}`);
    }

    // Get updated balance
    const updatedCredits = await getUserCredits(userId);
    
    
    return {
      amount_refunded: amount,
      new_balance: updatedCredits.balance,
      reason: reason,
      idempotent: false
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Check if user has enough credits for a specific generation type
 * @param {string} userId - User ID
 * @param {string} generationType - Type of generation
 * @returns {Promise<Object>} Object with check result and details
 */
async function checkCreditsForGeneration(userId, generationType) {
  try {
    const cost = await getCreditCost(generationType);
    const credits = await getUserCredits(userId);
    
    const hasEnough = credits.balance >= cost;
    const shortfall = hasEnough ? 0 : cost - credits.balance;
    
    return {
      hasEnough,
      currentBalance: credits.balance,
      required: cost,
      shortfall,
      balanceAfter: hasEnough ? credits.balance - cost : credits.balance
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Reset user credits to a specific amount
 * Useful for subscription renewals
 * @param {string} userId - User ID
 * @param {number} amount - New credit balance
 * @param {string} description - Description of reset
 * @returns {Promise<Object>} Updated credit info
 */
async function resetCredits(userId, amount, description = 'Credits reset') {
  try {
    
    const client = supabaseAdmin || supabase;
    
    // Get current balance
    const currentCredits = await getUserCredits(userId);
    
    // Update balance directly
    const { error } = await client
      .from('user_credits')
      .update({ 
        balance: amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to reset credits: ${error.message}`);
    }

    // Record transaction
    await client
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: 'earned',
        amount: amount,
        balance_after: amount,
        description: description,
        reference_type: 'subscription'
      });

    
    return {
      old_balance: currentCredits.balance,
      new_balance: amount,
      difference: amount - currentCredits.balance
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Safe credit deduction with automatic refund on failure
 * Wraps a generation function and handles credit deduction/refund automatically
 * @param {string} userId - User ID
 * @param {number} amount - Amount of credits to deduct
 * @param {string} generationType - Type of generation
 * @param {Function} generationFunction - Async function that performs the generation
 * @returns {Promise<Object>} Generation result with credit info
 */
async function safeDeductCreditsWithRefund(userId, amount, generationType, generationFunction) {
  let generationId = null;
  let creditsDeducted = false;

  try {
    // Execute the generation function
    const result = await generationFunction();
    generationId = result.generationId || result.id;

    // Deduct credits after successful generation
    const creditResult = await deductCredits(userId, amount, generationType, generationId);
    creditsDeducted = true;

    return {
      ...result,
      credits: creditResult
    };

  } catch (error) {
    // If credits were deducted but something failed after, refund them
    if (creditsDeducted && generationId) {
      try {
        await refundCredits(userId, amount, generationType, generationId, 'Generation processing failed');
      } catch (refundError) {
        // Log but don't throw - we want to show the original error
      }
    }

    // Re-throw the original error
    throw error;
  }
}

/**
 * Mark generation as failed and refund credits if already deducted
 * @param {string} userId - User ID
 * @param {string} generationId - Generation ID
 * @param {number} amount - Amount to refund
 * @param {string} generationType - Type of generation
 * @param {string} reason - Failure reason
 */
async function handleGenerationFailure(userId, generationId, amount, generationType, reason = 'Generation failed') {
  try {
    const client = supabaseAdmin || supabase;

    // Update generation status to failed
    await client
      .from('generations')
      .update({
        status: 'failed',
        error_message: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', generationId);

    // Check if credits were already deducted
    const { data: deductionRecord } = await client
      .from('credit_transactions')
      .select('id, amount')
      .eq('user_id', userId)
      .eq('reference_id', generationId)
      .eq('type', 'spent')
      .maybeSingle();

    // If credits were deducted, refund them
    if (deductionRecord) {
      await refundCredits(userId, deductionRecord.amount, generationType, generationId, reason);
    }

  } catch (error) {
    throw error;
  }
}

module.exports = {
  getUserCredits,
  hasEnoughCredits,
  deductCredits,
  addCredits,
  spendCredits,
  refundCredits,
  checkCreditsForGeneration,
  resetCredits,
  safeDeductCreditsWithRefund,
  handleGenerationFailure
};

