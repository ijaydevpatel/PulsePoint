import { createClerkClient } from '@clerk/backend';

// Initialize the Clerk Neural Identity Handshake
const clerkClient = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 
});

/**
 * Unified Clerk Authentication Middleware
 * Replaces legacy JWT architecture with the Clerk Neural Identity Protocol.
 * Extracts the session token from the Authorization header and verifies identity.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 1. Bearer Protocol Check
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('[Handshake Rejected]: Missing Clerk Authorization Header.');
      return res.status(401).json({ 
        error: 'MissingIdentity',
        message: 'No biological authorization token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // 2. Clerk Global Verification Handshake
      const requestState = await clerkClient.authenticateRequest(req, { 
        jwtKey: process.env.CLERK_JWT_KEY 
      });

      // If Clerk identity is verified, extract the userId
      if (requestState.isSignedIn) {
        req.auth = { userId: requestState.toAuth().userId };
        return next();
      }

      // Fallback: Verify manually if middleware helper isn't sufficient for specific bearer tokens
      const sessionClaims = await clerkClient.verifyToken(token);
      if (sessionClaims?.sub) {
        req.auth = { userId: sessionClaims.sub };
        return next();
      }

    } catch (tokenErr) {
      console.warn('[Handshake Warning] Clerk Identity Verification failed:', tokenErr.message);
      return res.status(401).json({ 
        error: 'InvalidIdentity',
        message: 'Your neural link has expired. Please re-authenticate via Clerk.'
      });
    }
    
    return res.status(401).json({ error: 'AuthFailure', message: 'Identity handshake validation incomplete' });
    
  } catch (error) {
    console.error('[Handshake Critical Protocol Fault]:', error);
    return res.status(500).json({ 
      error: 'ProtocolFault',
      message: 'Server identity check failed.'
    });
  }
};

// High-Fidelity Alias for Route Compatibility
export const protect = requireAuth;
