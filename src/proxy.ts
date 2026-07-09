import { updateSession } from "@/lib/supabase/middleware"
import { type NextRequest } from "next/server"

async function handler(request: NextRequest) {
  return await updateSession(request)
}

export const proxy = handler
export default handler

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
