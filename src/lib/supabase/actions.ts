"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "./server"

export async function signUp(
  formData: FormData
): Promise<{ error: string; success?: never } | { success: string; error?: never }> {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: "Revisa tu correo para confirmar tu cuenta." }
}

export async function signIn(
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function signInWithMagicLink(
  formData: FormData
): Promise<{ error: string; success?: never } | { success: string; error?: never }> {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const origin = (formData.get("origin") as string) ?? "http://localhost:3000"

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Revisa tu correo para el enlace mágico." }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/")
  redirect("/login")
}
