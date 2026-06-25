"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BarChartSquare02, LogOut01, RefreshCw01, Settings01, Shield01, Users01 } from '@untitledui/icons'

export default function AdminSettingsPage() {
  const router = useRouter()
  const pathname = usePathname()

  const [coursePrice, setCoursePrice] = useState('8000')
  const [courseName, setCourseName] = useState('Medical Course')
  const [courseStartDate, setCourseStartDate] = useState('15 August 2026')
  const [courseDuration, setCourseDuration] = useState('6 Weeks')
  const [whatsappGroupLink, setWhatsappGroupLink] = useState('https://chat.whatsapp.com/mock')
  const [lightweightMode, setLightweightMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/admin')
            return
          }
          throw new Error('Failed to load settings')
        }

        const data = await res.json()
        const settings = data.settings || {}
        setCoursePrice(settings.course_price ?? '8000')
        setCourseName(settings.course_name ?? 'Medical Course')
        setCourseStartDate(settings.course_start_date ?? '15 August 2026')
        setCourseDuration(settings.course_duration ?? '6 Weeks')
        setWhatsappGroupLink(settings.whatsapp_group_link ?? 'https://chat.whatsapp.com/mock')
        setLightweightMode(String(settings.lightweight_mode ?? 'false') === 'true')
      } catch (err: any) {
        setError(err.message)
      }
    }

    loadSettings()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coursePrice: Number(coursePrice || 0),
          courseName,
          courseStartDate,
          courseDuration,
          whatsappGroupLink,
          lightweightMode,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save settings')
      }

      setMessage('Settings saved successfully.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const navItems = [
    { label: 'Student Enrollments', href: '/admin/dashboard', icon: Users01 },
    { label: 'Transaction History', href: '/admin/transactions', icon: RefreshCw01 },
    { label: 'Analytics & Reports', href: '/admin/analytics', icon: BarChartSquare02 },
    { label: 'Admin Users', href: '/admin/users', icon: Shield01 },
    { label: 'Site Settings', href: '/admin/settings', icon: Settings01 },
  ]

  return (
    <div className="min-h-screen bg-bg-secondary text-text-primary flex font-sans">
      <aside className="hidden md:flex w-64 bg-bg-primary border-r border-border-secondary flex-col justify-between py-5 px-4 flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="size-8 rounded-lg bg-utility-brand-50 flex items-center justify-center">
              <span className="text-[#00A3A3] font-black text-sm">M</span>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary leading-none">MedAssist</p>
              <p className="text-[10px] text-text-tertiary">Academy Admin</p>
            </div>
          </div>

          <nav className="space-y-0.5">
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-2 pb-1">Menu</p>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${pathname === item.href ? 'bg-utility-brand-50 text-[#00A3A3]' : 'text-text-secondary hover:bg-bg-secondary'}`}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </a>
              )
            })}
          </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-secondary">
          <LogOut01 className="size-4" />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl rounded-2xl border border-border-secondary bg-bg-primary p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00A3A3]">Admin</p>
            <h1 className="mt-2 text-2xl font-bold text-text-primary">Site settings</h1>
            <p className="mt-2 text-sm text-text-secondary">Manage the public course settings without redeploying the app.</p>
          </div>

          {message ? <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
          {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-text-primary">Course price (KES)</span>
                <input type="number" min="0" value={coursePrice} onChange={(e) => setCoursePrice(e.target.value)} className="w-full rounded-lg border border-border-secondary bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-[#00A3A3]" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-text-primary">Course name</span>
                <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="w-full rounded-lg border border-border-secondary bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-[#00A3A3]" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-text-primary">Start date</span>
                <input type="text" value={courseStartDate} onChange={(e) => setCourseStartDate(e.target.value)} className="w-full rounded-lg border border-border-secondary bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-[#00A3A3]" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-text-primary">Duration</span>
                <input type="text" value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)} className="w-full rounded-lg border border-border-secondary bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-[#00A3A3]" />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-text-primary">WhatsApp group link</span>
              <input type="url" value={whatsappGroupLink} onChange={(e) => setWhatsappGroupLink(e.target.value)} className="w-full rounded-lg border border-border-secondary bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-[#00A3A3]" />
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-border-secondary bg-bg-secondary px-4 py-3">
              <input type="checkbox" checked={lightweightMode} onChange={(e) => setLightweightMode(e.target.checked)} className="size-4 rounded border-border-secondary text-[#00A3A3] focus:ring-[#00A3A3]" />
              <span className="text-sm text-text-primary">Enable lightweight course messaging</span>
            </label>

            <div className="flex justify-end">
              <button type="submit" disabled={isSaving} className="rounded-lg bg-[#00A3A3] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#008282] disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? 'Saving...' : 'Save settings'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
