"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import LiquidBg from "@/components/liquid-bg"

function LoginForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [magicEmail, setMagicEmail] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [magicState, setMagicState] = useState<{ success?: string; error?: string } | null>(null)
  const [passwordPending, setPasswordPending] = useState(false)
  const [magicPending, setMagicPending] = useState(false)

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError("")
    setPasswordPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setPasswordPending(false)
    if (error) {
      setPasswordError(error.message)
      return
    }
    router.push("/dashboard")
  }

  async function handleMagicLinkSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMagicState(null)
    setMagicPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })
    setMagicPending(false)
    if (error) {
      setMagicState({ error: error.message })
      return
    }
    setMagicState({ success: "Revisa tu correo para el enlace mágico." })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="glass-card p-8 sm:p-10">
          <div className="mb-6 text-center">
            <div className="glass mx-auto mb-3 flex size-12 items-center justify-center rounded-xl text-sm font-bold text-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              CR
            </div>
            <h1 className="text-xl font-semibold text-glass">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-muted-foreground">Elige tu método de acceso</p>
          </div>

          <div className="space-y-6">
            {errorParam && (
              <p className="animate-slide-down rounded-lg bg-destructive/15 backdrop-blur-sm p-3 text-sm text-destructive border border-destructive/20">{errorParam}</p>
            )}
            {magicState?.success && (
              <p className="animate-slide-down rounded-lg bg-green-500/10 backdrop-blur-sm p-3 text-sm text-green-600 dark:text-green-400 border border-green-500/20">{magicState.success}</p>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-glass text-sm font-medium">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="tu@correo.com" required className="glass-input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-glass text-sm font-medium">Contraseña</Label>
                <Input id="password" type="password" required className="glass-input" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {passwordError && (
                <p className="rounded-lg bg-destructive/15 backdrop-blur-sm p-3 text-sm text-destructive border border-destructive/20">{passwordError}</p>
              )}
              <Button type="submit" className="w-full glass-button text-foreground hover:text-foreground" disabled={passwordPending}>
                {passwordPending ? "Ingresando..." : "Iniciar sesión"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10 dark:border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-muted-foreground">O</span>
              </div>
            </div>

            <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email" className="text-glass text-sm font-medium">Correo electrónico</Label>
                <Input id="magic-email" type="email" placeholder="tu@correo.com" required className="glass-input" value={magicEmail} onChange={(e) => setMagicEmail(e.target.value)} />
              </div>
              {magicState?.error && (
                <p className="text-sm text-destructive">{magicState.error}</p>
              )}
              <Button type="submit" variant="outline" className="w-full glass-button text-foreground hover:text-foreground" disabled={magicPending}>
                {magicPending ? "Enviando enlace..." : "Enviar enlace mágico"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline transition-all">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <LiquidBg>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="glass-card p-6 text-sm text-muted-foreground animate-pulse">Cargando...</div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </LiquidBg>
  )
}
