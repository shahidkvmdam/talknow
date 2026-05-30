const { db, docToObj, snapshotToArr } = require('./firestore');
const admin = require('firebase-admin');

const FRIENDSHIPS_COLLECTION = 'friendships';

// Find friendship between two users
const findFriendship = async (user1Id, user2Id) => {
  const snapshot = await db.collection(FRIENDSHIPS_COLLECTION)
    .where('user1Id', '==', user1Id)
    .where('user2Id', '==', user2Id)
    .limit(1)
    .get();
  
  if (!snapshot.empty) return docToObj(snapshot.docs[0]);
  
  const snapshot2 = await db.collection(FRIENDSHIPS_COLLECTION)
    .where('user1Id', '==', user2Id)
    .where('user2Id', '==', user1Id)
    .limit(1)
    .get();
  
  if (!snapshot2.empty) return docToObj(snapshot2.docs[0]);
  
  return null;
};

// Create friendship
const create = async (friendshipData) => {
  const docRef = await db.collection(FRIENDSHIPS_COLLECTION).add({
    ...friendshipData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const doc = await docRef.get();
  return docToObj(doc);
};

// Find by ID
const findById = async (friendshipId) => {
  const doc = await db.collection(FRIENDSHIPS_COLLECTION).doc(friendshipId).get();
  return docToObj(doc);
};

// Update friendship
const update = async (friendshipId, friendshipData) => {
  await db.collection(FRIENDSHIPS_COLLECTION).doc(friendshipId).update({
    ...friendshipData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const doc = await db.collection(FRIENDSHIPS_COLLECTION).doc(friendshipId).get();
  return docToObj(doc);
};

// Delete friendship
const deleteById = async (friendshipId) => {
  await db.collection(FRIENDSHIPS_COLLECTION).doc(friendshipId).delete();
};

// Get pending requests for a user
const getPendingRequests = async (userId) => {
  const snapshot = await db.collection(FRIENDSHIPS_COLLECTION)
    .where('user2Id', '==', userId)
    .where('status', '==', 'pending')
    .get();
  
  return snapshotToArr(snapshot);
};

// Get all friendships for a user
const getUserFriendships = async (userId, status = 'accepted') => {
  const snapshot1 = await db.collection(FRIENDSHIPS_COLLECTION)
    .where('user1Id', '==', userId)
    .where('status', '==', status)
    .get();
  
  const snapshot2 = await db.collection(FRIENDSHIPS_COLLECTION)
    .where('user2Id', '==', userId)
    .where('status', '==', status)
    .get();
  
  return [...snapshotToArr(snapshot1), ...snapshotToArr(snapshot2)];
};

module.exports = {
  findFriendship,
  create,
  findById,
  update,
  deleteById,
  getPendingRequests,
  getUserFriendships
};
