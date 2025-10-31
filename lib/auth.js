// Authentication utilities
import jwt from 'jsonwebtoken';

export function getUserFromRequest(req) {
  try {
    // Get session cookie
    const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    const sessionToken = cookies?.session;

    if (!sessionToken) {
      return null;
    }

    // Verify JWT
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
    return decoded;

  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    const user = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }

    // Attach user to request
    req.user = user;

    return handler(req, res);
  };
}
