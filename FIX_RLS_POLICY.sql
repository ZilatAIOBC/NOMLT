-- =====================================================
-- Fix RLS Policy for Profiles Table
-- =====================================================

-- First, let's drop the problematic policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

-- Disable RLS temporarily to fix the data
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Check if the user profile exists and has admin role
SELECT 
    p.id, 
    p.email, 
    p.role,
    au.email as auth_email
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'miantahir1827@gmail.com' OR au.email = 'miantahir1827@gmail.com';

-- Ensure the profile exists with admin role
INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    created_at, 
    updated_at
) VALUES (
    'a0482594-d9f9-4169-82ac-090c26a02ac3',
    'miantahir1827@gmail.com',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    role = 'admin',
    updated_at = NOW();

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive RLS policies
CREATE POLICY "Enable read access for all authenticated users" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Test the profile lookup
SELECT 
    id, 
    email, 
    role,
    created_at,
    updated_at
FROM public.profiles 
WHERE id = 'a0482594-d9f9-4169-82ac-090c26a02ac3';

-- Verify the user exists in auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE id = 'a0482594-d9f9-4169-82ac-090c26a02ac3';
