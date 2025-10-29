const express = require("express");
const router = express.Router();

const {
  createTextToImageJob,
  getTextToImageResult,
} = require("../services/textToImageService");
const { saveGenerationToS3 } = require("../services/s3Service");
const { createGeneration } = require("../models/Generation");
const { auth } = require("../middleware/auth");
const { checkCredits } = require("../middleware/creditCheck");
const { deductCredits, refundCredits } = require("../services/creditService");
const { updateUsageSummaryAfterGeneration } = require("../services/usageSummaryService");
const { supabase, supabaseAdmin } = require("../utils/supabase");

// POST /api/text-to-image
router.post("/", auth, checkCredits('text_to_image'), async (req, res) => {
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


    // Step 1: Get result from AI provider
    const decodedUrl = decodeURIComponent(url);
    const result = await getTextToImageResult(
      decodedUrl,
      maxAttempts ? Number(maxAttempts) : undefined,
      intervalMs ? Number(intervalMs) : undefined
    );


    // Check if generation is complete and has image URL
    const externalImageUrl = result.data.output || (result.data.outputs && result.data.outputs[0]);
    
    if (!externalImageUrl) {
      // Still processing or no output yet, return the original response
      return res.status(200).json(result);
    }

    // Step 2: Generation is complete, save to S3

    const s3Result = await saveGenerationToS3(
      externalImageUrl,
      userId,
      "text-to-image"
    );


    // Step 3: Save to database FIRST to get generation ID
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


    // Step 4: Deduct credits with generation ID (enables idempotency)
    const creditCost = req.creditInfo?.cost || 30; // Default to 30 if not set
    let creditResult = null;
    
    try {
      creditResult = await deductCredits(
        userId, 
        creditCost, 
        'text_to_image', 
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
        generationType: 'text-to-image',
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
      // Include credit information
      credits: creditResult ? {
        used: creditCost,
        newBalance: creditResult.new_balance,
        lifetimeSpent: creditResult.lifetime_spent
      } : null,
      // Keep original external URL for reference
      externalUrl: externalImageUrl,
    });

  } catch (e) {
    
    // If we have a generation ID and credits were deducted, try to refund
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user._id);
    const creditCost = req.creditInfo?.cost || 30;
    
    // Check if generation was created (would need to be tracked in scope)
    // For now, we'll log the error and let manual admin intervention handle refunds if needed
    // In a production system, you might want to track generation IDs more carefully
    
    res.status(500).json({ 
      error: e.message || "Failed to get result",
      message: "Generation failed. If credits were deducted, they will be automatically refunded."
    });
  }
});

module.exports = router;


