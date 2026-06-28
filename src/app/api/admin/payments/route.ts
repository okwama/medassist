import { NextRequest, NextResponse } from 'next/server'
import {
  getAllPayments,
  getPaymentStats,
  getPaymentByReference,
  updatePaymentStatus,
} from '@/lib/db'
import { appendToSheet } from '@/lib/sheets'
import { sendStudentEmail, sendClientNotification } from '@/lib/email'

export async function GET() {
  try {
    const [payments, stats] = await Promise.all([
      getAllPayments(),
      getPaymentStats(),
    ])

    return NextResponse.json({ payments, stats })
  } catch (err: any) {
    console.error('[admin payments API error]:', err)
    return NextResponse.json({ error: 'Failed to fetch payment records' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { reference, status, receiptNumber } = await req.json()

    if (!reference || !status) {
      return NextResponse.json({ error: 'Reference and status are required' }, { status: 400 })
    }

    if (!['success', 'failed', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const payment = await getPaymentByReference(reference)
    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    const receipt = status === 'success' ? receiptNumber ?? payment.reference : undefined
    await updatePaymentStatus(reference, status, receipt)

    if (status === 'success') {
      const updated = await getPaymentByReference(reference)
      if (updated) {
        await Promise.allSettled([
          sendStudentEmail(updated),
          sendClientNotification(updated),
          appendToSheet(updated),
        ])
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[admin payments PATCH error]:', err)
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
  }
}
