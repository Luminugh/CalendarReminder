"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"
import type { EventFormData } from "@/lib/types"
import type { ReminderTime, ReminderMethod } from "./reminder-actions"
import { createReminder, deleteRemindersForEvent } from "./reminder-actions"

interface ReminderInput {
  time: ReminderTime | "none"
  method: ReminderMethod
}

export async function createEvent(data: EventFormData & { reminder?: ReminderInput | null }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      start_date: data.start_date,
      end_date: data.end_date,
      all_day: data.all_day,
      color: data.color || "#3b82f6",
      category: data.category || "default",
      priority: data.priority || "medium",
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  if (data.reminder && data.reminder.time !== "none") {
    await createReminder(
      event.id,
      user.id,
      data.start_date,
      { time: data.reminder.time, method: data.reminder.method }
    )
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateEvent(id: string, data: EventFormData & { reminder?: ReminderInput | null }) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("events")
    .update({
      title: data.title,
      description: data.description || null,
      start_date: data.start_date,
      end_date: data.end_date,
      all_day: data.all_day,
      color: data.color || "#3b82f6",
      category: data.category || "default",
      priority: data.priority || "medium",
    })
    .eq("id", id)
    .select("start_date, user_id")
    .single()

  if (error) {
    return { error: error.message }
  }

  if (data.reminder) {
    if (data.reminder.time === "none") {
      await deleteRemindersForEvent(id)
    } else {
      await deleteRemindersForEvent(id)
      const { data: evt } = await supabase
        .from("events")
        .select("start_date, user_id")
        .eq("id", id)
        .single()
      if (evt) {
        await createReminder(
          id,
          evt.user_id,
          evt.start_date,
          { time: data.reminder.time, method: data.reminder.method }
        )
      }
    }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()

  await deleteRemindersForEvent(id)

  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}
