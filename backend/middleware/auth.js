const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { supabase } = require("../utils/supabase");

// Main authentication middleware
const auth = async (req, res, next) => {
  try {
    // Check for token in authorization header
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided"
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format"
      });
    }

    try {
      // Validate token with Supabase and get the auth user
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      const supabaseUser = data.user;

          // Fetch user role from profiles table using service role to bypass RLS
          let userRole = "user"; // default role
          try {
            // Use service role to bypass RLS policies
            const serviceSupabase = require("../utils/supabase").supabaseAdmin || supabase;
            
            const { data: profile, error: profileError } = await serviceSupabase
              .from('profiles')
              .select('role')
              .eq('id', supabaseUser.id)
              .single();

            
            if (!profileError && profile) {
              userRole = profile.role || "user";
            } else {
            }
          } catch (profileErr) {
          }

      // Synthesize user object with role from database
      const user = {
        _id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
        email: supabaseUser.email,
        role: userRole,
        profilePicture: supabaseUser.user_metadata?.avatar_url || null,
        verified: !!supabaseUser.email_confirmed_at,
        createdAt: new Date(supabaseUser.created_at),
        lastLogin: null
      };

      if (user.verified === false) {
        return res.status(401).json({
          success: false,
          message: "Please verify your email to access this resource"
        });
      }

      req.user = user;
      req.token = token;
      req.supabaseUser = supabaseUser;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token validation failed",
        error: error.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
      error: error.message
    });
  }
};

// Middleware to check if user is verified
const requireVerifiedEmail = async (req, res, next) => {
  try {
    // We assume auth middleware was called before this
    if (!req.user.verified) {
      return res.status(403).json({ 
        message: "Email not verified. Please verify your email before proceeding."
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Check if user has admin role
const requireAdmin = async (req, res, next) => {
  try {
    // We assume auth middleware was called before this
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Access denied. Admin privileges required."
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  auth,
  requireVerifiedEmail,
  requireAdmin
};