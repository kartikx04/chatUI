'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

function CallbackHandler() {
  const router = useRouter()
  const { setUser } = useUser()

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
      credentials: 'include', // sends the httpOnly cookie automatically
    })
      .then((res) => {
        if (!res.ok) throw new Error('unauthorized')
        return res.json()
      })
      .then((data) => {
        setUser({ id: data.id, username: data.username, email: data.email })
        router.replace('/home')
      })
      .catch(() => {
        router.replace('/')
      })
  }, [router, setUser])

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