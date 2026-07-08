"use client"

import { useEffect, useState } from "react"
import { useReminders } from "@/hooks/use-reminders"
import { XIcon, BellIcon } from "lucide-react"

interface ToastItem {
  id: string
  title: string
  timestamp: number
}

export default function ReminderToast() {
  const { dueReminders, dismissReminder } = useReminders()
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    if (dueReminders.length === 0) return
    const id = setTimeout(() => {
      setToasts((prev) => {
        const existingIds = new Set(prev.map((t) => t.id))
        const newToasts = dueReminders
          .filter((r) => !existingIds.has(r.id))
          .map((r) => ({ id: r.id, title: r.title, timestamp: Date.now() }))
        if (newToasts.length === 0) return prev
        return [...prev, ...newToasts]
      })
    }, 0)
    return () => clearTimeout(id)
  }, [dueReminders])

  function handleDismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    dismissReminder(id)
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => (
        <ToastItemView key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  )
}

function ToastItemView({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div
      className={`glass-strong rounded-xl px-4 py-3 shadow-2xl transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3">
        <BellIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Recordatorio</p>
          <p className="text-sm text-muted-foreground truncate">{toast.title}</p>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded-md p-1 transition-colors hover:bg-white/10"
        >
          <XIcon className="size-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
