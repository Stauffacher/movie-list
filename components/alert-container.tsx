"use client"

import { useEffect, useState } from "react"
import { NewSeasonAlertCard } from "./new-season-alert"
import type { NewSeasonAlert } from "@/lib/season-checker"
import { getDismissedAlerts } from "@/lib/season-tracker"

interface AlertContainerProps {
  alerts: NewSeasonAlert[]
  onDismiss: (alertId: string) => void
  onViewSeries?: (tmdbId: number) => void
}

export function AlertContainer({ alerts, onDismiss, onViewSeries }: AlertContainerProps) {
  const [visibleAlerts, setVisibleAlerts] = useState<NewSeasonAlert[]>([])

  useEffect(() => {
    // Filter out dismissed alerts
    const dismissed = getDismissedAlerts()
    const filtered = alerts.filter((alert) => !dismissed.has(alert.id))
    setVisibleAlerts(filtered)
  }, [alerts])

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {visibleAlerts.map((alert) => (
        <div key={alert.id} className="pointer-events-auto">
          <NewSeasonAlertCard
            alert={alert}
            onDismiss={onDismiss}
            onViewSeries={onViewSeries}
          />
        </div>
      ))}
    </div>
  )
}

