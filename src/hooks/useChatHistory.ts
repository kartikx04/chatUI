// src/hooks/useChatHistory.ts
import { useState, useCallback } from 'react'
import type { Chat } from '@/types'

export function useChatHistory() {
  const [messages, setMessages] = useState<Chat[]>([])
  const [loading, setLoading] = useState(false)

  const fetchHistory = useCallback(async (userId: string, contactId: string) => {
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat-history?id=${userId}&contact=${contactId}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('failed to fetch')
      const data = await res.json()
      // API returns newest first, reverse for display
      setMessages((data ?? []).reverse())
    } catch (err) {
      console.error('chat history fetch failed:', err)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  const appendMessage = useCallback((msg: Chat) => {
    setMessages(prev => [...prev, msg])
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, loading, fetchHistory, appendMessage, clearMessages }
}