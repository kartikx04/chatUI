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
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      localStorage.setItem('auth_token', token)
      setUser({ id: payload.user_id, username: payload.username, email: payload.email })
      router.replace('/home')
    } catch {
      router.replace('/')
    }
  }, [params, router, setUser])

  return <AuthLoadingScreen label="Signing you in" />
}

function AuthLoadingScreen({ label }: { label: string }) {
  return (
    <div
      className="h-screen flex flex-col items-center justify-center gap-8 bg-background"
      style={{ userSelect: 'none' }}
    >
      {/* Logo mark */}
      <div className="flex flex-col items-center gap-3">
        <div
          style={{
            width: 40,
            height: 40,
            background: 'hsl(158 64% 52%)',
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            className="font-display font-bold"
            style={{ fontSize: 16, color: 'hsl(220 16% 6%)' }}
          >
            B
          </span>
        </div>
        <span className="font-display font-semibold tracking-tight text-foreground">Banterrr</span>
      </div>

      {/* Spinner + label */}
      <div className="flex flex-col items-center gap-3">
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '2px solid hsl(158 64% 52% / 0.2)',
            borderTopColor: 'hsl(158 64% 52%)',
            animation: 'spin 0.85s linear infinite',
          }}
        />
        <p
          className="font-mono text-muted-foreground"
          style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' }}
        >
          {label}
        </p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen label="Loading" />}>
      <CallbackHandler />
    </Suspense>
  )
}