"use strict";

const express = require("express");
const router = express.Router();
const { auth: verifyToken } = require("../middleware/auth");
const {
  getUserGenerations,
  getGenerationById,
  deleteGeneration,
  getUserGenerationStats,
  getUserGenerationKeys,
  deleteAllGenerationsForUser,
} = require("../models/Generation");
const { getSignedS3Url, deleteFromS3 } = require("../services/s3Service");

/**
 * GET /api/generations
 * Get user's generations with optional filters
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.supabaseUser.id;
    const {
      type,
      limit = 50,
      offset = 0,
      orderBy = "created_at",
      orderDirection = "desc",
    } = req.query;


    const generations = await getUserGenerations(userId, {
      generationType: type,
      limit: parseInt(limit),
      offset: parseInt(offset),
      orderBy,
      orderDirection,
    });

    // Generate fresh signed URLs for all generations (24-hour expiry)
    const generationsWithFreshUrls = await Promise.all(
      generations.map(async (gen) => {
        try {
          const freshSignedUrl = await getSignedS3Url(gen.s3_key, 86400); // 24 hours
          return {
            ...gen,
            s3_url: freshSignedUrl, // Replace old expired URL with fresh one
          };
        } catch (error) {
          return gen; // Return original if signing fails
        }
      })
    );

    
    res.status(200).json({
      success: true,
      count: generationsWithFreshUrls.length,
      generations: generationsWithFreshUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch generations",
      error: error.message,
    });
  }
});

/**
 * GET /api/generations/stats
 * Get user's generation statistics
 */
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.supabaseUser.id;
    const stats = await getUserGenerationStats(userId);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch generation statistics",
      error: error.message,
    });
  }
});

/**
 * GET /api/generations/:id
 * Get a specific generation by ID
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.supabaseUser.id;
    const generationId = req.params.id;

    const generation = await getGenerationById(generationId);

    // Verify ownership
    if (generation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Generate fresh signed URL
    try {
      const freshSignedUrl = await getSignedS3Url(generation.s3_key, 86400); // 24 hours
      generation.s3_url = freshSignedUrl;
    } catch (error) {
      // Continue with old URL if signing fails
    }

    res.status(200).json({
      success: true,
      generation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch generation",
      error: error.message,
    });
  }
});

/**
 * GET /api/generations/:id/signed-url
 * Get a signed URL for private S3 object
 */
router.get("/:id/signed-url", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.supabaseUser.id;
    const generationId = req.params.id;
    const expiresIn = parseInt(req.query.expiresIn) || 3600; // 1 hour default
    const download = String(req.query.download || '').toLowerCase() === '1' || String(req.query.download || '').toLowerCase() === 'true';

    const generation = await getGenerationById(generationId);

    // Verify ownership
    if (generation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    let responseContentDisposition;
    if (download) {
      const filename = (generation.s3_key && generation.s3_key.split('/').pop()) || `generation-${generation.id}`;
      responseContentDisposition = `attachment; filename="${filename}"`;
    }

    const signedUrl = await getSignedS3Url(generation.s3_key, expiresIn, responseContentDisposition);

    res.status(200).json({
      success: true,
      signedUrl,
      expiresIn,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate signed URL",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/generations/:id
 * Delete a generation
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.supabaseUser.id;
    const generationId = req.params.id;

    // Get generation details before deleting
    const generation = await getGenerationById(generationId);

    // Verify ownership
    if (generation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Delete from S3 bucket first
    try {
      if (generation.s3_key) {
        await deleteFromS3(generation.s3_key);
      }
    } catch (s3Error) {
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await deleteGeneration(generationId, userId);

    res.status(200).json({
      success: true,
      message: "Generation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete generation",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/generations
 * Bulk delete all generations for the authenticated user
 */
router.delete("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.supabaseUser.id;

    // Fetch s3 keys first, then delete S3 objects in parallel (best-effort)
    const keys = await getUserGenerationKeys(userId);
    await Promise.all(
      keys
        .filter((k) => k.s3_key)
        .map(async (k) => {
          try { await deleteFromS3(k.s3_key); } catch (_) {}
        })
    );

    const deletedCount = await deleteAllGenerationsForUser(userId);

    res.status(200).json({ success: true, deleted: deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete all generations", error: error.message });
  }
});

module.exports = router;

