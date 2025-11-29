"use client"

const TMDB_API_BASE = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCached(key: string): any | null {
  const cached = cache.get(key)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }

  return cached.data
}

function setCached(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() })
}

function getApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
  if (!apiKey) {
    throw new Error(
      "TMDB API key is not configured. Please set NEXT_PUBLIC_TMDB_API_KEY in your environment variables.",
    )
  }
  return apiKey
}

function getTMDBImageUrl(posterPath: string | null | undefined): string | null {
  if (!posterPath) return null
  return `${TMDB_IMAGE_BASE}${posterPath}`
}

export interface TMDBEpisode {
  id: number
  episode_number: number
  name: string
  overview: string
  air_date: string | null
  runtime: number | null
  still_path: string | null
}

export interface TMDBSeason {
  id: number
  season_number: number
  name: string
  overview: string
  episode_count: number
  air_date: string | null
  poster_path: string | null
  episodes: TMDBEpisode[]
}

export interface TMDBTvDetails {
  id: number
  name: string
  overview: string
  first_air_date: string | null
  last_air_date: string | null
  number_of_seasons: number
  number_of_episodes: number
  poster_path: string | null
  backdrop_path: string | null
  seasons: TMDBSeason[]
}

export interface SeasonEpisode {
  season: number
  episodes: EpisodeInfo[]
  year: string | null
  airDate: string | null
}

export interface EpisodeInfo {
  episode: number
  title: string
  airDate: string | null
  tmdbId: number
  overview?: string
  runtime?: number | null
  stillPath?: string | null
}

// Full series data structure with all TMDB IDs
export interface FullSeriesEpisode {
  episodeNumber: number
  title: string
  airDate: string | null
  tmdbEpisodeId: number
}

export interface FullSeriesSeason {
  seasonNumber: number
  tmdbSeasonId: number
  episodes: FullSeriesEpisode[]
  year: string | null
  airDate: string | null
}

export interface FullSeriesData {
  title: string
  tmdbId: number
  seasons: FullSeriesSeason[]
}

