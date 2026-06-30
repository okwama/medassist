import { Resend } from 'resend'
import { getSiteSetting, initDb } from '@/lib/db'
import { PaymentRecord } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY || 'temp')

async function getEmailContext() {
  await initDb()
  return {
    waLink: await getSiteSetting('whatsapp_group_link', process.env.WHATSAPP_GROUP_LINK || 'https://chat.whatsapp.com/mock'),
    courseName: await getSiteSetting('course_name', process.env.COURSE_NAME || 'Medical Course'),
    startDate: await getSiteSetting('course_start_date', process.env.COURSE_START_DATE || '15 August 2026'),
  }
}

export async function sendStudentEmail(record: PaymentRecord) {
  const { waLink, courseName, startDate } = await getEmailContext()

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'courses@yourclient.co.ke',
    to: record.email,
    subject: `Your access to ${courseName} — Join the WhatsApp Group`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#333;">
        <h2 style="color:#1D9E75">Payment Confirmed ✓</h2>
        <p>Hi ${record.name},</p>
        <p>Your payment of <strong>KES ${record.amount.toLocaleString()}</strong> 
           for <strong>${courseName}</strong> has been received.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <tr><td style="padding:8px 0;color:#666">Course</td>
              <td style="padding:8px 0;font-weight:600">${courseName}</td></tr>
          <tr style="border-top:1px solid #eee;border-bottom:1px solid #eee;">
              <td style="padding:8px 0;color:#666">Start Date</td>
              <td style="padding:8px 0;font-weight:600">${startDate}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Receipt Number</td>
              <td style="padding:8px 0;font-weight:600;font-family:monospace;">${record.receipt_number || record.reference}</td></tr>
        </table>
        <div style="margin:32px 0;">
          <a href="${waLink}" 
             style="display:inline-block;background:#25D366;color:#fff;padding:14px 28px;
                    border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">
            Join WhatsApp Group
          </a>
        </div>
        <p style="margin-top:32px;color:#999;font-size:13px;">
          Questions? Reply to this email or contact us via WhatsApp.
        </p>
      </div>
    `
  })
}

export async function sendClientNotification(record: PaymentRecord) {
  const { courseName } = await getEmailContext()
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'courses@yourclient.co.ke',
    to: process.env.CLIENT_NOTIFY_EMAIL || 'admin@yourclient.co.ke',
    subject: `New Payment — ${record.name} · KES ${record.amount.toLocaleString()}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#333;">
        <h2 style="color:#1D9E75">New Course Enrollment</h2>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #f0f0f0;">Name</td>
              <td style="padding:8px;font-weight:600;border-bottom:1px solid #f0f0f0;">${record.name}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #f0f0f0;">Email</td>
              <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${record.email}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #f0f0f0;">Phone</td>
              <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${record.phone}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #f0f0f0;">County</td>
              <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${record.county}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #f0f0f0;">Study Level</td>
              <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${record.study_level}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #f0f0f0;">Referral</td>
              <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${record.referral}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #f0f0f0;">Course</td>
              <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${courseName}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #f0f0f0;">Amount</td>
              <td style="padding:8px;font-weight:600;color:#1D9E75;border-bottom:1px solid #f0f0f0;">
                KES ${record.amount.toLocaleString()}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #f0f0f0;">Receipt Number</td>
              <td style="padding:8px;font-weight:600;border-bottom:1px solid #f0f0f0;">${record.receipt_number || record.reference}</td></tr>
          <tr><td style="padding:8px;color:#666;">Reference</td>
              <td style="padding:8px;font-family:monospace;">${record.reference}</td></tr>
        </table>
      </div>
    `
  })
}

export async function sendContactInquiryEmail(payload: { name: string; email: string; message: string }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'courses@yourclient.co.ke',
    to: process.env.CONTACT_EMAIL || process.env.CLIENT_NOTIFY_EMAIL || 'medassistacademy@gmail.com',
    replyTo: payload.email,
    subject: `New inquiry from ${payload.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#333;">
        <h2 style="color:#1D9E75">New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${payload.name}</p>
        <p><strong>Email:</strong> ${payload.email}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space:pre-wrap;background:#f7f7f7;padding:16px;border-radius:8px;">${payload.message}</div>
      </div>
    `,
  })
}
