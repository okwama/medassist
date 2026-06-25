import { NextRequest, NextResponse } from 'next/server'
import { getPaymentByReference, updatePaymentStatus } from '@/lib/db'
import { getDarajaToken, querySTKStatus } from '@/lib/daraja'

// In-memory cache to prevent hitting Safaricom's strict Spike Arrest rate limits (5 requests/min)
const lastQueryCache = new Map<string, number>()

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

    // Fallback: If status is pending and checkout_request_id exists, poll Safaricom directly 
    // to handle local test environments that cannot receive callbacks, or lost callbacks.
    // Throttle queries to Safaricom to at most once every 15 seconds per reference.
    const now = Date.now()
    const lastQueryTime = lastQueryCache.get(reference) || 0

    if (record.status === 'pending' && record.checkout_request_id && (now - lastQueryTime >= 15000)) {
      lastQueryCache.set(reference, now)
      try {
        const token = await getDarajaToken()
        const queryRes = await querySTKStatus(token, record.checkout_request_id)
        
        console.log('[polling Safaricom status for ref]', reference, JSON.stringify(queryRes))
        
        // ResponseCode "0" means the status query itself was completed successfully
        if (queryRes.ResponseCode === '0') {
          const resultCode = queryRes.ResultCode
          
          if (resultCode === '0' || resultCode === 0) {
            // Successful transaction
            // Retrieve Receipt Number if available in the response description or fallback
            const receipt = queryRes.ResultDesc?.match(/[A-Z0-9]{10}/)?.[0] || 'STK_DIRECT'
            await updatePaymentStatus(reference, 'success', receipt)
            record.status = 'success'
            record.mpesa_receipt = receipt
          } else if (resultCode === '4999' || resultCode === 4999) {
            // "4999" means the transaction is still under processing/pending.
            // Do not update status, let the client keep polling.
            record.status = 'pending'
          } else {
            // Any other non-zero ResultCode indicates a finalized transaction failure (e.g. cancelled, timed out, insufficient funds)
            await updatePaymentStatus(reference, 'failed')
            record.status = 'failed'
          }
        }
      } catch (pollErr) {
        console.error('Failed to query Daraja STK status directly:', pollErr)
      }
    }

    return NextResponse.json({
      status: record.status,
      name: record.name,
      email: record.email,
      amount: record.amount,
      mpesa_receipt: record.mpesa_receipt,
    })

  } catch (err: any) {
    console.error('[status check error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
