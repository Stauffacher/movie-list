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
        name: data.name,
        entryDate: data.entryDate,
        type: data.type,
        rating: data.rating,
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

    const newMovie = {
      ...movieData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    const docRef = await addDoc(moviesRef, newMovie)

    return {
      id: docRef.id,
      ...movieData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error: any) {
    console.error("Error creating movie:", error)
    if (error?.code === "permission-denied") {
      throw new Error(
        "Firestore permission denied. Please update your Firestore Security Rules to allow read/write access to the 'movies' collection. See FIRESTORE_RULES.md for instructions.",
      )
    }
    throw new Error("Failed to create movie")
  }
}

export async function updateMovie(id: string, movieData: MovieFormData): Promise<void> {
  try {
    const db = getFirebaseDb()
    const movieRef = doc(db, MOVIES_COLLECTION, id)

    await updateDoc(movieRef, {
      ...movieData,
      updatedAt: Timestamp.now(),
    })
  } catch (error: any) {
    console.error("Error updating movie:", error)
    if (error?.code === "permission-denied") {
      throw new Error(
        "Firestore permission denied. Please update your Firestore Security Rules to allow read/write access to the 'movies' collection. See FIRESTORE_RULES.md for instructions.",
      )
    }
    throw new Error("Failed to update movie")
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

