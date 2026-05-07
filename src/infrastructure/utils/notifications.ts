import { sendEmail } from '@/infrastructure/email/mailer';

export type AlertPayload = {
  title: string;
  message: string;
  type: 'INQUIRY' | 'SECURITY' | 'SYSTEM';
  data?: Record<string, unknown>;
};

/**
 * Enhanced Notification System
 * Handles Admin alerts and User "Double Handshake" confirmations.
 */
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

  // 2. Admin Email Alert
  const adminEmail = process.env.ADMIN_EMAIL || 'aimeserge51260@gmail.com';
  
  try {
    await sendEmail({
      to: adminEmail,
      subject: `[${type}] ${title}`,
      html: `
        <div style="font-family: 'Courier New', Courier, monospace; background-color: #020617; color: #f8fafc; padding: 40px; border-radius: 20px; border: 1px solid #1e293b;">
          <h2 style="color: ${type === 'SECURITY' ? '#ef4444' : '#06b6d4'}; margin-top: 0;">&gt; SYSTEM_ALERT: ${title}</h2>
          <div style="background-color: #0f172a; padding: 20px; border-radius: 10px; border: 1px solid #334155; margin-bottom: 20px;">
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">${message}</p>
            ${data ? `<pre style="color: #22d3ee; font-size: 12px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>` : ''}
          </div>
          <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;" />
          <p style="font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 2px;">Portfolio System Node // Handshake Protocol 1.0</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Admin email notification failed", err);
  }

  // 3. User Confirmation (Double Handshake)
  if (type === 'INQUIRY' && data?.Email) {
    const userEmail = data.Email as string;
    const userName = (data.Name as string) || 'User';

    try {
      await sendEmail({
        to: userEmail,
        subject: "Handshake Established | Aime Serge Portfolio",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background-color: #0891b2; padding: 30px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px;">Connection Synchronized</h1>
            </div>
            <div style="padding: 40px;">
              <p style="font-size: 16px; line-height: 1.6;">Hello ${userName},</p>
              <p style="font-size: 16px; line-height: 1.6;">Your inquiry has been successfully transmitted to my digital node. I have received your message regarding <strong>${data.Interest || 'Collaboration'}</strong>.</p>
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0891b2;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">Current Status:</p>
                <p style="margin: 5px 0 0 0; font-weight: bold; color: #0891b2;">QUEUED_FOR_REVIEW (ETA: 24-48h)</p>
              </div>
              <p style="font-size: 16px; line-height: 1.6;">While I process your request, you can explore my latest architectural broadcasts or query my Digital Twin directly on the platform.</p>
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #94a3b8;">
                <p style="margin: 0;">Best regards,</p>
                <p style="margin: 5px 0 0 0; font-weight: bold; color: #1e293b;">Aime Serge UKOBIZABA</p>
                <p style="margin: 2px 0 0 0;">Senior Software Engineer</p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("User confirmation email failed", err);
    }
  }
}
