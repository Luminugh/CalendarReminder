"use client"

import { useEffect, useState } from "react"

const ORBS = [
  { size: 280, x: "15%", y: "10%", delay: "0s", duration: 6 },
  { size: 200, x: "75%", y: "20%", delay: "1s", duration: 8 },
  { size: 160, x: "60%", y: "70%", delay: "2s", duration: 7 },
  { size: 240, x: "10%", y: "60%", delay: "0.5s", duration: 9 },
  { size: 120, x: "85%", y: "75%", delay: "1.5s", duration: 5 },
]

interface CursorPos {
  x: number
  y: number
}

export default function LiquidBg({ children }: { children: React.ReactNode }) {
  const [cursor, setCursor] = useState<CursorPos>({ x: 0.5, y: 0.5 })

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      setCursor({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    }
    window.addEventListener("mousemove", handleMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])

  return (
    <div
      className="relative min-h-screen overflow-hidden liquid-bg"
      style={{
        "--mouse-x": cursor.x,
        "--mouse-y": cursor.y,
      } as React.CSSProperties}
    >
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="liquid-glass-decor animate-float"
          style={{
            width: orb.size,
            height: orb.size,
            left: `calc(${orb.x} + ${(cursor.x - 0.5) * (i + 1) * -15}px)`,
            top: `calc(${orb.y} + ${(cursor.y - 0.5) * (i + 1) * -15}px)`,
            animationDelay: orb.delay,
            animationDuration: `${orb.duration}s`,
            transition: "left 0.8s ease-out, top 0.8s ease-out",
          }}
        />
      ))}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
