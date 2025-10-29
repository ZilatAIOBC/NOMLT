const express = require("express");
const { check, validationResult } = require("express-validator");
const { supabase } = require("../utils/supabase");
const router = express.Router();
const { auth, requireVerifiedEmail, requireAdmin } = require("../middleware/auth.js");

// Using Supabase's built-in verification emails exclusively

// Registration route with validation (Supabase sign-up)
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Password must be at least 8 characters with uppercase, lowercase, and number"
    )
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
  ],
  async (req, res) => {
    try {
      
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, email, password } = req.body;

      const redirectTo = `${process.env.FRONTEND_URL.replace(/\/$/, '')}/signin`;

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { name }
        }
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      // Supabase will send the verification email if enabled in the project settings

      return res.status(201).json({
        message: "Registration successful. Please check your email to verify your account.",
        userId: data.user?.id
      });
  } catch (err) {
      if (err?.name === 'ValidationError' && err?.errors) {
        const errors = Object.keys(err.errors).map((key) => ({
          msg: err.errors[key]?.message || 'Invalid value',
          param: err.errors[key]?.path || key,
        }));
        return res.status(400).json({ errors });
      }
      res.status(500).json({ message: "An error occurred during registration." });
    }
  }
);

// Email verification is handled by Supabase. Keep endpoint for compatibility.
router.get("/verify-email/:token", async (_req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/signin?verified=true`);
});

// Resend verification email using Supabase built-in flow
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.toLowerCase()
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(200).json({ message: "Verification email sent." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login route using Supabase
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });
    if (error) {
      return res.status(401).json({ message: error.message });
    }
    const session = data.session;
    
        // Fetch user role from profiles table using service role to bypass RLS
        let userRole = "user"; // default role
        try {
          
          // Use service role to bypass RLS policies
          const { supabaseAdmin } = require("../utils/supabase");
          const serviceSupabase = supabaseAdmin || supabase;
          
          const { data: profile, error: profileError } = await serviceSupabase
            .from('profiles')
            .select('role')
            .eq('id', data.user?.id)
            .single();

          
          if (!profileError && profile) {
            userRole = profile.role || "user";
          } else {
          }
        } catch (profileErr) {
        }
    
    return res.status(200).json({ 
      accessToken: session?.access_token,
      refreshToken: session?.refresh_token,
      user: {
        id: data.user?.id,
        name: data.user?.user_metadata?.name || data.user?.email?.split('@')[0],
        email: data.user?.email,
        role: userRole,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Refresh token route using Supabase
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }
  
  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) {
      return res.status(403).json({ message: error.message });
    }
    res.status(200).json({ accessToken: data.session?.access_token, refreshToken: data.session?.refresh_token });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

// API to fetch user information
router.get("/user-info", auth, async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    res.status(200).json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profilePicture: req.user.profilePicture,
      verified: req.user.verified,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred while fetching user info." });
  }
});

// Forgot password via Supabase
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const redirectTo = `${process.env.FRONTEND_URL.replace(/\/$/, '')}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(200).json({ message: "If that email exists, a password reset link has been sent." });
  } catch (err) {
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
});

// Confirm reset password using magic-link access token
router.post(
  "/reset-password/confirm",
  [
    check(
      "password",
      "Password must be at least 8 characters with uppercase, lowercase, and number"
    )
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { accessToken, password } = req.body;
      if (!accessToken) {
        return res.status(400).json({ message: "Missing accessToken from reset link" });
      }

      // Get the user from the access token embedded in the magic link
      const { data: userData, error: getUserError } = await supabase.auth.getUser(accessToken);
      if (getUserError || !userData?.user) {
        return res.status(401).json({ message: "Invalid or expired reset token" });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ message: "Server not configured for password resets (service role missing)" });
      }

      // Update the user's password using admin privileges
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
        password
      });
      if (updateError) {
        return res.status(400).json({ message: updateError.message });
      }

      return res.status(200).json({ message: "Password reset successful. You can now sign in." });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Change password (when logged in) - Supabase version
