const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { findByUserId, update } = require('../services/profileService');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Upload image (profile picture or message image)
router.post('/image', verifyFirebaseToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'connect/images',
        quality: 'auto',
        fetch_format: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Failed to upload image' });
        }
        
        res.json({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height
        });
      }
    );
    
    result.end(req.file.buffer);
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload audio
router.post('/audio', verifyFirebaseToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'connect/audio',
        quality: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Failed to upload audio' });
        }
        
        res.json({
          url: result.secure_url,
          publicId: result.public_id,
          duration: result.duration
        });
      }
    );
    
    result.end(req.file.buffer);
  } catch (error) {
    console.error('Upload audio error:', error);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

// Update profile picture
router.put('/profile-picture', verifyFirebaseToken, upload.single('image'), async (req, res) => {
  try {
    const user = req.user;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'connect/profiles',
          quality: 'auto',
          fetch_format: 'auto',
          transformation: [
            { width: 200, height: 200, crop: 'fill' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });
    
    // Update profile
    const profile = await findByUserId(user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Delete old profile picture if exists
    if (profile.profilePic) {
      const publicId = profile.profilePic.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`connect/profiles/${publicId}`);
    }
    
    await update(profile.id, { profilePic: result.secure_url });
    
    res.json({
      message: 'Profile picture updated',
      profilePic: result.secure_url
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

// Delete file
router.delete('/file/:publicId', verifyFirebaseToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    await cloudinary.uploader.destroy(publicId);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
