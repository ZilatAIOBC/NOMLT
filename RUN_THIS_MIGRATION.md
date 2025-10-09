# 🔧 Database Migration Required

## Error Fix: Add Stripe Customer ID Column

The error you're seeing is because the `profiles` table is missing the `stripe_customer_id` column needed for Stripe integration.

## Quick Fix - Run This SQL

### Option 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the content from `ADD_STRIPE_CUSTOMER_ID_TO_PROFILES.sql`
6. Click **Run** or press `Ctrl+Enter`

### Option 2: Copy-Paste Directly

Run this SQL in your Supabase SQL Editor:

```sql
-- Add stripe_customer_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON public.profiles(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for payment processing';

-- Optional: Add stripe_subscription_id for tracking active subscription
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id 
ON public.profiles(stripe_subscription_id);

COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Current active Stripe subscription ID';
```

### Option 3: Using psql CLI

If you have direct database access:

```bash
psql "your-database-connection-string" -f ADD_STRIPE_CUSTOMER_ID_TO_PROFILES.sql
```

## What This Does

This migration adds two columns to the `profiles` table:

1. **`stripe_customer_id`** - Stores the Stripe customer ID for each user
   - Required for creating checkout sessions
   - Unique constraint to prevent duplicates
   - Indexed for fast lookups

2. **`stripe_subscription_id`** - Stores the current active subscription ID
   - Optional but useful for quick subscription status checks
   - Indexed for fast lookups

## After Running the Migration

1. ✅ The error will be fixed
2. ✅ You can click "Get Started" on any plan
3. ✅ Stripe checkout will work properly
4. ✅ Customer IDs will be stored automatically

## Verify It Worked

After running the migration, you can verify with:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('stripe_customer_id', 'stripe_subscription_id');
```

You should see both columns listed.

## Test Again

After running the migration:

1. Refresh your application
2. Go to Purchase Subscriptions page
3. Click "Get Started" on any plan
4. Should redirect to Stripe Checkout successfully ✅

---

**File to Run**: `ADD_STRIPE_CUSTOMER_ID_TO_PROFILES.sql`

