const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { findByUserId, create, update, updateByUserId, isUniqueIdExists } = require('../services/profileService');
const { findById } = require('../services/userService');

// Generate unique ID for user
const generateUniqueId = async () => {
  let uniqueId;
  let isUnique = false;
  
  while (!isUnique) {
    uniqueId = 'CONNECT' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const exists = await isUniqueIdExists(uniqueId);
    if (!exists) isUnique = true;
  }
  
  return uniqueId;
};

// Create profile
router.post('/create', verifyFirebaseToken, async (req, res) => {
  try {
    const user = req.user;
    const { name, age, city, state, country, hobbies, bio } = req.body;
    
    // Check if profile already exists
    const existingProfile = await findByUserId(user.id);
    if (existingProfile) {
      return res.status(400).json({ error: 'Profile already exists' });
    }
    
    // Generate unique ID
    const uniqueId = await generateUniqueId();
    
    // Create profile
    const profile = await create({
      userId: user.id,
      uniqueId,
      name,
      age,
      city,
      state,
      country: country || 'USA',
      hobbies: hobbies || [],
      bio: bio || '',
      isOnline: false,
      lastSeen: new Date()
    });
    
    res.status(201).json({
      message: 'Profile created successfully',
      profile: {
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
      }
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Update profile
router.put('/update', verifyFirebaseToken, async (req, res) => {
  try {
    const user = req.user;
    const { name, age, city, state, country, hobbies, bio, profilePic } = req.body;
    
    const profile = await findByUserId(user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (hobbies) updateData.hobbies = hobbies;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePic !== undefined) updateData.profilePic = profilePic;
    
    const updatedProfile = await update(profile.id, updateData);
    
    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get profile by user ID
router.get('/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await findByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Get user details
    const user = await findById(userId);
    
    res.json({
      ...profile,
      user: user ? {
        phoneNumber: user.phoneNumber,
        email: user.email
      } : null
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update online status
router.put('/online', verifyFirebaseToken, async (req, res) => {
  try {
    const user = req.user;
    const { isOnline } = req.body;
    
    const profile = await findByUserId(user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    await updateByUserId(user.id, {
      isOnline,
      lastSeen: new Date()
    });
    
    res.json({ message: 'Online status updated' });
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({ error: 'Failed to update online status' });
  }
});

module.exports = router;
