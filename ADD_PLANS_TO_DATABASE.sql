-- =====================================================
-- Add Subscription Plans to Database
-- =====================================================

-- First, let's update the plans table to support quarterly pricing
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS price_quarterly DECIMAL(10,2);

-- Update the existing plans table structure to match the frontend requirements
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS badge TEXT,
ADD COLUMN IF NOT EXISTS badge_color TEXT,
ADD COLUMN IF NOT EXISTS cta TEXT DEFAULT 'Get Started',
ADD COLUMN IF NOT EXISTS concurrent_image_generations INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS concurrent_video_generations INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS image_visibility TEXT DEFAULT 'public' CHECK (image_visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS priority_support BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority_queue BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS seedream_unlimited BOOLEAN DEFAULT FALSE;

-- Clear existing plans to insert new ones
DELETE FROM public.plans;

-- Insert the 4 subscription plans from the frontend component
INSERT INTO public.plans (
    name, 
    display_name, 
    description, 
    price_monthly, 
    price_quarterly, 
    price_yearly, 
    credits_included, 
    max_generations_per_month,
    features, 
    badge, 
    badge_color, 
    cta,
    concurrent_image_generations,
    concurrent_video_generations,
    image_visibility,
    priority_support,
    priority_queue,
    seedream_unlimited,
    is_popular,
    sort_order
) VALUES 
-- Basic Plan
(
    'basic',
    'Basic',
    'Perfect for trying out our AI models',
    4.249,
    10.836,
    35.691,
    3500,
    300,
    '["3500 credits per month", "Up to ~300 Image Generations/month", "Up to ~36 Video Generations/month", "General Commercial Terms", "Image Generations Visibility: Public", "4 concurrent Image Generations", "1 concurrent Video Generation"]',
    NULL,
    NULL,
    'Get Started',
    4,
    1,
    'public',
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    1
),

-- Standard Plan
(
    'standard',
    'Standard', 
    'Great for creators and enthusiasts',
    8.499,
    21.671,
    71.631,
    8000,
    1000,
    '["8000 credits per month", "Up to ~1000 Image Generations/month", "Up to ~125 Video Generations/month", "General Commercial Terms", "Image Generation Visibility: Public", "8 concurrent Image Generations", "2 concurrent Video Generations"]',
    NULL,
    NULL,
    'Get Started',
    8,
    2,
    'public',
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    2
),

-- Ultimate Plan (Most Popular)
(
    'ultimate',
    'Ultimate',
    'For professionals and businesses',
    14.165,
    36.101,
    119.994,
    16000,
    3000,
    '["16000 credits per month", "Up to ~3000 Image Generations/month", "Up to ~375 Video Generations/month", "All styles and models", "General Commercial Terms", "Image Generation Visibility: Private", "12 Concurrent Image Generations", "3 concurrent Video Generations", "Priority Support", "Higher priority in generation queue", "Seedream V4 — Unlimited"]',
    'Most Popular',
    'bg-[#FED3A7] text-amber-900',
    'Get Started',
    12,
    3,
    'private',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    3
),

-- Creator Plan (Special Offer)
(
    'creator',
    'Creator',
    'For content creators and agencies',
    70.823,
    180.635,
    600.995,
    100000,
    8000,
    '["100000 credits per month", "Unlimited Realtime Generations", "Up to ~8000 Image Generations/month", "Up to ~1000 Video Generations/month", "All styles and models", "General Commercial Terms", "Image Generation Visibility: Private", "16 Concurrent Image Generations", "4 concurrent Video Generations", "Priority Support", "Higher priority in generation queue", "Seedream V4 — Unlimited"]',
    'Special Offer',
    'bg-pink-500 text-white',
    'Get Started',
    16,
    4,
    'private',
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    4
);

-- Add some helpful comments
COMMENT ON TABLE public.plans IS 'Subscription plans with pricing and features';
COMMENT ON COLUMN public.plans.price_monthly IS 'Monthly price in USD';
COMMENT ON COLUMN public.plans.price_quarterly IS 'Quarterly price in USD (15% discount)';
COMMENT ON COLUMN public.plans.price_yearly IS 'Yearly price in USD (30% discount)';
COMMENT ON COLUMN public.plans.credits_included IS 'Number of credits included per billing period';
COMMENT ON COLUMN public.plans.max_generations_per_month IS 'Maximum number of generations per month';
COMMENT ON COLUMN public.plans.features IS 'JSON array of plan features';
COMMENT ON COLUMN public.plans.badge IS 'Optional badge text (e.g., "Most Popular", "Special Offer")';
COMMENT ON COLUMN public.plans.badge_color IS 'CSS classes for badge styling';
COMMENT ON COLUMN public.plans.cta IS 'Call-to-action button text';
COMMENT ON COLUMN public.plans.concurrent_image_generations IS 'Number of concurrent image generations allowed';
COMMENT ON COLUMN public.plans.concurrent_video_generations IS 'Number of concurrent video generations allowed';
COMMENT ON COLUMN public.plans.image_visibility IS 'Whether generated images are public or private';
COMMENT ON COLUMN public.plans.priority_support IS 'Whether plan includes priority support';
COMMENT ON COLUMN public.plans.priority_queue IS 'Whether plan gets higher priority in generation queue';
COMMENT ON COLUMN public.plans.seedream_unlimited IS 'Whether plan includes unlimited Seedream V4 access';

-- Verify the data was inserted correctly
SELECT 
    name,
    display_name,
    price_monthly,
    price_quarterly,
    price_yearly,
    credits_included,
    badge,
    is_popular,
    sort_order
FROM public.plans 
ORDER BY sort_order;
