"use client"

import { X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { NewSeasonAlert } from "@/lib/season-checker"
import { dismissAlert } from "@/lib/season-tracker"

interface NewSeasonAlertProps {
  alert: NewSeasonAlert
  onDismiss: (alertId: string) => void
  onViewSeries?: (tmdbId: number) => void
}

export function NewSeasonAlertCard({ alert, onDismiss, onViewSeries }: NewSeasonAlertProps) {
  function handleDismiss() {
    dismissAlert(alert.id)
    onDismiss(alert.id)
  }

  function handleViewSeries() {
    if (onViewSeries) {
      onViewSeries(alert.tmdbId)
    }
    handleDismiss()
  }

  return (
    <Card className="w-full max-w-sm shadow-lg border-primary/20 animate-in slide-in-from-top-5">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {alert.coverImage && (
            <div className="w-16 h-24 shrink-0 rounded-md overflow-hidden bg-muted">
              <img
                src={alert.coverImage}
                alt={alert.seriesName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm line-clamp-2">{alert.seriesName}</h4>
                <Badge variant="default" className="mt-1">
                  Season {alert.newSeasonNumber} Available!
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={handleDismiss}
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleViewSeries}
              >
                View Series
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleDismiss}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

