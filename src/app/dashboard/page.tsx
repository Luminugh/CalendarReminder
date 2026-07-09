import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/supabase/actions"
import CalendarView from "@/components/calendar-view"
import LiquidBg from "@/components/liquid-bg"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single()

  return (
    <LiquidBg>
      <header className="sticky top-0 z-20 glass border-b border-white/20 dark:border-white/10 shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="glass flex size-8 items-center justify-center rounded-lg text-xs font-bold text-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl">
              CR
            </div>
            <h1 className="text-base font-semibold tracking-tight text-glass">Calendar Reminder</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-md bg-white/10 px-2 py-0.5 text-sm text-muted-foreground backdrop-blur sm:block">
              {profile?.display_name ?? user.email}
            </span>
            <form action={signOut}>
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="glass-button text-muted-foreground hover:text-foreground text-xs"
              >
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 animate-fade-in animation-delay-100">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="glass-card p-4 sm:p-6">
            <CalendarView />
          </div>
        </div>
      </main>
    </LiquidBg>
  )
}
