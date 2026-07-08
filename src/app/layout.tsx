import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import PWARegister from "@/components/pwa-register"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Calendar Reminder",
  description: "Calendario inteligente con recordatorios",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Calendar Reminder",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [
      { url: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "application-name": "Calendar Reminder",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <svg aria-hidden="true" className="absolute -z-50 size-0 overflow-hidden">
          <filter id="liquid-glass">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="2" result="blurred" />
            <feComposite in="blurred" in2="SourceGraphic" operator="in" />
          </filter>
          <filter id="glass-shine">
            <feSpecularLighting in="blurred" specularExponent="30" lightingColor="white" result="specular">
              <fePointLight x="0" y="0" z="200" />
            </feSpecularLighting>
            <feComposite in="specular" in2="SourceGraphic" operator="in" result="shine" />
            <feComposite in="SourceGraphic" in2="shine" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" />
          </filter>
        </svg>
        {children}
        <PWARegister />
      </body>
    </html>
  )
}
