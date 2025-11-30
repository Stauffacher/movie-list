"use client"

import { getTvDetails } from "./tmdb"
import { getTrackedSeries, updateSeriesSeasonCount, type SeriesSeasonTracker } from "./season-tracker"

export interface NewSeasonAlert {
  id: string
  tmdbId: number
  seriesName: string
  newSeasonNumber: number
  totalSeasons: number
  coverImage?: string
  timestamp: Date
}

/**
 * Check a single series for new seasons
 */
export async function checkForNewSeasons(tmdbId: number): Promise<NewSeasonAlert | null> {
  try {
    // Get tracked data
    const tracked = getTrackedSeries()
    const trackedData = tracked.get(tmdbId)

    if (!trackedData) {
      // Not tracked yet, skip
      return null
    }

    // Fetch current season count from TMDB
    const tvDetails = await getTvDetails(tmdbId)
    const currentSeasonCount = tvDetails.number_of_seasons

    // Check if there's a new season
    if (currentSeasonCount > trackedData.lastKnownSeasonCount) {
      // Update tracking with new count
      updateSeriesSeasonCount(
        tmdbId,
        currentSeasonCount,
        trackedData.seriesName,
        trackedData.coverImage,
      )

      // Return alert with unique ID (includes timestamp to avoid conflicts when testing)
      const alertId = `alert-${tmdbId}-${currentSeasonCount}-${Date.now()}`
      return {
        id: alertId,
        tmdbId,
        seriesName: trackedData.seriesName,
        newSeasonNumber: currentSeasonCount,
        totalSeasons: currentSeasonCount,
        coverImage: trackedData.coverImage,
        timestamp: new Date(),
      }
    }

    // Update last checked time even if no new season
    updateSeriesSeasonCount(
      tmdbId,
      trackedData.lastKnownSeasonCount,
      trackedData.seriesName,
      trackedData.coverImage,
    )

    return null
  } catch (error) {
    console.error(`Failed to check for new seasons for series ${tmdbId}:`, error)
    return null
  }
}

/**
 * Check all tracked series for new seasons
 */
export async function checkAllTrackedSeries(): Promise<NewSeasonAlert[]> {
  const tracked = getTrackedSeries()
  const alerts: NewSeasonAlert[] = []

  // Check each series (with a small delay to avoid rate limiting)
  for (const [tmdbId] of tracked) {
    try {
      const alert = await checkForNewSeasons(tmdbId)
      if (alert) {
        alerts.push(alert)
      }

      // Small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`Error checking series ${tmdbId}:`, error)
      // Continue with other series even if one fails
    }
  }

  return alerts
}

