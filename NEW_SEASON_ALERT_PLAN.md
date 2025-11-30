# New Season Alert Feature - Implementation Plan

## Overview
Add functionality to detect and alert users when a new season is available for series they're tracking (e.g., "Homeland" Season 9).

## Feature Requirements

### Core Functionality
1. **Track Series Seasons**: Store the last known season count for each tracked series
2. **Periodic Checking**: Check TMDB API for new seasons (on app load and periodically)
3. **Alert Display**: Show notifications/alerts when new seasons are detected
4. **Alert Management**: Allow users to dismiss alerts and mark them as read

## Implementation Plan

### Phase 1: Data Storage & Tracking

#### 1.1 Create Season Tracking Storage
- **File**: `lib/season-tracker.ts`
- **Purpose**: Store and manage last known season counts for each series
- **Storage Method**: localStorage (similar to seen seasons)
- **Data Structure**:
  ```typescript
  interface SeriesSeasonTracker {
    tmdbId: number
    seriesName: string
    lastKnownSeasonCount: number
    lastChecked: Date
    coverImage?: string
  }
  ```
- **Functions**:
  - `getTrackedSeries()` - Get all tracked series
  - `updateSeriesSeasonCount(tmdbId, count)` - Update season count
  - `getSeriesSeasonCount(tmdbId)` - Get last known count
  - `removeTrackedSeries(tmdbId)` - Remove from tracking

#### 1.2 Initialize Tracking
- When a series is added/edited with a `tmdbId`, automatically track it
- Store initial season count from TMDB API
- Update in `app/page.tsx` when creating/updating series entries

### Phase 2: Detection Logic

#### 2.1 Create Season Checker Service
- **File**: `lib/season-checker.ts`
- **Purpose**: Check TMDB for new seasons
- **Functions**:
  - `checkForNewSeasons(tmdbId: number)` - Check single series
  - `checkAllTrackedSeries()` - Check all tracked series
  - Returns array of series with new seasons

#### 2.2 Integration Points
- **On App Load**: Check all tracked series when `app/page.tsx` mounts
- **Periodic Checks**: Set up interval (e.g., every 24 hours) to check for updates
- **Manual Check**: Add "Check for Updates" button in UI

### Phase 3: Alert/Notification System

#### 3.1 Create Alert Component
- **File**: `components/new-season-alert.tsx`
- **Design**: Toast/Notification style component using Shadcn UI
- **Features**:
  - Display series name, cover image, new season number
  - "Dismiss" button
  - "View Series" button (scrolls to series card)
  - Auto-dismiss after 10 seconds (optional)

#### 3.2 Alert State Management
- **State**: `newSeasonAlerts` in `app/page.tsx`
- **Structure**:
  ```typescript
  interface NewSeasonAlert {
    id: string
    tmdbId: number
    seriesName: string
    newSeasonNumber: number
    totalSeasons: number
    coverImage?: string
    timestamp: Date
  }
  ```

#### 3.3 Alert Display
- Show alerts in a fixed position (top-right or bottom-right)
- Stack multiple alerts if multiple series have new seasons
- Store dismissed alerts in localStorage to prevent re-showing

### Phase 4: UI Integration

#### 4.1 Alert Container
- Add alert container to `app/page.tsx`
- Position: Fixed overlay, non-intrusive
- Show badge/count indicator if alerts exist

#### 4.2 Alert Badge Indicator
- Add notification badge to header (if alerts exist)
- Click to show all alerts in a dropdown/modal

#### 4.3 Series Card Integration
- Add visual indicator on series cards when new season is available
- Small badge/icon showing "New Season Available"

### Phase 5: User Preferences (Optional)

#### 5.1 Alert Settings
- Allow users to enable/disable alerts per series
- Global setting to enable/disable all alerts
- Frequency settings (daily, weekly, etc.)

## Technical Implementation Details

### Files to Create
1. `lib/season-tracker.ts` - Season tracking storage
2. `lib/season-checker.ts` - TMDB checking logic
3. `components/new-season-alert.tsx` - Alert component
4. `components/alert-container.tsx` - Container for multiple alerts

### Files to Modify
1. `app/page.tsx` - Add alert state, checking logic, alert display
2. `components/series-card.tsx` - Add new season indicator badge
3. `lib/movies-api.ts` - Initialize tracking when series added

### API Integration
- Use existing `getTvDetails(tvId)` from `lib/tmdb.ts` to get current season count
- Compare with stored last known count
- Cache API calls (already implemented in tmdb.ts)

### Storage Strategy
- **localStorage**: For season tracking data and dismissed alerts
- **Structure**:
  ```typescript
  {
    "season-tracker": {
      "tmdbId1": { lastKnownSeasonCount: 8, lastChecked: "2024-01-01", ... },
      "tmdbId2": { ... }
    },
    "dismissed-alerts": ["alert-id-1", "alert-id-2"]
  }
  ```

## Implementation Steps

### Step 1: Create Season Tracker (lib/season-tracker.ts)
- [ ] Create storage functions
- [ ] Implement get/update/remove functions
- [ ] Add TypeScript interfaces

### Step 2: Create Season Checker (lib/season-checker.ts)
- [ ] Implement checkForNewSeasons function
- [ ] Implement checkAllTrackedSeries function
- [ ] Add error handling

### Step 3: Create Alert Component (components/new-season-alert.tsx)
- [ ] Design alert UI using Shadcn components
- [ ] Add dismiss functionality
- [ ] Add "View Series" navigation

### Step 4: Integrate into Main App (app/page.tsx)
- [ ] Add alert state management
- [ ] Add checking on mount
- [ ] Add periodic checking (optional)
- [ ] Display alerts in UI

### Step 5: Initialize Tracking
- [ ] Auto-track series when added/edited with tmdbId
- [ ] Update tracking when series data changes

### Step 6: Add Visual Indicators
- [ ] Add badge to series cards
- [ ] Add notification indicator to header

## UI/UX Considerations

### Alert Design
- Non-intrusive: Toast-style notification
- Informative: Show series name, new season number, cover image
- Actionable: Quick actions (dismiss, view)
- Accessible: Keyboard navigation, screen reader support

### User Flow
1. User opens app
2. System checks for new seasons (background)
3. If new seasons found, alert appears
4. User can dismiss or view the series
5. Alert doesn't reappear for same season

## Testing Considerations

### Test Cases
1. New season detected for tracked series
2. Multiple new seasons for different series
3. Series without tmdbId (should not track)
4. Dismissed alerts don't reappear
5. App handles API errors gracefully
6. Performance with many tracked series

## Future Enhancements

1. **Email/Push Notifications**: Notify users outside the app
2. **Season Details**: Show new season release date, episode count
3. **Watchlist Integration**: Only alert for series in "Watchlist" status
4. **Custom Alerts**: User-defined alert preferences per series
5. **Batch Updates**: Check all series at once with progress indicator

## Notes

- Use existing TMDB API integration
- Leverage localStorage for persistence (client-side only)
- Consider rate limiting for TMDB API calls
- Cache results to minimize API calls
- Handle edge cases (series removed from TMDB, API failures)

