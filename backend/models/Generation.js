"use strict";

const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Create a new generation record
 * @param {object} generationData - Generation data
 * @returns {Promise<object>} Created generation record
 */
async function createGeneration(generationData) {
  const {
    userId,
    generationType,
    s3Key,
    s3Url,
    prompt,
    settings,
    fileSize,
    contentType,
  } = generationData;

  try {
    const { data, error } = await supabase
      .from("generations")
      .insert([
        {
          user_id: userId,
          generation_type: generationType,
          s3_key: s3Key,
          s3_url: s3Url,
          prompt: prompt || null,
          settings: settings || null,
          file_size: fileSize || null,
          content_type: contentType || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save generation to database: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get user's generations
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} List of generations
 */
async function getUserGenerations(userId, options = {}) {
  const {
    generationType = null,
    limit = 50,
    offset = 0,
    orderBy = "created_at",
    orderDirection = "desc",
  } = options;

  try {
    let query = supabase
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .order(orderBy, { ascending: orderDirection === "asc" })
      .range(offset, offset + limit - 1);

    if (generationType) {
      query = query.eq("generation_type", generationType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch generations: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Get generation by ID
 * @param {string} generationId - Generation ID
 * @returns {Promise<object>} Generation record
 */
async function getGenerationById(generationId) {
  try {
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("id", generationId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch generation: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete generation record
 * @param {string} generationId - Generation ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
async function deleteGeneration(generationId, userId) {
  try {
    const { error } = await supabase
      .from("generations")
      .delete()
      .eq("id", generationId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete generation: ${error.message}`);
    }

    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch all generations for a user with ids and s3 keys
 * @param {string} userId
 * @returns {Promise<Array<{id:string, s3_key:string}>>}
 */
async function getUserGenerationKeys(userId) {
  try {
    const { data, error } = await supabase
      .from("generations")
      .select("id, s3_key")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch generation keys: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Delete all generations for a user
 * @param {string} userId
 * @returns {Promise<number>} Number of deleted rows
 */
async function deleteAllGenerationsForUser(userId) {
  try {
    const { count, error } = await supabase
      .from("generations")
      .delete({ count: "exact" })
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete all generations: ${error.message}`);
    }

    return count || 0;
  } catch (error) {
    throw error;
  }
}

/**
 * Get generations older than given days
 * @param {number} days
 * @returns {Promise<Array<{id:string, user_id:string, s3_key:string}>>}
 */
async function getGenerationsOlderThan(days) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  try {
    const { data, error } = await supabase
      .from("generations")
      .select("id, user_id, s3_key")
      .lt("created_at", cutoff);

    if (error) {
      throw new Error(`Failed to fetch old generations: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Get generation statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Statistics
 */
async function getUserGenerationStats(userId) {
  try {
    const { data, error } = await supabase
      .from("generations")
      .select("generation_type, file_size")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }

    const stats = {
      total: data.length,
      byType: {},
      totalSize: 0,
    };

    data.forEach((gen) => {
      stats.byType[gen.generation_type] = (stats.byType[gen.generation_type] || 0) + 1;
      stats.totalSize += gen.file_size || 0;
    });

    return stats;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createGeneration,
  getUserGenerations,
  getGenerationById,
  deleteGeneration,
  getUserGenerationStats,
  getUserGenerationKeys,
  deleteAllGenerationsForUser,
  getGenerationsOlderThan,
};

