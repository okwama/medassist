export interface StudentForm {
  name: string
  email: string
  phone: string
  county: string
  studyLevel: string
  referral: string
}

export interface PaymentRecord {
  id?: number
  reference: string
  name: string
  email: string
  phone: string
  county: string
  study_level: string
  referral: string
  course: string
  amount: number
  status: 'pending' | 'success' | 'failed'
  mpesa_receipt?: string
  checkout_request_id?: string
  created_at?: Date
  paid_at?: Date
}

export interface DarajaAuthResponse {
  access_token: string
  expires_in: string
}

export interface DarajaSTKResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export interface DarajaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{
          Name: string
          Value?: string | number
        }>
      }
    }
  }
}
