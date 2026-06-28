import { NextRequest, NextResponse } from 'next/server'
import { getSiteSetting, getSiteSettingNumber, insertPayment, initDb } from '@/lib/db'
import { StudentForm } from '@/types'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body: StudentForm & { phone: string } = await req.json()

    if (!body.name || !body.email || !body.phone || !body.county || !body.studyLevel || !body.referral) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await initDb()

    const reference = `MED-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`
    const amount = await getSiteSettingNumber('course_price', Number(process.env.COURSE_PRICE || 8000))
    const course = await getSiteSetting('course_name', process.env.COURSE_NAME || 'Medical Course')

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
    })

    return NextResponse.json({ reference })
  } catch (err: any) {
    console.error('[initiate API error]:', err)
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 })
  }
}
