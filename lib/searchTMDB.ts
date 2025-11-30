"use client"

export interface TMDBResult {
  id: number
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
  media_type: "movie" | "tv" | "person"
  poster_path?: string | null
  backdrop_path?: string | null
}

export interface TMDBResponse {
  page: number
  results: TMDBResult[]
  total_pages: number
  total_results: number
}

export interface TMDBMovieResult {
  id: number
  title: string
  year: string
  type: "Movie" | "Series"
  posterUrl: string | null
  mediaType: "movie" | "tv"
}

const TMDB_API_BASE = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

function getTMDBImageUrl(posterPath: string | null | undefined): string | null {
  if (!posterPath) return null
  return `${TMDB_IMAGE_BASE}${posterPath}`
}

function extractYear(dateString?: string): string {
  if (!dateString) return ""
  return dateString.split("-")[0] || ""
}

export async function searchTMDB(query: string): Promise<TMDBMovieResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY

  if (!apiKey) {
    throw new Error(
      "TMDB API key is not configured. Please set NEXT_PUBLIC_TMDB_API_KEY in your environment variables. Make sure to restart your Replit project after adding the secret.",
    )
  }

  if (query.length < 2) {
    return []
  }

  try {
    const url = `${TMDB_API_BASE}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US`

    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`TMDB API error: ${response.status} - ${errorText}`)
    }

    const data: TMDBResponse = await response.json()

    // Filter out person results and only include movie/tv
    const filteredResults = data.results.filter(
      (result) => result.media_type === "movie" || result.media_type === "tv",
    ) as Array<TMDBResult & { media_type: "movie" | "tv" }>

    // Transform to our format
    const transformedResults: TMDBMovieResult[] = filteredResults.map((result) => {
      const title = result.title || result.name || "Unknown"
      const year =
        extractYear(result.release_date) || extractYear(result.first_air_date) || ""
      const type: "Movie" | "Series" = result.media_type === "movie" ? "Movie" : "Series"
      const posterUrl = getTMDBImageUrl(result.poster_path)

      return {
        id: result.id,
        title,
        year,
        type,
        posterUrl,
        mediaType: result.media_type as "movie" | "tv",
      }
    })

    // Limit to first 10 results
    return transformedResults.slice(0, 10)
  } catch (error) {
    console.error("Error searching TMDB:", error)
    throw error
  }
}

