"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/base/badges/badges'
import { Button } from '@/components/base/buttons/button'

function SuccessContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')
  
  const [record, setRecord] = useState<{
    name: string
    email: string
    receipt_number?: string
    status: string
    amount?: number
    reference?: string
  } | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [courseStartDate, setCourseStartDate] = useState('15 August 2026')
  const [whatsappGroupLink, setWhatsappGroupLink] = useState('https://chat.whatsapp.com/mock')

  const status = record?.status
  const receiptNumber = record?.receipt_number || record?.reference || '—'

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/public/settings')
        if (res.ok) {
          const data = await res.json()
          setCourseStartDate(data.courseStartDate || '15 August 2026')
          setWhatsappGroupLink(data.whatsappGroupLink || 'https://chat.whatsapp.com/mock')
        }
      } catch (err) {
        console.error('Failed to load public settings', err)
      }
    }

    loadSettings()
  }, [])

  useEffect(() => {
    if (!ref) return
    
    fetch(`/api/status?ref=${ref}`)
      .then(res => res.json())
      .then(data => {
        setRecord(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [ref])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <div className="size-10 border-4 border-[#00bfb3] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-[#5c8580]">Fetching your payment status...</p>
      </div>
    )
  }

  const studentName = record?.name || 'Student'
  const displayAmount = record?.amount ? `KES ${Number(record.amount).toLocaleString()}` : '—'
  const receiptEmail = record?.email || 'your email'
  const statusLabel =
    status === 'success'
      ? 'Payment Confirmed!'
      : status === 'pending'
      ? 'Payment pending confirmation'
      : status === 'failed'
      ? 'Payment not confirmed'
      : 'Payment status'
  const statusDescription =
    status === 'success'
      ? 'Your payment has been manually confirmed by the admin team. Welcome to the cohort!'
      : status === 'pending'
      ? 'Your payment is pending review. Keep this page open and check back later, or contact admin with your reference.'
      : status === 'failed'
      ? 'We could not confirm your payment. Please contact support and provide your reference.'
      : 'We are checking your payment details.'

  return (
    <div className="w-full max-w-[440px] space-y-6">
      {/* Header Indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold select-none">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center size-5 rounded-full text-[10px] bg-client-accent text-client-dark">1</span>
          <span className="text-client-accent">Details</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center size-5 rounded-full text-[10px] bg-client-accent text-client-dark">2</span>
          <span className="text-client-accent">Payment</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center size-5 rounded-full text-[10px] bg-client-accent text-client-dark">3</span>
          <span className="text-client-accent">Confirm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center size-5 rounded-full text-[10px] bg-client-accent text-client-dark">4</span>
          <span className="text-client-accent">Access</span>
        </div>
      </div>

      <div className="bg-client-card rounded-2xl p-6 text-center space-y-5">
        {/* Emojis at the top */}
        <div className="text-3xl select-none tracking-widest pt-2">
          🎉 ✨ 🩺
        </div>

        {/* Checkmark circle */}
        <div className="mx-auto size-14 bg-client-accent rounded-full flex items-center justify-center text-client-dark">
          <svg className="size-6 stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-client-text">{statusLabel}</h1>
          <div className="text-xs text-client-text space-y-1">
            <p>Welcome to MedAssist Academy, <strong className="text-client-accent">{studentName}</strong>.</p>
            <p>{statusDescription}</p>
            {status === 'pending' && (
              <p>Your payment reference is <strong className="text-client-accent">{receiptNumber}</strong>.</p>
            )}
          </div>
        </div>

        {/* Details Box */}
        <div className="bg-client-inner-bg rounded-xl p-4.5 space-y-3 text-left text-xs text-client-text">
          <div className="flex justify-between items-center">
            <span>Amount Paid</span>
            <span className="font-bold text-client-accent">{displayAmount}</span>
          </div>
          <div className="flex justify-between items-center border-t border-client-border pt-3">
            <span>Start Date</span>
            <span className="font-semibold text-client-accent">{courseStartDate}</span>
          </div>
          <div className="flex justify-between items-center border-t border-client-border pt-3">
            <span>Receipt Number</span>
            <span className="font-semibold text-client-accent truncate max-w-[200px]">{receiptNumber}</span>
          </div>
          <div className="flex justify-between items-center border-t border-client-border pt-3">
            <span>Receipt sent to</span>
            <span className="font-semibold text-client-accent truncate max-w-[200px]">{receiptEmail}</span>
          </div>
        </div>


          <div className="space-y-3 pt-2">
          <div className="flex justify-center">
            <Badge color="success" type="pill-color" size="md">✓ Payment Confirmed</Badge>
          </div>
          <Button color="secondary" size="md" className="w-full justify-center" onClick={() => window.location.assign('/')}>
            Back to home
          </Button>
          <p className="text-[10px] text-client-muted">
            A confirmation email has also been sent to you
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-client-bg text-client-text flex flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="size-10 border-4 border-client-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-client-muted">Loading success information...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
