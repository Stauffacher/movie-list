export interface Movie {
  id: string
  name: string
  entryDate: string
  type: "Movie" | "Series"
  rating: number
  platform: string
  notes: string
  status: "Completed" | "Watching" | "Dropped" | "Watchlist"
  season?: number
  episode?: number
  coverImage?: string
  genres: string[]
  watchAgain: boolean
  tmdbId?: number // TMDB ID for series grouping
  createdAt?: Date
  updatedAt?: Date
}

export interface MovieFormData {
  name: string
  entryDate: string
  type: "Movie" | "Series"
  rating: number
  platform: string
  notes: string
  status: "Completed" | "Watching" | "Dropped" | "Watchlist"
  season?: number
  episode?: number
  coverImage?: string
  genres: string[]
  watchAgain: boolean
  tmdbId?: number // TMDB ID for series grouping
}
