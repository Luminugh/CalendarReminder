# Calendar Reminder (calendario-inteligente)

Next.js 16.2 + React 19.2 + Tailwind CSS v4 + Supabase app.

## Framework & tooling quirks

- **Next.js is a custom build.** Read `node_modules/next/dist/docs/` before
  writing any code — APIs, conventions, and file structure may differ from
  upstream Next.js.
- **Tailwind v4** — uses `@tailwindcss/postcss` (PostCSS plugin), not a
  `tailwind.config.js`. CSS entry: `src/app/globals.css` imports
  `@import "tailwindcss"`.
- **shadcn/ui "base-nova" style** — uses `@base-ui/react` (not Radix).
  Components in `src/components/ui/`. Config in `components.json`.
- **ESLint flat config** (`eslint.config.mjs`) — uses
  `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- **No test framework** installed yet. No `typecheck` script — run
  `npx tsc --noEmit` manually.
- **Available skills**: accessiblity, composition-patterns, frontend-design,
  next-best-practices, nodejs-best-practices, react-best-practices, shadcn,
  supabase-postgres-best-practices, tailwind-css-patterns.

## Commands

```
npm run dev       # dev server (localhost:3000)
npm run build     # production build
npm run start     # start production server
npm run lint      # ESLint
```

## Supabase email templates (magic link)

Customize in Supabase Dashboard → Authentication → Email Templates → Magic Link.

**Subject:**
```
Inicia sesión en Calendar Reminder ✨
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; }
    .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 20px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .logo { width: 44px; height: 44px; background: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; margin-bottom: 20px; }
    h1 { font-size: 22px; color: #1d1d1f; margin: 0 0 8px; font-weight: 600; }
    p { font-size: 15px; color: #6e6e73; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: inline-block; padding: 14px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5ea; font-size: 12px; color: #8e8e93; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">CR</div>
      <h1>Inicia sesión en Calendar Reminder</h1>
      <p>Haz clic en el botón para acceder a tu calendario de forma segura.</p>
      <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/dashboard" class="btn">Iniciar sesión</a>
      <p style="margin-top: 16px; font-size: 13px;">Si no solicitaste este enlace, ignora este correo.</p>
      <div class="footer">Calendar Reminder — Tu calendario inteligente</div>
    </div>
  </div>
</body>
</html>
```

**Set up custom SMTP** (recommended for production):
1. Create account at Resend (or SendGrid, Mailgun, etc.)
2. Go to Supabase Dashboard → Authentication → Settings → SMTP
3. Enter your SMTP credentials from Resend
4. Verify the email sender domain

## Session persistence

Supabase sessions persist across browser restarts via cookies with `maxAge: 365 days`.
Configured in:
- `src/lib/supabase/client.ts` — browser client
- `src/lib/supabase/server.ts` — server client (server actions, route handlers)
- `src/lib/supabase/middleware.ts` — proxy/middleware session refresh

## Reminder engine

The `reminders` table in Supabase holds scheduled reminders linked to events.
The app uses:
- **Client-side polling**: `useReminders` hook checks `/api/check-reminders` every 60s
- **In-app notifications**: toast/banner for due reminders
- **Email reminders**: via Resend (requires `RESEND_API_KEY` env var)
- **API route**: `src/app/api/check-reminders/route.ts` — checks due reminders, sends emails, marks sent

## Glassmorphism UI

Custom glass utilities defined in `globals.css`:
- `.glass`, `.glass-strong`, `.glass-card`, `.glass-input`, `.glass-button`
- `.liquid-bg` — animated gradient background
- `.liquid-glass-decor` — floating glass orbs
- `LiquidBg` component — full-page animated background with mouse parallax

## Env vars

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `RESEND_API_KEY` | No (reminders) | Resend API key for custom emails |
| `EMAIL_FROM` | No | Sender email address |

## Key deps worth knowing

- `@fullcalendar/react` + daygrid/timegrid/interaction — calendar UI
- `@supabase/ssr` + `@supabase/supabase-js` — auth / DB
- `date-fns` v4 — date manipulation
- `react-day-picker` v10 — date picker
- `lucide-react` — icons
- `class-variance-authority`, `clsx`, `tailwind-merge` — via `@/lib/utils` `cn()`

## Path aliases

`@/*` → `./src/*`. shadcn aliases: `@/components`, `@/components/ui`,
`@/lib`, `@/hooks` (all in `components.json`).

## Architecture

- App Router (`src/app/`).
- Supabase SSR auth with proxy (`src/proxy.ts`).
- Colors use oklch space. Dark mode via `.dark` class on `<html>`.
- Glassmorphism design system with liquid animations.
