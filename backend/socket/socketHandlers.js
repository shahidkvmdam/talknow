const { create: createMessage } = require('../services/messageService');
const { findByUserId, updateByUserId } = require('../services/profileService');

const setupSocketHandlers = (io) => {
  // Store online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins with their user ID
    socket.on('user_join', async (userId) => {
      try {
        socket.userId = userId;
        onlineUsers.set(userId.toString(), socket.id);
        
        // Update online status in database
        await updateByUserId(userId, { isOnline: true, lastSeen: new Date() });
        
        // Notify friends that user is online
        socket.broadcast.emit('user_online', { userId });
        
        console.log(`User ${userId} joined`);
      } catch (error) {
        console.error('User join error:', error);
      }
    });

    // Join a chat room (private conversation)
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    // Leave a chat room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.userId} left room ${roomId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, content, type, mediaUrl, mediaDuration } = data;
        
        // Create room ID (sorted to ensure same room for both users)
        const roomUsers = [senderId, receiverId].sort();
        const roomId = `chat_${roomUsers[0]}_${roomUsers[1]}`;
        
        // Save message to database
        const message = await createMessage({
          senderId,
          receiverId,
          content,
          type: type || 'text',
          mediaUrl,
          mediaDuration: mediaDuration || 0
        });
        
        // Populate sender profile
        const senderProfile = await findByUserId(senderId);
        
        // Send to room
        io.to(roomId).emit('receive_message', {
          id: message.id,
          senderId,
          receiverId,
          content,
          type: message.type,
          mediaUrl,
          mediaDuration,
          isRead: false,
          createdAt: message.createdAt,
          senderProfile: {
            name: senderProfile?.name,
            profilePic: senderProfile?.profilePic
          }
        });
        
        // Send notification to receiver if not in room
        const receiverSocketId = onlineUsers.get(receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message_notification', {
            senderId,
            content: type === 'text' ? content : `Sent a ${type}`,
            roomId
          });
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Mark message as read
    socket.on('mark_read', async (data) => {
      try {
        const { messageId, senderId } = data;
        
        // Note: We need to implement update in messageService for marking as read
        // For now, this is a placeholder - the actual read marking happens in getConversation
        
        // Notify sender that message was read
        const senderSocketId = onlineUsers.get(senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_read', { messageId });
        }
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const receiverSocketId = onlineUsers.get(receiverId.toString());
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          senderId: socket.userId,
          isTyping
        });
      }
    });

    // WebRTC signaling for calls
    socket.on('call_offer', (data) => {
      const { receiverId, offer, callerId } = data;
      const receiverSocketId = onlineUsers.get(receiverId.toString());
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming_call', {
          callerId,
          offer
        });
      }
    });

    socket.on('call_answer', (data) => {
      const { callerId, answer } = data;
      const callerSocketId = onlineUsers.get(callerId.toString());
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('call_answered', { answer });
      }
    });

    socket.on('ice_candidate', (data) => {
      const { receiverId, candidate } = data;
      const receiverSocketId = onlineUsers.get(receiverId.toString());
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('ice_candidate', { candidate });
      }
    });

    socket.on('end_call', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId.toString());
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call_ended');
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          onlineUsers.delete(socket.userId.toString());
          
          // Update offline status
          await updateByUserId(socket.userId, { isOnline: false, lastSeen: new Date() });
          
          // Notify friends that user is offline
          socket.broadcast.emit('user_offline', { userId: socket.userId });
          
          console.log(`User ${socket.userId} disconnected`);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });
};

module.exports = setupSocketHandlers;
