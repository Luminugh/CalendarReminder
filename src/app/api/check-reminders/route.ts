import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDueReminders, markReminderSent } from "@/lib/supabase/reminder-actions"
import { sendEmail, buildReminderEmailHtml } from "@/lib/email"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const reminders = await getDueReminders()
    const userReminders = reminders.filter((r) => r.user_id === user.id)

    const results: Array<{ id: string; title: string; method: string; sent: boolean }> = []

    for (const reminder of userReminders) {
      try {
        if (reminder.method === "email" || reminder.method === "both") {
          const { data: userData } = await supabase.auth.admin.getUserById(user.id)
          const email = userData?.user?.email
          if (email) {
            await sendEmail({
              to: email,
              subject: `⏰ Recordatorio: ${reminder.events.title}`,
              html: buildReminderEmailHtml({
                title: reminder.events.title,
                startDate: reminder.events.start_date,
                minutesBefore: 0,
              }),
            })
          }
        }

        if (reminder.method === "notification" || reminder.method === "both") {
          await markReminderSent(reminder.id)
        }

        await markReminderSent(reminder.id)

        results.push({
          id: reminder.id,
          title: reminder.events.title,
          method: reminder.method,
          sent: true,
        })
      } catch (err) {
        console.error("Error processing reminder:", err)
        results.push({
          id: reminder.id,
          title: reminder.events.title,
          method: reminder.method,
          sent: false,
        })
      }
    }

    return NextResponse.json({ reminders: results })
  } catch (err) {
    console.error("Error in check-reminders:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
