"use strict";

const axios = require("axios");
const dotenv = require("dotenv");
const { videoLimiter, pollLimiter } = require("./rateLimiterService");

dotenv.config();

const IMAGE_TO_VIDEO_API_KEY = process.env.IMAGE_TO_VIDEO_API_KEY;
const IMAGE_TO_VIDEO_API_URL = process.env.IMAGE_TO_VIDEO_API_URL;

if (!IMAGE_TO_VIDEO_API_KEY || !IMAGE_TO_VIDEO_API_URL) {
  console.warn(
    "Missing IMAGE_TO_VIDEO_API_KEY or IMAGE_TO_VIDEO_API_URL environment variables."
  );
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
    console.log('Backend: Creating image-to-video job with payload:', JSON.stringify(requestBody, null, 2));
    
    // Schedule request through rate limiter
    console.log('🔄 [Video Limiter] Request scheduled through rate limiter');
    const response = await videoLimiter.schedule(async () => {
      console.log('✅ [Video Limiter] Executing API request');
      return await axios.post(IMAGE_TO_VIDEO_API_URL, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${IMAGE_TO_VIDEO_API_KEY}`,
        },
        timeout: 60_000,
      });
    });

    const data = response.data;
    console.log('Backend: Image-to-video create job response:', JSON.stringify(data, null, 2));
    
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
    console.error('Backend: Image-to-video create job failed:', message);
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

  console.log(`Backend: Starting image-to-video polling for URL: ${resultUrl}`);
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      // Schedule poll request through rate limiter
      const response = await pollLimiter.schedule(async () => {
        console.log(`🔄 [Poll Limiter] Poll attempt ${attempts + 1} executing`);
        return await axios.get(resultUrl, {
          headers: { Authorization: `Bearer ${IMAGE_TO_VIDEO_API_KEY}` },
          timeout: 60_000,
        });
      });

      const data = response.data;
      const status = data && data.data && data.data.status;
      
      console.log(`Backend: Poll attempt ${attempts + 1}/${maxAttempts} - Status: ${status}`);

      if (status === "succeeded" || status === "completed") {
        const finalUrl = data && data.data && data.data.output;
        console.log('Backend: Image-to-video generation completed successfully!');
        console.log('Backend: Final video URL:', finalUrl);
        console.log('Backend: Final result:', JSON.stringify(data, null, 2));
        return data;
      }
      if (status === "failed") {
        const err = (data && data.data && data.data.error) || "Unknown error";
        console.error('Backend: Image-to-video generation failed:', err);
        throw new Error(`Image-to-video generation failed: ${err}`);
      }

      console.log(`Backend: Image-to-video still ${status}, waiting ${intervalMs}ms before next check...`);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      attempts++;
    } catch (error) {
      attempts++;
      console.error(`Backend: Poll attempt ${attempts} failed:`, error.message);
      
      if (attempts >= maxAttempts) {
        const message =
          (error.response &&
            `${error.response.status} ${error.response.statusText} - ${JSON.stringify(
              error.response.data
            )}`) || error.message || "Unknown error";
        console.error('Backend: Image-to-video polling timed out:', message);
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
