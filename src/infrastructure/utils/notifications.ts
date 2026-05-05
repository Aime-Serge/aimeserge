import { sendEmail } from '@/infrastructure/email/mailer';

export type AlertPayload = {
  title: string;
  message: string;
  type: 'INQUIRY' | 'SECURITY' | 'SYSTEM';
  data?: Record<string, unknown>;
};

export async function notifyAdmin(payload: AlertPayload) {
  const { title, message, type, data } = payload;
  
  // 1. Discord Webhook (Instant Mobile Push)
  const DISCORD_URL = process.env.DISCORD_WEBHOOK_URL;
  
  if (DISCORD_URL) {
    try {
      await fetch(DISCORD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `[${type}] ${title}`,
            description: message,
            color: type === 'SECURITY' ? 15158332 : (type === 'INQUIRY' ? 3066993 : 3447003),
            fields: data ? Object.entries(data).map(([key, val]) => ({
              name: key,
              value: String(val),
              inline: true
            })) : [],
            footer: { text: "Portfolio System Node" },
            timestamp: new Date().toISOString(),
          }]
        }),
      });
    } catch (err) {
      console.error("Discord notification failed", err);
    }
  }

  // 2. Email (Resend)
  const adminEmail = process.env.ADMIN_EMAIL || 'aimeserge51260@gmail.com';
  
  try {
    await sendEmail({
      to: adminEmail,
      subject: `[${type}] ${title}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: ${type === 'SECURITY' ? '#d32f2f' : '#0288d1'};">${title}</h2>
          <p>${message}</p>
          ${data ? `<pre style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${JSON.stringify(data, null, 2)}</pre>` : ''}
          <hr />
          <p style="font-size: 10px; color: #888;">System Alert Generated at ${new Date().toISOString()}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Email notification failed", err);
  }
}

