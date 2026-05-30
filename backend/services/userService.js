const { db, docToObj } = require('./firestore');

const USERS_COLLECTION = 'users';

// Find user by Firebase UID
const findByFirebaseUid = async (firebaseUid) => {
  const snapshot = await db.collection(USERS_COLLECTION)
    .where('firebaseUid', '==', firebaseUid)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  return docToObj(snapshot.docs[0]);
};

// Create user
const create = async (userData) => {
  const docRef = await db.collection(USERS_COLLECTION).add({
    ...userData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const doc = await docRef.get();
  return docToObj(doc);
};

// Update user
const update = async (userId, userData) => {
  await db.collection(USERS_COLLECTION).doc(userId).update({
    ...userData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
  return docToObj(doc);
};

// Find user by ID
const findById = async (userId) => {
  const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
  return docToObj(doc);
};

module.exports = {
  findByFirebaseUid,
  create,
  update,
  findById
};
