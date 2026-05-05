import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';
  
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
