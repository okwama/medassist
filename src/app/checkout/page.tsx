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

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [courseName, setCourseName] = useState('Medical Course')
  const [courseDuration, setCourseDuration] = useState('6 Weeks · Sat & Sun')
  const [courseStartDate, setCourseStartDate] = useState('15 August 2026')
  const [coursePrice, setCoursePrice] = useState(8000)
  const [lightweightMode, setLightweightMode] = useState(false)
  
  // Step 1 Form Data
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [county, setCounty] = useState('')
  const [studyLevel, setStudyLevel] = useState('Working Professional')
  const [referral, setReferral] = useState('')
  
  // State Management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/public/settings')
        if (!res.ok) return

        const data = await res.json()
        setCourseName(data.courseName || 'Medical Course')
        setCourseDuration(data.courseDuration || '6 Weeks · Sat & Sun')
        setCourseStartDate(data.courseStartDate || '15 August 2026')
        setCoursePrice(Number(data.coursePrice || 8000))
        setLightweightMode(Boolean(data.lightweightMode))
      } catch (err) {
        console.error('Failed to load public settings', err)
      }
    }

    loadSettings()
  }, [])

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

    try {
      const res = await fetch('/api/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          county,
          studyLevel,
          referral,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create payment record')
      }

      const reference = data.reference
      if (!reference) {
        throw new Error('Missing payment reference from server')
      }

      const selarLink = 'https://selar.com/7447833287'
      window.open(selarLink, '_blank')
      router.push(`/success?ref=${encodeURIComponent(reference)}`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Unable to proceed to payment')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="font-sans antialiased text-[#0A0A0A] bg-white min-h-screen flex flex-col">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      {/* Navigation Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 shadow-sm z-50">
        <nav className="max-w-[1200px] mx-auto flex justify-between items-center p-4 px-8">
          <a
            href="/"
            className="text-2xl font-bold text-[#00A3A3] flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault()
              router.push('/')
            }}
          >
            <i className="fa-solid fa-user-nurse"></i> MedAssist
          </a>
          <ul className="flex gap-8 items-center">
            <li>
              <a
                href="/"
                className="font-semibold text-[#0A0A0A] hover:text-[#00A3A3] transition-colors py-2 block"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/')
                }}
              >
                Back to Site
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 bg-gray-50 py-16">
        {/* Wrapper */}
        <div className="w-full max-w-[440px] space-y-6">
          
          {/* Back to Home Button */}
          <div className="px-2">
            <button
              onClick={() => router.push('/')}
              className="text-xs font-semibold text-gray-500 hover:text-[#00A3A3] transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-left"></i> Back to Home
            </button>
          </div>

          {/* Step Indicator Header */}
          <div className="flex items-center justify-between px-2 text-xs font-semibold select-none">
            <div className="flex items-center gap-1.5">
              <span className={`flex items-center justify-center size-5 rounded-full text-[10px] ${step >= 1 ? 'bg-client-accent text-white' : 'bg-gray-200 text-gray-400'}`}>1</span>
              <span className={step >= 1 ? 'text-client-accent' : 'text-gray-400'}>Details</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`flex items-center justify-center size-5 rounded-full text-[10px] ${step >= 2 ? 'bg-client-accent text-white' : 'bg-gray-200 text-gray-400'}`}>2</span>
              <span className={step >= 2 ? 'text-client-accent' : 'text-gray-400'}>Payment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`flex items-center justify-center size-5 rounded-full text-[10px] ${step >= 3 ? 'bg-client-accent text-white' : 'bg-gray-200 text-gray-400'}`}>3</span>
              <span className={step >= 3 ? 'text-client-accent' : 'text-gray-400'}>Confirm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`flex items-center justify-center size-5 rounded-full text-[10px] ${step >= 4 ? 'bg-client-accent text-white' : 'bg-gray-200 text-gray-400'}`}>4</span>
              <span className={step >= 4 ? 'text-client-accent' : 'text-gray-400'}>Access</span>
            </div>
          </div>

          {/* Card Main */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-xs font-medium border border-red-200">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-client-light">Your Details</h1>
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
                <h1 className="text-xl font-bold text-client-light">Order Summary</h1>
                <p className="text-xs text-client-muted mt-1">Review your details before paying</p>
              </div>

              {/* Order Summary Details */}
              <div className="bg-client-inner-bg rounded-xl p-4.5 space-y-3.5 text-xs text-client-text">
                <div className="flex justify-between items-center">
                  <span>Programme</span>
                  <span className="font-semibold text-client-light">{courseName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Duration</span>
                  <span className="font-semibold text-client-light">{courseDuration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Start Date</span>
                  <span className="font-semibold text-client-light">{courseStartDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Name</span>
                  <span className="font-semibold text-client-light">{name}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-client-border">
                  <span className="font-bold text-client-text">Total</span>
                  <span className="font-bold text-client-accent text-sm">KES {coursePrice.toLocaleString()}</span>
                </div>
              </div>

              {/* STK Push Info Box */}
              {lightweightMode ? (
                <div className="rounded-xl border border-[#00A3A3]/20 bg-[#e6f6f6] p-3 text-[11px] text-client-light">
                  This is a training-first programme. We do not offer agency placement or guaranteed job placement.
                </div>
              ) : null}

              <div className="bg-client-inner-bg rounded-xl p-4.5 flex items-center gap-3.5">
                <div className="size-10 rounded-lg bg-[#00A3A3]/10 text-[#00A3A3] flex items-center justify-center">
                  <i className="fa-solid fa-link"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-client-light">Pay via Selar</h4>
                  <p className="text-[10px] text-client-muted mt-0.5">You will be redirected to Selar to complete the checkout.</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handlePay}
                  className="w-full bg-client-accent text-client-dark font-bold py-3.5 px-4 rounded-lg hover:bg-client-accent-hover active:bg-client-accent-active transition flex items-center justify-center gap-1.5 text-sm"
                >
                  Pay KES {coursePrice.toLocaleString()} via Selar →
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full text-client-muted hover:text-client-accent text-xs font-bold py-2.5 transition"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          </div>
        </div>
      </div>
    </div>
  )
}
