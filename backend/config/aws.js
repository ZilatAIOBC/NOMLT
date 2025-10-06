"use strict";

const { S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");

dotenv.config();

// AWS S3 Configuration
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
  console.warn(
    "Missing AWS S3 configuration. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME in .env file."
  );
}

// Initialize S3 Client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = {
  s3Client,
  AWS_S3_BUCKET_NAME,
  AWS_REGION,
};