router.post("/change-password", auth, [
  check("currentPassword", "Current password is required").not().isEmpty(),
  check(
    "newPassword", 
    "New password must be at least 8 characters with uppercase, lowercase, and number"
  )
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPassword, newPassword, refreshToken } = req.body;
    const userEmail = req.user.email;
    
    if (!userEmail) {
      return res.status(400).json({ message: "User email not found" });
    }

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // First, verify the current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword
    });

    if (signInError) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization token provided" });
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Create a Supabase client with the user's access token and set the session
    const { createClient } = require('@supabase/supabase-js');
    const userSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Set the session using both access and refresh tokens
    const { data: sessionData, error: sessionError } = await userSupabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (sessionError || !sessionData.session) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // Update the password using the authenticated user's session
    const { error: updateError } = await userSupabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return res.status(400).json({ message: updateError.message });
    }
    
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile (name and email)
router.put("/update-profile", auth, [
  check("name", "Name is required").not().isEmpty().trim(),
  check("email", "Please include a valid email").isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email } = req.body;
    const userId = req.user._id;
    const currentEmail = req.user.email;
    
    // Check if email is being changed
    if (email !== currentEmail) {
      // Check if new email already exists in Supabase
      const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (checkError && checkError.message !== "User not found") {
        return res.status(500).json({ message: "Server error while checking email" });
      }
      
      if (existingUser && existingUser.user && existingUser.user.id !== userId) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    const accessToken = authHeader.replace('Bearer ', '');
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Create a Supabase client with the user's access token and set the session
    const { createClient } = require('@supabase/supabase-js');
    const userSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Set the session using both access and refresh tokens
    const { data: sessionData, error: sessionError } = await userSupabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (sessionError || !sessionData.session) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // Prepare update data
    const updateData = { data: { name } };
    
    // Only update email if it's different
    if (email !== currentEmail) {
      updateData.email = email;
    }

    // Update user profile in Supabase
    const { data: updateResult, error: updateError } = await userSupabase.auth.updateUser(updateData);

    if (updateError) {
      return res.status(400).json({ message: updateError.message });
    }

    // Update profile in our profiles table if needed
    try {
      const serviceSupabase = require("../utils/supabase").supabaseAdmin || supabase;
      const { error: profileError } = await serviceSupabase
        .from('profiles')
        .update({ 
          name: name,
          ...(email !== currentEmail && { email: email })
        })
        .eq('id', userId);

      if (profileError) {
        // Don't fail the request since Supabase auth was updated successfully
      }
    } catch (profileErr) {
    }

    res.status(200).json({ 
      message: "Profile updated successfully",
      user: {
        id: userId,
        name: name,
        email: email,
        verified: updateResult.user?.email_confirmed_at ? true : false
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Logout route (token blacklisting would be implemented here)
router.post("/logout", auth, async (req, res) => {
  try {
    // In a production system, you should implement token blacklisting
    // For example, using Redis:
    // await redisClient.set(`blacklist:${req.token}`, 'true', 'EX', TOKEN_EXPIRY_TIME);
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin-specific logout (same behavior, but ensures admin context)
router.post("/admin/logout", auth, requireAdmin, async (req, res) => {
  try {
    // Place to add server-side session invalidation if implemented later
    return res.status(200).json({ message: "Admin logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Validate token route
router.post("/validate-token", auth, (req, res) => {
  res.status(200).json({ 
    valid: true, 
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Removed custom email test route to avoid dual email systems

// Google OAuth via Supabase - start flow
router.get('/oauth/google', async (req, res) => {
  try {
    
    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({ 
        message: 'Server configuration error: FRONTEND_URL not set',
        hint: 'Please set FRONTEND_URL in your .env file'
      });
    }
    
    const redirectTo = `${process.env.FRONTEND_URL.replace(/\/$/, '')}/auth/callback`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    });
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    return res.redirect(data.url);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// Health check route
router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Authentication service is up and running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;