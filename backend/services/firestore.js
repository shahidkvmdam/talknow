const admin = require('firebase-admin');

// Initialize Firestore
if (!admin.apps.length) {
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Helper function to convert Firestore document to plain object
const docToObj = (doc) => {
  if (!doc.exists) return null;
  return {
    id: doc.id,
    ...doc.data()
  };
};

// Helper function to convert Firestore snapshot to array
const snapshotToArr = (snapshot) => {
  return snapshot.docs.map(doc => docToObj(doc));
};

module.exports = { db, docToObj, snapshotToArr };
