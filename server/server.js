import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Ensures .env variables are loaded at the very start

// Import route handlers
import adminAuthRoutes from './routes/adminAuth.js';
import mediaRoutes from './routes/media.js';

// Import Redis client to initialize it and log connection status
import './config/redisClient.js'; // This will run the redisClient.js file

// Import Multer - needed for the instanceof check in the error handler
import multer from 'multer';


const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'; // Fallback if not in .env

// --- Middleware Setup ---
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- API Routes ---
app.use('/api/auth', adminAuthRoutes);
app.use('/api/media', mediaRoutes);

// --- Basic Root Route for API Health Check ---
app.get('/', (req, res) => {
  res.send('🖼️ Media Gallery API is running and healthy! 🚀');
});

// --- Global Error Handling Middleware (Catch-all) ---
app.use((err, req, res, next) => {
  console.error("Unhandled Application Error:", err.stack || err.message || err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `File upload error: ${err.message} (Field: ${err.field})`});
  }
  if (err.status) {
    return res.status(err.status).json({ message: err.message || 'An error occurred.' });
  }
  res.status(500).json({
      message: 'An unexpected internal server error occurred. Please try again later.',
      ...(process.env.NODE_ENV === 'development' ? { error: err.message, stack: err.stack } : {})
  });
});

// --- Start the Server (Conditional for Local Development) ---
// Vercel handles listening automatically for serverless functions.
// This ensures app.listen only runs during local development.
if (process.env.NODE_ENV !== 'production') { // Check if NOT in production
    app.listen(PORT, () => {
      console.log(`✅ LOCAL Server listening on port ${PORT}`);
      console.log(`🔗 Accepting API requests from client URL: ${CLIENT_URL}`);

      // Sanity checks for critical environment variables on startup (for local dev)
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('your_super_strong')) {
          console.warn('🔒 LOCAL DEV WARNING: JWT_SECRET is using a default/dummy value.');
      }
      if (!process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN.includes('dummytoken')) {
          console.warn('🔒 LOCAL DEV WARNING: BLOB_READ_WRITE_TOKEN is using a dummy value.');
      }
      if (!process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL.includes('<your-upstash-instance-region>')) {
          console.warn('🔒 LOCAL DEV WARNING: UPSTASH_REDIS_REST_URL is using a dummy/placeholder value.');
      }
      if (!process.env.ADMIN_EMAIL || (!process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD)) {
          console.warn('🔒 LOCAL DEV WARNING: Admin credentials are not fully set.');
      }
    });
}

// Export the Express app for Vercel's Node.js runtime
export default app;