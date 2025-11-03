const express = require("express");

const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const { supabase, supabaseAdmin } = require("./utils/supabase");

dotenv.config();

const app = express();

console.log('[backend] Booting…');

// IMPORTANT: Webhook endpoint needs raw body for Stripe signature verification
// Add this BEFORE any body parsing middleware
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(fileUpload({ limits: { fileSize: 100 * 1024 * 1024 } }));

// Configure CORS
//allow all origins
// app.use(cors());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:8080',
  'https://nolmt.ai',
  'https://www.nolmt.ai',
 
 
  'https://api.nolmt.ai',
  
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like Postman, mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true, // Allow credentials (cookies, authentication, etc.)
};

app.use(cors(corsOptions));


// Configure session
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));


// Middleware - no API logging
app.use((req, res, next) => {
  res.on("finish", () => {
    // API request completed
  });
  next();
});
// Supabase (no persistent DB connection required). Validate envs.
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('[backend][supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
} else {
  console.log('[backend][supabase] Environment variables present');
}

// Ensure CORS headers and handle OPTIONS preflight at Node level (safety net)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOriginsSet = new Set([
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000',
    'http://localhost:8080',
    'https://nolmt.ai',
    'https://www.nolmt.ai',
    'https://api.nolmt.ai',
  ]);

  if (origin && allowedOriginsSet.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Import Routes

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

// DB health check - verifies Supabase connectivity
app.get('/db-health', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'Supabase client not initialized' });
    }
    // Prefer admin to bypass RLS for a head/count query
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

app.use("/auth", require("./routes/authRoutes"));
app.use("/api/text-to-video", require("./routes/textToVideo"));
app.use("/api/text-to-image", require("./routes/textToImage"));
app.use("/api/image-to-image", require("./routes/imageToImage"));
app.use("/api/image-to-video", require("./routes/imageToVideo"));
app.use("/api/usage", require("./routes/usage"));
app.use("/api/generations", require("./routes/generations"));
app.use("/api/plans", require("./routes/plans"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/billing", require("./routes/billing"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/credits", require("./routes/credits"));
app.use("/api/models", require("./routes/models"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/admin/credits", require("./routes/adminCredits"));
app.use("/api/admin/users", require("./routes/adminUsers"));
app.use("/api/admin/models", require("./routes/adminModels"));
app.use("/api/webhooks", require("./routes/webhooks"));
app.use("/api/rate-limiter", require("./routes/rateLimiter"));

// Schedule background jobs
try {
  const { scheduleDailyUsageSummary } = require('./jobs/dailyUsageSummary');
  const { scheduleCreditExpirationJob } = require('./jobs/creditExpirationJob');
  const { scheduleGenerationRetention } = require('./jobs/generationRetention');
  scheduleDailyUsageSummary && scheduleDailyUsageSummary();
  scheduleCreditExpirationJob && scheduleCreditExpirationJob();
  scheduleGenerationRetention && scheduleGenerationRetention(7);
} catch (e) {
  
}


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[backend] Listening on ${PORT} (${process.env.NODE_ENV || 'dev'})`);

  // One-time Supabase connectivity check (non-blocking)
  (async () => {
    try {
      if (!supabase) {
        console.warn('[backend][supabase] Client not initialized');
        return;
      }
      const client = supabaseAdmin || supabase;
      const { error } = await client
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      if (error) {
        console.warn('[backend][supabase] Connectivity check failed:', error.message);
      } else {
        console.log('[backend][supabase] Connected');
      }
    } catch (e) {
      console.warn('[backend][supabase] Connectivity check error:', e.message);
    }
  })();
});

module.exports = app;
