# Connect - Stranger Chat App

A messaging app to chat with strangers, make friends, and share media.

## Features

- 🔐 Authentication via Mobile Number & Google Account
- 👤 User Profiles (name, age, location, hobbies, profile pic)
- 🔍 Search Strangers by ID, hobby, name, age, place
- 💬 Real-time Messaging
- 👥 Friend System (add strangers as friends)
- 📞 Voice Calling
- 📸 Image Sharing (camera/gallery)
- 🎙️ Audio Recording & Sharing
- ⚙️ Configurable App Name

## Tech Stack

### Frontend
- React + Vite
- TailwindCSS + shadcn/ui
- Socket.io-client
- Firebase SDK
- WebRTC

### Backend
- Node.js + Express
- Socket.io
- Firebase Admin SDK
- Firebase Firestore
- Multer
- Cloudinary SDK

### Database & Storage
- Firebase Firestore
- Cloudinary (images/audio)
- Firebase Authentication

## Project Structure

```
TalkNow/
├── frontend/          # React frontend
├── backend/           # Node.js backend
├── README.md          # This file
└── .env.example       # Environment variables template
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Firebase project (free)
- Cloudinary account (free)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Update .env with your Firebase config
npm run dev
```

## Environment Variables

See `.env.example` files in both frontend and backend directories.

## Free Services Used

- **Firebase Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Firebase Auth**: Free tier
- **Cloudinary**: 25GB storage
- **Vercel**: Frontend hosting
- **Render**: Backend hosting

## License

MIT
