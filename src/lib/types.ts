export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  all_day: boolean
  color: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  recurrence: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type EventFormData = {
  title: string
  description: string
  start_date: string
  end_date: string
  all_day: boolean
  color: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
}