export async function searchTMDB(query: string) {
  const apiKey = getApiKey()
  const cacheKey = `search:${query}`

  const cached = getCached(cacheKey)
  if (cached) return cached

  if (query.length < 2) {
    return []
  }

  const url = `${TMDB_API_BASE}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US`
  const response = await fetch(url)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`TMDB API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const results = data.results.filter((result: any) => result.media_type === "movie" || result.media_type === "tv")

  setCached(cacheKey, results)
  return results
}

export async function getTvDetails(tvId: number): Promise<TMDBTvDetails> {
  const apiKey = getApiKey()
  const cacheKey = `tv:${tvId}`

  const cached = getCached(cacheKey)
  if (cached) return cached

  const url = `${TMDB_API_BASE}/tv/${tvId}?api_key=${apiKey}&language=en-US`
  const response = await fetch(url)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`TMDB API error: ${response.status} - ${errorText}`)
  }

  const data: TMDBTvDetails = await response.json()
  setCached(cacheKey, data)
  return data
}

export async function getSeasonEpisodes(tvId: number, seasonNumber: number): Promise<TMDBSeason> {
  const apiKey = getApiKey()
  const cacheKey = `tv:${tvId}:season:${seasonNumber}`

  const cached = getCached(cacheKey)
  if (cached) return cached

  const url = `${TMDB_API_BASE}/tv/${tvId}/season/${seasonNumber}?api_key=${apiKey}&language=en-US`
  const response = await fetch(url)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`TMDB API error: ${response.status} - ${errorText}`)
  }

  const data: TMDBSeason = await response.json()
  setCached(cacheKey, data)
  return data
}

export async function getAllSeasonsAndEpisodes(tvId: number): Promise<SeasonEpisode[]> {
  try {
    // Get TV details first
    const tvDetails = await getTvDetails(tvId)

    // Fetch all seasons and episodes
    const seasonPromises: Promise<SeasonEpisode>[] = []

    for (let seasonNum = 1; seasonNum <= tvDetails.number_of_seasons; seasonNum++) {
      const promise = getSeasonEpisodes(tvId, seasonNum).then((season) => {
        const episodes: EpisodeInfo[] = season.episodes.map((ep) => ({
          episode: ep.episode_number,
          title: ep.name || `Episode ${ep.episode_number}`,
          airDate: ep.air_date,
          tmdbId: ep.id,
          overview: ep.overview || undefined,
          runtime: ep.runtime,
          stillPath: ep.still_path ? getTMDBImageUrl(ep.still_path) : undefined,
        }))

        // Extract year from season air_date, or from first episode's air_date if season doesn't have one
        const seasonYear = season.air_date
          ? season.air_date.split("-")[0]
          : episodes.length > 0 && episodes[0].airDate
            ? episodes[0].airDate.split("-")[0]
            : null

        return {
          season: season.season_number,
          episodes,
          year: seasonYear,
          airDate: season.air_date,
        }
      })

      seasonPromises.push(promise)
    }

    const seasons = await Promise.all(seasonPromises)

    // Filter out seasons with no episodes and sort by year (then by season number as fallback)
    const filteredSeasons = seasons.filter((s) => s.episodes.length > 0)
    
    // Sort by year (ascending, oldest first), then by season number if years are equal
    filteredSeasons.sort((a, b) => {
      if (a.year && b.year) {
        const yearDiff = Number.parseInt(a.year) - Number.parseInt(b.year)
        if (yearDiff !== 0) return yearDiff
      } else if (a.year && !b.year) return -1
      else if (!a.year && b.year) return 1
      // If years are equal or both null, sort by season number (ascending)
      return a.season - b.season
    })

    return filteredSeasons
  } catch (error) {
    console.error("Error fetching seasons and episodes:", error)
    throw error
  }
}

/**
 * Fetches complete series data including all seasons, episodes, and TMDB IDs
 * Returns a structured object with all metadata needed for the form
 */
export async function getFullSeriesData(seriesId: number): Promise<FullSeriesData> {
  try {
    // Get TV details first to get series title and number of seasons
    const tvDetails = await getTvDetails(seriesId)

    // Fetch all seasons and episodes in parallel
    const seasonPromises: Promise<FullSeriesSeason>[] = []

    for (let seasonNum = 1; seasonNum <= tvDetails.number_of_seasons; seasonNum++) {
      const promise = getSeasonEpisodes(seriesId, seasonNum).then((season) => {
        const episodes: FullSeriesEpisode[] = season.episodes.map((ep) => ({
          episodeNumber: ep.episode_number,
          title: ep.name || `Episode ${ep.episode_number}`,
          airDate: ep.air_date,
          tmdbEpisodeId: ep.id,
        }))

        // Extract year from season air_date, or from first episode's air_date if season doesn't have one
        const seasonYear = season.air_date
          ? season.air_date.split("-")[0]
          : episodes.length > 0 && episodes[0].airDate
            ? episodes[0].airDate.split("-")[0]
            : null

        return {
          seasonNumber: season.season_number,
          tmdbSeasonId: season.id,
          episodes,
          year: seasonYear,
          airDate: season.air_date,
        }
      })

      seasonPromises.push(promise)
    }

    const seasons = await Promise.all(seasonPromises)

    // Filter out seasons with no episodes and sort by year (ascending, oldest first), then by season number
    const filteredSeasons = seasons.filter((s) => s.episodes.length > 0)
    
    // Sort by year (ascending, oldest first), then by season number if years are equal
    filteredSeasons.sort((a, b) => {
      // First, try to sort by year
      if (a.year && b.year) {
        const yearA = Number.parseInt(a.year)
        const yearB = Number.parseInt(b.year)
        if (!isNaN(yearA) && !isNaN(yearB)) {
          const yearDiff = yearA - yearB
          if (yearDiff !== 0) return yearDiff
        }
      }
      // If one has a year and the other doesn't, prioritize the one with a year
      if (a.year && !b.year) return -1
      if (!a.year && b.year) return 1
      // If years are equal or both null, sort by season number (ascending)
      return a.seasonNumber - b.seasonNumber
    })

    console.log("Full series data fetched:", {
      title: tvDetails.name,
      tmdbId: tvDetails.id,
      seasonsCount: filteredSeasons.length,
      seasons: filteredSeasons.map(s => ({ season: s.seasonNumber, year: s.year }))
    })

    return {
      title: tvDetails.name,
      tmdbId: tvDetails.id,
      seasons: filteredSeasons,
    }
  } catch (error) {
    console.error("Error fetching full series data:", error)
    throw error
  }
}


