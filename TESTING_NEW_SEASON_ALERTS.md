# Testing Guide: New Season Alert Feature

## Quick Test Methods

### Method 1: Manual Testing with Existing Series

1. **Add a Series with TMDB ID**
   - Go to your app and click "Add Entry"
   - Search for a TV series (e.g., "Homeland", "Breaking Bad", "The Office")
   - Select a series from the autocomplete
   - Fill in the form and save
   - The series should now be tracked automatically

2. **Manually Trigger Alert (Developer Method)**
   - Open browser DevTools (F12)
   - Go to Console tab
   - **Note**: If you see a security warning about pasting, type `allow pasting` and press Enter first
   - Run this command to manually decrease the tracked season count:
   ```javascript
   // Get current tracking data
   const tracker = JSON.parse(localStorage.getItem('season-tracker') || '{}')
   
   // Find a series (replace with actual tmdbId from your series)
   const tmdbId = 1408 // Example: Homeland
   
   // Decrease the lastKnownSeasonCount by 1 to simulate a new season
   if (tracker[tmdbId]) {
     tracker[tmdbId].lastKnownSeasonCount = tracker[tmdbId].lastKnownSeasonCount - 1
     localStorage.setItem('season-tracker', JSON.stringify(tracker))
     console.log('Updated tracker. Refresh the page to see the alert!')
   }
   ```
   - Refresh the page
   - You should see an alert for the new season!

3. **Verify Alert Appears**
   - After refreshing, check the top-right corner
   - You should see an alert card with:
     - Series name
     - Cover image
     - "Season X Available!" badge
     - "View Series" and "Dismiss" buttons

### Method 2: Test with Browser DevTools (Easiest)

1. **Add a Series First**
   - Add any series with a TMDB ID through the UI

2. **Open Console and Run:**
   ```javascript
   // Simulate a new season alert
   const testAlert = {
     id: 'test-alert-1',
     tmdbId: 1408, // Replace with your series tmdbId
     seriesName: 'Homeland',
     newSeasonNumber: 9,
     totalSeasons: 9,
     coverImage: 'https://image.tmdb.org/t/p/w500/your-image.jpg',
     timestamp: new Date()
   }
   
   // Access the React component state (if using React DevTools)
   // Or manually add to localStorage and trigger check
   ```

3. **Or Use This Direct Method:**
   ```javascript
   // Directly manipulate localStorage to simulate new season
   const tracker = JSON.parse(localStorage.getItem('season-tracker') || '{}')
   const tmdbId = 1408 // Your series tmdbId
   
   if (tracker[tmdbId]) {
     // Set lastKnownSeasonCount to be less than current
     tracker[tmdbId].lastKnownSeasonCount = 7 // Assuming current is 8
     tracker[tmdbId].lastChecked = new Date(Date.now() - 86400000).toISOString() // Yesterday
     localStorage.setItem('season-tracker', JSON.stringify(tracker))
     
     // Now refresh page - it should detect the new season
   }
   ```

### Method 3: Test Alert UI Components

1. **Test Alert Container**
   - The alerts should appear in the top-right corner
   - Multiple alerts should stack vertically
   - Alerts should be dismissible

2. **Test "View Series" Button**
   - Click "View Series" on an alert
   - The page should scroll to the series card
   - The series card should briefly highlight with a ring

3. **Test Dismiss Functionality**
   - Click "Dismiss" on an alert
   - The alert should disappear
   - Refresh the page - the dismissed alert should not reappear

### Method 4: Test Series Card Badge

1. **Add a Series**
   - Add a series with TMDB ID

2. **Manually Set hasNewSeason**
   - In browser console, you can't directly modify React state
   - Instead, manipulate the tracking data so the check detects a new season:
   ```javascript
   const tracker = JSON.parse(localStorage.getItem('season-tracker') || '{}')
   const tmdbId = 1408 // Your series
   
   // Set lastKnownSeasonCount lower than actual
   tracker[tmdbId].lastKnownSeasonCount = 7
   localStorage.setItem('season-tracker', JSON.stringify(tracker))
   ```
   - Refresh the page
   - The series card should show "New Season Available!" badge

## Step-by-Step Testing Checklist

### ✅ Initial Setup
- [ ] Add a TV series entry with TMDB ID
- [ ] Verify series appears in the list
- [ ] Check browser console for any errors

### ✅ Tracking Verification
- [ ] Open DevTools → Application → Local Storage
- [ ] Look for `season-tracker` key
- [ ] Verify your series is stored with correct data:
  ```json
  {
    "1408": {
      "tmdbId": 1408,
      "seriesName": "Homeland",
      "lastKnownSeasonCount": 8,
      "lastChecked": "2024-01-15T10:00:00.000Z",
      "coverImage": "..."
    }
  }
  ```

