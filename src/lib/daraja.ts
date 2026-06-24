import { DarajaAuthResponse, DarajaSTKResponse } from '@/types'

const BASE_URL = process.env.DARAJA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

// ---------------------------------------------------------------------------
// Token cache – Daraja tokens are valid for 1 hour; we refresh after 55 min
// ---------------------------------------------------------------------------
let _cachedToken: string | null = null
let _tokenExpiry = 0 // Unix ms

export async function getDarajaToken(): Promise<string> {
  const now = Date.now()
  if (_cachedToken && now < _tokenExpiry) {
    return _cachedToken
  }

  const key = process.env.DARAJA_CONSUMER_KEY!
  const secret = process.env.DARAJA_CONSUMER_SECRET!
  const auth = Buffer.from(`${key}:${secret}`).toString('base64')

  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error(`Failed to generate Daraja token: ${res.statusText}`)
  }

  const data: DarajaAuthResponse = await res.json()
  _cachedToken = data.access_token
  _tokenExpiry = now + 55 * 60 * 1000 // cache for 55 minutes
  return _cachedToken
}

export async function sendSTKPush(
  token: string,
  phone: string,
  amount: number,
  reference: string,
  description: string
): Promise<DarajaSTKResponse> {
  const shortcode = process.env.DARAJA_SHORTCODE!
  const passkey = process.env.DARAJA_PASSKEY!
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

  // Normalize phone: 07XX → 2547XX
  let normalizedPhone = phone.trim().replace(/\s+/g, '')
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = `254${normalizedPhone.slice(1)}`
  } else if (normalizedPhone.startsWith('+')) {
    normalizedPhone = normalizedPhone.slice(1)
  }

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline', // CustomerPayBillOnline (for Till or Paybill online payment)
    Amount: amount,
    PartyA: normalizedPhone,
    PartyB: shortcode,
    PhoneNumber: normalizedPhone,
    CallBackURL: process.env.DARAJA_CALLBACK_URL!,
    AccountReference: reference,
    TransactionDesc: description
  }

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`STK Push failed: ${res.status} ${errorText}`)
  }

  return res.json()
}

export async function querySTKStatus(
  token: string,
  checkoutRequestId: string
): Promise<any> {
  const shortcode = process.env.DARAJA_SHORTCODE!
  const passkey = process.env.DARAJA_PASSKEY!
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId
  }

  const res = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  // We return the parsed JSON response (even if status is not 200, as the body contains details)
  return res.json()
}
