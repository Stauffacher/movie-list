"use client"

import * as React from "react"
import { Check, Film, Tv, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { searchTMDB, type TMDBMovieResult } from "@/lib/searchTMDB"
import { Badge } from "@/components/ui/badge"

interface MovieAutocompleteProps {
  value?: string
  onSelect: (result: TMDBMovieResult) => void
  disabled?: boolean
}

export function MovieAutocomplete({ value, onSelect, disabled }: MovieAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [results, setResults] = React.useState<TMDBMovieResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Debounce search
  React.useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await searchTMDB(searchQuery)
        setResults(searchResults)
        setError(null)
      } catch (err: any) {
        console.error("Error searching TMDB:", err)
        setError(err?.message || "Failed to search movies")
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  function handleSelect(result: TMDBMovieResult) {
    onSelect(result)
    setOpen(false)
    setSearchQuery("")
    setResults([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">
            {value || "Search for a movie or series..."}
          </span>
          <Film className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type at least 2 characters to search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            )}

            {error && !isLoading && (
              <CommandEmpty>
                <div className="py-6 text-center">
                  <p className="text-sm text-destructive">{error}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Check your TMDB API key in environment variables
                  </p>
                </div>
              </CommandEmpty>
            )}

            {!isLoading && !error && searchQuery.length < 2 && (
              <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
            )}

            {!isLoading && !error && searchQuery.length >= 2 && results.length === 0 && (
              <CommandEmpty>No movies or series found.</CommandEmpty>
            )}

            {!isLoading && !error && results.length > 0 && (
              <CommandGroup heading="Results">
                {results.map((result) => (
                  <CommandItem
                    key={`${result.mediaType}-${result.id}`}
                    value={`${result.title}-${result.year}`}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3 w-full">
                      {result.posterUrl ? (
                        <img
                          src={result.posterUrl}
                          alt={result.title}
                          className="h-16 w-12 object-cover rounded shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      ) : (
                        <div className="h-16 w-12 bg-muted rounded flex items-center justify-center shrink-0">
                          {result.type === "Movie" ? (
                            <Film className="h-6 w-6 text-muted-foreground" />
                          ) : (
                            <Tv className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{result.title}</span>
                          <Badge variant="secondary" className="shrink-0">
                            {result.type === "Movie" ? (
                              <Film className="h-3 w-3 mr-1" />
                            ) : (
                              <Tv className="h-3 w-3 mr-1" />
                            )}
                            {result.type}
                          </Badge>
                        </div>
                        {result.year && (
                          <p className="text-sm text-muted-foreground">{result.year}</p>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          value === result.title ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

