const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { findFriendship, create, findById, update, deleteById, getPendingRequests, getUserFriendships } = require('../services/friendshipService');
const { findByUserId, findByUserIds } = require('../services/profileService');
const { findById: findUserById } = require('../services/userService');

// Send friend request
router.post('/request/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;
    
    if (currentUserId === userId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }
    
    // Check if friendship already exists
    const existingFriendship = await findFriendship(currentUserId, userId);
    
    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({ error: 'Already friends' });
      }
      if (existingFriendship.status === 'pending') {
        return res.status(400).json({ error: 'Friend request already sent' });
      }
    }
    
    // Create friend request
    const friendship = await create({
      user1Id: currentUserId,
      user2Id: userId,
      status: 'pending',
      requestedBy: currentUserId
    });
    
    res.status(201).json({ message: 'Friend request sent', friendship });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept friend request
router.put('/accept/:friendshipId', verifyFirebaseToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { friendshipId } = req.params;
    
    const friendship = await findById(friendshipId);
    
    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    // Check if the current user is the receiver
    if (friendship.user2Id !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }
    
    const updatedFriendship = await update(friendshipId, { status: 'accepted' });
    
    res.json({ message: 'Friend request accepted', friendship: updatedFriendship });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// Reject friend request
router.put('/reject/:friendshipId', verifyFirebaseToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { friendshipId } = req.params;
    
    const friendship = await findById(friendshipId);
    
    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    // Check if the current user is the receiver
    if (friendship.user2Id !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to reject this request' });
    }
    
    await deleteById(friendshipId);
    
    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ error: 'Failed to reject friend request' });
  }
});

// Get pending friend requests
router.get('/requests/pending', verifyFirebaseToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    const requests = await getPendingRequests(currentUserId);
    
    // Get profiles for each request
    const requestsWithProfiles = await Promise.all(
      requests.map(async (request) => {
        const profile = await findByUserId(request.user1Id);
        const user = await findUserById(request.user1Id);
        return {
          ...request,
          profile,
          user: user ? {
            phoneNumber: user.phoneNumber,
            email: user.email
          } : null
        };
      })
    );
    
    res.json({ requests: requestsWithProfiles });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

// Get all friends
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    const friendships = await getUserFriendships(currentUserId, 'accepted');
    
    // Get friend IDs
    const friendIds = friendships.map(f => 
      f.user1Id === currentUserId ? f.user2Id : f.user1Id
    );
    
    // Get profiles
    const friends = await findByUserIds(friendIds);
    
    // Get user details for each friend
    const friendsWithUsers = await Promise.all(
      friends.map(async (friend) => {
        const user = await findUserById(friend.userId);
        return {
          ...friend,
          user: user ? {
            phoneNumber: user.phoneNumber,
            email: user.email
          } : null
        };
      })
    );
    
    res.json({ friends: friendsWithUsers });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

// Remove friend
router.delete('/:friendId', verifyFirebaseToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { friendId } = req.params;
    
    const friendship = await findFriendship(currentUserId, friendId);
    
    if (!friendship) {
      return res.status(404).json({ error: 'Friendship not found' });
    }
    
    await deleteById(friendship.id);
    
    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

module.exports = router;
