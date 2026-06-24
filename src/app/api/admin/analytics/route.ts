import { NextResponse } from 'next/server'
import {
  getEnrollmentsByDay,
  getEnrollmentsByCourse,
  getEnrollmentsByCounty,
  getEnrollmentsByReferral,
  getPaymentStats,
} from '@/lib/db'

export async function GET() {
  try {
    const [byDay, byCourse, byCounty, byReferral, stats] = await Promise.all([
      getEnrollmentsByDay(30),
      getEnrollmentsByCourse(),
      getEnrollmentsByCounty(),
      getEnrollmentsByReferral(),
      getPaymentStats(),
    ])

    return NextResponse.json({ byDay, byCourse, byCounty, byReferral, stats })
  } catch (err: any) {
    console.error('[analytics API error]:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
