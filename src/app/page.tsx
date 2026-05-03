'use client'

import { useEffect, useRef, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const CYCLING_WORDS = ['chaos', 'roasts', 'debates', 'vibes', 'beef', 'rants', 'banter']

const FEATURES = [
  {
    label: '01',
    title: 'WebSocket Hub',
    desc: 'Single-goroutine hub, no mutex thrash. Messages arrive before you finish typing.',
  },
  {
    label: '02',
    title: 'Redis-first',
    desc: 'Chat history hits Redis JSON first. Postgres is the fallback, not the bottleneck.',
  },
  {
    label: '03',
    title: 'Google OAuth',
    desc: 'One click. JWT in localStorage, Bearer on every request. Your creds never touch us.',
  },
  {
    label: '04',
    title: 'Contact lists',
    desc: 'Sorted by last activity, bidirectional adds, username lookups in Redis strings.',
  },
  {
    label: '05',
    title: 'Graceful shutdown',
    desc: 'SIGTERM drains HTTP in 10s, closes WebSockets cleanly. Zero data loss on redeploy.',
  },
  {
    label: '06',
    title: 'Structured logs',
    desc: 'Custom slog handler — colored in dev, JSON in prod. No stray fmt.Println anywhere.',
  },
]

const TICKER_ITEMS = [
  'Real-time WebSocket',
  'Google OAuth',
  'Redis-powered',
  'Go backend',
  'Next.js 14',
  'No polling',
  'Instant delivery',
  'Persistent history',
  'Just banter',
]

export default function LandingPage() {
  const [wordIdx, setWordIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  // Word cycler
  useEffect(() => {
    const id = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setWordIdx(i => (i + 1) % CYCLING_WORDS.length)
        setFading(false)
      }, 200)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  // Dot grid canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = (canvas.width = canvas.offsetWidth)
    let H = (canvas.height = canvas.offsetHeight)

    const COLS = 32, ROWS = 20
    const dots = Array.from({ length: COLS * ROWS }, (_, i) => ({
      x: ((i % COLS) / (COLS - 1)) * W,
      y: (Math.floor(i / COLS) / (ROWS - 1)) * H,
      t: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.01,
    }))

    function draw() {
      ctx.clearRect(0, 0, W, H)
      dots.forEach(d => {
        d.t += d.speed
        const pulse = (Math.sin(d.t) + 1) / 2
        ctx.beginPath()
        ctx.arc(d.x, d.y, 1 + pulse * 1.8, 0, Math.PI * 2)
        // primary color hsl(158 64% 52%) = roughly rgb(48,212,149)
        ctx.fillStyle = `rgba(48,212,149,${0.06 + pulse * 0.18})`
        ctx.fill()
      })
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      dots.forEach((d, i) => {
        d.x = ((i % COLS) / (COLS - 1)) * W
        d.y = (Math.floor(i / COLS) / (ROWS - 1)) * H
      })
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── CANVAS dot grid ── */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* ── AMBIENT glows ── */}
      <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
        <div
          className="absolute rounded-full"
          style={{
            top: '-15%', left: '5%',
            width: 600, height: 600,
            background: 'radial-gradient(circle, hsl(158 64% 52% / 0.07) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: '-10%', right: '0%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, hsl(220 60% 60% / 0.05) 0%, transparent 70%)',
          }}
        />
      </div>

      <style>{`
        .word-slot {
          display: inline-block;
          color: hsl(158 64% 52%);
          transition: opacity 0.18s ease, transform 0.18s ease;
          min-width: 3ch;
        }
        .word-slot.out {
          opacity: 0;
          transform: translateY(-8px);
        }
        .ticker-track {
          animation: ticker 28s linear infinite;
          white-space: nowrap;
          display: flex;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .feat-card {
          border: 1px solid hsl(220 12% 16%);
          padding: 28px 24px;
          position: relative;
          transition: border-color 220ms, background 220ms;
          background: hsl(220 14% 9%);
        }
        .feat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 28px; height: 2px;
          background: hsl(158 64% 52%);
          opacity: 0;
          transition: opacity 220ms;
        }
        .feat-card:hover {
          border-color: hsl(158 64% 52% / 0.3);
          background: hsl(158 64% 52% / 0.03);
        }
        .feat-card:hover::before { opacity: 1; }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          background: hsl(158 64% 52%);
          color: hsl(220 16% 6%);
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 100ms, transform 80ms, box-shadow 100ms;
        }
        .cta-btn:hover {
          background: hsl(158 64% 62%);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px hsl(158 64% 52% / 0.25);
        }
        .cta-btn:active { transform: translateY(0); }

        .ghost-btn {
          display: inline-flex;
          align-items: center;
          padding: 13px 32px;
          border: 1px solid hsl(220 12% 22%);
          color: hsl(220 8% 48%);
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 13px;
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: border-color 150ms, color 150ms;
        }
        .ghost-btn:hover {
          border-color: hsl(220 8% 38%);
          color: hsl(220 10% 80%);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease forwards; opacity: 0; }

        .mockup-msg-in {
          animation: fadeUp 0.4s ease 1.2s forwards; opacity: 0;
        }
        .mockup-msg-out {
          animation: fadeUp 0.4s ease 1.5s forwards; opacity: 0;
        }
        .mockup-msg-in2 {
          animation: fadeUp 0.4s ease 1.8s forwards; opacity: 0;
        }
      `}</style>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 py-5 border-b border-border"
        style={{
          zIndex: 50,
          background: 'hsl(220 16% 6% / 0.85)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 flex items-center justify-center"
            style={{ background: 'hsl(158 64% 52%)', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
          >
            <span className="font-display font-bold text-xs" style={{ color: 'hsl(220 16% 6%)' }}>B</span>
          </div>
          <span className="font-display font-semibold tracking-tight text-foreground">Banterrr</span>
        </div>

        <div className="flex items-center gap-8">
          {['Features', 'Stack', 'About'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="font-mono text-xs tracking-widest uppercase text-muted-foreground transition-colors"
              style={{ letterSpacing: '0.1em' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'hsl(220 10% 94%)')}
              onMouseLeave={e => (e.currentTarget.style.color = '')}
            >
              {item}
            </a>
          ))}
          <a href={`${API_URL}/google-sso`} className="cta-btn" style={{ padding: '9px 22px', fontSize: 12 }}>
            Sign in →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative flex flex-col justify-end"
        style={{ zIndex: 1, minHeight: '100vh', padding: '120px 48px 88px' }}
      >
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-8 fade-up" style={{ animationDelay: '0s' }}>
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: 'hsl(158 64% 52%)', boxShadow: '0 0 8px hsl(158 64% 52% / 0.6)' }}
          />
          <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Real-time chat — WebSocket · Go · Redis
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display font-extrabold leading-none mb-6 fade-up"
          style={{
            fontSize: 'clamp(64px, 11vw, 148px)',
            letterSpacing: '-0.02em',
            animationDelay: '0.08s',
          }}
        >
          talk.<br />
          <span className={`word-slot ${fading ? 'out' : ''}`}>
            {CYCLING_WORDS[wordIdx]}.
          </span>
          <br />
          <span style={{ color: 'hsl(220 8% 28%)', fontSize: '0.55em' }}>repeat.</span>
        </h1>

        {/* Sub + CTA row */}
        <div
          className="flex items-end justify-between flex-wrap gap-8 fade-up"
          style={{ animationDelay: '0.18s' }}
        >
          <p
            className="font-sans font-light text-muted-foreground leading-relaxed"
            style={{ fontSize: 17, maxWidth: 400 }}
          >
            Banterrr is a blazing-fast chat built for people who actually have
            things to say. Google sign-in, zero friction, real-time everything.
          </p>

          <div className="flex gap-3 items-center flex-shrink-0">
            <a href={`${API_URL}/google-sso`} className="cta-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>
            <a href="#features" className="ghost-btn">How it works</a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 right-12 flex flex-col items-center gap-2" style={{ opacity: 0.3 }}>
          <div style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, transparent, hsl(220 10% 94%))' }} />
          <span className="font-mono text-xs tracking-widest" style={{ writingMode: 'vertical-lr', fontSize: 10 }}>SCROLL</span>
        </div>
      </section>

      {/* ── CHAT MOCKUP ── */}
      <section className="relative px-12 pb-24" style={{ zIndex: 1 }}>
        <div
          className="max-w-2xl mx-auto rounded-2xl overflow-hidden border border-border"
          style={{ background: 'hsl(220 14% 9%)', boxShadow: '0 32px 80px hsl(220 16% 3% / 0.7)' }}
        >
          {/* window bar */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border" style={{ background: 'hsl(220 12% 11%)' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(0 60% 50% / 0.5)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(45 80% 50% / 0.5)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(130 50% 45% / 0.5)' }} />
            <span className="font-mono text-xs text-muted-foreground ml-3">banterrr — kartik → user_alpha</span>
            <span
              className="ml-auto w-1.5 h-1.5 rounded-full"
              style={{ background: 'hsl(158 64% 52%)', boxShadow: '0 0 6px hsl(158 64% 52%)' }}
            />
          </div>

          <div className="flex" style={{ height: 220 }}>
            {/* sidebar */}
            <div className="border-r border-border p-3 space-y-1" style={{ width: 168, background: 'hsl(220 14% 7%)' }}>
              {[
                { name: 'user_alpha', active: true },
                { name: 'dev_team', active: false },
                { name: 'kartik_k', active: false },
              ].map(c => (
                <div
                  key={c.name}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg"
                  style={{ background: c.active ? 'hsl(158 64% 52% / 0.1)' : 'transparent' }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center font-display font-bold"
                    style={{
                      fontSize: 10,
                      background: c.active ? 'hsl(158 64% 52%)' : 'hsl(220 12% 18%)',
                      color: c.active ? 'hsl(220 16% 6%)' : 'hsl(220 8% 48%)',
                    }}
                  >
                    {c.name[0].toUpperCase()}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground truncate">{c.name}</span>
                </div>
              ))}
            </div>

            {/* messages */}
            <div className="flex-1 p-4 flex flex-col justify-end gap-2.5">
              <div className="flex justify-start mockup-msg-in">
                <div className="font-sans text-xs px-3 py-2 rounded-2xl rounded-tl-sm" style={{ background: 'hsl(220 12% 16%)', color: 'hsl(220 10% 80%)' }}>
                  yo what&apos;s good
                </div>
              </div>
              <div className="flex justify-end mockup-msg-out">
                <div className="font-sans text-xs px-3 py-2 rounded-2xl rounded-tr-sm" style={{ background: 'hsl(158 64% 52%)', color: 'hsl(220 16% 6%)' }}>
                  just shipped the WebSocket hub 🔥
                </div>
              </div>
              <div className="flex justify-start mockup-msg-in2">
                <div className="font-sans text-xs px-3 py-2 rounded-2xl rounded-tl-sm" style={{ background: 'hsl(220 12% 16%)', color: 'hsl(220 10% 80%)' }}>
                  send it, let&apos;s goooo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div
        className="border-y border-border overflow-hidden"
        style={{ zIndex: 1, position: 'relative', padding: '13px 0' }}
      >
        <div className="ticker-track">
          {[...Array(2)].map((_, i) =>
            TICKER_ITEMS.map((t, j) => (
              <span
                key={`${i}-${j}`}
                className="font-mono text-muted-foreground"
                style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 28px' }}
              >
                {t}
                <span style={{ color: 'hsl(158 64% 52%)', margin: '0 4px' }}>◆</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="relative px-12 py-28" style={{ zIndex: 1 }}>
        <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
          <h2
            className="font-display font-extrabold leading-none"
            style={{ fontSize: 'clamp(44px, 7vw, 80px)', letterSpacing: '-0.01em' }}
          >
            built to
            <br />
            <span style={{ color: 'hsl(158 64% 52%)' }}>move fast.</span>
          </h2>
          <p
            className="font-sans font-light text-muted-foreground leading-relaxed"
            style={{ fontSize: 14, maxWidth: 260 }}
          >
            Every technical decision made with one goal: your messages arrive before you even
            finish typing.
          </p>
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            background: 'hsl(220 12% 16%)',
          }}
        >
          {FEATURES.map(f => (
            <div key={f.label} className="feat-card">
              <span
                className="font-mono block mb-5"
                style={{ fontSize: 11, color: 'hsl(158 64% 52%)', letterSpacing: '0.12em' }}
              >
                {f.label}
              </span>
              <h3
                className="font-display font-bold mb-3"
                style={{ fontSize: 20, letterSpacing: '0.02em', color: 'hsl(220 10% 94%)' }}
              >
                {f.title}
              </h3>
              <p
                className="font-sans font-light leading-relaxed text-muted-foreground"
                style={{ fontSize: 13 }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        id="stack"
        className="border-y border-border px-12 py-16"
        style={{ zIndex: 1, position: 'relative' }}
      >
        <div className="grid grid-cols-4 gap-12">
          {[
            { val: '<10ms', label: 'Median latency' },
            { val: '54s', label: 'Keepalive interval' },
            { val: '∞', label: 'Message history' },
            { val: '0', label: 'Dropped packets' },
          ].map(s => (
            <div key={s.label}>
              <div
                className="font-display font-extrabold"
                style={{ fontSize: 'clamp(40px, 5vw, 64px)', color: 'hsl(158 64% 52%)', lineHeight: 1 }}
              >
                {s.val}
              </div>
              <div
                className="font-mono text-muted-foreground mt-2"
                style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="relative text-center px-12 py-40"
        style={{ zIndex: 1 }}
      >
        {/* Ghost background wordmark */}
        <div
          aria-hidden="true"
          className="font-display font-extrabold pointer-events-none select-none absolute left-1/2 top-1/2"
          style={{
            fontSize: 'clamp(80px, 16vw, 200px)',
            letterSpacing: '-0.02em',
            color: 'hsl(220 12% 13%)',
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          BANTERRR
        </div>

        <div className="relative">
          <p
            className="font-mono mb-7"
            style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'hsl(158 64% 52%)' }}
          >
            ◆ Free · No account needed beyond Google
          </p>
          <h2
            className="font-display font-extrabold leading-none mb-12"
            style={{ fontSize: 'clamp(52px, 8vw, 108px)', letterSpacing: '-0.01em' }}
          >
            stop lurking.
            <br />
            start talking.
          </h2>
          <a href={`${API_URL}/google-sso`} className="cta-btn" style={{ fontSize: 14, padding: '16px 52px' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Open Banterrr
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="border-t border-border px-10 py-6 flex items-center justify-between flex-wrap gap-4"
        style={{ zIndex: 1, position: 'relative' }}
      >
        <span className="font-display font-semibold tracking-tight text-muted-foreground" style={{ opacity: 0.4 }}>
          Banterrr.
        </span>
        <span className="font-mono text-muted-foreground" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
          Go · Redis · Next.js 14 · Render · Vercel
        </span>
      </footer>
    </main>
  )
}