import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Ensures .env variables are loaded at the very start

// Import route handlers
import adminAuthRoutes from './routes/adminAuth.js';
import mediaRoutes from './routes/media.js';

// Import Redis client to initialize it and log connection status (optional, as routes also import it)
import './config/redisClient.js';

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'; // Fallback if not in .env

// --- Middleware Setup ---
// Enable CORS for requests from the client URL
app.use(cors({
  origin: CLIENT_URL,
  credentials: true // Important if you plan to use cookies or sessions from frontend
}));

// Parse JSON request bodies (e.g., for login, edit metadata)
app.use(express.json({ limit: '10mb' })); // Adjust limit if you expect large JSON payloads
// Parse URL-encoded request bodies (usually for simple form posts, less common for APIs)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// --- API Routes ---
// Mount authentication routes (e.g., /api/auth/login)
app.use('/api/auth', adminAuthRoutes);
// Mount media routes (e.g., /api/media/gallery, /api/media/upload)
app.use('/api/media', mediaRoutes);


// --- Basic Root Route for API Health Check ---
app.get('/', (req, res) => {
  res.send('🖼️ Media Gallery API is running and healthy! 🚀');
});


// --- Global Error Handling Middleware (Catch-all) ---
// This should be defined after all other app.use() and routes calls.
app.use((err, req, res, next) => {
  console.error("Unhandled Application Error:", err.stack || err.message || err);

  // For Multer-specific errors (like file size limit)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `File upload error: ${err.message} (Field: ${err.field})`});
  }
  // For other errors passed with a status
  if (err.status) {
    return res.status(err.status).json({ message: err.message || 'An error occurred.' });
  }
  // Generic server error
  res.status(500).json({
      message: 'An unexpected internal server error occurred. Please try again later.',
      // In development, you might want to send the error stack, but never in production.
      ...(process.env.NODE_ENV === 'development' ? { error: err.message, stack: err.stack } : {})
  });
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🔗 Accepting API requests from client URL: ${CLIENT_URL}`);

  // Sanity checks for critical environment variables on startup
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('your_super_strong')) {
      console.warn('🔒 SECURITY WARNING: JWT_SECRET is using a default/dummy value. Please set a strong, unique secret in your .env file for production!');
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN.includes('dummytoken')) {
      console.warn('🔒 CONFIGURATION WARNING: BLOB_READ_WRITE_TOKEN is using a dummy value. Please update it from your Vercel project settings.');
  }
  if (!process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL.includes('<your-upstash-instance-region>')) {
      console.warn('🔒 CONFIGURATION WARNING: UPSTASH_REDIS_REST_URL is using a dummy/placeholder value. Please update it from your Upstash dashboard.');
  }
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD) {
      console.warn('🔒 CONFIGURATION WARNING: Admin credentials (ADMIN_EMAIL and ADMIN_PASSWORD_HASH/ADMIN_PASSWORD) are not fully set. Admin login may fail.');
  }
});