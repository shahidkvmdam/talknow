# Connect App - Setup Guide

Complete setup instructions for the Connect stranger chat application.

## Prerequisites

- Node.js (v18 or higher) - [Download here](https://nodejs.org/)
- Git (optional) - [Download here](https://git-scm.com/)
- A code editor (VS Code recommended)

## Step 1: Set Up Free Services

### 1.1 Firebase (Authentication & Database)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "Connect"
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable "Google" sign-in
   - Enable "Phone" sign-in
4. Enable Firestore Database:
   - Go to Firestore Database → Create database
   - Select "Start in test mode" (for development)
   - Choose a location (e.g., us-central)
5. Get Firebase config:
   - Go to Project Settings → General → Your apps
   - Click "Web app" icon (</>)
   - Copy the firebaseConfig object
6. Get Service Account Key (for backend):
   - Go to Project Settings → Service accounts
   - Click "Generate new private key"
   - Download and save the JSON file
   - Open the JSON file and copy these values:
     - `project_id`
     - `private_key` (replace \n with actual newlines)
     - `client_email`

### 1.2 Cloudinary (Image/Audio Storage)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Go to Dashboard → Account Details
4. Copy:
   - Cloud name
   - API Key
   - API Secret (from "Security" section)

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your credentials:
```env
# Firebase (Backend & Database)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App Settings
DEFAULT_APP_NAME=Connect
```

### 2.3 Start Backend Server

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your Firebase config:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3.3 Start Frontend Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Step 4: Test the Application

1. Open `http://localhost:5173` in your browser
2. Click "Sign in with Google" to authenticate
3. Create your profile with:
   - Name
   - Age
   - Location (optional)
   - Hobbies (optional)
   - Bio (optional)
4. Explore features:
   - Search for strangers by ID, name, hobby, or location
   - Start chatting
   - Send friend requests
   - Share images
   - Make voice calls

## Step 5: Deployment (Free Hosting)

### 5.1 Deploy Backend to Render

1. Go to [Render](https://render.com/)
2. Sign up for a free account
3. Create a new "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
6. Add environment variables (same as backend `.env`)
7. Deploy!

### 5.2 Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Sign up for a free account
3. Import your GitHub repository
4. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables (same as frontend `.env`)
6. Update `VITE_API_URL` to your Render backend URL
7. Deploy!

## Troubleshooting

### Firebase Connection Error
- Verify Firebase project ID and credentials are correct
- Check that Firestore is enabled in your Firebase project
- Ensure service account key is valid and properly formatted

### Firebase Authentication Error
- Verify Firebase config is correct
- Check that sign-in methods are enabled
- Ensure service account key is valid

### Socket.io Connection Error
- Ensure backend is running
- Check CORS settings in backend
- Verify `CLIENT_URL` in backend `.env`

### Image Upload Error
- Verify Cloudinary credentials
- Check file size (max 10MB)
- Ensure file type is supported

## Feature Checklist

- ✅ User Authentication (Google + Phone)
- ✅ Profile Creation & Management
- ✅ Search Strangers (ID, name, hobby, location, age)
- ✅ Real-time Messaging
- ✅ Friend System (requests, accept, reject)
- ✅ Image Sharing
- ✅ Audio Sharing
- ✅ Voice Calling (WebRTC)
- ✅ Configurable App Name
- ✅ Online Status
- ✅ Message Read Receipts
- ✅ Typing Indicators

## Next Steps

1. **Add more features**:
   - Video calling
   - Group chats
   - Push notifications
   - Message encryption
   - Blocked users list

2. **Improve UI/UX**:
   - Add animations
   - Improve mobile responsiveness
   - Add dark/light theme toggle
   - Add more profile customization

3. **Scale up**:
   - Add Redis for caching
   - Implement rate limiting
   - Add analytics
   - Set up monitoring

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all services are running (MongoDB, Firebase, Cloudinary)
4. Check that ports 5000 and 5173 are not in use

## License

MIT License - Free to use and modify
