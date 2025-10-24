-- =====================================================
-- NOLMT.AI - Complete Database Migration
-- Comprehensive database schema for AI Models Wrapper Website
-- Created: 2025-01-XX
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USER PROFILES & AUTHENTICATION
-- =====================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone TEXT,
    country TEXT,
    timezone TEXT DEFAULT 'UTC',
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- 2. PLANS & SUBSCRIPTIONS
-- =====================================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_quarterly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    stripe_product_id TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    credits_included INTEGER DEFAULT 0,
    max_generations_per_month INTEGER,
    max_file_size_mb INTEGER DEFAULT 10,
    allowed_models TEXT[] DEFAULT '{}',
    badge TEXT,
    badge_color TEXT,
    cta TEXT DEFAULT 'Get Started',
    concurrent_image_generations INTEGER DEFAULT 1,
    concurrent_video_generations INTEGER DEFAULT 1,
    image_visibility TEXT DEFAULT 'public' CHECK (image_visibility IN ('public', 'private')),
    priority_support BOOLEAN DEFAULT FALSE,
    priority_queue BOOLEAN DEFAULT FALSE,
    seedream_unlimited BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.plans(id),
    stripe_subscription_id TEXT UNIQUE,
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    pending_plan_id UUID,
    pending_interval TEXT CHECK (pending_interval IN ('monthly','yearly')),
    pending_change_type TEXT CHECK (pending_change_type IN ('downgrade','upgrade')),
    pending_requested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREDITS SYSTEM
-- =====================================================

-- Credits packages table
CREATE TABLE IF NOT EXISTS public.credit_packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stripe_price_id TEXT,
    stripe_product_id TEXT,
    bonus_credits INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0,
    lifetime_earned INTEGER DEFAULT 0,
    lifetime_spent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Credits transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('earned', 'spent', 'purchased', 'bonus', 'refund')),
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit expirations table
CREATE TABLE IF NOT EXISTS public.credit_expirations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    consumed_amount NUMERIC NOT NULL DEFAULT 0 CHECK (consumed_amount >= 0),
    reason TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'pending', 'completed', 'failed')),
    metadata JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. AI MODELS CONFIGURATION
-- =====================================================

-- AI models table
CREATE TABLE IF NOT EXISTS public.ai_models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('text_to_image', 'image_to_image', 'text_to_video', 'image_to_video')),
    provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    api_endpoint TEXT NOT NULL,
    cost_per_generation DECIMAL(10,4) DEFAULT 0,
    max_dimensions TEXT,
    supported_formats TEXT[] DEFAULT '{}',
    default_settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. GENERATIONS & AWS S3 STORAGE
-- =====================================================

-- Generations table
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    model_id UUID REFERENCES public.ai_models(id),
    category TEXT CHECK (category IN ('text_to_image', 'image_to_image', 'text_to_video', 'image_to_video')),
    prompt TEXT,
    negative_prompt TEXT,
    input_image_url TEXT,
    input_image_key TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    output_url TEXT,
    output_key TEXT,
    output_type TEXT,
    output_format TEXT,
    file_size_bytes BIGINT,
    dimensions TEXT,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    error_message TEXT,
    credits_used INTEGER DEFAULT 0,
    api_cost DECIMAL(10,4) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- AWS S3 file storage tracking
CREATE TABLE IF NOT EXISTS public.file_storage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    generation_id UUID REFERENCES public.generations(id) ON DELETE CASCADE,
    file_type TEXT CHECK (file_type IN ('input_image', 'output_image', 'output_video')),
    s3_bucket TEXT NOT NULL,
    s3_key TEXT NOT NULL UNIQUE,
    s3_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. PAYMENT INTEGRATION (STRIPE)
-- =====================================================

-- Stripe customers table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_charge_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled', 'requires_action')),
    type TEXT CHECK (type IN ('subscription', 'credits', 'upgrade')),
    reference_id UUID,
    reference_type TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. ADMIN MANAGEMENT
-- =====================================================

-- Admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    model_id UUID REFERENCES public.ai_models(id),
    generation_id UUID REFERENCES public.generations(id),
    endpoint TEXT,
    api_cost DECIMAL(10,4) NOT NULL,
    request_size_bytes BIGINT,
    response_size_bytes BIGINT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. USAGE SUMMARIES
-- =====================================================

