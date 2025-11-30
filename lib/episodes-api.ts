"use client"

import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore"
import { getFirebaseDb } from "./firebase-client"

const SERIES_COLLECTION = "series"

/**
 * Store structure in Firestore:
 * series/{seriesId} = {
 *   episodes: {
 *     [seasonNumber]: {
 *       [episodeNumber]: { seen: boolean, updatedAt: Timestamp }
 *     }
 *   },
 *   seasons: {
 *     [seasonNumber]: { seen: boolean, updatedAt: Timestamp }
 *   },
 *   updatedAt: Timestamp
 * }
 */

/**
 * Mark an episode as seen or unseen
 */
export async function setEpisodeSeen(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  seen: boolean,
): Promise<void> {
  try {
    const db = getFirebaseDb()
    const seriesRef = doc(db, SERIES_COLLECTION, seriesId.toString())

    // Get current data
    const seriesDoc = await getDoc(seriesRef)
    const currentData = seriesDoc.exists() ? seriesDoc.data() : { episodes: {} }

    // Update nested structure
    const episodes = currentData.episodes || {}
    if (!episodes[seasonNumber]) {
      episodes[seasonNumber] = {}
    }
    episodes[seasonNumber][episodeNumber] = {
      seen,
      updatedAt: Timestamp.now(),
    }

    // Save to Firestore
    await setDoc(
      seriesRef,
      {
        episodes,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    )
  } catch (error: any) {
    console.error("Error setting episode seen status:", error)
    if (error?.code === "permission-denied") {
      throw new Error(
        "Firestore permission denied. Please update your Firestore Security Rules to allow read/write access to the 'series' collection.",
      )
    }
    throw new Error(`Failed to update episode: ${error?.message || "Unknown error"}`)
  }
}

/**
 * Get seen status for a specific episode
 */
export async function getEpisodeSeen(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
): Promise<boolean> {
  try {
    const db = getFirebaseDb()
    const seriesRef = doc(db, SERIES_COLLECTION, seriesId.toString())
    const seriesDoc = await getDoc(seriesRef)

    if (seriesDoc.exists()) {
      const data = seriesDoc.data()
      const episodes = data.episodes || {}
      const season = episodes[seasonNumber] || {}
      const episode = season[episodeNumber]
      return episode?.seen === true
    }
    return false
  } catch (error: any) {
    console.error("Error getting episode seen status:", error)
    return false
  }
}

/**
 * Get all seen episodes for a series
 * Returns a map: Map<seasonNumber, Map<episodeNumber, boolean>>
 */
export async function getAllSeenEpisodes(seriesId: number): Promise<Map<number, Map<number, boolean>>> {
  try {
    const db = getFirebaseDb()
    const seriesRef = doc(db, SERIES_COLLECTION, seriesId.toString())
    const seriesDoc = await getDoc(seriesRef)

    const seenMap = new Map<number, Map<number, boolean>>()

    if (seriesDoc.exists()) {
      const data = seriesDoc.data()
      const episodes = data.episodes || {}

      for (const [seasonStr, seasonData] of Object.entries(episodes)) {
        const seasonNumber = Number.parseInt(seasonStr)
        if (isNaN(seasonNumber)) continue

        const seasonMap = new Map<number, boolean>()
        for (const [episodeStr, episodeData] of Object.entries(seasonData as Record<string, any>)) {
          const episodeNumber = Number.parseInt(episodeStr)
          if (isNaN(episodeNumber)) continue
          seasonMap.set(episodeNumber, episodeData.seen === true)
        }

        if (seasonMap.size > 0) {
          seenMap.set(seasonNumber, seasonMap)
        }
      }
    }

    return seenMap
  } catch (error: any) {
    console.error("Error getting all seen episodes:", error)
    return new Map()
  }
}

/**
 * Mark a season as seen or unseen
 */
export async function setSeasonSeen(
  seriesId: number,
  seasonNumber: number,
  seen: boolean,
): Promise<void> {
  try {
    const db = getFirebaseDb()
    const seriesRef = doc(db, SERIES_COLLECTION, seriesId.toString())

    // Get current data
    const seriesDoc = await getDoc(seriesRef)
    const currentData = seriesDoc.exists() ? seriesDoc.data() : { seasons: {} }

    // Update nested structure
    const seasons = currentData.seasons || {}
    seasons[seasonNumber] = {
      seen,
      updatedAt: Timestamp.now(),
    }

    // Save to Firestore
    await setDoc(
      seriesRef,
      {
        seasons,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    )
  } catch (error: any) {
    console.error("Error setting season seen status:", error)
    if (error?.code === "permission-denied") {
      throw new Error(
        "Firestore permission denied. Please update your Firestore Security Rules to allow read/write access to the 'series' collection.",
      )
    }
    throw new Error(`Failed to update season: ${error?.message || "Unknown error"}`)
  }
}

/**
 * Get seen status for a specific season
 */
export async function getSeasonSeen(seriesId: number, seasonNumber: number): Promise<boolean> {
  try {
    const db = getFirebaseDb()
    const seriesRef = doc(db, SERIES_COLLECTION, seriesId.toString())
    const seriesDoc = await getDoc(seriesRef)

    if (seriesDoc.exists()) {
      const data = seriesDoc.data()
      const seasons = data.seasons || {}
      const season = seasons[seasonNumber]
      return season?.seen === true
    }
    return false
  } catch (error: any) {
    console.error("Error getting season seen status:", error)
    return false
  }
}

/**
 * Get all seen seasons for a series
 * Returns a map: Map<seasonNumber, boolean>
 */
export async function getAllSeenSeasons(seriesId: number): Promise<Map<number, boolean>> {
  try {
    const db = getFirebaseDb()
    const seriesRef = doc(db, SERIES_COLLECTION, seriesId.toString())
    const seriesDoc = await getDoc(seriesRef)

    const seenMap = new Map<number, boolean>()

    if (seriesDoc.exists()) {
      const data = seriesDoc.data()
      const seasons = data.seasons || {}

      for (const [seasonStr, seasonData] of Object.entries(seasons)) {
        const seasonNumber = Number.parseInt(seasonStr)
        if (isNaN(seasonNumber)) continue
        seenMap.set(seasonNumber, (seasonData as any).seen === true)
      }
    }

    return seenMap
  } catch (error: any) {
    console.error("Error getting all seen seasons:", error)
    return new Map()
  }
}

