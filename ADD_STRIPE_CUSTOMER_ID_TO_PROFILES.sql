-- =====================================================
-- Add Stripe Customer ID to Profiles Table
-- This is required for Stripe payment integration
-- =====================================================

-- Add stripe_customer_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON public.profiles(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for payment processing';

-- Optional: Add stripe_subscription_id if you want to track active subscription directly on profile
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id 
ON public.profiles(stripe_subscription_id);

COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Current active Stripe subscription ID';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully added Stripe columns to profiles table';
END $$;

