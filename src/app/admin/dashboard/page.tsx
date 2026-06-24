"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LogOut01, 
  SearchMd, 
  Users01, 
  Coins02, 
  RefreshCw01, 
  CheckCircle, 
  XCircle 
} from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { Badge } from '@/components/base/badges/badges'

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

export default function AdminDashboard() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, paid: 0, pending: 0, failed: 0, revenue: 0 })
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchPayments = async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/payments')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin')
          return
        }
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
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const filteredPayments = payments.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.reference.toLowerCase().includes(search.toLowerCase()) ||
    (p.mpesa_receipt && p.mpesa_receipt.toLowerCase().includes(search.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="min-h-screen bg-client-bg text-client-text flex font-sans">
      {/* Left Sidebar */}
      <aside className="w-56 bg-client-card border-r border-client-border flex flex-col justify-between p-4 flex-shrink-0 select-none hidden md:flex">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="size-6 rounded-lg bg-client-accent flex items-center justify-center text-client-dark font-extrabold text-xs">
              MA
            </div>
            <span className="font-bold text-white text-sm">MedAssist</span>
          </div>

          {/* Nav Link Items */}
          <nav className="space-y-1.5">
            <div className="text-[10px] font-bold text-client-muted px-2 py-1 tracking-wider uppercase">Menu</div>
            <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs text-client-accent font-semibold bg-client-inner-bg/40">
              👥 Student Enrollments
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header className="bg-client-card px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-client-accent flex items-center justify-center text-client-dark font-extrabold text-sm md:hidden">
              MA
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">MedAssist Academy Admin</h1>
              <p className="text-[10px] text-client-muted">Real-time payment logs</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => {
                setIsLoading(true)
                fetchPayments()
              }}
              disabled={isLoading}
              className="bg-client-inner-bg hover:bg-[#1d3d39] text-white text-xs font-bold py-2 px-3.5 rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
            >
              Refresh
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-950/60 hover:bg-red-900/60 text-red-400 text-xs font-bold py-2 px-3.5 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full space-y-5">
          {error && (
            <div className="bg-red-950/40 text-red-400 p-3 rounded-lg text-xs font-medium border border-red-900/30">
              {error}
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-client-card rounded-xl p-4 flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] font-bold text-client-muted uppercase tracking-wider">Total Enrollments</span>
              <h3 className="text-xl font-bold text-white mt-1">{stats.total}</h3>
            </div>

            <div className="bg-client-card rounded-xl p-4 flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] font-bold text-client-muted uppercase tracking-wider">Confirmed Revenue</span>
              <h3 className="text-xl font-bold text-client-accent mt-1">
                KES {(Number(stats.revenue) || 0).toLocaleString()}
              </h3>
            </div>

            <div className="bg-client-card rounded-xl p-4 flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] font-bold text-client-muted uppercase tracking-wider">Pending Prompts</span>
              <h3 className="text-xl font-bold text-amber-400 mt-1">{stats.pending}</h3>
            </div>

            <div className="bg-client-card rounded-xl p-4 flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] font-bold text-client-muted uppercase tracking-wider">Failed Payments</span>
              <h3 className="text-xl font-bold text-red-400 mt-1">{stats.failed}</h3>
            </div>
          </div>

          {/* Payments Table Card */}
          <div className="bg-client-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-client-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white">Student Enrollments</h2>
                <p className="text-[10px] text-client-muted mt-0.5">Review and search student payment statuses</p>
              </div>
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search name, email, phone, ref..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-client-input text-client-light placeholder-client-muted text-xs px-3.5 py-2 rounded-lg border-none outline-none focus:ring-1 focus:ring-client-accent transition"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="p-10 flex flex-col items-center justify-center text-client-muted text-xs">
                <div className="size-6 border-2 border-client-accent border-t-transparent rounded-full animate-spin mb-2"></div>
                <span>Loading payment logs...</span>
              </div>
            ) : paginatedPayments.length === 0 ? (
              <div className="p-10 text-center text-client-muted text-xs">
                No payment logs found.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-client-inner-bg text-client-muted font-bold uppercase tracking-wider text-[9px]">
                        <th className="px-5 py-3">Student Details</th>
                        <th className="px-5 py-3">Phone Number</th>
                        <th className="px-5 py-3">County & Level</th>
                        <th className="px-5 py-3">Date & Ref</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Receipt</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-client-border">
                      {paginatedPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-client-inner-bg/35 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-client-inner-bg text-client-accent flex items-center justify-center font-bold text-xs uppercase select-none flex-shrink-0">
                                {p.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-white truncate max-w-[150px]">{p.name}</div>
                                <div className="text-[10px] text-client-muted truncate max-w-[150px]">{p.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-client-light font-medium">
                            {p.phone}
                            {p.referral && (
                              <div className="text-[10px] text-client-muted font-normal">Via: {p.referral}</div>
                            )}
                          </td>
                          <td className="px-5 py-3 text-client-light">
                            <div>{p.county}</div>
                            <div className="text-[10px] text-client-muted">{p.study_level}</div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="text-client-light">{new Date(p.created_at).toLocaleDateString()}</div>
                            <div className="text-[10px] font-mono text-client-muted">{p.reference}</div>
                          </td>
                          <td className="px-5 py-3 font-bold text-white">
                            KES {p.amount.toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-mono text-client-accent">
                            {p.mpesa_receipt || <span className="text-client-muted">—</span>}
                          </td>
                          <td className="px-5 py-3">
                            {p.status === 'success' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-950/40 text-green-400 border border-green-900/30">Confirmed</span>
                            )}
                            {p.status === 'pending' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-900/30">Pending</span>
                            )}
                            {p.status === 'failed' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/40 text-red-400 border border-red-900/30">Failed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-client-border flex items-center justify-between text-xs font-semibold select-none text-client-muted">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-client-inner-bg hover:bg-client-border disabled:opacity-40 transition cursor-pointer"
                    >
                      &lt; Previous
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`size-7 rounded-lg flex items-center justify-center transition cursor-pointer ${currentPage === page ? 'bg-client-accent text-client-dark font-bold' : 'hover:bg-client-inner-bg'}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-client-inner-bg hover:bg-client-border disabled:opacity-40 transition cursor-pointer"
                    >
                      Next &gt;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
