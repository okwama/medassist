import { NextRequest, NextResponse } from 'next/server'
import { getDarajaToken, sendSTKPush } from '@/lib/daraja'
import { getSiteSetting, getSiteSettingNumber, insertPayment, initDb } from '@/lib/db'
import { StudentForm } from '@/types'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body: StudentForm & { phone: string } = await req.json()

    // Validate request body
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure database tables exist
    await initDb()

    const reference = `MED-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`
    const amount = await getSiteSettingNumber('course_price', Number(process.env.COURSE_PRICE || 8000))
    const course = await getSiteSetting('course_name', process.env.COURSE_NAME || 'Medical Course')

    // Trigger STK Push via Daraja API
    const token = await getDarajaToken()
    const stkRes = await sendSTKPush(token, body.phone, amount, reference, `${course} Enrollment`)

    if (stkRes.ResponseCode !== '0') {
      return NextResponse.json({ 
        error: 'STK Push failed to initiate', 
        detail: stkRes.ResponseDescription 
      }, { status: 502 })
    }

    // Save pending payment record to database with CheckoutRequestID
    await insertPayment({
      reference,
      name: body.name,
      email: body.email,
      phone: body.phone,
      county: body.county,
      study_level: body.studyLevel,
      referral: body.referral,
      course,
      amount,
      status: 'pending',
      checkout_request_id: stkRes.CheckoutRequestID
    })

    return NextResponse.json({ reference, message: stkRes.CustomerMessage })

  } catch (err: any) {
    console.error('[initiate API error]:', err)
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 })
  }
}
