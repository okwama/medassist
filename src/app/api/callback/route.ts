import { NextRequest, NextResponse } from 'next/server'
import { DarajaCallbackBody } from '@/types'
import { getPaymentByCheckoutRequestId, updatePaymentStatusByCheckoutRequestId } from '@/lib/db'
import { sendStudentEmail, sendClientNotification } from '@/lib/email'
import { appendToSheet } from '@/lib/sheets'

export async function POST(req: NextRequest) {
  try {
    const body: DarajaCallbackBody = await req.json()
    console.log('[callback received]:', JSON.stringify(body))

    const { stkCallback } = body.Body
    const checkoutRequestId = stkCallback.CheckoutRequestID
    const resultCode = stkCallback.ResultCode

    const metadata = stkCallback.CallbackMetadata?.Item || []
    const getValue = (name: string) => metadata.find(i => i.Name === name)?.Value

    const mpesaReceipt = getValue('MpesaReceiptNumber') as string | undefined

    if (resultCode === 0) {
      // Payment was successful
      await updatePaymentStatusByCheckoutRequestId(checkoutRequestId, 'success', mpesaReceipt)

      const record = await getPaymentByCheckoutRequestId(checkoutRequestId)
      if (record) {
        // Enforce updated values for the side-effect handlers
        record.status = 'success'
        record.mpesa_receipt = mpesaReceipt

        // Run side-effects in parallel
        await Promise.allSettled([
          sendStudentEmail(record),
          sendClientNotification(record),
          appendToSheet(record),
        ])
      }
    } else {
      // Payment failed or was cancelled by the user
      await updatePaymentStatusByCheckoutRequestId(checkoutRequestId, 'failed')
    }

    // Daraja expects a JSON response with ResultCode: 0 to acknowledge callback reception
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })

  } catch (err: any) {
    console.error('[callback error]:', err)
    // Always return 200/Success to Safaricom to prevent callback retries/flooding
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted with internal error' })
  }
}
