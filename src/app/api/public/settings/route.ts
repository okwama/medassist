import { NextResponse } from 'next/server'
import { getSiteSetting, getSiteSettingBoolean, getSiteSettingNumber, initDb } from '@/lib/db'

export async function GET() {
  try {
    await initDb()

    const settings = {
      coursePrice: await getSiteSettingNumber('course_price', Number(process.env.COURSE_PRICE || 8000)),
      courseName: await getSiteSetting('course_name', process.env.COURSE_NAME || 'Medical Course'),
      courseStartDate: await getSiteSetting('course_start_date', process.env.COURSE_START_DATE || '15 August 2026'),
      courseDuration: await getSiteSetting('course_duration', process.env.COURSE_DURATION || '6 Weeks'),
      whatsappGroupLink: await getSiteSetting('whatsapp_group_link', process.env.WHATSAPP_GROUP_LINK || 'https://chat.whatsapp.com/mock'),
      lightweightMode: await getSiteSettingBoolean('lightweight_mode', false),
    }

    return NextResponse.json(settings)
  } catch (err: any) {
    console.error('[public settings error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
