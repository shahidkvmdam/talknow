const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { findByUserId } = require('../services/profileService');

// Register/Login with Firebase token
router.post('/login', verifyFirebaseToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if profile exists
    let profile = await findByUserId(user.id);
    
    res.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        authProvider: user.authProvider
      },
      profile: profile ? {
        id: profile.id,
        uniqueId: profile.uniqueId,
        name: profile.name,
        age: profile.age,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        hobbies: profile.hobbies,
        profilePic: profile.profilePic,
        bio: profile.bio,
        isOnline: profile.isOnline
      } : null,
      hasProfile: !!profile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user info
router.get('/me', verifyFirebaseToken, async (req, res) => {
  try {
    const user = req.user;
    const profile = await findByUserId(user.id);
    
    res.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        authProvider: user.authProvider
      },
      profile
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;
