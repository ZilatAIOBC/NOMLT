-- =====================================================
-- Make a User Admin
-- =====================================================

-- Replace 'your-email@example.com' with the email of the user you want to make admin
-- You can find the user ID by checking the auth.users table or profiles table

-- Method 1: Update by email (recommended)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Method 2: Update by user ID (if you know the UUID)
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = 'your-user-uuid-here';

-- Method 3: Check current user roles
SELECT id, email, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- Method 4: Find a specific user by email
-- SELECT id, email, role, created_at 
-- FROM public.profiles 
-- WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE role = 'admin';
