export interface Movie {
  id: string
  name: string
  entryDate: string
  type: "Movie" | "Series"
  rating: number
  createdAt?: Date
  updatedAt?: Date
}

export interface MovieFormData {
  name: string
  entryDate: string
  type: "Movie" | "Series"
  rating: number
}

