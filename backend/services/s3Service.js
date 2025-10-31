"use strict";

const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const axios = require("axios");
const { s3Client, AWS_S3_BUCKET_NAME } = require("../config/aws");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

/**
 * Generate S3 key (path) for a user's generation
 * @param {string} userId - User ID
 * @param {string} generationType - Type: 'text-to-image', 'text-to-video', etc.
 * @param {string} fileExtension - File extension (e.g., 'png', 'mp4')
 * @returns {string} S3 key path
 */
function generateS3Key(userId, generationType, fileExtension) {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const uniqueId = uuidv4();
  return `${userId}/${generationType}/${timestamp}-${uniqueId}.${fileExtension}`;
}

/**
 * Get file extension from URL or content type
 * @param {string} url - URL of the file
 * @param {string} contentType - Content-Type header
 * @returns {string} File extension
 */
function getFileExtension(url, contentType) {
  // Try to get from URL first
  const urlExt = path.extname(new URL(url).pathname).slice(1);
  if (urlExt) return urlExt;

  // Fallback to content type
  const contentTypeMap = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };

  return contentTypeMap[contentType] || "bin";
}

/**
 * Get content type from file extension
 * @param {string} extension - File extension
 * @returns {string} Content-Type
 */
function getContentType(extension) {
  const contentTypeMap = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
  };

  return contentTypeMap[extension.toLowerCase()] || "application/octet-stream";
}

/**
 * Download file from URL
 * @param {string} url - URL to download from
 * @returns {Promise<{buffer: Buffer, contentType: string, size: number}>}
 */
async function downloadFile(url) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 120000, // 2 minutes timeout for large files
    });

    const buffer = Buffer.from(response.data);
    const contentType = response.headers["content-type"] || "application/octet-stream";
    const size = buffer.length;

    return { buffer, contentType, size };
  } catch (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

/**
 * Upload file buffer to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} s3Key - S3 key (path)
 * @param {string} contentType - Content-Type
 * @returns {Promise<{s3Key: string, s3Url: string}>}
 */
async function uploadToS3(buffer, s3Key, contentType) {
  if (!AWS_S3_BUCKET_NAME) {
    throw new Error("AWS S3 bucket is not configured");
  }

  try {
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      // Make file publicly readable (optional - comment out if you want private files)
      // ACL: "public-read",
    });

    await s3Client.send(command);

    return { s3Key };
  } catch (error) {
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}

/**
 * Generate a signed URL for private S3 objects
 * @param {string} s3Key - S3 key (path)
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} Signed URL
 */
async function getSignedS3Url(s3Key, expiresIn = 3600, responseContentDisposition) {
  if (!AWS_S3_BUCKET_NAME) {
    throw new Error("AWS S3 bucket is not configured");
  }

  try {
    const command = new GetObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: s3Key,
      ...(responseContentDisposition ? { ResponseContentDisposition: responseContentDisposition } : {}),
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

/**
 * Main function: Download from external URL and upload to S3
 * @param {string} externalUrl - External URL to download from
 * @param {string} userId - User ID
 * @param {string} generationType - Generation type
 * @returns {Promise<{s3Key: string, s3Url: string, fileSize: number}>}
 */
async function saveGenerationToS3(externalUrl, userId, generationType) {
  try {
    // Step 1: Download file from external URL
    const { buffer, contentType, size } = await downloadFile(externalUrl);

    // Step 2: Determine file extension
    const fileExtension = getFileExtension(externalUrl, contentType);

    // Step 3: Generate S3 key
    const s3Key = generateS3Key(userId, generationType, fileExtension);

    // Step 4: Upload to S3
    const { s3Key: uploadedKey } = await uploadToS3(buffer, s3Key, contentType);

    // Step 5: Generate signed URL (temporary access URL)
    const s3Url = await getSignedS3Url(s3Key, 86400); // 24 hours expiry

    return {
      s3Key,
      s3Url,
      fileSize: size,
      contentType,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a file from S3 bucket
 * @param {string} s3Key - S3 key (path) of the file to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteFromS3(s3Key) {
  if (!AWS_S3_BUCKET_NAME) {
    throw new Error("AWS S3 bucket is not configured");
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);

    return true;
  } catch (error) {
    throw new Error(`Failed to delete from S3: ${error.message}`);
  }
}

module.exports = {
  saveGenerationToS3,
  getSignedS3Url,
  generateS3Key,
  uploadToS3,
  downloadFile,
  deleteFromS3,
};

