import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/infrastructure/email/mailer';

/**
 * Enhanced Supabase Database Webhook Receiver
 * Dynamically handles notifications for all critical transactions.
 */
export async function POST(req: NextRequest) {
  const webhookSecret = req.headers.get('x-supabase-webhook-secret');

  if (webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const { table, record, type } = payload;
    const adminEmail = process.env.ADMIN_EMAIL!;

    let subject = `[${table.toUpperCase()}] ${type} Operation Detected`;
    let html = `<h3>Database Transaction Alert</h3>
                <p><strong>Table:</strong> ${table}</p>
                <p><strong>Operation:</strong> ${type}</p>
                <hr />`;

    // 1. Dynamic Notification Templates
    switch (table) {
      case 'contacts':
        if (type === 'INSERT') {
          subject = `New Inquiry: ${record.name}`;
          html += `
            <p><strong>Name:</strong> ${record.name}</p>
            <p><strong>Email:</strong> ${record.email}</p>
            <p><strong>Interest:</strong> ${record.interest}</p>
            <p><strong>Message:</strong> ${record.message}</p>
          `;
        }
        break;

      case 'security_logs':
        if (record.severity === 'CRITICAL' || record.severity === 'WARN') {
          subject = `🚨 ${record.severity} SECURITY ALERT: ${record.event_type}`;
          html += `
            <p><strong>Event:</strong> ${record.event_type}</p>
            <p><strong>Severity:</strong> ${record.severity}</p>
            <p><strong>IP:</strong> ${record.ip_address}</p>
            <p><strong>Metadata:</strong> <pre>${JSON.stringify(record.metadata, null, 2)}</pre></p>
          `;
        } else {
          // Don't send emails for INFO logs to prevent spam
          return NextResponse.json({ success: true, message: 'Skipped INFO log' });
        }
        break;

      case 'projects':
      case 'research':
      case 'broadcasts':
        subject = `Content Update: ${table} (${type})`;
        html += `
          <p><strong>Record ID:</strong> ${record.id}</p>
          <p><strong>Title/Slug:</strong> ${record.title || record.slug}</p>
          <p><strong>Status:</strong> Content was ${type.toLowerCase()}ed in the secure vault.</p>
        `;
        break;

      default:
        html += `<p>Raw Record Data: <pre>${JSON.stringify(record, null, 2)}</pre></p>`;
    }

    html += `<hr /><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">Open Management Console</a></p>`;

    // 2. Dispatch Email
    await sendEmail({
      to: adminEmail,
      subject,
      html
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
