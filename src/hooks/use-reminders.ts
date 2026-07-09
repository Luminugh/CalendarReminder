"use client"

export interface DueReminder {
  id: string
  title: string
  method: string
  sent: boolean
}

export function useReminders() {
  return {
    dueReminders: [] as DueReminder[],
    error: null as string | null,
    dismissReminder: function () {},
    dismissAll: function () {},
  }
}
