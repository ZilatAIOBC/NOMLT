"use strict";

const Bottleneck = require("bottleneck");

/**
 * =====================================================
 * WAVESPEED API RATE LIMITER SERVICE
 * =====================================================
 * 
 * Implements rate limiting for Wavespeed API using Bottleneck
 * Based on Silver tier (Pro) limits:
 * - Images: 500 per minute
 * - Videos: 60 per minute  
 * - Max concurrent: 100 tasks
 * 
 * Implementation follows Wavespeed's official documentation:
 * - Level Silver/Pro: 500 images or 60 videos per minute, max 100 concurrent tasks
 * - Automatic queueing prevents "Too Many Requests" errors
 * - Retry with exponential backoff on 429 errors
 * - Separate limiters for different request types
 * 
 * Best practices:
 * - Prevents API throttling
 * - Queues requests automatically
 * - Handles retries with backoff
 * - Monitors queue and active tasks
 */

// Create rate limiters for different request types
// Using conservative limits to stay well within API limits

/**
 * Rate limiter for image generation requests (text-to-image, image-to-image)
 * Limit: 450 requests per minute (leaving buffer below 500 limit)
 */
const imageLimiter = new Bottleneck({
  reservoir: 450, // Number of tokens
  reservoirRefreshAmount: 450,
  reservoirRefreshInterval: 60 * 1000, // Refresh every 60 seconds
  maxConcurrent: 100, // Max parallel requests
  minTime: 133, // Minimum time between requests (450 req/min = ~133ms between requests)

  // Retry configuration
  retryCondition: (error, options) => {
    // Retry on rate limit errors (429) or network errors (5xx)
    const statusCode = error?.response?.status;
    return statusCode === 429 || (statusCode >= 500 && statusCode < 600);
  },
  retryDelay: (retryCount, error) => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, retryCount), 30000);
  },
  maxRetries: 5,

  // Events for monitoring
  events: {
    error: (error, info) => {
    },
    dropped: (reason, payload) => {
    },
    done: (info) => {
      const counts = imageLimiter.counts();
    }
  }
});

/**
 * Rate limiter for video generation requests (text-to-video, image-to-video)
 * Limit: 55 requests per minute (leaving buffer below 60 limit)
 */
const videoLimiter = new Bottleneck({
  reservoir: 55, // Number of tokens
  reservoirRefreshAmount: 55,
  reservoirRefreshInterval: 60 * 1000, // Refresh every 60 seconds
  maxConcurrent: 100, // Max parallel requests
  minTime: 1090, // Minimum time between requests (55 req/min = ~1090ms between requests)

  // Retry configuration
  retryCondition: (error, options) => {
    const statusCode = error?.response?.status;
    return statusCode === 429 || (statusCode >= 500 && statusCode < 600);
  },
  retryDelay: (retryCount, error) => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, retryCount), 30000);
  },
  maxRetries: 5,

  events: {
    error: (error, info) => {
    },
    dropped: (reason, payload) => {
    },
    done: (info) => {
      const counts = videoLimiter.counts();
    }
  }
});

/**
 * Generic rate limiter for result polling (get operations)
 * More lenient since these are GET requests
 */
const pollLimiter = new Bottleneck({
  reservoir: 1000,
  reservoirRefreshAmount: 1000,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 200,
  minTime: 60,

  retryCondition: (error, options) => {
    const statusCode = error?.response?.status;
    return statusCode === 429 || (statusCode >= 500 && statusCode < 600);
  },
  retryDelay: (retryCount, error) => {
    return Math.min(1000 * Math.pow(2, retryCount), 30000);
  },
  maxRetries: 3,

  events: {
    error: (error, info) => {
    },
    dropped: (reason, payload) => {
    }
  }
});

/**
 * Wrap an async function with rate limiting
 * @param {Function} fn - The function to wrap
 * @param {'image'|'video'|'poll'} type - The type of request
 * @returns {Function} - The wrapped function
 */
function withRateLimit(fn, type = 'image') {
  let limiter;
  
  switch (type) {
    case 'image':
      limiter = imageLimiter;
      break;
    case 'video':
      limiter = videoLimiter;
      break;
    case 'poll':
      limiter = pollLimiter;
      break;
    default:
      limiter = imageLimiter;
  }

  return async (...args) => {
    try {
      const startTime = Date.now();
      const result = await limiter.schedule(() => fn(...args));
      const duration = Date.now() - startTime;
      
      const counts = limiter.counts();
      
      return result;
    } catch (error) {
      throw error;
    }
  };
}

/**
 * Get current limiter statistics
 * @param {'image'|'video'|'poll'} type - The type of limiter
 * @returns {Object} Statistics object
 */
function getStats(type = 'image') {
  let limiter;
  
  switch (type) {
    case 'image':
      limiter = imageLimiter;
      break;
    case 'video':
      limiter = videoLimiter;
      break;
    case 'poll':
      limiter = pollLimiter;
      break;
    default:
      limiter = imageLimiter;
  }

  const counts = limiter.counts();
  return {
    type,
    queued: counts.QUEUED,
    running: counts.RUNNING,
    done: counts.DONE,
    received: counts.RECEIVED
  };
}

/**
 * Get all limiter statistics
 * @returns {Object} All statistics
 */
function getAllStats() {
  return {
    image: getStats('image'),
    video: getStats('video'),
    poll: getStats('poll')
  };
}

/**
 * Log current statistics for all limiters
 * Useful for monitoring during development
 */
function logStats() {
  const stats = getAllStats();
}

/**
 * Schedule periodic stats logging
 * @param {number} intervalMs - Interval in milliseconds
 */
function startPeriodicStatsLogging(intervalMs = 10000) {
  setInterval(() => {
    logStats();
  }, intervalMs);
}

// Log initial stats when module loads

// Optionally start periodic stats logging (uncomment to enable)
// startPeriodicStatsLogging(10000); // Log stats every 10 seconds

module.exports = {
  imageLimiter,
  videoLimiter,
  pollLimiter,
  withRateLimit,
  getStats,
  getAllStats,
  logStats,
  startPeriodicStatsLogging
};
