/**
 * =====================================================
 * RATE LIMITER MONITORING ROUTES
 * =====================================================
 * 
 * Endpoints for monitoring Bottleneck rate limiter statistics
 * Useful for debugging and observing API request patterns
 */

const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const { getAllStats, getStats } = require('../services/rateLimiterService');

/**
 * GET /api/rate-limiter/stats
 * Get all rate limiter statistics
 * Requires authentication (admin only for security)
 */
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const stats = getAllStats();
    
    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rate limiter statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/rate-limiter/stats/:type
 * Get statistics for a specific rate limiter type
 * Types: image, video, poll
 */
router.get('/stats/:type', auth, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['image', 'video', 'poll'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rate limiter type',
        message: 'Type must be one of: image, video, poll'
      });
    }
    
    const stats = getStats(type);
    
    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch ${req.params.type} rate limiter statistics`,
      message: error.message
    });
  }
});

module.exports = router;
