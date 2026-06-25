import { NextRequest, NextResponse } from 'next/server'
import { getAllSiteSettings, initDb, setSiteSetting } from '@/lib/db'

export async function GET() {
  try {
    await initDb()

    const settings = await getAllSiteSettings()

    return NextResponse.json({
      settings: {
        course_price: settings.course_price ?? '',
        course_name: settings.course_name ?? '',
        course_start_date: settings.course_start_date ?? '',
        course_duration: settings.course_duration ?? '',
        whatsapp_group_link: settings.whatsapp_group_link ?? '',
        lightweight_mode: settings.lightweight_mode ?? 'false',
      },
    })
  } catch (err: any) {
    console.error('[admin settings GET error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await initDb()

    const updates = [
      ['course_price', String(body.coursePrice ?? '')],
      ['course_name', String(body.courseName ?? '')],
      ['course_start_date', String(body.courseStartDate ?? '')],
      ['course_duration', String(body.courseDuration ?? '')],
      ['whatsapp_group_link', String(body.whatsappGroupLink ?? '')],
      ['lightweight_mode', body.lightweightMode ? 'true' : 'false'],
    ] as Array<[string, string]>

    for (const [key, value] of updates) {
      await setSiteSetting(key, value)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[admin settings POST error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
