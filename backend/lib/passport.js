// Google OAuth setup

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

function initializePassport(config) {
  passport.serializeUser((user, done) => done(null, user._id));
  
  passport.deserializeUser(async (id, done) => {
    try {
      done(null, await User.findById(id));
    } catch (error) {
      done(error, null);
    }
  });

  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser({
          provider: 'google',
          providerId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
        });
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }));
    console.log('Google OAuth initialized');
  }

  return passport;
}

async function findOrCreateOAuthUser({ provider, providerId, email, name, avatar }) {
  // Check for existing OAuth user
  let user = await User.findOne({ oauthProvider: provider, oauthId: providerId });
  
  if (user) {
    // Update profile if changed
    if ((name && user.name !== name) || (avatar && user.avatar !== avatar)) {
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      await user.save();
    }
    return user;
  }

  // Check if email exists (link accounts)
  if (email) {
    user = await User.findOne({ email });
    if (user?.oauthProvider === 'local') {
      user.oauthProvider = provider;
      user.oauthId = providerId;
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      await user.save();
      return user;
    }
  }

  // Create new user
  user = new User({ email, oauthProvider: provider, oauthId: providerId, name, avatar });
  await user.save();
  return user;
}

module.exports = { initializePassport, findOrCreateOAuthUser };
