/**
 * FREE NOTIFICATION SYSTEM
 * Channels: Discord (Mobile/Desktop Push) & Email (Resend)
 */

type AlertPayload = {
  title: string;
  message: string;
  type: 'INQUIRY' | 'SECURITY' | 'SYSTEM';
  data?: Record<string, unknown>;
};

export async function notifyAdmin(payload: AlertPayload) {
  const { title, message, type, data } = payload;
  
  // 1. Discord Webhook (Instant Mobile Push)
  // Get yours: Discord Server > Channel Settings > Integrations > Webhooks
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
            color: type === 'SECURITY' ? 15158332 : 3447003, // Red for security, Blue for info
            fields: data ? Object.entries(data).map(([key, val]) => ({
              name: key,
              value: String(val),
              inline: true
            })) : [],
            timestamp: new Date().toISOString(),
          }]
        }),
      });
    } catch (err) {
      console.error("Discord notification failed", err);
    }
  }

  // 2. Email (Resend - 3,000 free/mo)
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (RESEND_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'System <system@aimeserge.dev>',
          to: [process.env.ADMIN_EMAIL || 'aimeserge51260@gmail.com'],
          subject: `Alert: ${title}`,
          html: `<strong>${title}</strong><p>${message}</p><pre>${JSON.stringify(data, null, 2)}</pre>`,
        }),
      });
    } catch (err) {
      console.error("Email notification failed", err);
    }
  }

  // Fallback to console if no keys are set
  if (!DISCORD_URL && !RESEND_KEY) {
    console.log("🔔 [PENDING_ALERT]", { title, message, data });
  }
}