### ✅ Alert Detection
- [ ] Manually decrease `lastKnownSeasonCount` in localStorage
- [ ] Refresh the page
- [ ] Verify alert appears in top-right corner
- [ ] Check alert shows correct series name and season number

### ✅ Alert Interactions
- [ ] Click "Dismiss" - alert should disappear
- [ ] Refresh page - dismissed alert should not reappear
- [ ] Check `dismissed-season-alerts` in localStorage
- [ ] Click "View Series" - should scroll to series card
- [ ] Verify series card highlights briefly

### ✅ Series Card Badge
- [ ] Verify "New Season Available!" badge appears on series card
- [ ] Badge should be visible below the series title

### ✅ Multiple Alerts
- [ ] Add multiple series
- [ ] Trigger alerts for multiple series
- [ ] Verify all alerts stack properly
- [ ] Test dismissing individual alerts

## Testing with Real Data

If you want to test with actual TMDB data:

1. **Find a Series with Recent New Season**
   - Go to TMDB website
   - Find a series that recently got a new season
   - Note the series ID and current season count

2. **Add the Series**
   - Add it to your app with the TMDB ID
   - The system will track the current season count

3. **Wait or Simulate**
   - Either wait for the next season to be released
   - Or manually adjust the tracking data as shown above

## Debugging Tips

### Check if Tracking is Working
```javascript
// In browser console
const tracker = JSON.parse(localStorage.getItem('season-tracker') || '{}')
console.log('Tracked series:', tracker)
```

### Check Dismissed Alerts
```javascript
const dismissed = JSON.parse(localStorage.getItem('dismissed-season-alerts') || '[]')
console.log('Dismissed alerts:', dismissed)
```

### Clear All Tracking Data (Reset)
```javascript
localStorage.removeItem('season-tracker')
localStorage.removeItem('dismissed-season-alerts')
console.log('Tracking data cleared. Refresh page.')
```

### Force Check for New Seasons
```javascript
// This will trigger the check function
// You need to access the React component, or just refresh the page
// The check happens automatically on page load
```

## Common Issues

### Alert Not Appearing
- Check browser console for errors
- Verify series has a `tmdbId`
- Check if alert was already dismissed
- Verify `season-tracker` data exists in localStorage

### Series Card Badge Not Showing
- Verify series has `tmdbId`
- Check if tracking data exists
- Verify the season count comparison logic
- Check browser console for errors

### "View Series" Not Working
- Verify the series card has `data-series-tmdb-id` attribute
- Check if the series is visible on the page
- Verify the scroll function is working

## Quick Test Script

**Important**: If you see a security warning about pasting, type `allow pasting` in the console first, then press Enter.

Then copy and paste this into browser console for quick testing:

```javascript
// Quick test script
(async function() {
  // 1. Check current tracking
  const tracker = JSON.parse(localStorage.getItem('season-tracker') || '{}')
  console.log('Current tracked series:', Object.keys(tracker).length)
  
  // 2. If you have a series, simulate new season
  const firstTmdbId = Object.keys(tracker)[0]
  if (firstTmdbId) {
    const series = tracker[firstTmdbId]
    console.log(`Testing with: ${series.seriesName} (ID: ${firstTmdbId})`)
    
    // Decrease season count
    tracker[firstTmdbId].lastKnownSeasonCount = Math.max(1, series.lastKnownSeasonCount - 1)
    localStorage.setItem('season-tracker', JSON.stringify(tracker))
    
    console.log('✅ Simulated new season! Refresh the page to see the alert.')
  } else {
    console.log('❌ No tracked series found. Add a series with TMDB ID first.')
  }
})()
```

**Alternative: Type commands manually** (no pasting needed):
1. Type: `const tracker = JSON.parse(localStorage.getItem('season-tracker') || '{}')`
2. Press Enter
3. Type: `const firstId = Object.keys(tracker)[0]`
4. Press Enter
5. Type: `if (firstId) { tracker[firstId].lastKnownSeasonCount = tracker[firstId].lastKnownSeasonCount - 1; localStorage.setItem('season-tracker', JSON.stringify(tracker)); console.log('Done! Refresh page.') }`
6. Press Enter
7. Refresh the page

## Expected Behavior

1. **On App Load**: System checks all tracked series for new seasons
2. **If New Season Found**: Alert appears in top-right corner
3. **Series Card**: Shows "New Season Available!" badge
4. **User Actions**:
   - Dismiss: Alert disappears and won't show again
   - View Series: Scrolls to series card and highlights it
5. **Persistence**: Dismissed alerts are stored and won't reappear

## Next Steps After Testing

Once you've verified everything works:
- The feature will automatically work for real new seasons
- No additional setup needed
- Alerts will appear when TMDB detects new seasons for your tracked series

