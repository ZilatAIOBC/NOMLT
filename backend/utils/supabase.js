const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing: SUPABASE_URL or SUPABASE_ANON_KEY');
} else {
  console.log('Supabase configured with URL:', supabaseUrl);
}

// Client for end-user operations (verifying JWTs via getUser, sign-in/up)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

// Service client for admin operations (optional)
const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
  : null;

module.exports = { supabase, supabaseAdmin };


