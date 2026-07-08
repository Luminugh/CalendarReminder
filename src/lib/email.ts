const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM ?? "notificaciones@calendario-reminder.app"

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<{ error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured — email not sent")
    return { error: "Email service not configured" }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      return { error: `Resend error (${res.status}): ${body}` }
    }

    return {}
  } catch (err) {
    return { error: String(err) }
  }
}

export function buildMagicLinkEmailHtml({ redirectTo, tokenHash }: { redirectTo: string; tokenHash: string }) {
  const link = `${redirectTo}?token_hash=${tokenHash}&type=magiclink&next=/dashboard`
  return `<!DOCTYPE html>
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
    .btn { display: inline-block; padding: 14px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; transition: background 0.2s; }
    .btn:hover { background: #2563eb; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5ea; font-size: 12px; color: #8e8e93; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">CR</div>
      <h1>Inicia sesión en Calendar Reminder</h1>
      <p>Haz clic en el botón para acceder a tu calendario de forma segura. Este enlace expira en 24 horas.</p>
      <a href="${link}" class="btn">Iniciar sesión</a>
      <p style="margin-top: 16px; font-size: 13px;">Si no solicitaste este enlace, puedes ignorar este correo.</p>
      <div class="footer">
        Calendar Reminder — Tu calendario inteligente con recordatorios
      </div>
    </div>
  </div>
</body>
</html>`
}

export function buildReminderEmailHtml({ title, startDate, minutesBefore }: { title: string; startDate: string; minutesBefore: number }) {
  const date = new Date(startDate)
  const formattedDate = date.toLocaleString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; }
    .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 20px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    h1 { font-size: 20px; color: #1d1d1f; margin: 0 0 16px; font-weight: 600; }
    .event { background: #f5f5f7; border-radius: 12px; padding: 16px; margin: 16px 0; }
    .event-title { font-size: 17px; font-weight: 600; color: #1d1d1f; }
    .event-time { font-size: 14px; color: #6e6e73; margin-top: 4px; }
    p { font-size: 15px; color: #6e6e73; line-height: 1.6; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5ea; font-size: 12px; color: #8e8e93; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>⏰ Recordatorio de evento</h1>
      <p>Faltan ${minutesBefore} minutos para tu evento:</p>
      <div class="event">
        <div class="event-title">${title}</div>
        <div class="event-time">${formattedDate}</div>
      </div>
      <div class="footer">
        Calendar Reminder — Tu calendario inteligente con recordatorios
      </div>
    </div>
  </div>
</body>
</html>`
}
