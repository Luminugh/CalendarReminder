import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const MAX_AGE = 60 * 60 * 24 * 365

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, { ...options, maxAge: MAX_AGE })
          }
        },
      },
    }
  )
}
