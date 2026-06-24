import { google } from 'googleapis'
import { PaymentRecord } from '@/types'

export async function appendToSheet(record: PaymentRecord) {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
    const sheetId = process.env.GOOGLE_SHEET_ID

    if (!email || !privateKey || !sheetId) {
      console.warn('Google Sheets config is missing. Skipping spreadsheet logging.')
      return
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: email,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
          record.name,
          record.email,
          record.phone,
          record.county,
          record.study_level,
          record.referral,
          record.course,
          record.amount,
          record.mpesa_receipt || '',
          record.reference,
          record.status
        ]]
      }
    })
    console.log(`Appended reference ${record.reference} to Google Sheet`)
  } catch (err) {
    console.error('Failed to append to Google Sheet:', err)
  }
}
