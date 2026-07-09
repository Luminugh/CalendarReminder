# Reactivar sistema de recordatorios

El sistema de recordatorios se deshabilitó temporalmente para pruebas.
Para reactivarlo, la IA debe seguir esta orden:

---

**Orden**: Reactiva el sistema completo de recordatorios.

## Archivos a modificar

### 1. `src/hooks/use-reminders.ts`
Reemplazar el stub actual con el hook original que hace polling cada 60s a `/api/check-reminders`, acumula `dueReminders` en estado, y expone `dismissReminder`/`dismissAll`.

### 2. `src/app/api/check-reminders/route.ts`
Reemplazar el stub actual (`return { reminders: [] }`) con el endpoint original que:
- Autentica usuario via `createClient()` + `getUser()`
- Llama `getDueReminders()` y filtra por `user_id`
- Para cada recordatorio:
  - Si method es "email" o "both": envía correo vía Resend (`sendEmail()` + `buildReminderEmailHtml()`)
  - Si method es "notification" o "both": marca como enviado (`markReminderSent()`)
  - Siempre marca como enviado al final
- Retorna `{ reminders: results }`

### 3. `src/components/event-form.tsx`
Agregar sección "Recordatorio" con dos selects:
- `reminder_time`: Sin recordatorio / A la hora / 15min / 30min / 1h / 2h / 1d
- `reminder_method`: Notificación / Correo / Ambos

En `submitAction`, leer `formData.get("reminder_time")` y `reminder_method`, construir objeto `reminder` en los datos.

### 4. `src/lib/supabase/events-actions.ts`
Restaurar:
- Import de `ReminderTime`, `ReminderMethod` desde `./reminder-actions`
- Import de `createReminder`, `deleteRemindersForEvent` desde `./reminder-actions`
- Interface `ReminderInput`
- En `createEvent`: si `data.reminder.time !== "none"`, llamar `createReminder()`
- En `updateEvent`: si `data.reminder.time === "none"` borrar, si no borrar y crear nueva
- En `deleteEvent`: llamar `deleteRemindersForEvent(id)` antes de borrar el evento

### 5. `src/app/dashboard/page.tsx`
- Agregar `import ReminderToast from "@/components/reminder-toast"`
- Agregar `<ReminderToast />` dentro del `<LiquidBg>` (antes del cierre)

### 6. Variables de entorno (Vercel o .env.local)
| Variable | Descripción |
|---|---|
| `RESEND_API_KEY` | API key de Resend para enviar correos |
| `EMAIL_FROM` | Correo verificado en Resend (ej: `notificaciones@tudominio.com`) |

**Para pruebas sin dominio**: usa `onboarding@resend.dev` como `EMAIL_FROM` (solo envía al correo registrado en Resend).

## Dependencias
- `src/lib/supabase/reminder-actions.ts` — CRUD + procesamiento (ya existe, intacto)
- `src/lib/email.ts` — envío de correos vía Resend (ya existe, intacto)
- `src/components/reminder-toast.tsx` — UI de toasts (ya existe, intacto)
- `src/app/api/check-reminders/route.ts` — endpoint polling (modificar)
- `src/hooks/use-reminders.ts` — hook cliente (modificar)
- `src/components/event-form.tsx` — formulario (modificar)
- `src/lib/supabase/events-actions.ts` — server actions (modificar)
- `src/app/dashboard/page.tsx` — layout (modificar)

## Notas
- Todos los archivos originales están intactos en `src/lib/supabase/reminder-actions.ts`, `src/lib/email.ts`, `src/components/reminder-toast.tsx`
- Solo se modificaron los puntos de integración (hook, API route, form, dashboard, events-actions)
- No se requiere instalar nuevos paquetes
