import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract specific token payload bypassing Bearer nomenclature
      token = req.headers.authorization.split(' ')[1];

      // Decode validation
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Mutate the local request appending strict isolated backend execution tracking removing the raw password map 
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, user no longer exists.' });
      }

      next();
    } catch (error) {
      console.error('[AuthMiddleware] Verification Error:', error.message);
      return res.status(401).json({ status: 'error', message: 'Not authorized, active token failure' });
    }
  }

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Not authorized, explicit payload routing failure (No Token Detected)' });
  }
};

export { protect };
