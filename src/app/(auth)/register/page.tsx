"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/lib/supabase/actions"
import LiquidBg from "@/components/liquid-bg"

export default function RegisterPage() {
  async function signUpAction(_prev: unknown, formData: FormData) {
    return signUp(formData)
  }

  const [state, action, pending] = useActionState(signUpAction, null)

  return (
    <LiquidBg>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="glass-card p-8 sm:p-10">
            <div className="mb-6 text-center">
              <div className="glass mx-auto mb-3 flex size-12 items-center justify-center rounded-xl text-sm font-bold text-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                CR
              </div>
              <h1 className="text-xl font-semibold text-glass">Crear cuenta</h1>
              <p className="mt-1 text-sm text-muted-foreground">Ingresa tu correo y contraseña para empezar</p>
            </div>

            <form action={action} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-glass text-sm font-medium">Correo electrónico</Label>
                <Input id="email" name="email" type="email" placeholder="tu@correo.com" required className="glass-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-glass text-sm font-medium">Contraseña</Label>
                <Input id="password" name="password" type="password" required className="glass-input" />
              </div>
              {state?.error && (
                <p className="animate-slide-down rounded-lg bg-destructive/15 backdrop-blur-sm p-3 text-sm text-destructive border border-destructive/20">{state.error}</p>
              )}
              {state?.success && (
                <p className="animate-slide-down rounded-lg bg-green-500/10 backdrop-blur-sm p-3 text-sm text-green-600 dark:text-green-400 border border-green-500/20">{state.success}</p>
              )}
              <Button type="submit" className="w-full glass-button text-foreground hover:text-foreground" disabled={pending}>
                {pending ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline transition-all">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </LiquidBg>
  )
}
