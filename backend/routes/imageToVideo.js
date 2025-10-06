const express = require("express");
const router = express.Router();

const {
  createImageToVideoJob,
  getImageToVideoResult,
} = require("../services/imageToVideoService");
const { saveGenerationToS3 } = require("../services/s3Service");
const { createGeneration } = require("../models/Generation");
const { auth } = require("../middleware/auth");
const { supabase, supabaseAdmin } = require("../utils/supabase");

// POST /api/image-to-video
router.post("/", auth, async (req, res) => {
  try {
    console.log('Backend Route: POST /api/image-to-video received request body:', JSON.stringify(req.body, null, 2));

    const startedAt = Date.now();
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user._id);
    const requestSizeBytes = Buffer.byteLength(JSON.stringify(req.body || {}), "utf8");

    const data = await createImageToVideoJob(req.body || {});
    console.log('Backend Route: POST /api/image-to-video response:', JSON.stringify(data, null, 2));

    const processingTimeMs = Date.now() - startedAt;
    const client = supabaseAdmin || supabase;
    if (client && userId) {
      try {
        // Attach a model_id to help categorize unknown endpoints in summary
        const { data: models } = await client
          .from('ai_models')
          .select('id')
          .eq('category', 'image_to_video')
          .eq('is_active', true)
          .limit(1);
        const modelId = models && models.length ? models[0].id : null;

        client
          .from('api_usage')
          .insert({
            user_id: userId,
            model_id: modelId,
            endpoint: 'image-to-video:create',
            api_cost: 0,
            request_size_bytes: requestSizeBytes,
            processing_time_ms: processingTimeMs
          })
          .then(() => {})
          .catch(() => {});
      } catch (_) {}
    }
    res.status(200).json(data);
  } catch (e) {
    console.error('Backend Route: POST /api/image-to-video error:', e.message);
    res.status(500).json({ error: e.message || "Failed to create job" });
  }
});

// GET /api/image-to-video/result?url=ENCODED_URL
router.get("/result", auth, async (req, res) => {
  try {
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user._id);
    const { url, maxAttempts, intervalMs } = req.query;
    
    console.log(`Image-to-Video: User ${userId} checking result for URL: ${url}`);
    
    if (!url) {
      return res.status(400).json({ error: "Missing url query parameter" });
    }

    // Step 1: Get result from AI provider
    const decodedUrl = decodeURIComponent(url);
    const result = await getImageToVideoResult(
      decodedUrl,
      maxAttempts ? Number(maxAttempts) : undefined,
      intervalMs ? Number(intervalMs) : undefined
    );

    console.log(`Image-to-Video: Got result from AI provider`);

    // Check if generation is complete and has video URL
    const externalVideoUrl = result.data.output || (result.data.outputs && result.data.outputs[0]);
    
    if (!externalVideoUrl) {
      // Still processing or no output yet, return the original response
      return res.status(200).json(result);
    }

    // Step 2: Generation is complete, save to S3
    console.log(`Image-to-Video: Saving to S3 - External URL: ${externalVideoUrl}`);

    const s3Result = await saveGenerationToS3(
      externalVideoUrl,
      userId,
      "image-to-video"
    );

    console.log(`Image-to-Video: Uploaded to S3 - Key: ${s3Result.s3Key}`);

    // Step 3: Save to database
    const generation = await createGeneration({
      userId,
      generationType: "image-to-video",
      s3Key: s3Result.s3Key,
      s3Url: s3Result.s3Url,
      prompt: req.body.prompt || "No prompt provided",
      settings: {
        model: req.body.model || "unknown",
        duration: req.body.duration,
        image: req.body.image,
        last_image: req.body.last_image,
        negative_prompt: req.body.negative_prompt,
        seed: req.body.seed,
      },
      fileSize: s3Result.fileSize,
      contentType: s3Result.contentType,
    });

    console.log(`Image-to-Video: Saved to database - Generation ID: ${generation.id}`);

    // Step 4: Return response with S3 URL and generation info
    res.status(200).json({
      success: true,
      message: "Video generated and saved successfully",
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
      externalUrl: externalVideoUrl,
    });

  } catch (e) {
    console.error("Image-to-Video: Error in result endpoint:", e);
    res.status(500).json({ error: e.message || "Failed to get result" });
  }
});

module.exports = router;
