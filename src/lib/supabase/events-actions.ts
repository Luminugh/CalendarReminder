"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"
import type { EventFormData } from "@/lib/types"

export async function createEvent(data: EventFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
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

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateEvent(id: string, data: EventFormData) {
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

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}