-- Usage summaries table
CREATE TABLE IF NOT EXISTS public.usage_summaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL CHECK (period_type IN ('all_time', 'daily', 'weekly', 'monthly')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE,
    credits_balance INTEGER DEFAULT 0,
    credits_earned_in_period INTEGER DEFAULT 0,
    credits_spent_in_period INTEGER DEFAULT 0,
    lifetime_credits_earned INTEGER DEFAULT 0,
    lifetime_credits_spent INTEGER DEFAULT 0,
    text_to_image_count INTEGER DEFAULT 0,
    image_to_image_count INTEGER DEFAULT 0,
    text_to_video_count INTEGER DEFAULT 0,
    image_to_video_count INTEGER DEFAULT 0,
    text_to_image_credits INTEGER DEFAULT 0,
    image_to_image_credits INTEGER DEFAULT 0,
    text_to_video_credits INTEGER DEFAULT 0,
    image_to_video_credits INTEGER DEFAULT 0,
    text_to_image_successful INTEGER DEFAULT 0,
    text_to_image_failed INTEGER DEFAULT 0,
    image_to_image_successful INTEGER DEFAULT 0,
    image_to_image_failed INTEGER DEFAULT 0,
    text_to_video_successful INTEGER DEFAULT 0,
    text_to_video_failed INTEGER DEFAULT 0,
    image_to_video_successful INTEGER DEFAULT 0,
    image_to_video_failed INTEGER DEFAULT 0,
    total_generations INTEGER DEFAULT 0,
    total_successful_generations INTEGER DEFAULT 0,
    total_failed_generations INTEGER DEFAULT 0,
    total_credits_spent INTEGER DEFAULT 0,
    average_credits_per_generation DECIMAL(10,2) DEFAULT 0,
    most_used_feature TEXT,
    total_api_calls INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period_type, period_start)
);

-- =====================================================
-- 9. NOTIFICATIONS & SUPPORT
-- =====================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('generation_complete', 'generation_failed', 'payment_success', 'payment_failed', 'subscription_expired', 'credits_low', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    category TEXT CHECK (category IN ('technical', 'billing', 'feature_request', 'bug_report', 'other')),
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. ANALYTICS & STATISTICS
-- =====================================================

-- Daily statistics table
CREATE TABLE IF NOT EXISTS public.daily_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_generations INTEGER DEFAULT 0,
    successful_generations INTEGER DEFAULT 0,
    failed_generations INTEGER DEFAULT 0,
    total_credits_used INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    api_costs DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

-- Credits indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_expirations_user_id ON public.credit_expirations(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_expirations_status ON public.credit_expirations(status);

-- Generations indexes
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_model_id ON public.generations(model_id);
CREATE INDEX IF NOT EXISTS idx_generations_category ON public.generations(category);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at);

-- File storage indexes
CREATE INDEX IF NOT EXISTS idx_file_storage_user_id ON public.file_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_file_storage_generation_id ON public.file_storage(generation_id);
CREATE INDEX IF NOT EXISTS idx_file_storage_s3_key ON public.file_storage(s3_key);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON public.stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);

