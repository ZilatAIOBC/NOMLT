const express = require("express");
const router = express.Router();

const {
  createImageToVideoJob,
  getImageToVideoResult,
} = require("../services/imageToVideoService");
const { saveGenerationToS3 } = require("../services/s3Service");
const { createGeneration } = require("../models/Generation");
const { auth } = require("../middleware/auth");
const { checkCredits } = require("../middleware/creditCheck");
const { deductCredits, refundCredits } = require("../services/creditService");
const { updateUsageSummaryAfterGeneration } = require("../services/usageSummaryService");
const { supabase, supabaseAdmin } = require("../utils/supabase");

// POST /api/image-to-video
router.post("/", auth, checkCredits('image_to_video'), async (req, res) => {
  try {

    const startedAt = Date.now();
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user._id);
    const requestSizeBytes = Buffer.byteLength(JSON.stringify(req.body || {}), "utf8");

    const data = await createImageToVideoJob(req.body || {});

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
    res.status(500).json({ error: e.message || "Failed to create job" });
  }
});

// GET /api/image-to-video/result?url=ENCODED_URL
router.get("/result", auth, async (req, res) => {
  try {
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user._id);
    const { url, maxAttempts, intervalMs } = req.query;
    
    
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


    // Check if generation is complete and has video URL
    const externalVideoUrl = result.data.output || (result.data.outputs && result.data.outputs[0]);
    
    if (!externalVideoUrl) {
      // Still processing or no output yet, return the original response
      return res.status(200).json(result);
    }

    // Step 2: Generation is complete, save to S3

    const s3Result = await saveGenerationToS3(
      externalVideoUrl,
      userId,
      "image-to-video"
    );


    // Step 3: Save to database FIRST to get generation ID
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


    // Step 4: Deduct credits with generation ID (enables idempotency)
    const creditCost = req.creditInfo?.cost || 80; // Default to 80 if not set
    let creditResult = null;
    
    try {
      creditResult = await deductCredits(
        userId, 
        creditCost, 
        'image_to_video', 
        generation.id // Use generation ID for idempotency
      );
      
      // Update generation record with credits_used
      const client = supabaseAdmin || supabase;
      await client
        .from('generations')
        .update({ 
          credits_used: creditCost,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', generation.id);

      // Update usage summary (all_time and daily)
      updateUsageSummaryAfterGeneration(userId, {
        generationType: 'image-to-video',
        creditsUsed: creditCost,
        status: 'completed',
        createdAt: generation.created_at
      }).catch(() => {});
        
    } catch (creditError) {
      // Mark generation as completed even if credit deduction fails
      try {
        const client = supabaseAdmin || supabase;
        await client
          .from('generations')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', generation.id);
      } catch (statusError) {
      }
    }


    // Step 5: Return response with S3 URL, generation info, and credit balance
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
      // Include credit information
      credits: creditResult ? {
        used: creditCost,
        newBalance: creditResult.new_balance,
        lifetimeSpent: creditResult.lifetime_spent
      } : null,
      // Keep original external URL for reference
      externalUrl: externalVideoUrl,
    });

  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to get result" });
  }
});

module.exports = router;
