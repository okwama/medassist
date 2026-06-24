import { NextResponse } from 'next/server'
import { getAllPayments, getPaymentStats } from '@/lib/db'

export async function GET() {
  try {
    const [payments, stats] = await Promise.all([
      getAllPayments(),
      getPaymentStats()
    ])

    return NextResponse.json({ payments, stats })
  } catch (err: any) {
    console.error('[admin payments API error]:', err)
    return NextResponse.json({ error: 'Failed to fetch payment records' }, { status: 500 })
  }
}
