# TMDB TV Series Seasons & Episodes Feature

## Overview

This feature automatically fetches and displays all seasons and episodes when you select a TV series from the TMDB autocomplete search.

## How It Works

1. **Search**: Type at least 2 characters to search for movies and TV series
2. **Select TV Series**: When you select a TV series result:
   - The app automatically fetches all seasons and episodes
   - Shows a loading indicator while fetching
   - Displays season and episode selectors
3. **Select Season**: Choose a season from the dropdown
4. **Select Episode**: Choose an episode from that season
5. **Auto-fill**: The form automatically fills with:
   - Series title
   - Season number
   - Episode number
   - Episode title
   - Air date
   - Episode overview (in notes)
   - Runtime (in notes)
   - Episode still image (as cover image)

## Features

### Automatic Data Fetching
- When a TV series is selected, all seasons and episodes are fetched automatically
- Uses TMDB API endpoints:
  - `/tv/{seriesId}` - Get TV show details
  - `/tv/{seriesId}/season/{seasonNumber}` - Get season episodes

### Caching
- API responses are cached for 5 minutes
- Selecting the same series twice won't refetch data
- Improves performance and reduces API calls

### User Interface
- **Loading Indicator**: Shows while fetching seasons/episodes
- **Season Selector**: Dropdown showing all available seasons with episode counts
- **Episode Selector**: Dropdown showing all episodes in the selected season
- **Manual Input**: Still available as fallback for manual entry

### Auto-fill Details
When you select an episode, the form automatically fills:
- **Title**: Series name (already filled from search)
- **Season**: Season number
- **Episode**: Episode number
- **Date Watched**: Episode air date (if available)
- **Notes**: Episode title, air date, runtime, and overview
- **Cover Image**: Episode still image (if available)

## Technical Implementation

### Files Created/Modified

1. **`lib/tmdb.ts`** - New file with TMDB API functions:
   - `getTvDetails(tvId)` - Get TV show details
   - `getSeasonEpisodes(tvId, seasonNumber)` - Get episodes for a season
   - `getAllSeasonsAndEpisodes(tvId)` - Get all seasons and episodes
   - `searchTMDB(query)` - Search movies/TV (alternative to searchTMDB.ts)
   - Includes caching mechanism

2. **`app/page.tsx`** - Modified:
   - Added state for seasons/episodes data
   - Updated `handleTMDBSelect()` to fetch seasons/episodes for TV series
   - Added `handleSeasonSelect()` and `handleEpisodeSelect()` functions
   - Added season/episode selector UI components
   - Integrated auto-fill logic

### State Management

- `seasonsAndEpisodes`: Array of all seasons with their episodes
- `isLoadingSeasons`: Loading state indicator
- `selectedTvSeriesId`: Currently selected TV series ID
- `selectedSeason`: Currently selected season number
- `selectedEpisodeInfo`: Currently selected episode details

### API Caching

- Responses cached for 5 minutes
- Cache key format: `tv:{tvId}`, `tv:{tvId}:season:{seasonNumber}`
- Automatically clears expired cache entries

## Usage Example

1. Click "Add Entry"
2. Search for a TV series (e.g., "Breaking Bad")
3. Select the series from results
4. Wait for seasons to load (shows loading indicator)
5. Select a season from dropdown (e.g., "Season 1 (7 episodes)")
6. Select an episode from dropdown (e.g., "Episode 1: Pilot (2008)")
7. Form automatically fills with episode details
8. Complete remaining fields (rating, platform, etc.)
9. Click "Add Entry"

## Requirements Met

✅ Uses TMDB API search endpoint
✅ Uses TMDB TV details endpoint
✅ Uses TMDB season episodes endpoint
✅ Fetches all seasons when TV series is selected
✅ Fetches all episodes for each season
✅ Displays season dropdown
✅ Displays episode dropdown (after season selection)
✅ Auto-fills form fields with episode info
✅ Shows loading indicators
✅ Implements caching
✅ Integrates cleanly into existing form
✅ TypeScript + Next.js + Shadcn UI

## Notes

- The feature works alongside the existing manual input fields
- If TMDB API fails, users can still manually enter season/episode
- Episode details (title, overview, runtime) are added to notes field
- Episode air date can be used as the "Date Watched" automatically
- All TMDB API calls respect rate limits (40 requests per 10 seconds)


