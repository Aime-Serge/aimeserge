import { sendEmail, CAN_EMAIL_VISITORS, type SendResult } from "@/infrastructure/email/mailer";
import { SITE } from "@/config/site";

export type AlertPayload = {
  title: string;
  message: string;
  type: "INQUIRY" | "SECURITY" | "SYSTEM";
  data?: Record<string, unknown>;
};

/** Where new messages and alerts go. */
export const notifyAddress = () =>
  process.env.INQUIRY_NOTIFY_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || SITE.email;

/** Escape text before putting it in an email: visitors must not be able to inject links or markup. */
export const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const oneLine = (v: unknown, max = 120) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

async function discord(title: string, message: string, type: AlertPayload["type"], data?: Record<string, unknown>) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Plain text only: Discord mentions like @everyone are disabled.
        allowed_mentions: { parse: [] },
        embeds: [{
          title: oneLine(`[${type}] ${title}`, 250),
          description: oneLine(message, 1000),
          color: type === "SECURITY" ? 15158332 : type === "INQUIRY" ? 3066993 : 3447003,
          fields: Object.entries(data ?? {}).slice(0, 10).map(([name, value]) => ({ name, value: oneLine(value, 1000) || "-", inline: false })),
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch (err) {
    console.error("Discord notification failed", err);
  }
}

const table = (rows: Array<[string, unknown]>) =>
  rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#0f172a">${esc(v)}</td></tr>`)
    .join("");

/** Security and system alerts to the site owner (email and optional Discord). */
export async function notifyAdmin(payload: AlertPayload): Promise<SendResult> {
  const { title, message, type, data } = payload;
  await discord(title, message, type, data);
  return sendEmail({
    to: notifyAddress(),
    subject: oneLine(`[${type === "SECURITY" ? "Security" : "Website"}] ${title}`, 150),
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0f172a">
      <h2 style="margin:0 0 12px">${esc(title)}</h2>
      <p>${esc(message)}</p>
      ${data ? `<table style="border-collapse:collapse;font-size:14px">${table(Object.entries(data))}</table>` : ""}
    </div>`,
    text: `${title}\n\n${message}\n\n${Object.entries(data ?? {}).map(([k, v]) => `${k}: ${String(v ?? "")}`).join("\n")}`,
  });
}

export type Inquiry = {
  name: string; email: string; contactType: string; interest: string; message: string;
  companyName?: string; jobTitle?: string; budget?: string; timeline?: string; location?: string;
  linkedinUrl?: string; whatsapp?: string; newsletterOptIn?: boolean;
};

/**
 * A new contact-form message: email the owner (Reply goes straight to the visitor),
 * then send the visitor a short confirmation when a verified sender domain is set.
 * Returns whether the owner's email was sent.
 */
export async function sendInquiryEmails(q: Inquiry, savedToDatabase: boolean): Promise<{ ownerEmailed: boolean }> {
  const rows: Array<[string, unknown]> = [
    ["Name", q.name], ["Email", q.email], ["Topic", q.interest], ["From", q.contactType],
    ["Organisation", q.companyName], ["Role", q.jobTitle], ["Budget", q.budget], ["Timeline", q.timeline],
    ["Location", q.location], ["LinkedIn", q.linkedinUrl], ["WhatsApp", q.whatsapp],
    ["Newsletter", q.newsletterOptIn ? "Yes, wants updates" : undefined],
  ];

  await discord("New message", `${q.name} (${q.interest})`, "INQUIRY", { Email: q.email, Message: q.message.slice(0, 900) });

  const owner = await sendEmail({
    to: notifyAddress(),
    replyTo: q.email,
    subject: oneLine(`New message from ${q.name}: ${q.interest}`, 150),
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#0f172a;max-width:640px">
      <h2 style="margin:0 0 4px">New message from your website</h2>
      <p style="margin:0 0 16px;color:#64748b">Press Reply to answer ${esc(q.name)} directly.</p>
      <div style="white-space:pre-wrap;background:#f1f5f9;border-left:4px solid #0891b2;padding:16px;border-radius:6px">${esc(q.message)}</div>
      <table style="border-collapse:collapse;font-size:14px;margin-top:16px">${table(rows)}</table>
      <p style="margin-top:20px;font-size:13px;color:#64748b">${savedToDatabase
        ? `Also saved in Admin → Messages: <a href="${SITE.url}/admin?tab=inquiries">${SITE.url}/admin</a>`
        : "This message could not be saved to the database, so this email is the only copy."}</p>
    </div>`,
    text: `New message from your website (reply to answer ${q.name} directly)\n\n${q.message}\n\n${rows
      .filter(([, v]) => v).map(([k, v]) => `${k}: ${String(v)}`).join("\n")}\n\n${savedToDatabase ? "Also saved in Admin → Messages." : "Not saved to the database: this email is the only copy."}`,
  });

  // Visitor confirmation: only from a verified domain, otherwise Resend rejects it.
  if (CAN_EMAIL_VISITORS) {
    await sendEmail({
      to: q.email,
      replyTo: notifyAddress(),
      subject: `Thanks for your message, ${oneLine(q.name, 60)}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0f172a;max-width:600px">
        <p>Hi ${esc(q.name)},</p>
        <p>Thanks for getting in touch about <strong>${esc(q.interest)}</strong>. I've received your message and ${esc(SITE.responseTime.replace(/^I /, "will ").replace(/\.$/, ""))}.</p>
        <p>If it's urgent, just reply to this email.</p>
        <p>Best regards,<br/>${esc(SITE.name)}<br/><a href="${SITE.url}">${SITE.url.replace(/^https:\/\//, "")}</a></p>
        <p style="font-size:12px;color:#64748b">You're receiving this because this address was entered in the contact form on ${SITE.url.replace(/^https:\/\//, "")}. If that wasn't you, you can ignore this email.</p>
      </div>`,
      text: `Hi ${q.name},\n\nThanks for getting in touch about ${q.interest}. I've received your message and ${SITE.responseTime.replace(/^I /, "will ").replace(/\.$/, "")}.\n\nIf it's urgent, just reply to this email.\n\nBest regards,\n${SITE.name}\n${SITE.url}`,
    });
  }

  return { ownerEmailed: owner.success };
}
