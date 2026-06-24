"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const studyLevels = [
  { id: 'Certificate', label: 'Certificate' },
  { id: 'Diploma', label: 'Diploma' },
  { id: 'Degree', label: 'Degree' },
  { id: 'Masters', label: 'Masters' },
  { id: 'PhD', label: 'PhD' },
  { id: 'Working Professional', label: 'Working Professional' },
]

const referralOptions = [
  { id: 'Instagram', label: 'Instagram' },
  { id: 'TikTok', label: 'TikTok' },
  { id: 'Referred by a friend', label: 'Referred by a friend' },
  { id: 'University', label: 'University' },
  { id: 'Other', label: 'Other' },
]

// Course constants matching client screenshot data
const COURSE_NAME = process.env.NEXT_PUBLIC_COURSE_NAME || 'MedAssist Academy'
const COURSE_DURATION = '6 Weeks · Sat & Sun'
const COURSE_START_DATE = '15 August 2026'
const COURSE_PRICE = 8000

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  
  // Step 1 Form Data
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [county, setCounty] = useState('')
  const [studyLevel, setStudyLevel] = useState('Working Professional')
  const [referral, setReferral] = useState('')
  
  // Step 2 M-Pesa Number
  const [mpesaPhone, setMpesaPhone] = useState('')

  // State Management
  const [reference, setReference] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pollingStatus, setPollingStatus] = useState<'pending' | 'success' | 'failed' | ''>('')
  
  // Pre-fill M-Pesa number when phone is entered in Step 1
  useEffect(() => {
    if (phone && !mpesaPhone) {
      setMpesaPhone(phone)
    }
  }, [phone])

  // Form Validations
  const validateStep1 = () => {
    if (!name.trim()) return 'Full Name is required'
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return 'A valid Email is required'
    
    const cleanPhone = phone.trim().replace(/\s+/g, '')
    const kenyanPhoneRegex = /^(?:254|\+254|0)?(7|1)\d{8}$/
    if (!cleanPhone || !kenyanPhoneRegex.test(cleanPhone)) {
      return 'Please enter a valid Kenyan phone number (e.g. 07XXXXXXXX)'
    }
    
    if (!county.trim()) return 'County is required'
    if (!referral) return 'Please select how you heard about us'
    return null
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) {
      setError(err)
      return
    }
    setError('')
    setStep(2)
  }

  // STK Push Trigger
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const cleanMpesaPhone = mpesaPhone.trim().replace(/\s+/g, '')
    const kenyanPhoneRegex = /^(?:254|\+254|0)?(7|1)\d{8}$/
    if (!cleanMpesaPhone || !kenyanPhoneRegex.test(cleanMpesaPhone)) {
      setError('Please enter a valid M-Pesa phone number')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: cleanMpesaPhone,
          county,
          studyLevel,
          referral
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to trigger STK Push')
      }

      setReference(data.reference)
      setStep(3)
      setPollingStatus('pending')
      startPolling(data.reference)
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  // Polling logic
  const startPolling = (ref: string) => {
    let attempts = 0
    const maxAttempts = 40 // ~2 minutes
    
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/status?ref=${ref}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'success') {
            clearInterval(interval)
            setPollingStatus('success')
            router.push(`/success?ref=${ref}`)
          } else if (data.status === 'failed') {
            clearInterval(interval)
            setPollingStatus('failed')
            setError('Payment was cancelled or failed. Please try again.')
          }
        }
      } catch (err) {
        console.error('Error polling status:', err)
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        setPollingStatus('failed')
        setError('Transaction timed out. If you already entered your PIN, please check your email for confirmation shortly or contact support.')
      }
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-client-bg flex flex-col items-center justify-center p-4">
      {/* Wrapper */}
      <div className="w-full max-w-[440px] space-y-6">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between px-2 text-xs font-semibold select-none">
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center justify-center size-5 rounded-full text-[10px] ${step >= 1 ? 'bg-client-accent text-client-dark' : 'bg-client-inner-bg text-client-muted'}`}>1</span>
            <span className={step >= 1 ? 'text-client-accent' : 'text-client-muted'}>Details</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center justify-center size-5 rounded-full text-[10px] ${step >= 2 ? 'bg-client-accent text-client-dark' : 'bg-client-inner-bg text-client-muted'}`}>2</span>
            <span className={step >= 2 ? 'text-client-accent' : 'text-client-muted'}>Payment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center justify-center size-5 rounded-full text-[10px] ${step >= 3 ? 'bg-client-accent text-client-dark' : 'bg-client-inner-bg text-client-muted'}`}>3</span>
            <span className={step >= 3 ? 'text-client-accent' : 'text-client-muted'}>Confirm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center justify-center size-5 rounded-full text-[10px] ${step >= 4 ? 'bg-client-accent text-client-dark' : 'bg-client-inner-bg text-client-muted'}`}>4</span>
            <span className={step >= 4 ? 'text-client-accent' : 'text-client-muted'}>Access</span>
          </div>
        </div>

        {/* Card Main */}
        <div className="bg-client-card rounded-2xl p-6 space-y-6">
          {error && (
            <div className="bg-red-950/40 text-red-400 p-3 rounded-lg text-xs font-medium border border-red-900/30">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-white">Your Details</h1>
                <p className="text-xs text-client-muted mt-1">Fill in your information to reserve your spot</p>
              </div>

              <div className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-client-accent tracking-wider block">FULL NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Wanjiku"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-client-input text-client-light placeholder-client-muted text-sm px-4 py-3 rounded-lg border-none outline-none focus:ring-1 focus:ring-client-accent transition"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-client-accent tracking-wider block">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    placeholder="jane@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-client-input text-client-light placeholder-client-muted text-sm px-4 py-3 rounded-lg border-none outline-none focus:ring-1 focus:ring-client-accent transition"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-client-accent tracking-wider block">PHONE NUMBER</label>
                  <input
                    type="tel"
                    placeholder="07XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-client-input text-client-light placeholder-client-muted text-sm px-4 py-3 rounded-lg border-none outline-none focus:ring-1 focus:ring-client-accent transition"
                  />
                </div>

                {/* County & Study Level Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-client-accent tracking-wider block">COUNTY</label>
                    <input
                      type="text"
                      placeholder="e.g. Nairobi"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="w-full bg-client-input text-client-light placeholder-client-muted text-sm px-4 py-3 rounded-lg border-none outline-none focus:ring-1 focus:ring-client-accent transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-client-accent tracking-wider block">STUDY LEVEL</label>
                    <select
                      value={studyLevel}
                      onChange={(e) => setStudyLevel(e.target.value)}
                      className="w-full bg-client-input text-client-light text-sm px-4 py-3 rounded-lg border-none outline-none focus:ring-1 focus:ring-client-accent transition appearance-none cursor-pointer"
                    >
                      {studyLevels.map((opt) => (
                        <option key={opt.id} value={opt.id} className="bg-client-input text-client-light">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* How did you hear about us */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-client-accent tracking-wider block">HOW DID YOU HEAR ABOUT US?</label>
                  <select
                    value={referral}
                    onChange={(e) => setReferral(e.target.value)}
                    className="w-full bg-client-input text-client-light text-sm px-4 py-3 rounded-lg border-none outline-none focus:ring-1 focus:ring-client-accent transition appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-client-muted">Select</option>
                    {referralOptions.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-client-input text-client-light">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-client-accent text-client-dark font-bold py-3.5 px-4 rounded-lg hover:bg-client-accent-hover active:bg-client-accent-active transition flex items-center justify-center gap-1.5 mt-4 text-sm"
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-white">Order Summary</h1>
                <p className="text-xs text-client-muted mt-1">Review your details before paying</p>
              </div>

              {/* Order Summary Details */}
              <div className="bg-client-inner-bg rounded-xl p-4.5 space-y-3.5 text-xs text-client-text">
                <div className="flex justify-between items-center">
                  <span>Programme</span>
                  <span className="font-semibold text-white">{COURSE_NAME}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Duration</span>
                  <span className="font-semibold text-white">{COURSE_DURATION}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Start Date</span>
                  <span className="font-semibold text-white">{COURSE_START_DATE}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Name</span>
                  <span className="font-semibold text-white">{name}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-client-border">
                  <span className="font-bold text-client-text">Total</span>
                  <span className="font-bold text-client-accent text-sm">KES {COURSE_PRICE.toLocaleString()}</span>
                </div>
              </div>

              {/* STK Push Info Box */}
              <div className="bg-client-inner-bg rounded-xl p-4.5 flex items-center gap-3.5">
                <img src="/mpesa.png" alt="M-Pesa" className="size-10 object-contain rounded-lg flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Pay via M-Pesa STK Push</h4>
                  <p className="text-[10px] text-client-muted mt-0.5">An M-Pesa prompt will be sent to your phone</p>
                </div>
              </div>

              {/* M-Pesa phone number input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-client-accent tracking-wider block">M-PESA NUMBER</label>
                <input
                  type="tel"
                  placeholder="07XXXXXXXX"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  className="w-full bg-client-input text-client-light placeholder-client-muted text-sm px-4 py-3 rounded-lg border-none outline-none focus:ring-1 focus:ring-client-accent transition"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handlePay}
                  disabled={isSubmitting}
                  className="w-full bg-client-accent text-client-dark font-bold py-3.5 px-4 rounded-lg hover:bg-client-accent-hover active:bg-client-accent-active disabled:opacity-50 transition flex items-center justify-center gap-1.5 text-sm"
                >
                  {isSubmitting ? 'Sending Request...' : `Pay KES ${COURSE_PRICE.toLocaleString()} via M-Pesa →`}
                </button>

                <button
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="w-full text-client-muted hover:text-client-accent text-xs font-bold py-2.5 transition"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white">Check Your Phone 📱</h1>
                <p className="text-xs text-client-muted mt-1">Enter your M-Pesa PIN to complete payment</p>
              </div>

              {/* Status Message */}
              <div className="bg-client-inner-bg rounded-xl p-4.5 border-l-4 border-client-accent text-xs text-client-text leading-relaxed">
                An M-Pesa STK Push has been sent to <strong className="text-white">{mpesaPhone}</strong>. Enter your <strong className="text-white">M-Pesa PIN</strong> on your phone when prompted, then tap &quot;Confirm&quot; below.
              </div>

              {/* Polling Spinner */}
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <div className="size-10 border-4 border-client-accent border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xs font-bold text-white">Waiting for payment...</div>
                <div className="text-[10px] text-client-muted">Please enter your M-Pesa PIN on your phone</div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    // Check status manually or just trigger poll success/check
                    startPolling(reference)
                  }}
                  className="w-full bg-client-accent text-client-dark font-bold py-3.5 px-4 rounded-lg hover:bg-client-accent-hover active:bg-client-accent-active transition text-sm"
                >
                  I&apos;ve Entered My PIN ✓
                </button>

                <button
                  onClick={() => {
                    setStep(2)
                    setIsSubmitting(false)
                  }}
                  className="w-full text-client-muted hover:text-client-accent text-xs font-bold py-2.5 transition"
                >
                  ← Resend prompt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

