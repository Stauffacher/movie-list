"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2, Plus, Search, Star, Tv, Download, Heart, Loader2 } from "lucide-react"
import { getMovies, createMovie, updateMovie, deleteMovie } from "@/lib/movies-api"
import type { Movie, MovieFormData } from "@/lib/movie-types"
import { MovieAutocomplete } from "@/components/movie-autocomplete"
import type { TMDBMovieResult } from "@/lib/searchTMDB"
import { getFullSeriesData, type FullSeriesData, type FullSeriesSeason, type FullSeriesEpisode } from "@/lib/tmdb"
import { SeriesCard } from "@/components/series-card"
import { AlertContainer } from "@/components/alert-container"
import { checkAllTrackedSeries, type NewSeasonAlert } from "@/lib/season-checker"
import { updateSeriesSeasonCount } from "@/lib/season-tracker"
import { getTvDetails } from "@/lib/tmdb"

function StarRating({ value, onChange }: { value: number; onChange?: (rating: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`${onChange ? "cursor-pointer hover:scale-110" : ""} transition-transform`}
          disabled={!onChange}
        >
          <Star className={`w-5 h-5 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  )
}

export default function MovieListApp() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null)

  const [movieName, setMovieName] = useState("")
  const [entryDate, setEntryDate] = useState("")
  const [type, setType] = useState<"Movie" | "Series">("Movie")
  const [rating, setRating] = useState(0)
  const [platform, setPlatform] = useState("Netflix")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<"Completed" | "Watching" | "Dropped" | "Watchlist">("Completed")
  const [season, setSeason] = useState("")
  const [episode, setEpisode] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [genreInput, setGenreInput] = useState("")
  const [watchAgain, setWatchAgain] = useState(false)
  const [tmdbId, setTmdbId] = useState<number | undefined>(undefined)

  // TMDB TV Series seasons/episodes state
  const [fullSeriesData, setFullSeriesData] = useState<FullSeriesData | null>(null)
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false)
  const [selectedTvSeriesId, setSelectedTvSeriesId] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<string>("")
  const [selectedEpisode, setSelectedEpisode] = useState<FullSeriesEpisode | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterPlatform, setFilterPlatform] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")

  // New season alerts
  const [newSeasonAlerts, setNewSeasonAlerts] = useState<NewSeasonAlert[]>([])
  const [isCheckingSeasons, setIsCheckingSeasons] = useState(false)

  const filteredAndSortedMovies = useMemo(() => {
    let result = movies.filter((movie) => {
      const matchesSearch = movie.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === "all" || movie.type === filterType
      const matchesPlatform = filterPlatform === "all" || movie.platform === filterPlatform
      const matchesStatus = filterStatus === "all" || movie.status === filterStatus
      return matchesSearch && matchesType && matchesPlatform && matchesStatus
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
        case "date-asc":
          return new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
        case "rating-desc":
          return b.rating - a.rating
        case "rating-asc":
          return a.rating - b.rating
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })

    return result
  }, [movies, searchQuery, filterType, filterPlatform, filterStatus, sortBy])

  // Group series by TMDB ID (or by name if tmdbId is missing)
  const groupedItems = useMemo(() => {
    const moviesList: Movie[] = []
    const seriesMap = new Map<number | string, Movie[]>()

    filteredAndSortedMovies.forEach((movie) => {
      if (movie.type === "Series") {
        // Group series by tmdbId if available, otherwise by normalized name
        const groupKey = movie.tmdbId || movie.name.toLowerCase().trim()
        
        if (!seriesMap.has(groupKey)) {
          seriesMap.set(groupKey, [])
        }
        seriesMap.get(groupKey)!.push(movie)
      } else {
        // Movies go to movies list
        moviesList.push(movie)
      }
    })

    return { movies: moviesList, series: seriesMap }
  }, [filteredAndSortedMovies])

  const uniquePlatforms = useMemo(() => {
    return Array.from(new Set(movies.map((m) => m.platform).filter(Boolean)))
  }, [movies])

  useEffect(() => {
    loadMovies()
  }, [])

  // Check for new seasons after movies are loaded
  useEffect(() => {
    if (movies.length > 0 && !isLoading) {
      checkForNewSeasons()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movies.length, isLoading])

  async function checkForNewSeasons() {
    if (isCheckingSeasons) return

    try {
      setIsCheckingSeasons(true)
      const alerts = await checkAllTrackedSeries()
      if (alerts.length > 0) {
        setNewSeasonAlerts((prev) => {
          // Merge new alerts with existing ones, avoiding duplicates
          const existingIds = new Set(prev.map((a) => a.id))
          const newAlerts = alerts.filter((a) => !existingIds.has(a.id))
          return [...prev, ...newAlerts]
        })
      }
    } catch (error) {
      console.error("Failed to check for new seasons:", error)
    } finally {
      setIsCheckingSeasons(false)
    }
  }

  function handleDismissAlert(alertId: string) {
    setNewSeasonAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  function handleViewSeries(tmdbId: number) {
    // Find the series card and scroll to it
    const seriesCard = document.querySelector(`[data-series-tmdb-id="${tmdbId}"]`)
    if (seriesCard) {
      seriesCard.scrollIntoView({ behavior: "smooth", block: "center" })
      // Highlight the card briefly
      seriesCard.classList.add("ring-2", "ring-primary", "ring-offset-2")
      setTimeout(() => {
        seriesCard.classList.remove("ring-2", "ring-primary", "ring-offset-2")
      }, 2000)
    }
  }

  async function initializeSeriesTracking(movie: Movie) {
    // Only track series with tmdbId
    if (movie.type === "Series" && movie.tmdbId) {
      try {
        const tvDetails = await getTvDetails(movie.tmdbId)
        updateSeriesSeasonCount(
          movie.tmdbId,
          tvDetails.number_of_seasons,
          movie.name,
          movie.coverImage,
        )
      } catch (error) {
        console.error(`Failed to initialize tracking for series ${movie.name}:`, error)
      }
    }
  }

  async function loadMovies() {
    try {
      setIsLoading(true)
      const moviesData = await getMovies()
      setMovies(moviesData)
    } catch (error: any) {
      console.error("Failed to load movies:", error)
      const message = error?.message || "Failed to load movies"
      if (message.includes("permission") || message.includes("Firestore")) {
        alert(
          "🔒 Firestore Permission Error!\n\nYour Firestore Security Rules are blocking access.\n\nQuick Fix:\n1. Go to Firebase Console → Firestore Database → Rules\n2. Update rules to allow access to 'movies' collection\n3. See FIRESTORE_RULES_FIX.md for details\n\n" +
            message,
        )
      } else {
        alert("Failed to load movies: " + message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setMovieName("")
    setEntryDate("")
    setType("Movie")
    setRating(0)
    setPlatform("Netflix")
    setNotes("")
    setStatus("Completed")
    setSeason("")
    setEpisode("")
    setCoverImage("")
    setGenreInput("")
    setWatchAgain(false)
    setTmdbId(undefined)
    // Reset TMDB TV series data
    setFullSeriesData(null)
    setSelectedTvSeriesId(null)
    setSelectedSeason("")
    setSelectedEpisode(null)
  }

  async function handleAddMovie() {
    if (!movieName.trim() || !entryDate) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const genres = genreInput
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g.length > 0)

      const movieData: MovieFormData = {
        name: movieName.trim(),
        entryDate,
        type,
        rating,
        platform,
        notes: notes.trim(),
        status,
        season: season ? Number.parseInt(season) : undefined,
        episode: episode ? Number.parseInt(episode) : undefined,
        coverImage: coverImage.trim() || undefined,
        genres,
        watchAgain,
        tmdbId,
      }

      const newMovie = await createMovie(movieData)
      resetForm()
      setIsAddDialogOpen(false)
      await loadMovies()
      // Initialize tracking for new series
      if (newMovie.type === "Series" && newMovie.tmdbId) {
        await initializeSeriesTracking(newMovie)
        // Check for new seasons after initializing tracking
        await checkForNewSeasons()
      }
    } catch (error: any) {
      console.error("Failed to create movie:", error)
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      })
      
      const message = error?.message || "Failed to create movie"
      
      if (message.includes("permission") || message.includes("Firestore") || error?.code === "permission-denied") {
        alert(
          "🔒 Firestore Permission Error!\n\nYour Firestore Security Rules are blocking access.\n\nQuick Fix:\n1. Go to Firebase Console → Firestore Database → Rules\n2. Update rules to allow access to 'movies' collection\n3. See FIRESTORE_RULES_FIX.md for details\n\n" +
            message,
        )
      } else {
        alert(`Failed to create movie:\n\n${message}\n\nCheck the browser console for more details.`)
      }
    }
  }

  async function handleUpdateMovie() {
    if (!currentMovie || !movieName.trim() || !entryDate) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const genres = genreInput
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g.length > 0)

      const movieData: MovieFormData = {
        name: movieName.trim(),
        entryDate,
        type,
        rating,
        platform,
        notes: notes.trim(),
        status,
        season: season ? Number.parseInt(season) : undefined,
        episode: episode ? Number.parseInt(episode) : undefined,
        coverImage: coverImage.trim() || undefined,
        genres,
        watchAgain,
        tmdbId: tmdbId || currentMovie.tmdbId, // Use new tmdbId if set, otherwise preserve existing
      }

      await updateMovie(currentMovie.id, movieData)
      const updatedMovie: Movie = {
        ...currentMovie,
        ...movieData,
        tmdbId: tmdbId || currentMovie.tmdbId,
      }
      resetForm()
      setCurrentMovie(null)
      setIsEditDialogOpen(false)
      await loadMovies()
      // Update tracking if tmdbId was added or changed
      if (updatedMovie.type === "Series" && updatedMovie.tmdbId) {
        await initializeSeriesTracking(updatedMovie)
      }
    } catch (error: any) {
      console.error("Failed to update movie:", error)
      const message = error?.message || "Failed to update movie"
      if (message.includes("permission") || message.includes("Firestore")) {
        alert(
          "🔒 Firestore Permission Error!\n\nYour Firestore Security Rules are blocking access.\n\nQuick Fix:\n1. Go to Firebase Console → Firestore Database → Rules\n2. Update rules to allow access to 'movies' collection\n3. See FIRESTORE_RULES_FIX.md for details",
        )
      } else {
        alert("Failed to update movie: " + message)
      }
    }
  }

  async function handleDeleteMovie(id: string) {
    if (!confirm("Are you sure you want to delete this movie?")) {
      return
    }

    try {
      await deleteMovie(id)
      await loadMovies()
    } catch (error: any) {
      console.error("Failed to delete movie:", error)
      const message = error?.message || "Failed to delete movie"
      if (message.includes("permission") || message.includes("Firestore")) {
        alert(
          "🔒 Firestore Permission Error!\n\nYour Firestore Security Rules are blocking access.\n\nQuick Fix:\n1. Go to Firebase Console → Firestore Database → Rules\n2. Update rules to allow access to 'movies' collection\n3. See FIRESTORE_RULES_FIX.md for details",
        )
      } else {
        alert("Failed to delete movie: " + message)
      }
    }
  }

  async function handleTMDBSelect(result: TMDBMovieResult) {
    // Autofill form fields from TMDB result
    setMovieName(result.title)
    setType(result.type)
    setTmdbId(result.id) // Store TMDB ID for series grouping
    if (result.posterUrl) {
      setCoverImage(result.posterUrl)
    }

    // If it's a TV series, fetch all seasons and episodes
    if (result.mediaType === "tv") {
      setSelectedTvSeriesId(result.id)
      setIsLoadingSeasons(true)
      setSelectedSeason("")
      setSelectedEpisode(null)
      setSeason("")
      setEpisode("")

      try {
        const seriesData = await getFullSeriesData(result.id)
        setFullSeriesData(seriesData)
      } catch (error: any) {
        console.error("Failed to fetch full series data:", error)
        alert(`Failed to load seasons and episodes: ${error?.message || "Unknown error"}`)
        setFullSeriesData(null)
      } finally {
        setIsLoadingSeasons(false)
      }
    } else {
      // Reset TV series data for movies
      setFullSeriesData(null)
      setSelectedTvSeriesId(null)
      setSelectedSeason("")
      setSelectedEpisode(null)

      // Optionally add year to notes if it doesn't already have content
      if (result.year && !notes.trim()) {
        setNotes(`Released: ${result.year}`)
      }
    }
  }

  function handleSeasonSelect(seasonNumber: string) {
    setSelectedSeason(seasonNumber)
    setSelectedEpisode(null)
    setEpisode("")
    setSeason(seasonNumber)
  }

  function handleEpisodeSelect(episode: FullSeriesEpisode) {
    setSelectedEpisode(episode)
    setEpisode(episode.episodeNumber.toString())

    // Autofill additional episode details
    if (episode.airDate) {
      // Set entry date to episode air date if not already set
      if (!entryDate) {
        setEntryDate(episode.airDate)
      }
    }

    // Add episode details to notes
    let noteParts: string[] = []
    if (episode.title && episode.title !== `Episode ${episode.episodeNumber}`) {
      noteParts.push(`Episode: ${episode.title}`)
    }
    if (episode.airDate) {
      noteParts.push(`Aired: ${episode.airDate}`)
    }

    if (noteParts.length > 0) {
      const episodeNote = noteParts.join(" | ")
      setNotes(episodeNote)
    }
  }

  function openEditDialog(movie: Movie) {
    setCurrentMovie(movie)
    setMovieName(movie.name)
    setEntryDate(movie.entryDate)
    setType(movie.type)
    setRating(movie.rating)
    setPlatform(movie.platform || "Netflix")
    setNotes(movie.notes || "")
    setStatus(movie.status || "Completed")
    setSeason(movie.season?.toString() || "")
    setEpisode(movie.episode?.toString() || "")
    setCoverImage(movie.coverImage || "")
    setGenreInput(movie.genres?.join(", ") || "")
    setWatchAgain(movie.watchAgain || false)
    setTmdbId(movie.tmdbId)
    setIsEditDialogOpen(true)
  }

  function handleExportCSV() {
    const headers = [
      "Name",
      "Type",
      "Platform",
      "Status",
      "Rating",
      "Date Watched",
      "Season",
      "Episode",
      "Genres",
      "Watch Again",
      "Notes",
    ]
    const rows = movies.map((movie) => [
      movie.name,
      movie.type,
      movie.platform || "",
      movie.status || "Completed",
      movie.rating.toString(),
      movie.entryDate,
      movie.season?.toString() || "",
      movie.episode?.toString() || "",
      movie.genres?.join("; ") || "",
      movie.watchAgain ? "Yes" : "No",
      (movie.notes || "").replace(/,/g, ";"),
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `movie-list-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center gap-3">
            <Tv className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Netflix Tracker</h1>
              <p className="text-sm opacity-90">Never forget what you've watched</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search movies and series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Entry</DialogTitle>
                    <DialogDescription>Track a movie or series you've watched</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Search for Movie or Series (optional)</Label>
                      <MovieAutocomplete
                        value={movieName || undefined}
                        onSelect={handleTMDBSelect}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Search TMDB to autofill title, type, and poster. Or enter manually below.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="movie-name">Title *</Label>
                        <Input
                          id="movie-name"
                          placeholder="Enter title"
                          value={movieName}
                          onChange={(e) => setMovieName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="entry-date">Date Watched *</Label>
                        <Input
                          id="entry-date"
                          type="date"
                          value={entryDate}
                          onChange={(e) => setEntryDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={(value: "Movie" | "Series") => setType(value)}>
                          <SelectTrigger id="type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Movie">Movie</SelectItem>
                            <SelectItem value="Series">Series</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="platform">Platform</Label>
                        <Select value={platform} onValueChange={setPlatform}>
                          <SelectTrigger id="platform">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Netflix">Netflix</SelectItem>
                            <SelectItem value="Prime Video">Prime Video</SelectItem>
                            <SelectItem value="Disney+">Disney+</SelectItem>
                            <SelectItem value="HBO Max">HBO Max</SelectItem>
                            <SelectItem value="Apple TV+">Apple TV+</SelectItem>
                            <SelectItem value="Hulu">Hulu</SelectItem>
                            <SelectItem value="Bluewin">Bluewin</SelectItem>
                            <SelectItem value="Serienstream">Serienstream</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={status}
                          onValueChange={(value: "Completed" | "Watching" | "Dropped" | "Watchlist") => setStatus(value)}
                        >
                          <SelectTrigger id="status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Watching">Watching</SelectItem>
                            <SelectItem value="Dropped">Dropped</SelectItem>
                            <SelectItem value="Watchlist">Watchlist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <StarRating value={rating} onChange={setRating} />
                      </div>
                    </div>

                    {type === "Series" && (
                      <div className="space-y-4">
                        {/* TMDB Season/Episode Selectors (when available) */}
                        {isLoadingSeasons && (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                            <span className="text-sm text-muted-foreground">
                              Loading seasons and episodes...
                            </span>
                          </div>
                        )}

                        {!isLoadingSeasons && fullSeriesData && fullSeriesData.seasons.length > 0 && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="tmdb-season">Season (from TMDB)</Label>
                              <Select value={selectedSeason} onValueChange={handleSeasonSelect}>
                                <SelectTrigger id="tmdb-season">
                                  <SelectValue placeholder="Select a season" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fullSeriesData.seasons.map((seasonData) => (
                                    <SelectItem
                                      key={seasonData.seasonNumber}
                                      value={seasonData.seasonNumber.toString()}
                                    >
                                      Season {seasonData.seasonNumber}
                                      {seasonData.year && ` (${seasonData.year})`}
                                      {` — ${seasonData.episodes.length} episode${seasonData.episodes.length !== 1 ? "s" : ""}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {selectedSeason && (
                              <div className="space-y-2">
                                <Label htmlFor="tmdb-episode">Episode (from TMDB)</Label>
                                <Select
                                  value={selectedEpisode?.episodeNumber.toString() || ""}
                                  onValueChange={(value) => {
                                    const seasonData = fullSeriesData?.seasons.find(
                                      (s) => s.seasonNumber.toString() === selectedSeason,
                                    )
                                    const episodeData = seasonData?.episodes.find(
                                      (e) => e.episodeNumber.toString() === value,
                                    )
                                    if (episodeData) {
                                      handleEpisodeSelect(episodeData)
                                    }
                                  }}
                                >
                                  <SelectTrigger id="tmdb-episode">
                                    <SelectValue placeholder="Select an episode" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {fullSeriesData?.seasons
                                      .find((s) => s.seasonNumber.toString() === selectedSeason)
                                      ?.episodes.map((ep) => (
                                        <SelectItem
                                          key={ep.episodeNumber}
                                          value={ep.episodeNumber.toString()}
                                        >
                                          Episode {ep.episodeNumber}: {ep.title}
                                          {ep.airDate && ` (${ep.airDate.split("-")[0]})`}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </>
                        )}

                        {/* Manual Season/Episode Input (always available as fallback) */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="season">Season (manual)</Label>
                            <Input
                              id="season"
                              type="number"
                              min="1"
                              placeholder="e.g., 1"
                              value={season}
                              onChange={(e) => setSeason(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="episode">Episode (manual)</Label>
                            <Input
                              id="episode"
                              type="number"
                              min="1"
                              placeholder="e.g., 10"
                              value={episode}
                              onChange={(e) => setEpisode(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="genres">Genres (comma separated)</Label>
                      <Input
                        id="genres"
                        placeholder="e.g., Action, Thriller, Drama"
                        value={genreInput}
                        onChange={(e) => setGenreInput(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cover-image">Cover Image URL (optional)</Label>
                      <Input
                        id="cover-image"
                        placeholder="https://..."
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Your thoughts, recommendations, etc."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="watch-again"
                        checked={watchAgain}
                        onChange={(e) => setWatchAgain(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="watch-again" className="cursor-pointer">
                        Would watch again
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddMovie}>Add Entry</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleExportCSV} disabled={movies.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Movie">Movies</SelectItem>
                <SelectItem value="Series">Series</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="Netflix">Netflix</SelectItem>
                <SelectItem value="Prime Video">Prime Video</SelectItem>
                <SelectItem value="Disney+">Disney+</SelectItem>
                <SelectItem value="HBO Max">HBO Max</SelectItem>
                <SelectItem value="Apple TV+">Apple TV+</SelectItem>
                <SelectItem value="Hulu">Hulu</SelectItem>
                <SelectItem value="Bluewin">Bluewin</SelectItem>
                <SelectItem value="Serienstream">Serienstream</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Watching">Watching</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
                <SelectItem value="Watchlist">Watchlist</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="rating-desc">Highest Rated</SelectItem>
                <SelectItem value="rating-asc">Lowest Rated</SelectItem>
                <SelectItem value="name-asc">A to Z</SelectItem>
                <SelectItem value="name-desc">Z to A</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || filterType !== "all" || filterPlatform !== "all" || filterStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setFilterType("all")
                  setFilterPlatform("all")
                  setFilterStatus("all")
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Showing {groupedItems.movies.length + groupedItems.series.size} of {movies.length}{" "}
              {movies.length === 1 ? "entry" : "entries"}
              {groupedItems.series.size > 0 && ` (${groupedItems.series.size} series grouped)`}
            </p>
          </div>
        </div>

        {/* Movie List */}
        {isLoading ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Loading movies...</p>
            </CardContent>
          </Card>
        ) : movies.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tv className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-2 font-medium">No entries yet</p>
              <p className="text-sm text-muted-foreground text-center">
                Start tracking what you watch on Netflix and other platforms!
              </p>
            </CardContent>
          </Card>
        ) : groupedItems.movies.length === 0 && groupedItems.series.size === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No entries match your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Render Series Cards (grouped) */}
            {Array.from(groupedItems.series.entries()).map(([groupKey, seriesEntries]: [number | string, Movie[]]) => {
              // Find an entry with tmdbId if available, otherwise use first entry
              const entryWithTmdb = seriesEntries.find(e => e.tmdbId) || seriesEntries[0]
              // Use entry with cover image, preferring one with tmdbId
              const representative = seriesEntries.find(e => e.coverImage && e.tmdbId) || 
                                     seriesEntries.find(e => e.coverImage) || 
                                     entryWithTmdb
              // Merge tmdbId from any entry that has it
              const seriesWithTmdb = { ...representative, tmdbId: entryWithTmdb.tmdbId }
              return (
                <div
                  key={`series-${groupKey}`}
                  data-series-tmdb-id={seriesWithTmdb.tmdbId || undefined}
                  className="transition-all duration-300"
                >
                  <SeriesCard
                    series={seriesWithTmdb}
                    allSeriesEntries={seriesEntries}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteMovie}
                    onUpdate={loadMovies}
                  />
                </div>
              )
            })}

            {/* Render Movie Cards and Series without TMDB ID */}
            {groupedItems.movies.map((movie) => (
              <Card key={movie.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {movie.coverImage && (
                  <div className="w-full h-48 overflow-hidden bg-muted">
                    <img
                      src={movie.coverImage}
                      alt={movie.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="line-clamp-2 text-balance">{movie.name}</CardTitle>
                    {movie.watchAgain && <Heart className="w-5 h-5 text-red-500 fill-red-500 shrink-0" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{movie.type}</Badge>
                    {movie.platform && <Badge variant="outline">{movie.platform}</Badge>}
                    <Badge
                      variant={
                        movie.status === "Completed"
                          ? "default"
                          : movie.status === "Watching"
                            ? "secondary"
                            : movie.status === "Dropped"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {movie.status}
                    </Badge>
                  </div>

                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.map((genre, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <StarRating value={movie.rating} />
                    {movie.rating > 0 && <span className="text-sm text-muted-foreground">({movie.rating}/5)</span>}
                  </div>

                  {movie.type === "Series" && (movie.season || movie.episode) && (
                    <p className="text-sm text-muted-foreground">
                      {movie.season && `Season ${movie.season}`}
                      {movie.season && movie.episode && " • "}
                      {movie.episode && `Episode ${movie.episode}`}
                    </p>
                  )}

                  {movie.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2 italic">&ldquo;{movie.notes}&rdquo;</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => openEditDialog(movie)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteMovie(movie.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Movie Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
              <DialogDescription>Update your movie or series details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Search for Movie or Series (optional)</Label>
                <MovieAutocomplete
                  value={movieName || undefined}
                  onSelect={handleTMDBSelect}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Search TMDB to autofill title, type, poster, and add TMDB ID for series grouping.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-movie-name">Title *</Label>
                  <Input
                    id="edit-movie-name"
                    placeholder="Enter title"
                    value={movieName}
                    onChange={(e) => setMovieName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-entry-date">Date Watched *</Label>
                  <Input
                    id="edit-entry-date"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select value={type} onValueChange={(value: "Movie" | "Series") => setType(value)}>
                    <SelectTrigger id="edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Movie">Movie</SelectItem>
                      <SelectItem value="Series">Series</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="edit-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Netflix">Netflix</SelectItem>
                      <SelectItem value="Prime Video">Prime Video</SelectItem>
                      <SelectItem value="Disney+">Disney+</SelectItem>
                      <SelectItem value="HBO Max">HBO Max</SelectItem>
                      <SelectItem value="Apple TV+">Apple TV+</SelectItem>
                      <SelectItem value="Hulu">Hulu</SelectItem>
                      <SelectItem value="Bluewin">Bluewin</SelectItem>
                      <SelectItem value="Serienstream">Serienstream</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value: "Completed" | "Watching" | "Dropped" | "Watchlist") => setStatus(value)}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Watching">Watching</SelectItem>
                      <SelectItem value="Dropped">Dropped</SelectItem>
                      <SelectItem value="Watchlist">Watchlist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
              </div>

              {type === "Series" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-season">Season</Label>
                    <Input
                      id="edit-season"
                      type="number"
                      min="1"
                      placeholder="e.g., 1"
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-episode">Episode</Label>
                    <Input
                      id="edit-episode"
                      type="number"
                      min="1"
                      placeholder="e.g., 10"
                      value={episode}
                      onChange={(e) => setEpisode(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-genres">Genres (comma separated)</Label>
                <Input
                  id="edit-genres"
                  placeholder="e.g., Action, Thriller, Drama"
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cover-image">Cover Image URL (optional)</Label>
                <Input
                  id="edit-cover-image"
                  placeholder="https://..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Your thoughts, recommendations, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-watch-again"
                  checked={watchAgain}
                  onChange={(e) => setWatchAgain(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-watch-again" className="cursor-pointer">
                  Would watch again
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMovie}>Update Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      {/* New Season Alerts */}
      <AlertContainer
        alerts={newSeasonAlerts}
        onDismiss={handleDismissAlert}
        onViewSeries={handleViewSeries}
      />

      {/* Footer */}
      <footer className="bg-muted py-6 px-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">Netflix Tracker © {new Date().getFullYear()}</p>
          <p className="text-xs text-muted-foreground mt-1">Keep track of everything you watch, never forget again</p>
        </div>
      </footer>
    </div>
  )
}
