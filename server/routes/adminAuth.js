import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { hashAdminPassword } from '../utils/hashPassword.js'; // For initial password hashing if needed

const router = express.Router();

const ADMIN_EMAIL_FROM_ENV = process.env.ADMIN_EMAIL;
let ADMIN_PASSWORD_HASH_FROM_ENV = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_PLAINTEXT_PASSWORD_FOR_INIT = process.env.ADMIN_PASSWORD;

// One-time hash setup: If ADMIN_PASSWORD_HASH is not set in .env,
// but ADMIN_PASSWORD (plaintext) is, this will hash it and log for manual update.
// For production, always pre-hash and set ADMIN_PASSWORD_HASH directly in .env.
if (!ADMIN_PASSWORD_HASH_FROM_ENV && ADMIN_PLAINTEXT_PASSWORD_FOR_INIT) {
    console.warn("WARNING: ADMIN_PASSWORD_HASH is not set in .env. Attempting to hash ADMIN_PASSWORD.");
    console.warn("This is for development convenience. For production, ensure ADMIN_PASSWORD_HASH is pre-set.");
    (async () => {
        const hashed = await hashAdminPassword(ADMIN_PLAINTEXT_PASSWORD_FOR_INIT);
        if (hashed) {
            ADMIN_PASSWORD_HASH_FROM_ENV = hashed; // Use the newly hashed password for this server session
            console.log("Using temporarily hashed password. Please update your .env file with the logged ADMIN_PASSWORD_HASH for persistence.");
        } else {
            console.error("CRITICAL: Failed to hash ADMIN_PASSWORD from .env. Admin login will not function.");
        }
    })();
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (!ADMIN_EMAIL_FROM_ENV || !ADMIN_PASSWORD_HASH_FROM_ENV) {
    console.error('CRITICAL: Administrator email or password hash is not configured in the environment variables.');
    return res.status(500).json({ message: 'Server authentication configuration error. Please contact support.' });
  }

  const isEmailMatch = email.toLowerCase() === ADMIN_EMAIL_FROM_ENV.toLowerCase();
  let isPasswordValid = false;

  // Only attempt password comparison if the email matches, to avoid giving away info about valid emails.
  if (isEmailMatch) {
    isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH_FROM_ENV);
  }

  if (isEmailMatch && isPasswordValid) {
    const tokenPayload = {
      userId: 'admin_user_id_001', // Could be a static ID or more dynamic if multiple admins were supported
      email: ADMIN_EMAIL_FROM_ENV,
      role: 'admin', // Useful for role-based access control if extended
    };
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN } // e.g., '1h', '7d'
    );
    res.json({
      message: 'Admin login successful.',
      token,
      admin: { email: ADMIN_EMAIL_FROM_ENV, role: 'admin' } // Send back some user info
    });
  } else {
    // Generic  message to prevent enumeration attacks
    res.status(401).json({ message: 'Invalid credentials provided.' });
  }
});

export default router;