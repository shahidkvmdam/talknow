const admin = require('firebase-admin');
const { findByFirebaseUid, create, update } = require('../services/userService');

// Initialize Firebase Admin
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

// Verify Firebase token and get user
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    
    // Find or create user in database
    let user = await findByFirebaseUid(firebaseUid);
    
    if (!user) {
      // Create new user
      user = await create({
        firebaseUid,
        phoneNumber: decodedToken.phone_number || null,
        email: decodedToken.email || null,
        authProvider: decodedToken.firebase.sign_in_provider === 'phone' ? 'mobile' : 'google',
        isActive: true,
        lastLogin: new Date()
      });
    } else {
      // Update last login
      user = await update(user.id, { lastLogin: new Date() });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { verifyFirebaseToken };
