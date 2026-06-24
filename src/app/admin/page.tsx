"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock01, User01 } from '@untitledui/icons'
import { Input } from '@/components/base/input/input'
import { Button } from '@/components/base/buttons/button'

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
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
      {/* Card */}
      <div className="w-full max-w-[400px] bg-bg-primary rounded-2xl shadow-lg border border-border-secondary p-8 space-y-7">

        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-utility-brand-50 mx-auto">
            <span className="text-[#00A3A3] text-xl font-black">M</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-text-primary">MedAssist Academy</h1>
            <p className="text-sm text-text-tertiary">Sign in to your admin console</p>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="bg-bg-error-primary border border-utility-red-200 text-utility-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="Username"
            placeholder="Enter your username"
            icon={User01}
            size="md"
            value={username}
            onChange={(v) => setUsername(v)}
            isDisabled={isLoading}
            isRequired
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            icon={Lock01}
            type="password"
            size="md"
            value={password}
            onChange={(v) => setPassword(v)}
            isDisabled={isLoading}
            isRequired
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full justify-center"
            isDisabled={isLoading}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
