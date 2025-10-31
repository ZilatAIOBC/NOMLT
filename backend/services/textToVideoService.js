"use strict";

const axios = require("axios");
const dotenv = require("dotenv");
const { videoLimiter, pollLimiter } = require("./rateLimiterService");

dotenv.config();

const TEXT_TO_VIDEO_API_KEY = process.env.TEXT_TO_VIDEO_API_KEY;
const TEXT_TO_VIDEO_API_URL = process.env.TEXT_TO_VIDEO_API_URL;

if (!TEXT_TO_VIDEO_API_KEY || !TEXT_TO_VIDEO_API_URL) {
  // API routes will fail fast with clear message
}

/**
 * Create a text-to-video generation job.
 * @param {object} requestBody - Payload to send to provider API
 * @returns {Promise<object>} Provider response JSON
 */
async function createTextToVideoJob(requestBody) {
  if (!TEXT_TO_VIDEO_API_KEY || !TEXT_TO_VIDEO_API_URL) {
    throw new Error("Text-to-video API is not configured");
  }

  try {
    // Transform request body to Wavespeed WAN 2.5 format
    // Normalize size to Wavespeed's required format (e.g., 832*480)
    const requestedSize = requestBody.size || requestBody.resolution || '832x480';
    const normalizedSize = typeof requestedSize === 'string' ? requestedSize.replace('x', '*') : '832*480';

    const wavespeedRequestBody = {
      duration: requestBody.duration || 5,
      enable_prompt_expansion: false,
      prompt: requestBody.prompt,
      seed: typeof requestBody.seed === 'number' ? requestBody.seed : -1,
      size: normalizedSize,
      audio: requestBody.audio // optional
    };

    // Schedule request through rate limiter
    const response = await videoLimiter.schedule(async () => {
      return await axios.post(TEXT_TO_VIDEO_API_URL, wavespeedRequestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TEXT_TO_VIDEO_API_KEY}`,
        },
        timeout: 60_000,
      });
    });

    const data = response.data;
    
    // For Wavespeed API, check for prediction id and construct result URL
    if (!data || !data.data) {
      throw new Error("Invalid API response: missing data");
    }

    if (data.data.id) {
      const urlParts = TEXT_TO_VIDEO_API_URL.split('/');
      const baseUrl = `${urlParts[0]}//${urlParts[2]}/api/v3`;
      const resultUrl = `${baseUrl}/predictions/${data.data.id}/result`;
      return {
        ...data,
        data: {
          ...data.data,
          urls: { get: resultUrl }
        }
      };
    }

    // Fallback to old format if urls.get exists
    if (data.data.urls && data.data.urls.get) {
      return data;
    }

    throw new Error("Invalid API response: missing id or result URL");
  } catch (error) {
    const message =
      (error.response &&
        `${error.response.status} ${error.response.statusText} - ${JSON.stringify(
          error.response.data
        )}`) || error.message || "Unknown error";
    throw new Error(`Text-to-video create job failed: ${message}`);
  }
}

/**
 * Poll for text-to-video job result using dynamic URL from create response.
 * @param {string} resultUrl - Provider-issued URL for job status/result
 * @param {number} [maxAttempts=25]
 * @param {number} [intervalMs=4000]
 * @returns {Promise<object>} Final successful result JSON
 */
async function getTextToVideoResult(resultUrl, maxAttempts = 40, intervalMs = 6000) {
  if (!TEXT_TO_VIDEO_API_KEY) {
    throw new Error("Text-to-video API key is not configured");
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
          headers: { Authorization: `Bearer ${TEXT_TO_VIDEO_API_KEY}` },
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
        throw new Error(`Text-to-video generation failed: ${err}`);
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

  throw new Error("Text-to-video generation timed out - maximum attempts reached");
}

module.exports = {
  createTextToVideoJob,
  getTextToVideoResult,
};


