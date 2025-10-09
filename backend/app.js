const express = require("express");

const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const { supabase, supabaseAdmin } = require("./utils/supabase");

dotenv.config();

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(fileUpload({ limits: { fileSize: 100 * 1024 * 1024 } }));

// Configure CORS
//allow all origins
// app.use(cors());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      // Allow non-browser requests (like Postman)
      return callback(null, true);
    }
    callback(null, origin); // Allow all origins dynamicall
  },
  credentials: true, // Allow credentials (cookies, authentication, etc.)
};

app.use(cors(corsOptions));


// Configure session
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));


// Middleware to log API requests and their status codes
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(
      `API: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`
    );
  });
  next();
});
// Supabase (no persistent DB connection required). Validate envs.
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("Supabase configuration missing: SUPABASE_URL or SUPABASE_ANON_KEY");
} else {
  console.log("Supabase connected");
}

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
app.use("/api/webhooks", require("./routes/webhooks"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});

module.exports = app;
