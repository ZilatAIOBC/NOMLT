const express = require("express");
const router = express.Router();

const {
  createTextToImageJob,
  getTextToImageResult,
} = require("../services/textToImageService");
const { saveGenerationToS3 } = require("../services/s3Service");
const { createGeneration } = require("../models/Generation");
const { auth } = require("../middleware/auth");
const { supabase, supabaseAdmin } = require("../utils/supabase");

// POST /api/text-to-image
router.post("/", auth, async (req, res) => {
  try {
    const startedAt = Date.now();
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user._id);
    const requestSizeBytes = Buffer.byteLength(JSON.stringify(req.body || {}), "utf8");
    
    const data = await createTextToImageJob(req.body || {});
    
    const processingTimeMs = Date.now() - startedAt;
    // Fire-and-forget insert into api_usage; do not block response
    const client = supabaseAdmin || supabase;
    if (client && userId) {
      client
        .from('api_usage')
        .insert({
          user_id: userId,
          endpoint: 'text-to-image:create',
          api_cost: 0,
          request_size_bytes: requestSizeBytes,
          processing_time_ms: processingTimeMs
        })
        .then(() => {})
        .catch(() => {});
    }
    
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to create job" });
  }
});

// GET /api/text-to-image/result?url=ENCODED_URL
router.get("/result", auth, async (req, res) => {
  try {
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user._id);
    const { url, maxAttempts, intervalMs } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: "Missing url query parameter" });
    }

    console.log(`Text-to-Image: User ${userId} checking result for URL: ${url}`);

    // Step 1: Get result from AI provider
    const decodedUrl = decodeURIComponent(url);
    const result = await getTextToImageResult(
      decodedUrl,
      maxAttempts ? Number(maxAttempts) : undefined,
      intervalMs ? Number(intervalMs) : undefined
    );

    console.log(`Text-to-Image: Got result from AI provider`);

    // Check if generation is complete and has image URL
    const externalImageUrl = result.data.output || (result.data.outputs && result.data.outputs[0]);
    
    if (!externalImageUrl) {
      // Still processing or no output yet, return the original response
      return res.status(200).json(result);
    }

    // Step 2: Generation is complete, save to S3
    console.log(`Text-to-Image: Saving to S3 - External URL: ${externalImageUrl}`);

    const s3Result = await saveGenerationToS3(
      externalImageUrl,
      userId,
      "text-to-image"
    );

    console.log(`Text-to-Image: Uploaded to S3 - Key: ${s3Result.s3Key}`);

    // Step 3: Save to database
    const generation = await createGeneration({
      userId,
      generationType: "text-to-image",
      s3Key: s3Result.s3Key,
      s3Url: s3Result.s3Url,
      prompt: req.body.prompt || "No prompt provided",
      settings: {
        model: req.body.model || "unknown",
        width: req.body.width,
        height: req.body.height,
        num_samples: req.body.num_samples,
        response_format: req.body.response_format,
        num_inference_steps: req.body.num_inference_steps,
        safety_tolerance: req.body.safety_tolerance,
        guidance_scale: req.body.guidance_scale,
        seed: req.body.seed,
      },
      fileSize: s3Result.fileSize,
      contentType: s3Result.contentType,
    });

    console.log(`Text-to-Image: Saved to database - Generation ID: ${generation.id}`);

    // Step 4: Return response with S3 URL and generation info
    res.status(200).json({
      success: true,
      message: "Image generated and saved successfully",
      // Override the original result with our S3 URL
      data: {
        ...result.data,
        output: s3Result.s3Url, // Replace external URL with our S3 URL
      },
      generation: {
        id: generation.id,
        s3Url: s3Result.s3Url,
        s3Key: s3Result.s3Key,
        createdAt: generation.created_at,
      },
      // Keep original external URL for reference
      externalUrl: externalImageUrl,
    });

  } catch (e) {
    console.error("Text-to-Image: Error in result endpoint:", e);
    res.status(500).json({ error: e.message || "Failed to get result" });
  }
});

module.exports = router;


