"use client"

export interface SeriesSeasonTracker {
  tmdbId: number
  seriesName: string
  lastKnownSeasonCount: number
  lastChecked: string // ISO date string
  coverImage?: string
}

const STORAGE_KEY = "season-tracker"
const DISMISSED_ALERTS_KEY = "dismissed-season-alerts"

/**
 * Get all tracked series from localStorage
 */
export function getTrackedSeries(): Map<number, SeriesSeasonTracker> {
  if (typeof window === "undefined") return new Map()

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return new Map()

    const data = JSON.parse(stored)
    const map = new Map<number, SeriesSeasonTracker>()

    Object.entries(data).forEach(([key, value]) => {
      const tmdbId = Number.parseInt(key)
      if (!isNaN(tmdbId) && value) {
        map.set(tmdbId, value as SeriesSeasonTracker)
      }
    })

    return map
  } catch (error) {
    console.error("Failed to load tracked series:", error)
    return new Map()
  }
}

/**
 * Get tracked series data for a specific tmdbId
 */
export function getSeriesSeasonCount(tmdbId: number): SeriesSeasonTracker | null {
  const tracked = getTrackedSeries()
  return tracked.get(tmdbId) || null
}

/**
 * Update or add a series to tracking
 */
export function updateSeriesSeasonCount(
  tmdbId: number,
  seasonCount: number,
  seriesName: string,
  coverImage?: string,
): void {
  if (typeof window === "undefined") return

  try {
    const tracked = getTrackedSeries()
    const existing = tracked.get(tmdbId)

    tracked.set(tmdbId, {
      tmdbId,
      seriesName,
      lastKnownSeasonCount: seasonCount,
      lastChecked: new Date().toISOString(),
      coverImage: coverImage || existing?.coverImage,
    })

    // Convert Map to object for localStorage
    const data: Record<string, SeriesSeasonTracker> = {}
    tracked.forEach((value, key) => {
      data[key.toString()] = value
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to update series season count:", error)
  }
}

/**
 * Remove a series from tracking
 */
export function removeTrackedSeries(tmdbId: number): void {
  if (typeof window === "undefined") return

  try {
    const tracked = getTrackedSeries()
    tracked.delete(tmdbId)

    // Convert Map to object for localStorage
    const data: Record<string, SeriesSeasonTracker> = {}
    tracked.forEach((value, key) => {
      data[key.toString()] = value
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to remove tracked series:", error)
  }
}

/**
 * Get dismissed alert IDs
 */
export function getDismissedAlerts(): Set<string> {
  if (typeof window === "undefined") return new Set()

  try {
    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY)
    if (!stored) return new Set()

    const data = JSON.parse(stored) as string[]
    return new Set(data)
  } catch (error) {
    console.error("Failed to load dismissed alerts:", error)
    return new Set()
  }
}

/**
 * Dismiss an alert (store its ID)
 */
export function dismissAlert(alertId: string): void {
  if (typeof window === "undefined") return

  try {
    const dismissed = getDismissedAlerts()
    dismissed.add(alertId)

    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(Array.from(dismissed)))
  } catch (error) {
    console.error("Failed to dismiss alert:", error)
  }
}

/**
 * Clear all dismissed alerts (for testing or reset)
 */
export function clearDismissedAlerts(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(DISMISSED_ALERTS_KEY)
  } catch (error) {
    console.error("Failed to clear dismissed alerts:", error)
  }
}

