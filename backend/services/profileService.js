const { db, docToObj, snapshotToArr } = require('./firestore');
const admin = require('firebase-admin');

const PROFILES_COLLECTION = 'profiles';

// Find profile by user ID
const findByUserId = async (userId) => {
  const snapshot = await db.collection(PROFILES_COLLECTION)
    .where('userId', '==', userId)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  return docToObj(snapshot.docs[0]);
};

// Find profile by unique ID
const findByUniqueId = async (uniqueId) => {
  const snapshot = await db.collection(PROFILES_COLLECTION)
    .where('uniqueId', '==', uniqueId.toUpperCase())
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  return docToObj(snapshot.docs[0]);
};

// Create profile
const create = async (profileData) => {
  const docRef = await db.collection(PROFILES_COLLECTION).add({
    ...profileData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const doc = await docRef.get();
  return docToObj(doc);
};

// Update profile
const update = async (profileId, profileData) => {
  await db.collection(PROFILES_COLLECTION).doc(profileId).update({
    ...profileData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const doc = await db.collection(PROFILES_COLLECTION).doc(profileId).get();
  return docToObj(doc);
};

// Update profile by user ID
const updateByUserId = async (userId, profileData) => {
  const snapshot = await db.collection(PROFILES_COLLECTION)
    .where('userId', '==', userId)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  
  const profileId = snapshot.docs[0].id;
  await db.collection(PROFILES_COLLECTION).doc(profileId).update({
    ...profileData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const doc = await db.collection(PROFILES_COLLECTION).doc(profileId).get();
  return docToObj(doc);
};

// Search profiles with filters
const search = async (filters, excludeUserId) => {
  let query = db.collection(PROFILES_COLLECTION);
  
  if (excludeUserId) {
    query = query.where('userId', '!=', excludeUserId);
  }
  
  if (filters.uniqueId) {
    query = query.where('uniqueId', '==', filters.uniqueId.toUpperCase());
  }
  
  if (filters.hobby) {
    query = query.where('hobbies', 'array-contains', filters.hobby);
  }
  
  if (filters.city) {
    query = query.where('city', '==', filters.city);
  }
  
  if (filters.state) {
    query = query.where('state', '==', filters.state);
  }
  
  if (filters.ageMin !== undefined) {
    query = query.where('age', '>=', filters.ageMin);
  }
  
  if (filters.ageMax !== undefined) {
    query = query.where('age', '<=', filters.ageMax);
  }
  
  if (filters.isOnline !== undefined) {
    query = query.where('isOnline', '==', filters.isOnline);
  }
  
  // Note: Text search for name/bio requires Firestore indexes or client-side filtering
  // For now, we'll do client-side filtering for name search
  const snapshot = await query.limit(50).get();
  let profiles = snapshotToArr(snapshot);
  
  // Client-side text search for name
  if (filters.name) {
    const searchLower = filters.name.toLowerCase();
    profiles = profiles.filter(p => 
      p.name && p.name.toLowerCase().includes(searchLower)
    );
  }
  
  return profiles;
};

// Get suggested profiles (random)
const getSuggestions = async (excludeUserId, limit = 10) => {
  const snapshot = await db.collection(PROFILES_COLLECTION)
    .where('userId', '!=', excludeUserId)
    .limit(limit)
    .get();
  
  return snapshotToArr(snapshot);
};

// Find profiles by user IDs
const findByUserIds = async (userIds) => {
  if (userIds.length === 0) return [];
  
  const snapshot = await db.collection(PROFILES_COLLECTION)
    .where('userId', 'in', userIds.slice(0, 10)) // Firestore limit: 10 items in 'in' query
    .get();
  
  return snapshotToArr(snapshot);
};

// Check if unique ID exists
const isUniqueIdExists = async (uniqueId) => {
  const snapshot = await db.collection(PROFILES_COLLECTION)
    .where('uniqueId', '==', uniqueId.toUpperCase())
    .limit(1)
    .get();
  
  return !snapshot.empty;
};

module.exports = {
  findByUserId,
  findByUniqueId,
  create,
  update,
  updateByUserId,
  search,
  getSuggestions,
  findByUserIds,
  isUniqueIdExists
};
