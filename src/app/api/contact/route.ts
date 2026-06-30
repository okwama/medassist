import { NextRequest, NextResponse } from 'next/server'
import { enqueueContactInquiry } from '@/lib/db'
import { sendContactInquiryEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim()
    const message = String(body?.message || '').trim()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    const queued = await enqueueContactInquiry({ name, email, message })

    try {
      await sendContactInquiryEmail({ name, email, message })
      return NextResponse.json({ success: true, queued })
    } catch (error: any) {
      console.error('[contact inquiry email failed]', error)
      return NextResponse.json({ success: true, queued, warning: 'Queued for follow-up; email delivery failed' })
    }
  } catch (error: any) {
    console.error('[contact inquiry error]', error)
    return NextResponse.json({ error: 'Unable to process inquiry' }, { status: 500 })
  }
}
