'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useWebSocket } from '@/hooks/useWebSocket'
import { apiClient } from '@/lib/api'
import { ContactSidebar } from '@/components/chat/ContactSidebar'
import { ChatWindow } from '@/components/chat/ChatWindow'
import type { Chat, ContactList } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const { user, loading, logout } = useUser()
  const [contacts, setContacts] = useState<ContactList[]>([])
  const [activeContact, setActiveContact] = useState<ContactList | null>(null)
  const [messages, setMessages] = useState<Map<string, Chat[]>>(new Map())
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contactsLoading, setContactsLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    setContactsLoading(true)
    apiClient
      .getContacts(user.id)
      .then(res => setContacts(res.data.data ?? []))
      .catch(err => console.error('contacts fetch failed:', err))
      .finally(() => setContactsLoading(false))
  }, [user])

  useEffect(() => {
    if (!user || !activeContact) return
    setHistoryLoading(true)
    apiClient
      .getChatHistory(user.id, activeContact.id)
      .then(res => setMessages(prev => new Map(prev).set(activeContact.id, res.data ?? [])))
      .catch(err => console.error('history fetch failed:', err))
      .finally(() => setHistoryLoading(false))
  }, [activeContact, user])

  const handleIncomingMessage = useCallback((chat: Chat) => {
    const contactId = chat.is_self ? chat.to_id : chat.from_id
    setMessages(prev => {
      const existing = prev.get(contactId) ?? []
      return new Map(prev).set(contactId, [...existing, chat])
    })
    setContacts(prev => {
      const idx = prev.findIndex(c => c.id === contactId)
      if (idx === -1) return prev
      const updated = [...prev]
      const [contact] = updated.splice(idx, 1)
      return [{ ...contact, last_activity: chat.created_at_unix }, ...updated]
    })
  }, [])

  const { connected, sendMessage } = useWebSocket({ user, onMessage: handleIncomingMessage })

  const handleSend = useCallback(
    (message: string) => {
      if (!user || !activeContact) return
      sendMessage(user.id, activeContact.id, message)
    },
    [user, activeContact, sendMessage],
  )

  const handleSelectContact = (contact: ContactList) => {
    setActiveContact(contact)
    if (window.innerWidth < 640) setSidebarCollapsed(true)
  }

  const currentMessages = activeContact ? (messages.get(activeContact.id) ?? []) : []

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-9 h-9 rounded-full border-2 border-t-transparent"
            style={{
              borderColor: 'hsl(158 64% 52%)',
              borderTopColor: 'transparent',
              animation: 'spin 0.9s linear infinite',
            }}
          />
          <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            Loading
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-5 border-b border-border shrink-0"
        style={{ height: 52, background: 'hsl(220 14% 7%)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{
              background: 'hsl(158 64% 52%)',
              clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
            }}
          >
            <span
              className="font-display font-bold"
              style={{ fontSize: 10, color: 'hsl(220 16% 6%)' }}
            >
              B
            </span>
          </div>
          <span className="font-display font-semibold text-sm tracking-tight text-foreground">
            Banterrr
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection badge */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: connected ? 'hsl(158 64% 52%)' : 'hsl(0 60% 55%)',
                boxShadow: connected ? '0 0 6px hsl(158 64% 52% / 0.8)' : 'none',
                animation: connected ? 'pulseDot 2s ease-in-out infinite' : 'none',
              }}
            />
            <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
              {connected ? 'live' : 'offline'}
            </span>
          </div>

          {/* User pill */}
          <div
            className="flex items-center gap-2 px-2 py-1 rounded-md border border-border"
            style={{ background: 'hsl(220 12% 11%)' }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center font-display font-bold"
              style={{
                fontSize: 9,
                background: 'hsl(158 64% 52% / 0.15)',
                color: 'hsl(158 64% 52%)',
                border: '1px solid hsl(158 64% 52% / 0.3)',
              }}
            >
              {user.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
              {user.username}
            </span>
          </div>

          <button
            onClick={logout}
            className="font-mono text-xs text-muted-foreground px-2 py-1 rounded transition-colors"
            style={{ fontSize: 11, letterSpacing: '0.06em' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'hsl(0 60% 60%)'
              e.currentTarget.style.background = 'hsl(0 60% 60% / 0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = ''
              e.currentTarget.style.background = ''
            }}
          >
            sign out
          </button>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">
        <ContactSidebar
          user={user}
          contacts={contacts}
          activeContact={activeContact}
          onSelectContact={handleSelectContact}
          onContactsUpdate={setContacts}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        />
        <ChatWindow
          user={user}
          contact={activeContact}
          messages={currentMessages}
          onSend={handleSend}
          connected={connected}
          historyLoading={historyLoading}
        />
      </div>
    </div>
  )
}