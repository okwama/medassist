import { NextRequest, NextResponse } from 'next/server'
import { getPaymentByReference } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get('ref')

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference parameter' }, { status: 400 })
    }

    const record = await getPaymentByReference(reference)

    if (!record) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: record.status,
      name: record.name,
      email: record.email,
      mpesa_receipt: record.mpesa_receipt,
    })

  } catch (err: any) {
    console.error('[status check error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
