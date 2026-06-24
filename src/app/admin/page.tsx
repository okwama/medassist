"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials')
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-client-bg px-4">
      <div className="w-full max-w-[400px] bg-client-card rounded-2xl p-6 space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-1.5">
          <h2 className="text-lg font-bold text-white">Admin Console</h2>
          <p className="text-xs text-client-muted">Sign in to access your course dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-950/40 text-red-400 p-3 rounded-lg text-xs font-medium border border-red-900/30">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-client-accent tracking-wider block">USERNAME</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-client-input text-client-light placeholder-client-muted text-sm px-4 py-3 rounded-lg border-none outline-none focus:ring-1 focus:ring-client-accent transition"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-client-accent tracking-wider block">PASSWORD</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-client-input text-client-light placeholder-client-muted text-sm px-4 py-3 rounded-lg border-none outline-none focus:ring-1 focus:ring-client-accent transition"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-client-accent text-client-dark font-bold py-3.5 px-4 rounded-lg hover:bg-client-accent-hover active:bg-client-accent-active disabled:opacity-50 transition flex items-center justify-center text-sm mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

