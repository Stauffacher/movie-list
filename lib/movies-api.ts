"use client"

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { getFirebaseDb } from "./firebase-client"
import type { Movie, MovieFormData } from "./movie-types"

const MOVIES_COLLECTION = "movies"

function removeUndefinedFields(obj: any): any {
  const cleaned: any = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key]
    }
  }
  return cleaned
}

export async function getMovies(): Promise<Movie[]> {
  try {
    const db = getFirebaseDb()
    const moviesRef = collection(db, MOVIES_COLLECTION)
    const q = query(moviesRef, orderBy("entryDate", "desc"))
    const querySnapshot = await getDocs(q)

    const movies: Movie[] = []
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data()
      movies.push({
        id: docSnapshot.id,
        name: data.name || "",
        entryDate: data.entryDate || "",
        type: data.type || "Movie",
        rating: data.rating || 0,
        platform: data.platform || "",
        notes: data.notes || "",
        status: data.status || "Completed",
        season: data.season,
        episode: data.episode,
        coverImage: data.coverImage,
        genres: data.genres || [],
        watchAgain: data.watchAgain || false,
        tmdbId: data.tmdbId,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      })
    })

    return movies
  } catch (error: any) {
    console.error("Error fetching movies:", error)
    if (error?.code === "permission-denied") {
      throw new Error(
        "Firestore permission denied. Please update your Firestore Security Rules to allow read/write access to the 'movies' collection. See FIRESTORE_RULES.md for instructions.",
      )
    }
    throw new Error("Failed to fetch movies")
  }
}

export async function createMovie(movieData: MovieFormData): Promise<Movie> {
  try {
    const db = getFirebaseDb()
    const moviesRef = collection(db, MOVIES_COLLECTION)

    // Prepare movie data - Firestore doesn't accept undefined values
    const newMovieData: any = {
      name: movieData.name,
      entryDate: movieData.entryDate,
      type: movieData.type,
      rating: movieData.rating,
      platform: movieData.platform || "",
      notes: movieData.notes || "",
      status: movieData.status,
      genres: movieData.genres || [],
      watchAgain: movieData.watchAgain || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    // Only add optional fields if they have values
    if (movieData.season !== undefined && movieData.season !== null) {
      newMovieData.season = movieData.season
    }
    if (movieData.episode !== undefined && movieData.episode !== null) {
      newMovieData.episode = movieData.episode
    }
    if (movieData.coverImage && movieData.coverImage.trim()) {
      newMovieData.coverImage = movieData.coverImage.trim()
    }
    if (movieData.tmdbId !== undefined && movieData.tmdbId !== null) {
      newMovieData.tmdbId = movieData.tmdbId
    }

    // Remove any undefined values before sending to Firestore
    const newMovie = removeUndefinedFields(newMovieData)

    const docRef = await addDoc(moviesRef, newMovie)

    return {
      id: docRef.id,
      ...movieData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error: any) {
    console.error("Error creating movie:", error)
    console.error("Error code:", error?.code)
    console.error("Error message:", error?.message)
    
    if (error?.code === "permission-denied") {
      throw new Error(
        "Firestore permission denied. Please update your Firestore Security Rules to allow read/write access to the 'movies' collection. See FIRESTORE_RULES_FIX.md for instructions.",
      )
    }
    
    // Include the actual error message for debugging
    const errorMessage = error?.message || "Unknown error"
    throw new Error(`Failed to create movie: ${errorMessage}`)
  }
}

export async function updateMovie(id: string, movieData: MovieFormData): Promise<void> {
  try {
    const db = getFirebaseDb()
    const movieRef = doc(db, MOVIES_COLLECTION, id)

    // Prepare update data - Firestore doesn't accept undefined values
    const updateDataRaw: any = {
      name: movieData.name,
      entryDate: movieData.entryDate,
      type: movieData.type,
      rating: movieData.rating,
      platform: movieData.platform || "",
      notes: movieData.notes || "",
      status: movieData.status,
      genres: movieData.genres || [],
      watchAgain: movieData.watchAgain || false,
      updatedAt: Timestamp.now(),
    }

    // Only add optional fields if they have values
    if (movieData.season !== undefined && movieData.season !== null) {
      updateDataRaw.season = movieData.season
    }
    if (movieData.episode !== undefined && movieData.episode !== null) {
      updateDataRaw.episode = movieData.episode
    }
    if (movieData.coverImage && movieData.coverImage.trim()) {
      updateDataRaw.coverImage = movieData.coverImage.trim()
    }
    if (movieData.tmdbId !== undefined && movieData.tmdbId !== null) {
      updateDataRaw.tmdbId = movieData.tmdbId
    }

    // Remove any undefined values before sending to Firestore
    const updateData = removeUndefinedFields(updateDataRaw)

    await updateDoc(movieRef, updateData)
  } catch (error: any) {
    console.error("Error updating movie:", error)
    console.error("Error code:", error?.code)
    console.error("Error message:", error?.message)
    
    if (error?.code === "permission-denied") {
      throw new Error(
        "Firestore permission denied. Please update your Firestore Security Rules to allow read/write access to the 'movies' collection. See FIRESTORE_RULES_FIX.md for instructions.",
      )
    }
    
    const errorMessage = error?.message || "Unknown error"
    throw new Error(`Failed to update movie: ${errorMessage}`)
  }
}

export async function deleteMovie(id: string): Promise<void> {
  try {
    const db = getFirebaseDb()
    const movieRef = doc(db, MOVIES_COLLECTION, id)
    await deleteDoc(movieRef)
  } catch (error: any) {
    console.error("Error deleting movie:", error)
    if (error?.code === "permission-denied") {
      throw new Error(
        "Firestore permission denied. Please update your Firestore Security Rules to allow read/write access to the 'movies' collection. See FIRESTORE_RULES.md for instructions.",
      )
    }
    throw new Error("Failed to delete movie")
  }
}

