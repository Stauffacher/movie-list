# Firebase Setup Guide

This application uses Firebase Firestore for data persistence. Follow these steps to configure Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## 2. Enable Firestore Database

1. In your Firebase project, go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode** (you can change security rules later)
4. Choose a location for your database
5. Click "Enable"

## 3. Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web icon** (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Movie List App")
5. Copy your Firebase configuration object

## 4. Set Up Environment Variables in Replit

Add these environment variables in your **Replit Secrets Tab**:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Important Notes:**
- The `NEXT_PUBLIC_` prefix is required for Next.js to expose these variables to the client
- Replace all placeholder values with your actual Firebase config values
- In Replit, go to the Secrets tab (lock icon) in the sidebar to add these

## 5. Configure Firestore Security Rules

In Firebase Console → Firestore Database → Rules, update your rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /movies/{document=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

**⚠️ Security Warning:** The above rules allow anyone to read/write. For production, implement proper authentication and rules.

## 6. Verify Setup

1. Restart your Replit project
2. The app should connect to Firebase automatically
3. Try creating a movie entry to test the connection

## Troubleshooting

- **"Missing Firebase configuration" error**: Check that all environment variables are set in Replit Secrets
- **Permission denied errors**: Check your Firestore security rules
- **Connection issues**: Verify your Firebase project is active and Firestore is enabled

