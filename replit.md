# Netflix Tracker

## Overview
A Next.js 16 application for tracking movies and TV series across streaming platforms like Netflix, Prime Video, Disney+, and more. Users can add entries with ratings, notes, genres, and track their watching progress.

**Current State**: Fully functional (no authentication)
**Last Updated**: November 30, 2025

## Project Architecture

### Tech Stack
- **Framework**: Next.js 16.0.3 (React 19.2.0)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **API Integration**: TMDB for metadata

### Project Structure
```
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout with Geist fonts
│   ├── page.tsx          # Main tracker interface
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Reusable UI components (shadcn/ui style)
│   └── series-card.tsx   # Series card with TMDB seasons
├── lib/
│   ├── tmdb.ts           # TMDB API integration
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

### Key Features
- **Movie/Series Tracking**: Add entries with title, date watched, platform, rating, and notes
- **Advanced Filtering**: Filter by type, platform, status, and search by title
- **Sorting Options**: Sort by date, rating, or alphabetically
- **Series Support**: Track season and episode progress for series
- **TMDB Integration**: Automatic metadata lookup including broadcast years
- **Season Checkboxes**: Track watched seasons with localStorage persistence
- **Genres & Tags**: Add comma-separated genres to entries
- **Cover Images**: Optional cover image URLs
- **Watch Again**: Mark favorites to watch again
- **CSV Export**: Export all entries to CSV format

### Platforms
Netflix, Prime Video, Disney+, Apple TV+, Paramount+, RTL+, WOW, Joyn, Bluewin, Serienstream, Others

## Configuration

### Environment Variables
- `NEXT_PUBLIC_TMDB_API_KEY`: TMDB API key for metadata

### Replit-Specific Setup
- **Port**: 5000 (configured in package.json scripts)
- **Host**: 0.0.0.0 (allows Replit proxy to work correctly)
- **Next.js Config**: Allows all origins for server actions to work with Replit's iframe proxy

### Scripts
- `npm run dev`: Start development server on 0.0.0.0:5000
- `npm run build`: Build for production
- `npm start`: Start production server on 0.0.0.0:5000

## Recent Changes
- **2025-11-30**: Removed authentication
  - Removed Replit Auth with OpenID Connect
  - Removed PostgreSQL database for user sessions
  - App is now open access without login
  
- **2025-11-29**: Initial Replit setup
  - Installed all dependencies
  - Configured Next.js for Replit environment (allowedOrigins)
  - Updated dev/start scripts to use port 5000 and host 0.0.0.0
  - Created workflow for development server

## User Preferences
None documented yet.

## Known Limitations
- **Season Data**: Uses localStorage for watched seasons (per-device, not synced)
- **Entry Data**: Entries stored in React state (consider database migration for persistence)

## Future Enhancement Ideas
- Move entry data to database for persistence
- Add statistics/analytics dashboard
- Export/import functionality beyond CSV
