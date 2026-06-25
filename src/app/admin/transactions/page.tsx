"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Users01,
  RefreshCw01,
  LogOut01,
  SearchMd,
  AlertCircle,
  Printer,
  X,
  BarChartSquare02,
  Shield01,
} from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { Badge } from '@/components/base/badges/badges'
import { NavItemBase } from '@/components/application/app-navigation/base-components/nav-item'

interface Payment {
  id: number
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
  created_at: string
  paid_at?: string
}

interface Stats {
  total: number
  paid: number
  pending: number
  failed: number
  revenue: number
}

type StatusFilter = 'all' | 'success' | 'pending' | 'failed'

const STATUS_TABS = [
  { key: 'all' as StatusFilter,     label: 'All' },
  { key: 'success' as StatusFilter, label: 'Confirmed' },
  { key: 'pending' as StatusFilter, label: 'Pending' },
  { key: 'failed' as StatusFilter,  label: 'Failed' },
]

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-bg-primary border border-border-secondary rounded-xl p-5 flex flex-col gap-2 shadow-xs">
      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-bold ${accent ? 'text-[#00A3A3]' : 'text-text-primary'}`}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: Payment['status'] }) {
  if (status === 'success') return <Badge color="success" type="pill-color" size="sm">Confirmed</Badge>
  if (status === 'pending') return <Badge color="warning" type="pill-color" size="sm">Pending</Badge>
  return <Badge color="error" type="pill-color" size="sm">Failed</Badge>
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-border-secondary animate-pulse">
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-bg-tertiary shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-bg-tertiary rounded" />
                <div className="h-2.5 w-20 bg-bg-tertiary rounded" />
              </div>
            </div>
          </td>
          {[80, 64, 72, 48, 56, 40, 32].map((w, j) => (
            <td key={j} className="px-5 py-4">
              <div className={`h-3 w-${w === 32 ? '8' : w === 40 ? '10' : w === 48 ? '12' : w === 56 ? '14' : w === 64 ? '16' : w === 72 ? '18' : '20'} bg-bg-tertiary rounded`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <tr>
      <td colSpan={8}>
        <div className="p-14 flex flex-col items-center justify-center gap-3 text-center">
          <div className="size-12 rounded-xl bg-utility-brand-50 flex items-center justify-center">
            <RefreshCw01 className="size-6 text-[#00A3A3]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {filtered ? 'No matching records' : 'No transactions yet'}
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              {filtered
                ? 'Try adjusting your search or filter.'
                : 'Transaction history will appear here once payments are initiated.'}
            </p>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Receipt printer — opens a fresh window with standalone receipt HTML
// ---------------------------------------------------------------------------
function printReceipt(p: Payment) {
  const paid = new Date(p.paid_at || p.created_at)
  const dateStr = paid.toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = paid.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })

  const rows = [
    ['Programme',    'Medical Virtual Assistant Training'],
    ['Cohort',       'Cohort 1 — 2026'],
    ['Student Name', p.name],
    ['Email Address',p.email],
    ['Phone Number', p.phone],
    ['County',       p.county],
    ['Study Level',  p.study_level],
    ['Ref ID',       p.reference],
    ['M-Pesa No.',   p.phone],
    ['Date',         dateStr],
    ['Time',         timeStr],
  ]

  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td class="label">${label}</td>
      <td class="value">${value ?? '—'}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt — ${p.mpesa_receipt ?? p.reference}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: Arial, Helvetica, sans-serif;
      background: #f3f6f8;
      color: #111827;
      font-size: 13px;
      line-height: 1.5;
    }
    .receipt-card {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 28px 32px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 18px;
      border-bottom: 2px solid #00A3A3;
      margin-bottom: 20px;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: #e6f7f7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 800;
      color: #00A3A3;
    }
    .brand-name { font-size: 18px; font-weight: 800; color: #00A3A3; }
    .brand-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .receipt-meta { text-align: right; }
    .receipt-label { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .8px; }
    .receipt-no { font-size: 20px; font-weight: 800; color: #00A3A3; font-family: Consolas, monospace; letter-spacing: 1px; margin-top: 4px; }
    .status-banner {
      background: #e6f7f7;
      border: 1px solid #b2e8e8;
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .status-dot { width: 10px; height: 10px; border-radius: 999px; background: #00A3A3; flex-shrink: 0; }
    .status-text { font-weight: 700; color: #008282; font-size: 13px; }
    .section-title {
      font-size: 10px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: .8px;
      margin-bottom: 10px;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
    tr { border-bottom: 1px solid #f3f4f6; }
    tr:last-child { border-bottom: none; }
    td { padding: 10px 0; vertical-align: top; }
    td.label { width: 38%; color: #6b7280; font-size: 12px; }
    td.value { color: #111827; font-weight: 600; font-size: 12px; text-align: right; }
    .amount-row {
      background: linear-gradient(135deg, #f7fffe 0%, #eefbf8 100%);
      border: 1.5px solid #00A3A3;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 22px;
    }
    .amount-label { font-size: 12px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: .8px; }
    .amount-value { font-size: 24px; font-weight: 800; color: #00A3A3; font-family: Consolas, monospace; }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
      font-size: 11px;
      color: #6b7280;
    }
    .footer-left { line-height: 1.7; }
    .footer-right { text-align: right; line-height: 1.7; }
    .footer-note {
      margin-top: 14px;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
      font-style: italic;
    }
    @media print {
      body {
        background: #fff;
        padding: 0;
      }
      .receipt-card {
        max-width: none;
        border: none;
        border-radius: 0;
        box-shadow: none;
        padding: 0;
        margin: 0;
      }
      @page { size: A4; margin: 10mm; }
      .receipt-card { break-inside: avoid; }
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="header">
      <div class="brand-logo">
        <div class="brand-icon">M</div>
        <div>
          <div class="brand-name">MedAssist Academy</div>
          <div class="brand-sub">Academy &amp; Agency · Cohort 1</div>
        </div>
      </div>
      <div class="receipt-meta">
        <div class="receipt-label">M-Pesa Receipt No.</div>
        <div class="receipt-no">${p.mpesa_receipt ?? '—'}</div>
      </div>
    </div>

    <div class="status-banner">
      <div class="status-dot"></div>
      <span class="status-text">✓ Payment Confirmed — Official Receipt</span>
    </div>

    <div class="section-title">Enrolment Details</div>
    <table>${rowsHtml}</table>

    <div class="amount-row">
      <span class="amount-label">Total Amount Paid</span>
      <span class="amount-value">KES ${Number(p.amount).toLocaleString()}</span>
    </div>

    <div class="footer">
      <div class="footer-left">
        MedAssist Academy &amp; Agency<br/>
        admin@medassistacademy.co.ke<br/>
        Generated: ${new Date().toLocaleString('en-KE')}
      </div>
      <div class="footer-right">
        Ref: ${p.reference}<br/>
        This is an official receipt
      </div>
    </div>
    <div class="footer-note">Thank you for enrolling. Keep this receipt for your records.</div>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=800,height=960')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

export default function AdminTransactions() {
  const router   = useRouter()
  const pathname = usePathname()

  const [payments, setPayments]             = useState<Payment[]>([])
  const [stats, setStats]                   = useState<Stats>({ total: 0, paid: 0, pending: 0, failed: 0, revenue: 0 })
  const [search, setSearch]                 = useState('')
  const [statusFilter, setStatusFilter]     = useState<StatusFilter>('all')
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null)
  const [isLoading, setIsLoading]           = useState(true)
  const [error, setError]                   = useState('')
  const [currentPage, setCurrentPage]       = useState(1)
  const itemsPerPage = 10

  const fetchPayments = useCallback(async () => {
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/payments')
      if (!res.ok) {
        if (res.status === 401) { router.push('/admin'); return }
        throw new Error('Failed to load payments')
      }
      const data = await res.json()
      setPayments(data.payments || [])
      setStats(data.stats || { total: 0, paid: 0, pending: 0, failed: 0, revenue: 0 })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => { fetchPayments() }, [fetchPayments])
  useEffect(() => { setCurrentPage(1) }, [search, statusFilter])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin')
      router.refresh()
    } catch (err) { console.error('Logout failed:', err) }
  }

  const countByStatus = (s: Payment['status']) => payments.filter(p => p.status === s).length

  const filteredPayments = payments.filter(p => {
    const q = search.toLowerCase()
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.reference.toLowerCase().includes(q) ||
      (p.mpesa_receipt && p.mpesa_receipt.toLowerCase().includes(q))
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const navItems = [
    { label: 'Student Enrollments', href: '/admin/dashboard', icon: Users01 },
    { label: 'Transaction History', href: '/admin/transactions', icon: RefreshCw01 },
    { label: 'Analytics & Reports',  href: '/admin/analytics',  icon: BarChartSquare02 },
    { label: 'Admin Users',          href: '/admin/users',      icon: Shield01 },
  ]

  return (
    <div className="min-h-screen bg-bg-secondary text-text-primary flex font-sans">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-bg-primary border-r border-border-secondary flex-col justify-between py-5 px-4 flex-shrink-0">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="size-8 rounded-lg bg-utility-brand-50 flex items-center justify-center">
              <span className="text-[#00A3A3] font-black text-sm">M</span>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary leading-none">MedAssist</p>
              <p className="text-[10px] text-text-tertiary">Academy Admin</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-0.5">
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-2 pb-1">Menu</p>
            {navItems.map((item) => (
              <NavItemBase key={item.href} href={item.href} type="link" icon={item.icon} current={pathname === item.href}>
                {item.label}
              </NavItemBase>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <NavItemBase type="link" href="#" icon={LogOut01} onClick={(e) => { e.preventDefault(); handleLogout() }}>
          Sign out
        </NavItemBase>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-bg-primary border-b border-border-secondary px-6 py-4 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2">
            <div className="size-7 rounded-lg bg-utility-brand-50 flex items-center justify-center">
              <span className="text-[#00A3A3] font-black text-xs">M</span>
            </div>
            <span className="font-bold text-text-primary text-sm">MedAssist</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-sm font-bold text-text-primary">Transaction History</h1>
            <p className="text-xs text-text-tertiary">Complete billing, pending and failed attempts log</p>
          </div>
          <div className="flex items-center gap-2">
            <Button color="secondary" size="sm" iconLeading={RefreshCw01} disabled={isLoading} onClick={() => fetchPayments()}>
              Refresh
            </Button>
            <Button color="tertiary" size="sm" iconLeading={LogOut01} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-6 max-w-6xl mx-auto w-full space-y-5">

          {error && (
            <div className="bg-bg-error-primary border border-utility-red-200 text-utility-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-bg-primary border border-border-secondary rounded-xl p-5 space-y-3 animate-pulse shadow-xs">
                  <div className="h-2.5 w-24 bg-bg-tertiary rounded" />
                  <div className="h-7 w-16 bg-bg-tertiary rounded" />
                </div>
              ))
            ) : (
              <>
                <StatCard label="Total Attempts"  value={stats.total} />
                <StatCard label="Confirmed Revenue"   value={`KES ${(Number(stats.revenue) || 0).toLocaleString()}`} accent />
                <StatCard label="Pending Prompts"     value={stats.pending} />
                <StatCard label="Failed Payments"     value={stats.failed} />
              </>
            )}
          </div>

          {/* Table Card */}
          <div className="bg-bg-primary border border-border-secondary rounded-xl overflow-hidden shadow-xs">

            {/* Card header */}
            <div className="px-5 py-4 border-b border-border-secondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-text-primary">All Transactions</h2>
                <p className="text-xs text-text-tertiary mt-0.5">Filter and review M-Pesa transactions</p>
              </div>
              <div className="w-full sm:w-64">
                <Input
                  size="sm"
                  placeholder="Search name, email, phone, ref…"
                  icon={SearchMd}
                  value={search}
                  onChange={(v) => setSearch(v)}
                  aria-label="Search transactions"
                />
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex border-b border-border-secondary px-5 gap-1 overflow-x-auto bg-bg-primary">
              {STATUS_TABS.map(({ key, label }) => {
                const count = key === 'all' ? payments.length : countByStatus(key as Payment['status'])
                const isActive = statusFilter === key
                return (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
                      isActive ? 'border-[#00A3A3] text-[#00A3A3]' : 'border-transparent text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {label}
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-utility-brand-50 text-[#00A3A3]' : 'bg-bg-tertiary text-text-tertiary'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-bg-secondary text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">County / Level</th>
                    <th className="px-5 py-3">Date / Ref</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">M-Pesa Receipt</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary">
                  {isLoading ? (
                    <SkeletonRows />
                  ) : paginatedPayments.length === 0 ? (
                    <EmptyState filtered={search !== '' || statusFilter !== 'all'} />
                  ) : (
                    paginatedPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-bg-secondary/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-utility-brand-50 text-[#00A3A3] flex items-center justify-center font-bold text-xs uppercase select-none shrink-0">
                              {p.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-text-primary truncate max-w-[140px]">{p.name}</div>
                              <div className="text-[10px] text-text-tertiary truncate max-w-[140px]">{p.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-text-secondary font-medium">
                          {p.phone}
                          {p.referral && <div className="text-[10px] text-text-tertiary">Via: {p.referral}</div>}
                        </td>
                        <td className="px-5 py-3.5 text-text-secondary">
                          <div>{p.county}</div>
                          <div className="text-[10px] text-text-tertiary">{p.study_level}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-text-secondary">{new Date(p.created_at).toLocaleDateString()}</div>
                          <div className="text-[10px] font-mono text-text-tertiary">{p.reference}</div>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-text-primary">
                          KES {p.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#00A3A3] text-xs">
                          {p.mpesa_receipt || <span className="text-text-tertiary">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {p.status === 'success' ? (
                            <Button size="xs" color="secondary" onClick={() => setSelectedReceipt(p)}>
                              View Receipt
                            </Button>
                          ) : (
                            <span className="text-text-tertiary">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="px-5 py-3.5 border-t border-border-secondary flex items-center justify-between text-xs text-text-tertiary font-semibold">
                <Button size="xs" color="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>
                  ← Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`size-7 rounded-lg flex items-center justify-center text-xs font-semibold transition cursor-pointer ${
                        currentPage === page ? 'bg-[#00A3A3] text-white' : 'hover:bg-bg-secondary text-text-tertiary'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <Button size="xs" color="secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>
                  Next →
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-secondary rounded-2xl w-full max-w-[420px] p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-utility-brand-50 flex items-center justify-center">
                  <span className="text-[#00A3A3] font-black text-sm">M</span>
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm">MedAssist Academy</h3>
                  <p className="text-xs text-text-tertiary">Official Payment Receipt</p>
                </div>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-text-tertiary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-secondary transition cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="bg-bg-secondary rounded-xl p-5 border border-border-secondary space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-border-secondary">
                <span className="text-text-tertiary font-medium">Receipt No:</span>
                <span className="font-mono font-bold text-[#00A3A3] text-sm">{selectedReceipt.mpesa_receipt}</span>
              </div>
              <div className="space-y-2.5">
                {([
                  ['Student Name', selectedReceipt.name],
                  ['Email', selectedReceipt.email],
                  ['Phone', selectedReceipt.phone],
                  ['Location', selectedReceipt.county],
                  ['Study Level', selectedReceipt.study_level],
                  ['Ref ID', selectedReceipt.reference],
                  ['Date & Time', new Date(selectedReceipt.paid_at || selectedReceipt.created_at).toLocaleString()],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-text-tertiary shrink-0">{label}:</span>
                    <span className="font-semibold text-text-primary text-right truncate max-w-[220px]">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border-secondary">
                <span className="font-bold text-text-primary">Amount Paid:</span>
                <span className="font-extrabold text-[#00A3A3] text-base">KES {selectedReceipt.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <Badge color="success" type="pill-color" size="md">✓ Payment Confirmed</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button color="secondary" size="md" iconLeading={Printer} onClick={() => printReceipt(selectedReceipt)}>
                Print / PDF
              </Button>
              <Button color="primary" size="md" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
