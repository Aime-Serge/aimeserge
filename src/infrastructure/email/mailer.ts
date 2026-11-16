import { Resend } from "resend";

export type SendResult = { success: boolean; skipped?: boolean; id?: string; error?: string };

/** Resend's shared test sender only delivers to the Resend account's own email address. */
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || "Aime Serge website <onboarding@resend.dev>";
export const CAN_EMAIL_VISITORS = Boolean(process.env.RESEND_FROM_EMAIL?.trim()) && !/resend\.dev/i.test(FROM_EMAIL);

export async function sendEmail({ to, subject, html, text, replyTo }: {
  to: string; subject: string; html: string; text?: string; replyTo?: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`RESEND_API_KEY not set: email "${subject}" was not sent.`);
    return { success: false, skipped: true, error: "RESEND_API_KEY not set" };
  }

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
      replyTo,
    });
    if (error) {
      console.error("Resend error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "unknown error" };
  }
}