-- API usage indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id_endpoint ON public.api_usage(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id_created_at ON public.api_usage(user_id, created_at);

-- Usage summaries indexes
CREATE INDEX IF NOT EXISTS idx_usage_summaries_user_id ON public.usage_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_summaries_period_type ON public.usage_summaries(period_type);
CREATE INDEX IF NOT EXISTS idx_usage_summaries_period_start ON public.usage_summaries(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_usage_summaries_user_period ON public.usage_summaries(user_id, period_type, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_usage_summaries_updated ON public.usage_summaries(updated_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_expirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- User credits policies
DROP POLICY IF EXISTS "Users can view own credits" ON public.user_credits;
CREATE POLICY "Users can view own credits" ON public.user_credits FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all credits" ON public.user_credits;
CREATE POLICY "Admins can manage all credits" ON public.user_credits FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Generations policies
DROP POLICY IF EXISTS "Users can view own generations" ON public.generations;
CREATE POLICY "Users can view own generations" ON public.generations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create generations" ON public.generations;
CREATE POLICY "Users can create generations" ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own generations" ON public.generations;
CREATE POLICY "Users can update own generations" ON public.generations FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all generations" ON public.generations;
CREATE POLICY "Admins can view all generations" ON public.generations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- File storage policies
DROP POLICY IF EXISTS "Users can view own files" ON public.file_storage;
CREATE POLICY "Users can view own files" ON public.file_storage FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can upload files" ON public.file_storage;
CREATE POLICY "Users can upload files" ON public.file_storage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Support tickets policies
DROP POLICY IF EXISTS "Users can manage own tickets" ON public.support_tickets;
CREATE POLICY "Users can manage own tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Usage summaries policies
DROP POLICY IF EXISTS "Users can view own usage summaries" ON public.usage_summaries;
CREATE POLICY "Users can view own usage summaries" ON public.usage_summaries FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all usage summaries" ON public.usage_summaries;
CREATE POLICY "Admins can view all usage summaries" ON public.usage_summaries FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 13. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to set updated_at for credit_expirations
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON public.user_credits;
CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_generations_updated_at ON public.generations;
CREATE TRIGGER update_generations_updated_at BEFORE UPDATE ON public.generations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_credit_expirations_updated_at ON public.credit_expirations;
CREATE TRIGGER trg_credit_expirations_updated_at BEFORE UPDATE ON public.credit_expirations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS update_usage_summaries_updated_at ON public.usage_summaries;
CREATE TRIGGER update_usage_summaries_updated_at BEFORE UPDATE ON public.usage_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, email_verified)
    VALUES (NEW.id, NEW.email, NEW.email_confirmed_at IS NOT NULL);
    
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (NEW.id, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user credits
CREATE OR REPLACE FUNCTION update_user_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    SELECT balance INTO current_balance FROM public.user_credits WHERE user_id = p_user_id;
    
    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'User credits not found';
    END IF;
    
    IF p_type = 'spent' THEN
        current_balance := current_balance - p_amount;
        IF current_balance < 0 THEN
            RAISE EXCEPTION 'Insufficient credits';
        END IF;
    ELSE
        current_balance := current_balance + p_amount;
    END IF;
    
    UPDATE public.user_credits 
    SET balance = current_balance,
        lifetime_earned = CASE WHEN p_type IN ('earned', 'purchased', 'bonus') THEN lifetime_earned + p_amount ELSE lifetime_earned END,
        lifetime_spent = CASE WHEN p_type = 'spent' THEN lifetime_spent + p_amount ELSE lifetime_spent END,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    INSERT INTO public.credit_transactions (
        user_id, type, amount, balance_after, description, reference_id, reference_type
    ) VALUES (
        p_user_id, p_type, p_amount, current_balance, p_description, p_reference_id, p_reference_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 14. INITIAL DATA SEEDING
-- =====================================================

-- Insert subscription plans
INSERT INTO public.plans (
    name, display_name, description, price_monthly, price_quarterly, price_yearly, 
    credits_included, max_generations_per_month, features, badge, badge_color, cta,
    concurrent_image_generations, concurrent_video_generations, image_visibility,
    priority_support, priority_queue, seedream_unlimited, is_popular, sort_order
) VALUES 
('basic', 'Basic', 'Perfect for trying out our AI models', 4.249, 10.836, 35.691, 3500, 300,
 '["3500 credits per month", "Up to ~300 Image Generations/month", "Up to ~36 Video Generations/month", "General Commercial Terms", "Image Generations Visibility: Public", "4 concurrent Image Generations", "1 concurrent Video Generation"]',
 NULL, NULL, 'Get Started', 4, 1, 'public', FALSE, FALSE, FALSE, FALSE, 1),
('standard', 'Standard', 'Great for creators and enthusiasts', 8.499, 21.671, 71.631, 8000, 1000,
 '["8000 credits per month", "Up to ~1000 Image Generations/month", "Up to ~125 Video Generations/month", "General Commercial Terms", "Image Generation Visibility: Public", "8 concurrent Image Generations", "2 concurrent Video Generations"]',
 NULL, NULL, 'Get Started', 8, 2, 'public', FALSE, FALSE, FALSE, FALSE, 2),
('ultimate', 'Ultimate', 'For professionals and businesses', 14.165, 36.101, 119.994, 16000, 3000,
 '["16000 credits per month", "Up to ~3000 Image Generations/month", "Up to ~375 Video Generations/month", "All styles and models", "General Commercial Terms", "Image Generation Visibility: Private", "12 Concurrent Image Generations", "3 concurrent Video Generations", "Priority Support", "Higher priority in generation queue", "Seedream V4 — Unlimited"]',
 'Most Popular', 'bg-[#FED3A7] text-amber-900', 'Get Started', 12, 3, 'private', TRUE, TRUE, TRUE, TRUE, 3),
('creator', 'Creator', 'For content creators and agencies', 70.823, 180.635, 600.995, 100000, 8000,
 '["100000 credits per month", "Unlimited Realtime Generations", "Up to ~8000 Image Generations/month", "Up to ~1000 Video Generations/month", "All styles and models", "General Commercial Terms", "Image Generation Visibility: Private", "16 Concurrent Image Generations", "4 concurrent Video Generations", "Priority Support", "Higher priority in generation queue", "Seedream V4 — Unlimited"]',
 'Special Offer', 'bg-pink-500 text-white', 'Get Started', 16, 4, 'private', TRUE, TRUE, TRUE, FALSE, 4)
ON CONFLICT (name) DO NOTHING;

-- Insert credit packages
INSERT INTO public.credit_packages (name, credits, price, bonus_credits, sort_order) VALUES
('starter', 50, 9.99, 0, 1),
('popular', 100, 19.99, 10, 2),
('pro', 250, 49.99, 50, 3),
('enterprise', 500, 99.99, 150, 4)
ON CONFLICT DO NOTHING;

-- Insert AI models
INSERT INTO public.ai_models (
    name, display_name, description, category, provider, model_id, api_endpoint, 
    cost_per_generation, max_dimensions, supported_formats, default_settings, is_premium, is_active, sort_order
) VALUES 
('seedream-v4-t2i', 'Seedream V4 - Text to Image', 'High-quality text-to-image generation', 'text_to_image', 'bytedance', 'seedream-v4', 
 'https://api.wavespeed.ai/v1/models/bytedance/seedream-v4', 30, '1024x1024', ARRAY['png', 'jpg'], 
 '{"width": 1024, "height": 1024, "num_inference_steps": 20}'::jsonb, false, true, 1),
('seedream-v4-i2i', 'Seedream V4 - Image to Image', 'Transform images with AI', 'image_to_image', 'bytedance', 'seedream-v4/edit', 
 'https://api.wavespeed.ai/v1/models/bytedance/seedream-v4/edit', 30, '1024x1024', ARRAY['png', 'jpg'], 
 '{"width": 1024, "height": 1024, "strength": 0.8}'::jsonb, false, true, 2),
('seedance-v1-t2v', 'Seedance V1 - Text to Video', 'Generate videos from text descriptions', 'text_to_video', 'bytedance', 'seedance-v1-lite-t2v-480p', 
 'https://api.wavespeed.ai/v1/models/bytedance/seedance-v1-lite-t2v-480p', 80, '480p', ARRAY['mp4'], 
 '{"duration": 4, "fps": 8}'::jsonb, true, true, 3),
('wan-2.2-i2v', 'WAN 2.2 - Image to Video', 'Transform images into videos', 'image_to_video', 'wavespeed-ai', 'wan-2.2/i2v-480p-ultra-fast', 
 'https://api.wavespeed.ai/v1/models/wavespeed-ai/wan-2.2/i2v-480p-ultra-fast', 80, '480p', ARRAY['mp4'], 
 '{"duration": 4, "fps": 8}'::jsonb, true, true, 4)
ON CONFLICT (name) DO NOTHING;

-- Insert admin settings
INSERT INTO public.admin_settings (key, value, description) VALUES
('aws_s3_bucket', '"your-bucket-name"', 'AWS S3 bucket name for file storage'),
('aws_s3_region', '"us-east-1"', 'AWS S3 region'),
('stripe_webhook_secret', '""', 'Stripe webhook secret for payment processing'),
('default_credits_per_signup', '10', 'Default credits given to new users'),
('max_file_size_mb', '50', 'Maximum file size for uploads in MB'),
('api_rate_limit_per_minute', '60', 'API rate limit per user per minute'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('site_name', '"NOLMT.AI"', 'Website name'),
('support_email', '"support@nolmt.ai"', 'Support email address')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 15. VIEWS FOR ANALYTICS
-- =====================================================

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id,
    p.email,
    p.username,
    p.role,
    p.created_at,
    p.last_login_at,
    uc.balance as credits_balance,
    uc.lifetime_earned,
    uc.lifetime_spent,
    s.status as subscription_status,
    pl.name as plan_name,
    COUNT(g.id) as total_generations,
    COUNT(CASE WHEN g.status = 'completed' THEN 1 END) as successful_generations
FROM public.profiles p
LEFT JOIN public.user_credits uc ON p.id = uc.user_id
LEFT JOIN public.subscriptions s ON p.id = s.user_id AND s.status = 'active'
LEFT JOIN public.plans pl ON s.plan_id = pl.id
LEFT JOIN public.generations g ON p.id = g.user_id
GROUP BY p.id, p.email, p.username, p.role, p.created_at, p.last_login_at, 
         uc.balance, uc.lifetime_earned, uc.lifetime_spent, s.status, pl.name;

-- Revenue analytics view
CREATE OR REPLACE VIEW revenue_analytics AS
SELECT 
    DATE_TRUNC('month', pt.created_at) as month,
    COUNT(*) as total_transactions,
    SUM(pt.amount) as total_revenue,
    AVG(pt.amount) as average_transaction_value,
    COUNT(DISTINCT pt.user_id) as unique_customers
FROM public.payment_transactions pt
WHERE pt.status = 'succeeded'
GROUP BY DATE_TRUNC('month', pt.created_at)
ORDER BY month DESC;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

