// Auth middlewares

const User = require('../models/User');
const Guest = require('../models/Guest');

// Require logged-in user
async function isAuthenticated(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication error', code: 'AUTH_ERROR' });
  }
}

// Get user or create guest
async function ensureSession(req, res, next) {
  if (!req.session) {
    return res.status(500).json({ error: 'Session not available', code: 'SESSION_ERROR' });
  }
  
  try {
    // Check for logged-in user
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.account = user;
        req.accountType = 'user';
        return next();
      }
      delete req.session.userId;
    }
    
    // Check for existing guest
    if (req.session.guestId) {
      const guest = await Guest.findById(req.session.guestId);
      if (guest) {
        req.account = guest;
        req.accountType = 'guest';
        return next();
      }
      delete req.session.guestId;
    }
    
    // Create new guest
    const guest = new Guest({ sessionId: req.sessionID });
    await guest.save();
    req.session.guestId = guest._id;
    req.account = guest;
    req.accountType = 'guest';
    next();
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Session error', code: 'SESSION_ERROR' });
  }
}

// Require connected wallet
function requireWallet(req, res, next) {
  if (!req.account?.solanaWallet) {
    return res.status(400).json({
      error: 'Wallet required',
      code: 'WALLET_REQUIRED',
    });
  }
  next();
}

module.exports = { isAuthenticated, ensureSession, requireWallet };
