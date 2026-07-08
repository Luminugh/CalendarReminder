import { createBrowserClient } from "@supabase/ssr"

const MAX_AGE = 60 * 60 * 24 * 365

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") return []
          const cookies = document.cookie.split("; ").filter(Boolean)
          return cookies.map((c) => {
            const [name, ...rest] = c.split("=")
            return { name, value: rest.join("=") }
          })
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            document.cookie = `${name}=${value}; path=/; max-age=${MAX_AGE}; samesite=lax${options?.secure ? "; secure" : ""}`
          }
        },
      },
    }
  )
}
