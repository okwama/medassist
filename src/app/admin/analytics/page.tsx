"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Users01,
  LogOut01,
  BarChartSquare02,
  Shield01,
  RefreshCw01,
  TrendUp01,
  Coins02,
  Download01,
} from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { NavItemBase } from '@/components/application/app-navigation/base-components/nav-item'

interface DayData {
  day: string
  total: number
  confirmed: number
  revenue: number
}

interface CourseData  { course: string; total: number; confirmed: number }
interface CountyData  { county: string; total: number }
interface ReferralData { referral: string; total: number }
interface Stats { total: number; paid: number; pending: number; failed: number; revenue: number }

interface Analytics {
  byDay:      DayData[]
  byCourse:   CourseData[]
  byCounty:   CountyData[]
  byReferral: ReferralData[]
  stats:      Stats
}

/* ─── Sidebar shared nav ─────────────────────────────────────────── */
function AdminSidebar({ pathname, onLogout }: { pathname: string; onLogout: () => void }) {
  const navItems = [
    { label: 'Student Enrollments', href: '/admin/dashboard', icon: Users01 },
    { label: 'Transaction History', href: '/admin/transactions', icon: RefreshCw01 },
    { label: 'Analytics & Reports',  href: '/admin/analytics',  icon: BarChartSquare02 },
    { label: 'Admin Users',          href: '/admin/users',      icon: Shield01 },
  ]
  return (
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
          {navItems.map((item) => (
            <NavItemBase key={item.href} href={item.href} type="link" icon={item.icon} current={pathname === item.href}>
              {item.label}
            </NavItemBase>
          ))}
        </nav>
      </div>
      <NavItemBase type="link" href="#" icon={LogOut01} onClick={(e) => { e.preventDefault(); onLogout() }}>
        Sign out
      </NavItemBase>
    </aside>
  )
}

/* ─── Bar chart (pure CSS) ───────────────────────────────────────── */
function BarChart({ data, valueKey, labelKey, color = '#00A3A3' }: {
  data: any[]; valueKey: string; labelKey: string; color?: string
}) {
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0), 1)
  return (
    <div className="flex items-end gap-1 h-32 w-full">
      {data.map((d, i) => {
        const val = Number(d[valueKey]) || 0
        const pct = Math.round((val / max) * 100)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 bg-text-primary text-bg-primary text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10 pointer-events-none">
              {d[labelKey]}: {val}
            </div>
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{ height: `${pct}%`, minHeight: val > 0 ? 4 : 0, backgroundColor: color, opacity: 0.8 }}
            />
          </div>
        )
      })}
    </div>
  )
}

