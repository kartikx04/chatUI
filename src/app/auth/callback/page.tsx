'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

function CallbackHandler() {
  const router = useRouter()
  const params = useSearchParams()
  const { setUser } = useUser()

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      router.replace('/')
      return
    }

    // Decode the JWT payload (it's not sensitive to read, only to forge)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      localStorage.setItem('auth_token', token)
      setUser({
        id: payload.user_id,
        username: payload.username,
        email: payload.email,
      })
      router.replace('/home')
    } catch {
      router.replace('/')
    }
  }, [params, router, setUser])

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}