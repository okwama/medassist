import { NextRequest, NextResponse } from 'next/server'
import { getPaymentByReference, updatePaymentStatus } from '@/lib/db'
import { getDarajaToken, querySTKStatus } from '@/lib/daraja'

// In-memory cache to prevent hitting Safaricom's strict Spike Arrest rate limits (5 requests/min)
const lastQueryCache = new Map<string, number>()

// Track when each reference was first created (first seen by status endpoint)
// We use this to enforce a grace period before querying Safaricom directly,
// giving the user enough time to receive the STK prompt and enter their PIN.
const firstSeenCache = new Map<string, number>()

// Grace period: do NOT query Safaricom directly for at least this many ms
// after the STK push was initiated. The user needs time to enter their PIN.
const GRACE_PERIOD_MS = 35_000 // 35 seconds

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

    // Record when we first saw this reference so we can enforce the grace period
    if (!firstSeenCache.has(reference)) {
      firstSeenCache.set(reference, now)
    }
    const firstSeen = firstSeenCache.get(reference)!
    const ageMs = now - firstSeen

    // Only start querying Safaricom directly after the grace period has elapsed
    // AND at most once every 15 seconds (Spike Arrest limit)
    if (record.status === 'pending' && record.checkout_request_id && ageMs >= GRACE_PERIOD_MS && (now - lastQueryTime >= 15000)) {
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
          } else if (
            // These codes mean the transaction is still being processed or not yet acted on.
            // Do NOT mark as failed — keep polling.
            resultCode === '4999' || resultCode === 4999 || // Still processing
            resultCode === '1037' || resultCode === 1037 || // No response yet (user hasn't acted)
            resultCode === '1032' || resultCode === 1032 || // Request cancelled by user (transient in sandbox)
            resultCode === '2001' || resultCode === 2001    // Wrong PIN entered but prompt still open
          ) {
            record.status = 'pending'
          } else {
            // Any other non-zero ResultCode is a definitive failure
            // (e.g. insufficient funds=1, wrong PIN limit exceeded, etc.)
            console.log(`[status] Marking ${reference} as failed — ResultCode: ${resultCode}`)
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
