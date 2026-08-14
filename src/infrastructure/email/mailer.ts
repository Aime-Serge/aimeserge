import { Resend } from 'resend';

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';
  const apiKey = process.env.RESEND_API_KEY;

  // If Resend API key is not configured, gracefully skip email sending (development mode)
  if (!apiKey) {
    console.warn(`⚠️ RESEND_API_KEY not configured. Email would be sent to ${to} with subject: ${subject}`);
    return { success: true, skipped: true, message: 'Email skipped: RESEND_API_KEY not configured' };
  }
  
  const resend = new Resend(apiKey);

  try {
    console.log(`📡 Attempting to send email to ${to} via Resend...`);
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      return { success: false, error };
    }

    console.log(`✅ Email sent successfully! ID: ${data?.id}`);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Fatal mailer exception:", error);
    return { success: false, error };
  }
}
