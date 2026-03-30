import { createClerkClient, verifyToken } from '@clerk/backend';
import User from '../models/User.js';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const finalSecret = process.env.CLERK_SECRET_KEY;
const finalPublish = process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const clerkClient = createClerkClient({ 
  secretKey: finalSecret,
  publishableKey: finalPublish
});

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Not authorized — no token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the Clerk JWT session token using standalone verifyToken function as required by v3.x
    const payload = await verifyToken(token, {
      secretKey: finalSecret,
      publishableKey: finalPublish,
      leeway: 600
    });
    const clerkUserId = payload.sub;

    // Find or auto-create the local PulsePo!int user record linked to Clerk
    let user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      // Lazy-create a linked user on first authenticated API call
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';

      user = await User.findOne({ email });

      if (user) {
        user.clerkId = clerkUserId;
        await user.save();
      } else {
        user = await User.create({
          clerkId: clerkUserId,
          email,
          profileCompleted: false,
        });

        try {
          const ProfileModel = (await import('../models/Profile.js')).default;
          await ProfileModel.create({
            user: user._id,
            emergencyContact: { name: '', phone: '', relation: '' }
          });
        } catch (profileErr) {
          if (profileErr.code !== 11000) console.error('[Auth] Profile init error:', profileErr.message);
        }
      }
    }

    req.user = user;
    next();
  } catch (error) {
    const isExpired = error.message?.includes('expired');
    console.error(`[AuthMiddleware] ${isExpired ? 'SESSION EXPIRED' : 'VERIFICATION ERROR'}:`, error.message);
    
    // Transparent diagnostic feedback for the user
    return res.status(401).json({ 
      status: 'error', 
      message: `Session Link Interrupted: ${error.message}. (Leeway: 600s). Check your computer clock and refresh page.` 
    });
  }
};

export { protect };
