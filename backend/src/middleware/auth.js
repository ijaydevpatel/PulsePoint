import { verifyToken } from '@clerk/backend';

// Startup environment check
if (!process.env.CLERK_SECRET_KEY) {
  console.error('[Identity Core Fault]: CLERK_SECRET_KEY is undefined. All handshakes will fail.');
} else {
  console.log('[Identity Core] Clerk Secret Key loaded. Neural Handshake ready.');
}

/**
 * PulsePoint Identity Middleware — Production Grade
 * 
 * Uses Clerk's verifyToken() directly with the Bearer token from the
 * Authorization header. This is the correct approach for Express servers
 * since authenticateRequest() requires a Web API Request object.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'MissingIdentity',
        message: 'No authorization token provided. Please sign in.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Directly verify the Clerk session JWT — the correct approach for Express
    const sessionClaims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      clockSkewInMs: 60000 // 60s tolerance for network latency
    });

    if (!sessionClaims?.sub) {
      return res.status(401).json({
        error: 'InvalidToken',
        message: 'Session token is invalid or expired. Please sign in again.'
      });
    }

    req.auth = { userId: sessionClaims.sub };
    return next();

  } catch (error) {
    console.error('[Handshake Fault]:', error.message);
    return res.status(401).json({
      error: 'AuthFailure',
      message: 'Identity handshake validation incomplete. Your session has expired.',
      diagnostic: error.message
    });
  }
};

// Alias for route compatibility
export const protect = requireAuth;

