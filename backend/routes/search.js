const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { search, findByUniqueId, getSuggestions, findByUserIds } = require('../services/profileService');
const { findById } = require('../services/userService');

// Search users by various filters
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { uniqueId, name, hobby, city, state, ageMin, ageMax, isOnline } = req.query;
    const currentUser = req.user;
    
    // Build filters
    const filters = {};
    if (uniqueId) filters.uniqueId = uniqueId;
    if (name) filters.name = name;
    if (hobby) filters.hobby = hobby;
    if (city) filters.city = city;
    if (state) filters.state = state;
    if (ageMin) filters.ageMin = parseInt(ageMin);
    if (ageMax) filters.ageMax = parseInt(ageMax);
    if (isOnline !== undefined) filters.isOnline = isOnline === 'true';
    
    const profiles = await search(filters, currentUser.id);
    
    // Get user details for each profile
    const profilesWithUsers = await Promise.all(
      profiles.map(async (profile) => {
        const user = await findById(profile.userId);
        return {
          ...profile,
          user: user ? {
            phoneNumber: user.phoneNumber,
            email: user.email,
            authProvider: user.authProvider
          } : null
        };
      })
    );
    
    res.json({ profiles: profilesWithUsers, count: profilesWithUsers.length });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get user by unique ID
router.get('/id/:uniqueId', verifyFirebaseToken, async (req, res) => {
  try {
    const { uniqueId } = req.params;
    
    const profile = await findByUniqueId(uniqueId);
    
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user details
    const user = await findById(profile.userId);
    
    res.json({
      ...profile,
      user: user ? {
        phoneNumber: user.phoneNumber,
        email: user.email
      } : null
    });
  } catch (error) {
    console.error('Get by ID error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get suggested users (random)
router.get('/suggestions', verifyFirebaseToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const limit = parseInt(req.query.limit) || 10;
    
    const profiles = await getSuggestions(currentUser.id, limit);
    
    // Get user details for each profile
    const profilesWithUsers = await Promise.all(
      profiles.map(async (profile) => {
        const user = await findById(profile.userId);
        return {
          ...profile,
          user: user ? {
            phoneNumber: user.phoneNumber,
            email: user.email
          } : null
        };
      })
    );
    
    res.json({ profiles: profilesWithUsers });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

module.exports = router;
