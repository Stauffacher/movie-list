# Netflix Tracker

## Overview
A Next.js 16 application for tracking movies and TV series across streaming platforms like Netflix, Prime Video, Disney+, and more. Users can add entries with ratings, notes, genres, and track their watching progress.

**Current State**: Configured and ready to run on Replit
**Last Updated**: November 29, 2025

## Project Architecture

### Tech Stack
- **Framework**: Next.js 16.0.3 (React 19.2.0)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useMemo)

### Project Structure
```
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout with Geist fonts
│   ├── page.tsx         # Main tracker interface
│   └── globals.css      # Global styles
├── components/
│   └── ui/              # Reusable UI components (shadcn/ui style)
├── lib/
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

### Key Features
- **Movie/Series Tracking**: Add entries with title, date watched, platform, rating, and notes
- **Advanced Filtering**: Filter by type, platform, status, and search by title
- **Sorting Options**: Sort by date, rating, or alphabetically
- **Series Support**: Track season and episode progress for series
- **Genres & Tags**: Add comma-separated genres to entries
- **Cover Images**: Optional cover image URLs
- **Watch Again**: Mark favorites to watch again
- **CSV Export**: Export all entries to CSV format
- **Client-Side Only**: All data stored in browser state (no backend/database)

## Configuration

### Replit-Specific Setup
- **Port**: 5000 (configured in package.json scripts)
- **Host**: 0.0.0.0 (allows Replit proxy to work correctly)
- **Next.js Config**: Allows all origins for server actions to work with Replit's iframe proxy

### Scripts
- `npm run dev`: Start development server on 0.0.0.0:5000
- `npm run build`: Build for production
- `npm start`: Start production server on 0.0.0.0:5000
- `npm run lint`: Run ESLint

## Recent Changes
- **2025-11-29**: Initial Replit setup
  - Installed all dependencies
  - Configured Next.js for Replit environment (allowedOrigins)
  - Updated dev/start scripts to use port 5000 and host 0.0.0.0
  - Created workflow for development server

## User Preferences
None documented yet.

## Known Limitations
- **No Data Persistence**: All data is stored in React state and lost on page refresh
- **Client-Side Only**: No backend or database integration
- **No Authentication**: Single-user application

## Future Enhancement Ideas
- Add localStorage or database for data persistence
- Implement user authentication
- Add TMDB or IMDB API integration for automatic metadata
- Add statistics/analytics dashboard
- Export/import functionality beyond CSV
