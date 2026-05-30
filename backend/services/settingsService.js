const { db, docToObj } = require('./firestore');
const admin = require('firebase-admin');

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'app_settings';

// Get app settings (singleton)
const getSettings = async () => {
  const doc = await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID).get();
  
  if (!doc.exists) {
    // Create default settings
    const defaultSettings = {
      appName: 'Connect',
      themeColor: '#25D366',
      logoUrl: null,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: {
        images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        audio: ['mp3', 'wav', 'm4a', 'ogg']
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID).set(defaultSettings);
    const newDoc = await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID).get();
    return docToObj(newDoc);
  }
  
  return docToObj(doc);
};

// Update app settings
const updateSettings = async (settingsData) => {
  await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID).update({
    ...settingsData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const doc = await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID).get();
  return docToObj(doc);
};

module.exports = {
  getSettings,
  updateSettings
};
