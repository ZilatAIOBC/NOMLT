# Environment Variables Setup

To use the Wavespeed API integration, you need to create a `.env` file in the project root with the following variables:

## Required Environment Variables

```bash
# Image to Video API
VITE_IMAGE_TO_VIDEO_API_KEY=your_image_to_video_api_key_here
VITE_IMAGE_TO_VIDEO_API_URL=https://api.wavespeed.ai/api/v3/google/nano-banana/video

# Image to Image API
VITE_IMAGE_TO_IMAGE_API_KEY=your_image_to_image_api_key_here
VITE_IMAGE_TO_IMAGE_API_URL=https://api.wavespeed.ai/api/v3/google/nano-banana/edit

# Text to Image API (if needed)
VITE_TEXT_TO_IMAGE_API_KEY=your_text_to_image_api_key_here
VITE_TEXT_TO_IMAGE_API_URL=your_text_to_image_api_url_here

# Text to Video API (if needed)
VITE_TEXT_TO_VIDEO_API_KEY=your_text_to_video_api_key_here
VITE_TEXT_TO_VIDEO_API_URL=your_text_to_video_api_url_here
```

## Setup Instructions

1. Create a `.env` file in the project root directory
2. Copy the environment variables above into the `.env` file
3. Replace the placeholder values with your actual API keys and URLs
4. Make sure to use the same API key for both image-to-video and image-to-image APIs as mentioned in the requirements

## API Endpoints

- **Image to Image**: `https://api.wavespeed.ai/api/v3/google/nano-banana/edit`
- **Image to Video**: `https://api.wavespeed.ai/api/v3/google/nano-banana/video`

Both APIs use the same authentication method with Bearer token in the Authorization header.
