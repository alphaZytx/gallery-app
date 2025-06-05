import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to protect routes by verifying JWT.
 * If the token is valid, it adds decoded user information to `req.user`.
 */
const protect = (req, res, next) => {
  let token;

  if (!JWT_SECRET || JWT_SECRET === 'your_super_strong_and_unique_jwt_secret_key_please_change_this') {
      console.error('CRITICAL: JWT_SECRET is not set or is using a default insecure value in .env!');
      return res.status(500).json({ message: 'Server configuration error: JWT secret missing or insecure.' });
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Format: "Bearer TOKEN_STRING"
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Decoded payload: { userId, email, role, iat, exp }
      next(); // Proceed to the next middleware or the route handler
    } catch (error) {
      console.error('Token verification failed:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token has expired.' });
      }
      return res.status(401).json({ message: 'Not authorized, token verification failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

export { protect };