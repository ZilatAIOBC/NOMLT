"use strict";

const axios = require("axios");
const dotenv = require("dotenv");
const { videoLimiter, pollLimiter } = require("./rateLimiterService");

dotenv.config();

const IMAGE_TO_VIDEO_API_KEY = process.env.IMAGE_TO_VIDEO_API_KEY;
const IMAGE_TO_VIDEO_API_URL = process.env.IMAGE_TO_VIDEO_API_URL;

if (!IMAGE_TO_VIDEO_API_KEY || !IMAGE_TO_VIDEO_API_URL) {
  // API routes will fail fast with clear message
}

/**
 * Create an image-to-video generation job.
 * @param {object} requestBody - Payload to send to provider API
 * @returns {Promise<object>} Provider response JSON
 */
async function createImageToVideoJob(requestBody) {
  if (!IMAGE_TO_VIDEO_API_KEY || !IMAGE_TO_VIDEO_API_URL) {
    throw new Error("Image-to-video API is not configured");
  }

  try {
    // Transform request body to Wavespeed WAN 2.5 format
    const wavespeedRequestBody = {
      duration: requestBody.duration || 8,
      enable_prompt_expansion: false, // Default to false as per requirements
      image: requestBody.image,
      audio: requestBody.audio, // Optional audio field
      prompt: requestBody.prompt,
      resolution: "480p", // Default to 480p as per requirements
      seed: requestBody.seed || -1
    };
    
    
    
    // Schedule request through rate limiter
    const response = await videoLimiter.schedule(async () => {
      return await axios.post(IMAGE_TO_VIDEO_API_URL, wavespeedRequestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${IMAGE_TO_VIDEO_API_KEY}`,
        },
        timeout: 60_000,
      });
    });

    const data = response.data;
    
    // For Wavespeed API, check for prediction_id to construct result URL
    if (!data || !data.data) {
      throw new Error("Invalid API response: missing data");
    }
    
    // Construct the result URL from id/prediction_id
    // Wavespeed returns an id field that we use to construct the result URL
    if (data.data.id) {
      // Extract the base API URL (https://api.wavespeed.ai/api/v3) and construct the result URL
      // URL format: https://api.wavespeed.ai/api/v3/predictions/{id}/result
      const urlParts = IMAGE_TO_VIDEO_API_URL.split('/');
      const baseUrl = `${urlParts[0]}//${urlParts[2]}/api/v3`;
      const resultUrl = `${baseUrl}/predictions/${data.data.id}/result`;
      return {
        ...data,
        data: {
          ...data.data,
          urls: {
            get: resultUrl
          }
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
    throw new Error(`Image-to-video create job failed: ${message}`);
  }
}

/**
 * Poll for image-to-video job result using dynamic URL from create response.
 * @param {string} resultUrl - Provider-issued URL for job status/result
 * @param {number} [maxAttempts=40]
 * @param {number} [intervalMs=6000]
 * @returns {Promise<object>} Final successful result JSON
 */
async function getImageToVideoResult(resultUrl, maxAttempts = 40, intervalMs = 6000) {
  if (!IMAGE_TO_VIDEO_API_KEY) {
    throw new Error("Image-to-video API key is not configured");
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
          headers: { Authorization: `Bearer ${IMAGE_TO_VIDEO_API_KEY}` },
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
        throw new Error(`Image-to-video generation failed: ${err}`);
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

  throw new Error("Image-to-video generation timed out - maximum attempts reached");
}

module.exports = {
  createImageToVideoJob,
  getImageToVideoResult,
};
