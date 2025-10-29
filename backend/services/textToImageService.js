"use strict";

const axios = require("axios");
const dotenv = require("dotenv");
const { imageLimiter, pollLimiter } = require("./rateLimiterService");

dotenv.config();

const TEXT_TO_IMAGE_API_KEY = process.env.TEXT_TO_IMAGE_API_KEY;
const TEXT_TO_IMAGE_API_URL = process.env.TEXT_TO_IMAGE_API_URL;

if (!TEXT_TO_IMAGE_API_KEY || !TEXT_TO_IMAGE_API_URL) {
  // API routes will fail fast with clear message
}

/**
 * Create a text-to-image generation job.
 * @param {object} requestBody - Payload to send to provider API
 * @returns {Promise<object>} Provider response JSON
 */
async function createTextToImageJob(requestBody) {
  if (!TEXT_TO_IMAGE_API_KEY || !TEXT_TO_IMAGE_API_URL) {
    throw new Error("Text-to-image API is not configured");
  }

  try {
    
    // Schedule request through rate limiter
    const response = await imageLimiter.schedule(async () => {
      return await axios.post(TEXT_TO_IMAGE_API_URL, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TEXT_TO_IMAGE_API_KEY}`,
        },
        timeout: 60_000,
      });
    });

    const data = response.data;
    
    if (!data || !data.data || !data.data.urls || !data.data.urls.get) {
      throw new Error("Invalid API response: missing result URL");
    }
    return data;
  } catch (error) {
    const message =
      (error.response &&
        `${error.response.status} ${error.response.statusText} - ${JSON.stringify(
          error.response.data
        )}`) || error.message || "Unknown error";
    throw new Error(`Text-to-image create job failed: ${message}`);
  }
}

/**
 * Poll for text-to-image job result using dynamic URL from create response.
 * @param {string} resultUrl - Provider-issued URL for job status/result
 * @param {number} [maxAttempts=40]
 * @param {number} [intervalMs=6000]
 * @returns {Promise<object>} Final successful result JSON
 */
async function getTextToImageResult(resultUrl, maxAttempts = 40, intervalMs = 6000) {
  if (!TEXT_TO_IMAGE_API_KEY) {
    throw new Error("Text-to-image API key is not configured");
  }
  if (!resultUrl) {
    throw new Error("Result URL is required");
  }

  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      // Schedule poll request through rate limiter
      const response = await pollLimiter.schedule(async () => {
        return await axios.get(resultUrl, {
          headers: { Authorization: `Bearer ${TEXT_TO_IMAGE_API_KEY}` },
          timeout: 60_000,
        });
      });

      const data = response.data;
      const status = data && data.data && data.data.status;
      

      if (status === "succeeded" || status === "completed") {
        const finalUrl = data && data.data && data.data.output;
        return data;
      }
      if (status === "failed") {
        const err = (data && data.data && data.data.error) || "Unknown error";
        throw new Error(`Text-to-image generation failed: ${err}`);
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      attempts++;
    } catch (error) {
      attempts++;
      
      if (attempts >= maxAttempts) {
        const message =
          (error.response &&
            `${error.response.status} ${error.response.statusText} - ${JSON.stringify(
              error.response.data
            )}`) || error.message || "Unknown error";
        throw new Error(`Polling failed: ${message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error("Text-to-image generation timed out - maximum attempts reached");
}

module.exports = {
  createTextToImageJob,
  getTextToImageResult,
};


