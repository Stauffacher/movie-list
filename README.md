# Movie List App

A Next.js 16 application for managing your movie collection with Firebase Firestore integration.

## Overview

This application allows you to:
- **Create** movie entries with title, date watched, type, and rating
- **View** all your movies in a responsive grid layout
- **Update** movie details
- **Delete** movies from your collection

All data is persisted in Firebase Firestore, so your movie list is saved and synced across sessions.

## Tech Stack

- **Framework**: Next.js 16.0.3 (React 19.2.0)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI primitives (shadcn/ui style)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- A Firebase project with Firestore enabled

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

### Firebase Setup

**Important**: Before running the app, you need to configure Firebase.

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database in your Firebase project
3. Get your Firebase configuration from Project Settings
4. Add the following environment variables to your Replit Secrets Tab:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-api-key
```

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase setup instructions.
See [TMDB_SETUP.md](./TMDB_SETUP.md) for TMDB API key setup (optional, for autocomplete search).

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) with your browser to see the result.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx           # Main movie list interface
│   └── globals.css        # Global styles
├── components/
│   └── ui/                # Reusable UI components (shadcn/ui)
├── lib/
│   ├── firebase-client.ts # Firebase client-side initialization
│   ├── movies-api.ts      # Firebase CRUD operations
│   ├── movie-types.ts     # TypeScript interfaces
│   └── utils.ts           # Utility functions
└── FIREBASE_SETUP.md      # Firebase setup guide
```

## Features

### Core Functionality

- ✅ Create new movie entries
- ✅ View all movies in a grid
- ✅ Edit movie details
- ✅ Delete movies
- ✅ Star rating system (1-5 stars)
- ✅ Support for Movies and Series

### Technical Features

- Firebase Firestore integration for data persistence
- Responsive design with Tailwind CSS
- Type-safe with TypeScript
- Modern UI with Radix UI components

## Environment Variables

All Firebase configuration is done through environment variables. In Replit, add these to your Secrets tab:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Replit Configuration

This project is configured for Replit:
- Port: 5000
- Host: 0.0.0.0
- Next.js configured for Replit's proxy

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
