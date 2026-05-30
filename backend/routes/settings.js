const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../services/settingsService');

// Get app settings
router.get('/', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update app settings (admin only - for now, any authenticated user can update)
router.put('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { appName, themeColor, logoUrl, maxFileSize } = req.body;
    
    const updateData = {};
    if (appName) updateData.appName = appName;
    if (themeColor) updateData.themeColor = themeColor;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (maxFileSize) updateData.maxFileSize = maxFileSize;
    
    const settings = await updateSettings(updateData);
    
    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
