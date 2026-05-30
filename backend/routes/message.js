const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { getConversation, getConversations, findById, softDelete } = require('../services/messageService');
const { findByUserId } = require('../services/profileService');

// Get conversation between two users
router.get('/conversation/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const messages = await getConversation(currentUserId, userId, page, limit);
    
    res.json({ messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Get all conversations for current user
router.get('/conversations', verifyFirebaseToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    const conversations = await getConversations(currentUserId);
    
    // Get profiles for each conversation
    const conversationsWithProfiles = await Promise.all(
      conversations.map(async (conv) => {
        const profile = await findByUserId(conv._id);
        return {
          ...conv,
          profile
        };
      })
    );
    
    res.json({ conversations: conversationsWithProfiles });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Delete message
router.delete('/:messageId', verifyFirebaseToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;
    
    const message = await findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    if (message.senderId !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }
    
    await softDelete(messageId);
    
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
