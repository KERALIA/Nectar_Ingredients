'use client'

import { useEffect, useRef, useState } from 'react'

import LoadingBuffer from './LoadingBuffer'

const LETTERS = ['N', 'E', 'C', 'T', 'A', 'R']

export default function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState<'kern' | 'buffer' | 'reveal' | 'done'>('kern')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip preloader if already seen in this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('ni-preloader-seen') === '1') {
      setPhase('done')
      onComplete?.()
      return
    }

    // Phase 1: kern expand (500ms)
    const t1 = setTimeout(() => setPhase('buffer'), 500)
    // Phase 2: Loading Buffer pulse (700ms)
    const t2 = setTimeout(() => setPhase('reveal'), 1200)
    // Phase 3: mask reveal (500ms) then done
    const t3 = setTimeout(() => {
      try {
        sessionStorage.setItem('ni-preloader-seen', '1')
      } catch {}
      setPhase('done')
      onComplete?.()
    }, 1700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  if (phase === 'done') return null

  return (
    <div
      ref={containerRef}
      className="preloader fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg)' }}
      aria-hidden="true"
    >
      {/* Typography kern expand */}
      <div
        className="flex items-center"
        style={{
          letterSpacing: phase === 'kern' ? '0.05em' : '0.6em',
          transition: 'letter-spacing 500ms cubic-bezier(0.16,1,0.3,1)',
          opacity: phase === 'reveal' ? 0 : 1,
          transform: phase === 'reveal' ? 'scale(1.5)' : 'scale(1)',
          transitionProperty: 'opacity, transform',
          transitionDuration: '500ms',
        }}
      >
        {LETTERS.map((l, i) => (
          <span
            key={i}
            className="font-heading font-bold text-ni-rust select-none"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 6rem)',
              opacity: phase === 'kern' ? 0 : 1,
              transform: `translateY(${phase === 'kern' ? '16px' : '0'})`,
              transition: `opacity 300ms ease ${i * 50}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${i * 50}ms`,
            }}
          >
            {l}
          </span>
        ))}
      </div>

      {/* Custom Liquid Ring & Powder Buffer */}
      <div
        className="mt-6 transition-all duration-500"
        style={{
          opacity: phase === 'buffer' || phase === 'reveal' ? 1 : 0,
          transform: phase === 'reveal' ? 'scale(2)' : 'scale(1)',
        }}
      >
        <LoadingBuffer size="lg" text="Preparing Ingredients" />
      </div>

      {/* Progress line */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-ni-rust"
        style={{
          width: phase === 'kern' ? '33%' : phase === 'buffer' ? '75%' : '100%',
          transition: 'width 500ms cubic-bezier(0.16,1,0.3,1)',
        }}
      />
    </div>
  )
}
