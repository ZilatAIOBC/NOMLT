-- =====================================================
-- Create User Profile and Make Admin
-- =====================================================

-- User ID from your JWT token: a0482594-d9f9-4169-82ac-090c26a02ac3
-- Email: miantahir1827@gmail.com

-- Step 1: Check if profile exists
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE id = 'a0482594-d9f9-4169-82ac-090c26a02ac3';

-- Step 2: Check if user exists in auth.users
SELECT id, email, created_at, email_confirmed_at
FROM auth.users 
WHERE id = 'a0482594-d9f9-4169-82ac-090c26a02ac3';

-- Step 3: Create the profile if it doesn't exist
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
    role = 'admin',
    updated_at = NOW();

-- Step 4: Verify the profile was created/updated
SELECT id, email, role, created_at, updated_at
FROM public.profiles 
WHERE id = 'a0482594-d9f9-4169-82ac-090c26a02ac3';

-- Step 5: Check all admin users
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE role = 'admin';
