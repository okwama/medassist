"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const COURSE_START_DATE = '15 August 2026'

function SuccessContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')
  
  const [record, setRecord] = useState<{
    name: string
    email: string
    mpesa_receipt?: string
    status: string
    amount?: number
  } | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)

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

  const whatsappGroupLink = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || 'https://chat.whatsapp.com/mock'

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <div className="size-10 border-4 border-[#00bfb3] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-[#5c8580]">Confirming transaction details...</p>
      </div>
    )
  }

  const studentName = record?.name || 'Student'
  const displayAmount = record?.amount ? `KES ${Number(record.amount).toLocaleString()}` : '—'
  const receiptEmail = record?.email || 'your email'

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
          <h1 className="text-xl font-bold text-client-text">Payment Confirmed!</h1>
          <div className="text-xs text-client-text space-y-1">
            <p>Welcome to MedAssist Academy, <strong className="text-client-accent">{studentName}</strong>!</p>
            <p>Your spot in Cohort 1 is secured.</p>
            <p>Join our WhatsApp group to get started.</p>
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
            <span className="font-semibold text-client-accent">{COURSE_START_DATE}</span>
          </div>
          <div className="flex justify-between items-center border-t border-client-border pt-3">
            <span>Receipt sent to</span>
            <span className="font-semibold text-client-accent truncate max-w-[200px]">{receiptEmail}</span>
          </div>
        </div>

        {/* WhatsApp Button */}
        <div className="space-y-3 pt-2">
          <a
            href={whatsappGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-client-accent text-client-dark font-bold py-3.5 px-4 rounded-lg hover:bg-client-accent-hover active:bg-client-accent-active transition flex items-center justify-center gap-2 text-sm"
          >
            <span>💬</span> Join Our WhatsApp Group
          </a>
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