/* ─── Horizontal bar (for courses / counties) ────────────────────── */
function HorizontalBar({ label, value, max, color = '#00A3A3' }: {
  label: string; value: number; max: number; color?: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-secondary font-medium truncate max-w-[60%]">{label}</span>
        <span className="text-text-tertiary">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-bg-primary border border-border-secondary rounded-xl p-5 animate-pulse space-y-4 shadow-xs">
      <div className="h-3 w-32 bg-bg-tertiary rounded" />
      <div className="h-32 bg-bg-tertiary rounded" />
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const router   = useRouter()
  const pathname = usePathname()

  const [data, setData]       = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]     = useState('')

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) {
        if (res.status === 401) { router.push('/admin'); return }
        throw new Error('Failed to fetch analytics')
      }
      setData(await res.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const handleExport = () => {
    if (!data) return
    const rows = [
      ['Date', 'Total', 'Confirmed', 'Revenue (KES)'],
      ...(data.byDay || []).map((d) => [d.day, d.total, d.confirmed, d.revenue]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `enrollments_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats      = data?.stats
  const byDay      = data?.byDay      || []
  const byCourse   = data?.byCourse   || []
  const byCounty   = data?.byCounty   || []
  const byReferral = data?.byReferral || []

  const maxCourse   = Math.max(...byCourse.map(d => Number(d.total)) , 1)
  const maxCounty   = Math.max(...byCounty.map(d => Number(d.total)) , 1)
  const maxReferral = Math.max(...byReferral.map(d => Number(d.total)), 1)

  return (
    <div className="min-h-screen bg-bg-secondary text-text-primary flex font-sans">
      <AdminSidebar pathname={pathname} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-bg-primary border-b border-border-secondary px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-text-primary">Analytics & Reports</h1>
            <p className="text-xs text-text-tertiary">Enrollment trends and revenue breakdown — last 30 days</p>
          </div>
          <div className="flex items-center gap-2">
            <Button color="secondary" size="sm" iconLeading={RefreshCw01} disabled={isLoading} onClick={fetchData}>
              Refresh
            </Button>
            <Button color="primary" size="sm" iconLeading={Download01} disabled={isLoading || !data} onClick={handleExport}>
              Export CSV
            </Button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-6 max-w-6xl mx-auto w-full space-y-5">

          {error && (
            <div className="bg-bg-error-primary border border-utility-red-200 text-utility-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-bg-primary border border-border-secondary rounded-xl p-5 animate-pulse shadow-xs space-y-3">
                  <div className="h-2.5 w-24 bg-bg-tertiary rounded" />
                  <div className="h-7 w-16 bg-bg-tertiary rounded" />
                </div>
              ))
            ) : (
              <>
                {[
                  { label: 'Total Enrollments', value: stats?.total ?? 0, icon: Users01,   accent: false },
                  { label: 'Total Revenue',      value: `KES ${(stats?.revenue ?? 0).toLocaleString()}`, icon: Coins02,   accent: true },
                  { label: 'Confirmed',          value: stats?.paid    ?? 0, icon: TrendUp01, accent: false },
                  { label: 'Pending',            value: stats?.pending ?? 0, icon: RefreshCw01, accent: false },
                ].map(({ label, value, icon: Icon, accent }) => (
                  <div key={label} className="bg-bg-primary border border-border-secondary rounded-xl p-5 flex flex-col gap-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{label}</span>
                      <div className="size-8 rounded-lg bg-utility-brand-50 flex items-center justify-center">
                        <Icon className="size-4 text-[#00A3A3]" />
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${accent ? 'text-[#00A3A3]' : 'text-text-primary'}`}>{value}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Enrollment trend chart */}
          <div className="bg-bg-primary border border-border-secondary rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-text-primary mb-1">Enrollment Trend</h2>
            <p className="text-xs text-text-tertiary mb-4">Daily enrollments over the past 30 days</p>
            {isLoading ? (
              <div className="h-32 bg-bg-tertiary rounded animate-pulse" />
            ) : byDay.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-sm text-text-tertiary">No data yet</div>
            ) : (
              <BarChart data={byDay} valueKey="total" labelKey="day" color="#00A3A3" />
            )}
          </div>

          {/* Revenue trend chart */}
          <div className="bg-bg-primary border border-border-secondary rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-text-primary mb-1">Revenue Trend</h2>
            <p className="text-xs text-text-tertiary mb-4">Daily confirmed revenue (KES) over the past 30 days</p>
            {isLoading ? (
              <div className="h-32 bg-bg-tertiary rounded animate-pulse" />
            ) : byDay.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-sm text-text-tertiary">No data yet</div>
            ) : (
              <BarChart data={byDay} valueKey="revenue" labelKey="day" color="#00bfb3" />
            )}
          </div>

          {/* Bottom grid: courses + county + referral */}
          <div className="grid md:grid-cols-3 gap-5">

            {/* By course */}
            <div className="bg-bg-primary border border-border-secondary rounded-xl p-5 shadow-xs">
              <h2 className="text-sm font-bold text-text-primary mb-1">By Course</h2>
              <p className="text-xs text-text-tertiary mb-4">Enrollment breakdown per course</p>
              {isLoading ? (
                <SkeletonCard />
              ) : byCourse.length === 0 ? (
                <p className="text-xs text-text-tertiary">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {byCourse.map((d) => (
                    <HorizontalBar key={d.course} label={d.course} value={Number(d.total)} max={maxCourse} />
                  ))}
                </div>
              )}
            </div>

            {/* By county */}
            <div className="bg-bg-primary border border-border-secondary rounded-xl p-5 shadow-xs">
              <h2 className="text-sm font-bold text-text-primary mb-1">Top Counties</h2>
              <p className="text-xs text-text-tertiary mb-4">Confirmed enrollments by county</p>
              {isLoading ? (
                <SkeletonCard />
              ) : byCounty.length === 0 ? (
                <p className="text-xs text-text-tertiary">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {byCounty.map((d) => (
                    <HorizontalBar key={d.county} label={d.county} value={Number(d.total)} max={maxCounty} color="#5ee0d6" />
                  ))}
                </div>
              )}
            </div>

            {/* By referral */}
            <div className="bg-bg-primary border border-border-secondary rounded-xl p-5 shadow-xs">
              <h2 className="text-sm font-bold text-text-primary mb-1">Referral Sources</h2>
              <p className="text-xs text-text-tertiary mb-4">Where students heard about us</p>
              {isLoading ? (
                <SkeletonCard />
              ) : byReferral.length === 0 ? (
                <p className="text-xs text-text-tertiary">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {byReferral.map((d) => (
                    <HorizontalBar key={d.referral} label={d.referral} value={Number(d.total)} max={maxReferral} color="#2ccdc2" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
