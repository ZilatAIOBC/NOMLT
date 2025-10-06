# AWS S3 Setup Guide for NOLMT.AI

This guide will help you set up AWS S3 for storing user generations.

## 📋 Prerequisites

- AWS Account
- AWS CLI installed (optional but recommended)

## 🚀 Step 1: Create S3 Bucket

1. **Go to AWS Console** → S3 Service
2. **Click "Create bucket"**
3. **Configure:**
   - **Bucket name**: `nolmt-ai-generations` (must be globally unique)
   - **Region**: Choose your preferred region (e.g., `us-east-1`)
   - **Block Public Access**: 
     - If you want public files: Uncheck "Block all public access"
     - If you want private files with signed URLs: Keep checked
   - **Bucket Versioning**: Enable (optional, for backup)
   - **Encryption**: Enable (recommended)
4. **Click "Create bucket"**

## 🔐 Step 2: Configure Bucket Permissions

### Option A: Public Access (Simpler)

If you chose to allow public access, add this bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::nolmt-ai-generations/*"
    }
  ]
}
```

### Option B: Private Access with Signed URLs (More Secure)

Keep default permissions. The backend will generate signed URLs for access.

## 🔑 Step 3: Create IAM User for Backend

1. **Go to AWS Console** → IAM Service → Users
2. **Click "Add users"**
3. **User name**: `nolmt-ai-backend`
4. **Access type**: Programmatic access
5. **Click "Next: Permissions"**
6. **Click "Attach policies directly"**
7. **Create a custom policy** (recommended) or use `AmazonS3FullAccess` (simpler but less secure)

### Custom IAM Policy (Recommended):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::nolmt-ai-generations",
        "arn:aws:s3:::nolmt-ai-generations/*"
      ]
    }
  ]
}
```

8. **Complete user creation**
9. **IMPORTANT**: Save the **Access Key ID** and **Secret Access Key** (you won't see it again!)

## 🔧 Step 4: Configure CORS (if accessing from frontend)

Add this CORS configuration to your bucket:

1. Go to your bucket → **Permissions** tab → **CORS**
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 🌍 Step 5: Update Environment Variables

Add these to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=nolmt-ai-generations
```

## 📦 Step 6: Install Required NPM Packages

```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
```

## 🗄️ Step 7: Create Database Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type VARCHAR(50) NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  s3_url TEXT NOT NULL,
  prompt TEXT,
  settings JSONB,
  file_size INTEGER,
  content_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX idx_generations_type ON generations(generation_type);
CREATE INDEX idx_generations_user_type ON generations(user_id, generation_type, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own generations
CREATE POLICY "Users can view own generations"
  ON generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own generations
CREATE POLICY "Users can insert own generations"
  ON generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own generations
CREATE POLICY "Users can delete own generations"
  ON generations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generations_updated_at
  BEFORE UPDATE ON generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 🧪 Step 8: Test the Setup

You can test by making a generation request after implementing the integration in your service files.

## 💰 Cost Estimation

- **Storage**: ~$0.023 per GB/month
- **PUT requests**: $0.005 per 1,000 requests
- **GET requests**: $0.0004 per 1,000 requests
- **Data transfer OUT**: $0.09 per GB (first 10 TB)

**Example**: 1000 users, 10 generations each, 5MB average file = 50GB = ~$1.15/month

## 🎯 Next Steps

1. ✅ Create S3 bucket
2. ✅ Create IAM user and save credentials
3. ✅ Update `.env` file
4. ✅ Install NPM packages
5. ✅ Run SQL to create `generations` table
6. ✅ Integrate S3 service into your generation services
7. ✅ Register the `/api/generations` route in `app.js`

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [S3 Pricing Calculator](https://calculator.aws/)

## 🔒 Security Best Practices

1. ✅ Never commit AWS credentials to Git
2. ✅ Use IAM roles with minimum required permissions
3. ✅ Enable S3 bucket encryption
4. ✅ Enable S3 access logging
5. ✅ Use signed URLs for private files
6. ✅ Implement file size limits
7. ✅ Validate file types before upload
8. ✅ Set lifecycle policies to delete old files (optional)

## 🐛 Troubleshooting

**Error: Access Denied**
- Check IAM policy permissions
- Verify bucket policy if using public access
- Ensure credentials are correct

**Error: Bucket not found**
- Verify bucket name in `.env`
- Check region matches

**CORS Errors**
- Add your frontend URL to CORS configuration
- Check allowed methods include the ones you're using

