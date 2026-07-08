import { NextResponse } from "next/server"

export async function GET() {
  const manifest = {
    name: "Calendar Reminder",
    short_name: "Calendar RM",
    description: "Calendario inteligente con recordatorios",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    categories: ["productivity", "utilities"],
    lang: "es",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  })
}
