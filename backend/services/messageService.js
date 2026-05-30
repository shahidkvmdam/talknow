const { db, docToObj, snapshotToArr } = require('./firestore');
const admin = require('firebase-admin');

const MESSAGES_COLLECTION = 'messages';

// Create message
const create = async (messageData) => {
  const docRef = await db.collection(MESSAGES_COLLECTION).add({
    ...messageData,
    isRead: false,
    isDeleted: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const doc = await docRef.get();
  return docToObj(doc);
};

// Get conversation between two users
const getConversation = async (user1Id, user2Id, page = 1, limit = 50) => {
  const snapshot = await db.collection(MESSAGES_COLLECTION)
    .where('isDeleted', '==', false)
    .where('senderId', '==', user1Id)
    .where('receiverId', '==', user2Id)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  
  const messages1 = snapshotToArr(snapshot);
  
  const snapshot2 = await db.collection(MESSAGES_COLLECTION)
    .where('isDeleted', '==', false)
    .where('senderId', '==', user2Id)
    .where('receiverId', '==', user1Id)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  
  const messages2 = snapshotToArr(snapshot2);
  
  // Merge and sort
  const allMessages = [...messages1, ...messages2]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
  
  // Mark messages as read
  const unreadSnapshot = await db.collection(MESSAGES_COLLECTION)
    .where('senderId', '==', user2Id)
    .where('receiverId', '==', user1Id)
    .where('isRead', '==', false)
    .get();
  
  const batch = db.batch();
  unreadSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      isRead: true,
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  await batch.commit();
  
  return allMessages.reverse();
};

// Get all conversations for a user
const getConversations = async (userId) => {
  // Get all messages where user is sender or receiver
  const senderSnapshot = await db.collection(MESSAGES_COLLECTION)
    .where('senderId', '==', userId)
    .where('isDeleted', '==', false)
    .orderBy('createdAt', 'desc')
    .get();
  
  const receiverSnapshot = await db.collection(MESSAGES_COLLECTION)
    .where('receiverId', '==', userId)
    .where('isDeleted', '==', false)
    .orderBy('createdAt', 'desc')
    .get();
  
  const allMessages = [...snapshotToArr(senderSnapshot), ...snapshotToArr(receiverSnapshot)];
  
  // Group by conversation partner
  const conversations = {};
  allMessages.forEach(msg => {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!conversations[partnerId] || new Date(msg.createdAt) > new Date(conversations[partnerId].lastMessageTime)) {
      conversations[partnerId] = {
        _id: partnerId,
        lastMessage: msg.content,
        lastMessageType: msg.type,
        lastMessageTime: msg.createdAt,
        unreadCount: msg.receiverId === userId && !msg.isRead ? (conversations[partnerId]?.unreadCount || 0) + 1 : conversations[partnerId]?.unreadCount || 0
      };
    }
  });
  
  return Object.values(conversations).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
};

// Find message by ID
const findById = async (messageId) => {
  const doc = await db.collection(MESSAGES_COLLECTION).doc(messageId).get();
  return docToObj(doc);
};

// Update message
const update = async (messageId, messageData) => {
  await db.collection(MESSAGES_COLLECTION).doc(messageId).update({
    ...messageData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const doc = await db.collection(MESSAGES_COLLECTION).doc(messageId).get();
  return docToObj(doc);
};

// Delete message (soft delete)
const softDelete = async (messageId) => {
  await db.collection(MESSAGES_COLLECTION).doc(messageId).update({
    isDeleted: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
};

module.exports = {
  create,
  getConversation,
  getConversations,
  findById,
  update,
  softDelete
};
