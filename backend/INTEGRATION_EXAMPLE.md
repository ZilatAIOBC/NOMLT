# Integration Example: How to Use S3 Service in Your Generation Services

This guide shows you how to integrate the S3 service into your existing generation services.

## 📦 Required NPM Packages

First, install the required packages:

```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
```

## 🔧 Integration Steps

### Step 1: Update Your Generation Routes

Here's an example for `textToImageRoute.js`:

```javascript
const { saveGenerationToS3 } = require("../services/s3Service");
const { createGeneration } = require("../models/Generation");

// After getting the final result from the API
router.post("/generate", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt, ...settings } = req.body;

    // 1. Create job with external API
    const createResponse = await createTextToImageJob(req.body);
    const resultUrl = createResponse.data.urls.get;

    // 2. Poll for result
    const result = await getTextToImageResult(resultUrl);
    
    // 3. Get the final image URL from the result
    const externalImageUrl = result.data.output;

    // 4. Save to S3
    const s3Result = await saveGenerationToS3(
      externalImageUrl,
      userId,
      "text-to-image"
    );

    // 5. Save to database
    const generation = await createGeneration({
      userId,
      generationType: "text-to-image",
      s3Key: s3Result.s3Key,
      s3Url: s3Result.s3Url,
      prompt,
      settings,
      fileSize: s3Result.fileSize,
      contentType: s3Result.contentType,
    });

    // 6. Return the S3 URL to frontend
    res.status(200).json({
      success: true,
      message: "Image generated successfully",
      generation: {
        id: generation.id,
        url: s3Result.s3Url, // Use S3 URL instead of external URL
        s3Key: s3Result.s3Key,
        createdAt: generation.created_at,
      },
      // Optionally also return external URL for comparison
      externalUrl: externalImageUrl,
    });

  } catch (error) {
    console.error("Text-to-Image Route: Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
```

## 📋 Complete Example for Text-to-Image Route

```javascript
"use strict";

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  createTextToImageJob,
  getTextToImageResult,
} = require("../services/textToImageService");
const { saveGenerationToS3 } = require("../services/s3Service");
const { createGeneration } = require("../models/Generation");

router.post("/generate", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt, ...settings } = req.body;

    console.log(`Text-to-Image: User ${userId} generating image`);

    // Step 1: Create job with external API
    const createResponse = await createTextToImageJob(req.body);
    const resultUrl = createResponse.data.urls.get;

    // Step 2: Poll for result
    const result = await getTextToImageResult(resultUrl);
    const externalImageUrl = result.data.output;

    console.log(`Text-to-Image: Got external URL: ${externalImageUrl}`);

    // Step 3: Save to S3 and database
    const s3Result = await saveGenerationToS3(
      externalImageUrl,
      userId,
      "text-to-image"
    );

    const generation = await createGeneration({
      userId,
      generationType: "text-to-image",
      s3Key: s3Result.s3Key,
      s3Url: s3Result.s3Url,
      prompt,
      settings,
      fileSize: s3Result.fileSize,
      contentType: s3Result.contentType,
    });

    console.log(`Text-to-Image: Saved to S3 and DB - ID: ${generation.id}`);

    res.status(200).json({
      success: true,
      message: "Image generated and saved successfully",
      generation: {
        id: generation.id,
        url: s3Result.s3Url,
        prompt,
        createdAt: generation.created_at,
      },
    });

  } catch (error) {
    console.error("Text-to-Image Route: Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate image",
    });
  }
});

module.exports = router;
```

## 🎬 Same Pattern for Other Services

### Text-to-Video
```javascript
const s3Result = await saveGenerationToS3(
  externalVideoUrl,
  userId,
  "text-to-video"
);
```

### Image-to-Image
```javascript
const s3Result = await saveGenerationToS3(
  externalImageUrl,
  userId,
  "image-to-image"
);
```

### Image-to-Video
```javascript
const s3Result = await saveGenerationToS3(
  externalVideoUrl,
  userId,
  "image-to-video"
);
```

## 🔄 Register the Generations Route in app.js

Add this to your `app.js`:

```javascript
const generationsRouter = require("./routes/generations");
app.use("/api/generations", generationsRouter);
```

## 🎯 Frontend Usage

### Fetch User's Generations
```typescript
// Get all generations
const response = await fetch('http://localhost:3000/api/generations', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get specific type
const response = await fetch('http://localhost:3000/api/generations?type=text-to-image&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get stats
const statsResponse = await fetch('http://localhost:3000/api/generations/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Display Images/Videos
```typescript
// If using public S3 URLs:
<img src={generation.s3_url} alt="Generated" />
<video src={generation.s3_url} controls />

// If using signed URLs (for private files):
const signedUrlResponse = await fetch(
  `http://localhost:3000/api/generations/${generationId}/signed-url`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const { signedUrl } = await signedUrlResponse.json();
<img src={signedUrl} alt="Generated" />
```

## ✅ Benefits of This Approach

1. **Own Your Data**: Files stored in your S3, not external provider
2. **Permanent URLs**: Won't expire like external provider URLs might
3. **User History**: Track all generations per user
4. **Analytics**: Query generation patterns, popular types, etc.
5. **Access Control**: Implement who can see what
6. **Backup**: S3 versioning and lifecycle policies
7. **CDN Ready**: Can add CloudFront for faster global delivery

## 🚨 Important Notes

1. **Error Handling**: Always wrap S3 operations in try-catch
2. **Timeouts**: Large video files may take time to download/upload
3. **File Size Limits**: Consider adding validation for max file sizes
4. **Storage Costs**: Monitor S3 usage and costs
5. **Cleanup**: Optionally delete old generations or external URLs after saving to S3

## 🔧 Optional Enhancements

### Add File Size Validation
```javascript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
if (s3Result.fileSize > MAX_FILE_SIZE) {
  throw new Error("File too large");
}
```

### Add Retry Logic
```javascript
const maxRetries = 3;
let attempt = 0;
while (attempt < maxRetries) {
  try {
    return await saveGenerationToS3(...);
  } catch (error) {
    attempt++;
    if (attempt >= maxRetries) throw error;
    await new Promise(r => setTimeout(r, 1000 * attempt));
  }
}
```

### Implement Batch Operations
```javascript
// Save multiple generations at once
const results = await Promise.all(
  urls.map(url => saveGenerationToS3(url, userId, type))
);
```

