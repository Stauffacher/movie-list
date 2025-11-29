"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Trash2, Edit2, Plus, Star, Film } from "lucide-react"
import { getMovies, createMovie, updateMovie, deleteMovie } from "@/lib/movies-api"
import type { Movie, MovieFormData } from "@/lib/movie-types"

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

  useEffect(() => {
    loadMovies()
  }, [])

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
  }

  async function handleAddMovie() {
    if (!movieName.trim() || !entryDate) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const movieData: MovieFormData = {
        name: movieName.trim(),
        entryDate,
        type,
        rating,
      }

      await createMovie(movieData)
      resetForm()
      setIsAddDialogOpen(false)
      await loadMovies()
    } catch (error: any) {
      console.error("Failed to create movie:", error)
      const message = error?.message || "Failed to create movie"
      if (message.includes("permission") || message.includes("Firestore")) {
        alert(
          "🔒 Firestore Permission Error!\n\nYour Firestore Security Rules are blocking access.\n\nQuick Fix:\n1. Go to Firebase Console → Firestore Database → Rules\n2. Update rules to allow access to 'movies' collection\n3. See FIRESTORE_RULES_FIX.md for details\n\n" +
            message,
        )
      } else {
        alert("Failed to create movie: " + message)
      }
    }
  }

  async function handleUpdateMovie() {
    if (!currentMovie || !movieName.trim() || !entryDate) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const movieData: MovieFormData = {
        name: movieName.trim(),
        entryDate,
        type,
        rating,
      }

      await updateMovie(currentMovie.id, movieData)
      resetForm()
      setCurrentMovie(null)
      setIsEditDialogOpen(false)
      await loadMovies()
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

  function openEditDialog(movie: Movie) {
    setCurrentMovie(movie)
    setMovieName(movie.name)
    setEntryDate(movie.entryDate)
    setType(movie.type)
    setRating(movie.rating)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Movie List</h1>
              <p className="text-sm opacity-90">Manage your movie collection</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Movie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Movie</DialogTitle>
                <DialogDescription>Create a new movie entry in your collection</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="movie-name">Title *</Label>
                  <Input
                    id="movie-name"
                    placeholder="Enter movie title"
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
                  <Label>Rating</Label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMovie}>Add Movie</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <Film className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-2 font-medium">No movies yet</p>
              <p className="text-sm text-muted-foreground text-center">Start by adding your first movie!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {movies.map((movie) => (
              <Card key={movie.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{movie.name}</CardTitle>
                  <CardDescription>
                    Watched:{" "}
                    {new Date(movie.entryDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{movie.type}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <StarRating value={movie.rating} />
                    {movie.rating > 0 && <span className="text-sm text-muted-foreground">({movie.rating}/5)</span>}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(movie)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDeleteMovie(movie.id)}>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Movie</DialogTitle>
              <DialogDescription>Update your movie details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-movie-name">Title *</Label>
                <Input
                  id="edit-movie-name"
                  placeholder="Enter movie title"
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
                <Label>Rating</Label>
                <StarRating value={rating} onChange={setRating} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMovie}>Update Movie</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6 px-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">Movie List © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
