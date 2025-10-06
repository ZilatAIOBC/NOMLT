const express = require("express");
const { check, validationResult } = require("express-validator");
const { supabase } = require("../utils/supabase");
const router = express.Router();
const { auth, requireVerifiedEmail } = require("../middleware/auth.js");

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
      console.log('Registration attempt for:', req.body.email);
      
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
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
        console.error('Supabase signUp error:', error);
        return res.status(400).json({ message: error.message });
      }

      // Supabase will send the verification email if enabled in the project settings

      return res.status(201).json({
        message: "Registration successful. Please check your email to verify your account.",
        userId: data.user?.id
      });
  } catch (err) {
      console.error("Error during registration:", err);
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
    console.error("Error resending verification email:", error);
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
          console.log('Looking for user profile with ID:', data.user?.id);
          
          // Use service role to bypass RLS policies
          const { supabaseAdmin } = require("../utils/supabase");
          const serviceSupabase = supabaseAdmin || supabase;
          
          const { data: profile, error: profileError } = await serviceSupabase
            .from('profiles')
            .select('role')
            .eq('id', data.user?.id)
            .single();

          console.log('Profile lookup result:', { profile, profileError });
          
          if (!profileError && profile) {
            userRole = profile.role || "user";
            console.log('Found user role:', userRole);
          } else {
            console.log('No profile found, using default role:', userRole);
          }
        } catch (profileErr) {
          console.warn('Could not fetch user role from profiles table:', profileErr.message);
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
    console.error("Login error:", error);
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
    console.error("Token refresh error:", error);
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
    console.error("Error fetching user info:", error);
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
    console.error("Error in forgot password:", err);
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
      console.error("Error confirming password reset:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Change password (when logged in)
// router.post("/change-password", auth, [
//   check("currentPassword", "Current password is required").not().isEmpty(),
//   check("newPassword", "New password must be at least 8 characters").isLength({ min: 8 }),
// ], async (req, res) => {
//   try {
//     // Validate input
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
    
//     const { currentPassword, newPassword } = req.body;
//     const userId = req.user._id;
    
//     // Find user with full details including password
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
    
//     // Check current password
//     const isMatch = await user.comparePassword(currentPassword);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Current password is incorrect" });
//     }
    
//     // Update password
//     user.password = newPassword;
//     await user.save();
    
//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error("Error changing password:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// Logout route (token blacklisting would be implemented here)
router.post("/logout", auth, async (req, res) => {
  try {
    // In a production system, you should implement token blacklisting
    // For example, using Redis:
    // await redisClient.set(`blacklist:${req.token}`, 'true', 'EX', TOKEN_EXPIRY_TIME);
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
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
    console.error('Google OAuth init error:', e);
    res.status(500).json({ message: 'Server error' });
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