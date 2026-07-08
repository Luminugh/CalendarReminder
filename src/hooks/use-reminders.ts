"use client"

import { useEffect, useState, useCallback } from "react"

export interface DueReminder {
  id: string
  title: string
  method: string
  sent: boolean
}

const POLL_INTERVAL = 60_000

export function useReminders() {
  const [dueReminders, setDueReminders] = useState<DueReminder[]>([])
  const [error, setError] = useState<string | null>(null)

  const checkReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/check-reminders")
      if (!res.ok) {
        if (res.status === 401) return
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data.reminders?.length > 0) {
        setDueReminders((prev) => [...prev, ...data.reminders])
      }
    } catch (err) {
      setError(String(err))
    }
  }, [])

  useEffect(() => {
    const initId = setTimeout(checkReminders, 0)
    const interval = setInterval(checkReminders, POLL_INTERVAL)
    return () => { clearTimeout(initId); clearInterval(interval) }
  }, [checkReminders])

  const dismissReminder = useCallback((id: string) => {
    setDueReminders((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setDueReminders([])
  }, [])

  return { dueReminders, error, dismissReminder, dismissAll }
}
