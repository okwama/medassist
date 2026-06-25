"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Users01,
  LogOut01,
  BarChartSquare02,
  Shield01,
  Plus,
  Trash01,
  Edit01,
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw01,
} from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { Badge } from '@/components/base/badges/badges'
import { NavItemBase } from '@/components/application/app-navigation/base-components/nav-item'

interface AdminUser {
  id: number
  username: string
  role: 'superadmin' | 'admin' | 'viewer'
  created_at: string
  last_login?: string
}

const ROLES = ['superadmin', 'admin', 'viewer'] as const
type Role = typeof ROLES[number]

const roleBadge: Record<Role, { color: any; label: string }> = {
  superadmin: { color: 'error',   label: 'Super Admin' },
  admin:      { color: 'brand',   label: 'Admin' },
  viewer:     { color: 'gray',    label: 'Viewer' },
}

/* ─── Sidebar ────────────────────────────────────────────────────── */
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

/* ─── Main ───────────────────────────────────────────────────────── */
export default function AdminUsersPage() {
  const router   = useRouter()
  const pathname = usePathname()

  const [users, setUsers]           = useState<AdminUser[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editUser, setEditUser]     = useState<AdminUser | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null)

  // New user form
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole]         = useState<Role>('viewer')
  const [submitting, setSubmitting]   = useState(false)

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) {
        if (res.status === 401) { router.push('/admin'); return }
        throw new Error('Failed to fetch users')
      }
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const flash = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 4000)
  }

  const handleCreate = async () => {
    if (!newUsername.trim() || !newPassword.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create user')
      setShowModal(false)
      setNewUsername(''); setNewPassword(''); setNewRole('viewer')
      await fetchUsers()
      flash('Admin user created successfully.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleChange = async (user: AdminUser, role: Role) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, role }),
      })
      if (!res.ok) throw new Error('Failed to update role')
      setEditUser(null)
      await fetchUsers()
      flash(`${user.username}'s role updated to ${role}.`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (user: AdminUser) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id }),
      })
      if (!res.ok) throw new Error('Failed to delete user')
      setDeleteConfirm(null)
      await fetchUsers()
      flash(`${user.username} has been removed.`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-bg-secondary text-text-primary flex font-sans">
      <AdminSidebar pathname={pathname} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-bg-primary border-b border-border-secondary px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-text-primary">Admin Users</h1>
            <p className="text-xs text-text-tertiary">Manage who has access to this admin console</p>
          </div>
          <Button color="primary" size="sm" iconLeading={Plus} onClick={() => setShowModal(true)}>
            Add Admin User
          </Button>
        </header>

        <main className="flex-1 p-5 md:p-6 max-w-4xl mx-auto w-full space-y-4">

          {/* Alerts */}
          {error && (
            <div className="bg-bg-error-primary border border-utility-red-200 text-utility-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              {error}
              <button onClick={() => setError('')} className="ml-auto text-utility-red-500 hover:text-utility-red-700 cursor-pointer"><X className="size-4" /></button>
            </div>
          )}
          {success && (
            <div className="bg-bg-success-primary border border-utility-green-200 text-utility-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <CheckCircle className="size-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Users table */}
          <div className="bg-bg-primary border border-border-secondary rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-border-secondary">
              <h2 className="text-sm font-bold text-text-primary">Admin Accounts</h2>
              <p className="text-xs text-text-tertiary mt-0.5">
                {users.length} admin user{users.length !== 1 ? 's' : ''} in total
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-bg-secondary text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3">Last Login</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-bg-tertiary" />
                            <div className="h-3 w-24 bg-bg-tertiary rounded" />
                          </div>
                        </td>
                        {[48, 32, 32, 40].map((w, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className={`h-3 w-${w} bg-bg-tertiary rounded`} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
                          <div className="size-12 rounded-xl bg-utility-brand-50 flex items-center justify-center">
                            <Shield01 className="size-6 text-[#00A3A3]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">No admin users yet</p>
                            <p className="text-xs text-text-tertiary mt-1">Create the first admin account to get started.</p>
                          </div>
                          <Button color="primary" size="sm" iconLeading={Plus} onClick={() => setShowModal(true)}>
                            Add Admin User
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const badge = roleBadge[user.role]
                      return (
                        <tr key={user.id} className="hover:bg-bg-secondary/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-utility-brand-50 text-[#00A3A3] flex items-center justify-center font-bold text-xs uppercase select-none shrink-0">
                                {user.username.charAt(0)}
                              </div>
                              <span className="font-semibold text-text-primary">{user.username}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {editUser?.id === user.id ? (
                              <select
                                value={editUser.role}
                                onChange={(e) => setEditUser({ ...editUser, role: e.target.value as Role })}
                                className="text-xs border border-border-primary rounded-lg px-2 py-1 bg-bg-primary text-text-primary focus:outline-none focus:ring-1 focus:ring-[#00A3A3]"
                              >
                                {ROLES.map(r => <option key={r} value={r}>{roleBadge[r].label}</option>)}
                              </select>
                            ) : (
                              <Badge color={badge.color} type="pill-color" size="sm">{badge.label}</Badge>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-text-tertiary">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-text-tertiary">
                            {user.last_login ? new Date(user.last_login).toLocaleString() : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {editUser?.id === user.id ? (
                                <>
                                  <Button size="xs" color="primary" onClick={() => handleRoleChange(user, editUser.role)}>
                                    Save
                                  </Button>
                                  <Button size="xs" color="secondary" onClick={() => setEditUser(null)}>
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="xs" color="secondary" iconLeading={Edit01} onClick={() => setEditUser(user)}>
                                    Edit Role
                                  </Button>
                                  <Button size="xs" color="tertiary" iconLeading={Trash01} onClick={() => setDeleteConfirm(user)}>
                                    Remove
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ── Add User Modal ────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-secondary rounded-2xl w-full max-w-[400px] p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-text-primary text-base">Add Admin User</h3>
                <p className="text-xs text-text-tertiary mt-0.5">Create a new admin account</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-text-tertiary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-secondary transition cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Username"
                placeholder="e.g. jane.admin"
                size="md"
                value={newUsername}
                onChange={(v) => setNewUsername(v)}
                isRequired
              />
              <Input
                label="Password"
                placeholder="Set a strong password"
                type="password"
                size="md"
                value={newPassword}
                onChange={(v) => setNewPassword(v)}
                isRequired
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary block">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full text-sm border border-border-primary rounded-lg px-3 py-2.5 bg-bg-primary text-text-primary focus:outline-none focus:ring-1 focus:ring-[#00A3A3]"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{roleBadge[r].label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-text-tertiary">
                  {newRole === 'superadmin' && 'Full access — can manage users and all settings.'}
                  {newRole === 'admin'      && 'Can view and manage enrollments but not user accounts.'}
                  {newRole === 'viewer'     && 'Read-only access to enrollment data.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button color="secondary" size="md" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                size="md"
                isLoading={submitting}
                disabled={!newUsername.trim() || !newPassword.trim() || submitting}
                onClick={handleCreate}
              >
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-secondary rounded-2xl w-full max-w-[360px] p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="size-12 rounded-full bg-bg-error-primary flex items-center justify-center">
                <Trash01 className="size-5 text-utility-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">Remove Admin User</h3>
                <p className="text-sm text-text-tertiary mt-1">
                  Are you sure you want to remove <strong className="text-text-primary">{deleteConfirm.username}</strong>? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button color="secondary" size="md" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                color="secondary"
                size="md"
                className="!text-utility-red-700 hover:!bg-bg-error-primary"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Yes, Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
