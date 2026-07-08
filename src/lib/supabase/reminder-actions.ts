"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"
import { sendEmail, buildReminderEmailHtml } from "@/lib/email"

export type ReminderTime = "at_event" | "15min" | "30min" | "1h" | "2h" | "1d" | "custom"
export type ReminderMethod = "notification" | "email" | "both"

export interface ReminderConfig {
  time: ReminderTime
  method: ReminderMethod
}

const TIME_OFFSETS: Record<ReminderTime, number | null> = {
  at_event: 0,
  "15min": 15,
  "30min": 30,
  "1h": 60,
  "2h": 120,
  "1d": 1440,
  custom: null,
}

function computeRemindAt(startDate: string, time: ReminderTime, customMinutes?: number): Date {
  const start = new Date(startDate)
  const offset = time === "custom" ? (customMinutes ?? 0) : (TIME_OFFSETS[time] ?? 0)
  return new Date(start.getTime() - offset * 60 * 1000)
}

export async function createReminder(
  eventId: string,
  userId: string,
  startDate: string,
  config: ReminderConfig
) {
  const supabase = await createClient()
  const remindAt = computeRemindAt(startDate, config.time)

  const { error } = await supabase.from("reminders").insert({
    event_id: eventId,
    user_id: userId,
    remind_at: remindAt.toISOString(),
    method: config.method,
    sent: false,
  })

  if (error) {
    console.error("Error creating reminder:", error)
  }
}

export async function getRemindersForEvent(eventId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reminders")
    .select("*")
    .eq("event_id", eventId)
    .order("remind_at", { ascending: true })

  return data ?? []
}

export async function getDueReminders() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data } = await supabase
    .from("reminders")
    .select("*, events!inner(title, start_date, end_date, user_id)")
    .eq("sent", false)
    .lte("remind_at", now)

  return data ?? []
}

export async function markReminderSent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("reminders")
    .update({ sent: true })
    .eq("id", id)

  if (error) {
    console.error("Error marking reminder as sent:", error)
  }
}

export async function deleteRemindersForEvent(eventId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("event_id", eventId)

  if (error) {
    console.error("Error deleting reminders:", error)
  }
}

export async function processDueReminders() {
  const reminders = await getDueReminders()

  for (const reminder of reminders) {
    try {
      if (reminder.method === "email" || reminder.method === "both") {
        const email = await getEmailForUser(reminder.user_id)
        if (email) {
          const result = await sendEmail({
            to: email,
            subject: `⏰ Recordatorio: ${reminder.events.title}`,
            html: buildReminderEmailHtml({
              title: reminder.events.title,
              startDate: reminder.events.start_date,
              minutesBefore: 0,
            }),
          })
          if (result.error) {
            console.error("Failed to send reminder email:", result.error)
          }
        }
      }

      if (reminder.method === "notification" || reminder.method === "both") {
        await markReminderSent(reminder.id)
      }

      await markReminderSent(reminder.id)
    } catch (err) {
      console.error("Error processing reminder:", err)
    }
  }

  return reminders
}

async function getEmailForUser(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.auth.admin.getUserById(userId)
  return data?.user?.email ?? null
}

export async function updateReminderMethod(eventId: string, config: ReminderConfig) {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from("events")
    .select("start_date, user_id")
    .eq("id", eventId)
    .single()

  if (!events) return

  await deleteRemindersForEvent(eventId)
  await createReminder(eventId, events.user_id, events.start_date, config)
  revalidatePath("/dashboard")
}
