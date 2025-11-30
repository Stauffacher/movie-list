"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2, Star, Heart, Loader2 } from "lucide-react"
import { getTvSeasons, getTvDetails, type SeriesSeasonInfo, type TMDBTvDetails } from "@/lib/tmdb"
import { getAllSeenSeasons, setSeasonSeen } from "@/lib/episodes-api"
import type { Movie } from "@/lib/movie-types"

interface SeriesCardProps {
  series: Movie
  onEdit: (movie: Movie) => void
  onDelete: (id: string) => void
  allSeriesEntries: Movie[] // All entries for this series (for metadata)
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

export function SeriesCard({ series, onEdit, onDelete, allSeriesEntries }: SeriesCardProps) {
  const [seasons, setSeasons] = useState<SeriesSeasonInfo[]>([])
  const [tvDetails, setTvDetails] = useState<TMDBTvDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [seenSeasons, setSeenSeasons] = useState<Map<number, boolean>>(new Map())
  const [isUpdating, setIsUpdating] = useState(false)

  const tmdbId = series.tmdbId

  // Get aggregated metadata from all entries
  const aggregatedData = useMemo(() => {
    const platforms = new Set<string>()
    const statuses = new Set<string>()
    let maxRating = 0
    let hasWatchAgain = false
    const genres = new Set<string>()

    allSeriesEntries.forEach((entry) => {
      if (entry.platform) platforms.add(entry.platform)
      if (entry.status) statuses.add(entry.status)
      if (entry.rating > maxRating) maxRating = entry.rating
      if (entry.watchAgain) hasWatchAgain = true
      entry.genres?.forEach((g) => genres.add(g))
    })

    return {
      platforms: Array.from(platforms),
      statuses: Array.from(statuses),
      maxRating,
      hasWatchAgain,
      genres: Array.from(genres),
    }
  }, [allSeriesEntries])

  // Load series data and seasons from TMDB
  useEffect(() => {
    if (!tmdbId) {
      setIsLoading(false)
      return
    }

    async function loadSeriesData() {
      if (!tmdbId) return
      
      const seriesId = tmdbId as number
      try {
        setIsLoading(true)
        // Fetch TV details and seasons in parallel
        const [details, seasonsData] = await Promise.all([
          getTvDetails(seriesId),
          getTvSeasons(seriesId),
        ])
        setTvDetails(details)
        setSeasons(seasonsData)
      } catch (error) {
        console.error("Failed to load series data:", error)
        setSeasons([]) // Ensure seasons is set even on error
        setTvDetails(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadSeriesData()
  }, [tmdbId])

  // Load seen seasons from Firestore
  useEffect(() => {
    if (!tmdbId) return

    async function loadSeenSeasons() {
      // tmdbId is already checked above, so it's safe to use non-null assertion
      try {
        const seen = await getAllSeenSeasons(tmdbId!)
        setSeenSeasons(seen)
      } catch (error) {
        console.error("Failed to load seen seasons:", error)
      }
    }

    loadSeenSeasons()
  }, [tmdbId])

  // Calculate progress based on seasons
  const progress = useMemo(() => {
    if (seasons.length === 0) return { watched: 0, total: 0, percentage: 0 }

    const total = seasons.length
    let watched = 0

    seasons.forEach((season) => {
      if (seenSeasons.get(season.seasonNumber)) {
        watched++
      }
    })

    return {
      watched,
      total,
      percentage: total > 0 ? Math.round((watched / total) * 100) : 0,
    }
  }, [seasons, seenSeasons])

  // Build entries list when no TMDB data - show all entries individually (not deduplicated)
  const entriesForDisplay = useMemo(() => {
    // If we have TMDB data (tvDetails), don't use entries-based display
    if (tvDetails) return []

    // Sort entries by season number (entries without season go to the end)
    return [...allSeriesEntries].sort((a, b) => {
      if (a.season && b.season) return a.season - b.season
      if (a.season && !b.season) return -1
      if (!a.season && b.season) return 1
      return new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    })
  }, [tvDetails, allSeriesEntries])

  async function handleSeasonToggle(seasonNumber: number, currentSeen: boolean) {
    if (!tmdbId || isUpdating) return

    try {
      setIsUpdating(true)
      const newSeen = !currentSeen

      // Optimistically update UI
      const newSeenSeasons = new Map(seenSeasons)
      newSeenSeasons.set(seasonNumber, newSeen)
      setSeenSeasons(new Map(newSeenSeasons))

      // Update Firestore
      await setSeasonSeen(tmdbId!, seasonNumber, newSeen)
    } catch (error) {
      console.error("Failed to update season:", error)
      // Revert optimistic update on error
      const newSeenSeasons = new Map(seenSeasons)
      newSeenSeasons.set(seasonNumber, currentSeen)
      setSeenSeasons(new Map(newSeenSeasons))
      alert("Failed to update season. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  function isSeasonSeen(seasonNumber: number): boolean {
    return seenSeasons.get(seasonNumber) === true
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading series data...</span>
        </CardContent>
      </Card>
    )
  }

  if (!tvDetails && entriesForDisplay.length === 0) {
    // Fallback to simple card if no TMDB data and no entries
    return (
      <Card className="hover:shadow-lg transition-shadow">
        {series.coverImage && (
          <div className="w-full h-48 overflow-hidden bg-muted">
            <img
              src={series.coverImage}
              alt={series.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{series.name}</CardTitle>
          <CardDescription>Series ({allSeriesEntries.length} entries)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(series)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(series.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {series.coverImage && (
        <div className="w-full h-48 overflow-hidden bg-muted">
          <img
            src={series.coverImage}
            alt={tvDetails?.name || series.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="line-clamp-2 text-balance">{tvDetails?.name || series.name}</CardTitle>
          {aggregatedData.hasWatchAgain && <Heart className="w-5 h-5 text-red-500 fill-red-500 shrink-0" />}
        </div>
        <CardDescription>
          {tvDetails
            ? `${seasons.length} season${seasons.length !== 1 ? "s" : ""} available • ${tvDetails.number_of_episodes} total episodes`
            : `${allSeriesEntries.length} tracked ${allSeriesEntries.length === 1 ? "entry" : "entries"} • Add TMDB ID to see all seasons`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar - Only show if we have TMDB data */}
        {tvDetails && seasons.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Watched {progress.watched} / {progress.total} season{progress.total !== 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground">{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Series</Badge>
          {aggregatedData.platforms.map((platform) => (
            <Badge key={platform} variant="outline">
              {platform}
            </Badge>
          ))}
          {aggregatedData.statuses.map((status) => (
            <Badge
              key={status}
              variant={
                status === "Completed"
                  ? "default"
                  : status === "Watching"
                    ? "secondary"
                    : "destructive"
              }
            >
              {status}
            </Badge>
          ))}
        </div>

        {/* Genres */}
        {aggregatedData.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {aggregatedData.genres.map((genre, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        )}

        {/* Rating */}
        {aggregatedData.maxRating > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={aggregatedData.maxRating} />
            <span className="text-sm text-muted-foreground">({aggregatedData.maxRating}/5)</span>
          </div>
        )}

        {/* Seasons List with Checkboxes - Shows ALL seasons automatically */}
        {seasons.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              All Seasons ({seasons.length})
            </div>
            <div className="flex flex-col gap-3">
              {seasons.map((season) => {
                const isSeen = isSeasonSeen(season.seasonNumber)
                return (
                  <div
                    key={season.seasonNumber}
                    className="flex items-center gap-4 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`season-${season.seasonNumber}`}
                      checked={isSeen}
                      onCheckedChange={() => handleSeasonToggle(season.seasonNumber, isSeen)}
                      disabled={isUpdating || !tmdbId}
                    />
                    <label
                      htmlFor={`season-${season.seasonNumber}`}
                      className="flex-1 cursor-pointer text-sm font-medium"
                    >
                      Season {season.seasonNumber}
                      {season.year && (
                        <span className="text-muted-foreground font-normal"> ({season.year})</span>
                      )}
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        

        {/* Show all entries when no TMDB data */}
        {!tvDetails && entriesForDisplay.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-col gap-3">
              {entriesForDisplay.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-md border text-sm"
                >
                  <span className="font-medium">
                    {entry.season ? `Season ${entry.season}` : "No season specified"}
                    {entry.episode && ` • Episode ${entry.episode}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.entryDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(series)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" className="flex-1" onClick={() => onDelete(series.id)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

