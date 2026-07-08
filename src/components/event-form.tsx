"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createEvent, updateEvent, deleteEvent } from "@/lib/supabase/events-actions"
import type { EventFormData, CalendarEvent } from "@/lib/types"
import type { ReminderTime, ReminderMethod } from "@/lib/supabase/reminder-actions"

interface EventFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventSaved: () => void
  event?: CalendarEvent | null
  defaultStartDate?: string
  defaultEndDate?: string
}

const COLORS = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#ef4444", label: "Rojo" },
  { value: "#22c55e", label: "Verde" },
  { value: "#f59e0b", label: "Amarillo" },
  { value: "#a855f7", label: "Púrpura" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#6b7280", label: "Gris" },
]

function toLocalDatetime(iso: string) {
  if (!iso) return ""
  if (!iso.includes("T")) iso += "T00:00"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso.slice(0, 16)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export default function EventForm({ open, onOpenChange, onEventSaved, event, defaultStartDate, defaultEndDate }: EventFormProps) {
  async function submitAction(_prev: unknown, formData: FormData) {
    const reminderTime = formData.get("reminder_time") as ReminderTime | "none" | null
    const reminderMethod = formData.get("reminder_method") as ReminderMethod | null
    const data: EventFormData & { reminder?: { time: ReminderTime | "none"; method: ReminderMethod } | null } = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      all_day: formData.has("all_day"),
      color: formData.get("color") as string,
      category: formData.get("category") as string,
      priority: formData.get("priority") as "low" | "medium" | "high" | "urgent",
    }

    if (reminderTime) {
      data.reminder = { time: reminderTime, method: reminderMethod || "notification" }
    }

    const result = event
      ? await updateEvent(event.id, data)
      : await createEvent(data)

    if (!result?.error) {
      onOpenChange(false)
      onEventSaved()
    }

    return result
  }

  const [state, action, pending] = useActionState(submitAction, null)

  useEffect(() => {
    if (!open) {
      onEventSaved()
    }
  }, [open, onEventSaved])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <form action={action}>
          <SheetHeader>
            <SheetTitle className="text-xl text-glass">
              {event ? "Editar evento" : "Nuevo evento"}
            </SheetTitle>
            <SheetDescription className="text-glass/70">
              {event
                ? "Actualiza los datos del evento."
                : "Completa los detalles para crear un nuevo evento."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-glass text-sm font-medium">Título</Label>
              <Input
                id="title"
                name="title"
                defaultValue={event?.title ?? ""}
                required
                placeholder="Nombre del evento"
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-glass text-sm font-medium">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={event?.description ?? ""}
                placeholder="Descripción opcional"
                rows={3}
                className="glass-input min-h-[80px] resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-glass text-sm font-medium">Inicio</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  defaultValue={event ? toLocalDatetime(event.start_date) : defaultStartDate ? toLocalDatetime(defaultStartDate) : ""}
                  required
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-glass text-sm font-medium">Fin</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  defaultValue={event ? toLocalDatetime(event.end_date) : defaultEndDate ? toLocalDatetime(defaultEndDate) : ""}
                  required
                  className="glass-input"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                id="all_day"
                name="all_day"
                type="checkbox"
                defaultChecked={event?.all_day ?? false}
                className="peer sr-only"
              />
              <div className="size-5 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm transition-all peer-checked:bg-primary/30 peer-checked:border-primary peer-checked:backdrop-blur-md peer-checked:[background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%2220 6 9 17 4 12%22/></svg>')] bg-center bg-[length:14px] group-hover:border-ring transition-all" />
              <span className="text-sm font-medium text-glass select-none">Todo el día</span>
            </label>

            <div className="space-y-2">
              <Label className="text-glass text-sm font-medium">Color</Label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => (
                  <label key={c.value} className="group/color cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={c.value}
                      defaultChecked={(event?.color ?? "#3b82f6") === c.value}
                      className="peer sr-only"
                    />
                    <span
                      className="block size-8 rounded-full ring-1 ring-white/30 transition-all duration-200 peer-checked:ring-2 peer-checked:ring-ring peer-checked:scale-110 peer-checked:shadow-lg peer-checked:shadow-primary/20 group-hover/color:scale-110 group-hover/color:shadow-lg"
                      style={{ backgroundColor: c.value }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-glass text-sm font-medium">Categoría</Label>
                <Select name="category" defaultValue={event?.category ?? "default"}>
                  <SelectTrigger className="glass-input w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/20 dark:border-white/10">
                    <SelectItem value="default">General</SelectItem>
                    <SelectItem value="work">Trabajo</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="health">Salud</SelectItem>
                    <SelectItem value="finance">Finanzas</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-glass text-sm font-medium">Prioridad</Label>
                <Select name="priority" defaultValue={event?.priority ?? "medium"}>
                  <SelectTrigger className="glass-input w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/20 dark:border-white/10">
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 border-t border-white/20 dark:border-white/10 pt-4">
              <Label className="text-glass text-sm font-medium">Recordatorio</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Select name="reminder_time" defaultValue="none">
                    <SelectTrigger className="glass-input w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/20 dark:border-white/10">
                      <SelectItem value="none">Sin recordatorio</SelectItem>
                      <SelectItem value="at_event">A la hora del evento</SelectItem>
                      <SelectItem value="15min">15 minutos antes</SelectItem>
                      <SelectItem value="30min">30 minutos antes</SelectItem>
                      <SelectItem value="1h">1 hora antes</SelectItem>
                      <SelectItem value="2h">2 horas antes</SelectItem>
                      <SelectItem value="1d">1 día antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Select name="reminder_method" defaultValue="notification">
                    <SelectTrigger className="glass-input w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/20 dark:border-white/10">
                      <SelectItem value="notification">Notificación</SelectItem>
                      <SelectItem value="email">Correo</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {state?.error && (
              <div className="animate-slide-down rounded-lg bg-destructive/15 backdrop-blur-sm p-3 text-sm text-destructive border border-destructive/20">
                {state.error}
              </div>
            )}
          </div>

          <SheetFooter className="flex-row gap-2 sm:flex-row border-t border-white/20 dark:border-white/10 pt-4">
            {event && (
              <Button
                type="button"
                  variant="glass"
                  size="sm"
                  className="mr-auto bg-destructive/15 hover:bg-destructive/25 text-destructive border-destructive/30"
                onClick={async () => {
                  const result = await deleteEvent(event.id)
                  if (!result?.error) {
                    onOpenChange(false)
                    onEventSaved()
                  }
                }}
              >
                Eliminar
              </Button>
            )}
            <Button type="button" variant="glass" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="glass" size="sm" disabled={pending} className="min-w-[80px] bg-primary/20 hover:bg-primary/30 text-foreground border-primary/30">
              {pending ? (
                <span className="flex items-center gap-1">
                  <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Guardando
                </span>
              ) : event ? (
                "Guardar"
              ) : (
                "Crear"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
