'use client'

import React from 'react'
import Button from '../ui/Button'
import { useScrollReveal } from '../../lib/hooks'

const proofPoints = [
  { icon: 'box',      text: '1 kg samples available' },
  { icon: 'factory',  text: 'Up to 2 MT/month capacity' },
  { icon: 'location', text: 'Surendranagar, Gujarat' },
]

function Icon({ name }: { name: string }) {
  if (name === 'box') return (
    <svg className="w-4 h-4 text-ni-rust flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
  if (name === 'factory') return (
    <svg className="w-4 h-4 text-ni-rust flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
  return (
    <svg className="w-4 h-4 text-ni-rust flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export default function ContactCTA() {
  const { ref, visible } = useScrollReveal()

  return (
    <section className="relative py-[var(--space-section)] overflow-hidden border-t border-ni-border/15">
      {/* Background: warm sage wash */}
      <div className="absolute inset-0 bg-ni-sage" aria-hidden="true" />

      {/* Terracotta ambient glow — bottom left */}
      <div
        className="absolute left-0 bottom-0 w-1/2 h-2/3 pointer-events-none opacity-50"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 0% 100%, var(--glow-color) 0%, transparent 70%)' }}
      />
      {/* Terracotta ambient glow — top right */}
      <div
        className="absolute right-0 top-0 w-1/3 h-1/2 pointer-events-none opacity-30"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 100% 0%, var(--glow-color) 0%, transparent 70%)' }}
      />

      <div
        ref={ref}
        className={`relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center
                    transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-ni-rust mb-5">Get in Touch</p>

        <h2
          className="font-heading font-bold text-ni-primary tracking-[-0.025em] mb-6"
          style={{ fontSize: 'var(--text-h1)' }}
        >
          Ready to talk powder?
        </h2>

        <p
          className="font-body text-ni-secondary leading-[1.7] max-w-xl mx-auto mb-10"
          style={{ fontSize: 'var(--text-lead)' }}
        >
          Send us your product spec and quantity. We'll respond with availability,
          pricing, and a free sample offer within one business day.
        </p>

        <div className="flex flex-wrap justify-center gap-4 items-center">
          <Button
            variant="primary"
            size="lg"
            href="/contact"
            className="group h-14 px-8 flex items-center justify-center rounded-full text-xs font-bold uppercase tracking-widest
                       bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-premium hover:-translate-y-0.5
                       transition-all duration-300 min-w-[200px]"
          >
            Send an Inquiry
            <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            href="mailto:nectaringredients@gmail.com"
            className="h-14 px-8 flex items-center justify-center rounded-full text-xs font-bold uppercase tracking-widest
                       glass-panel border border-ni-border/40 text-ni-primary
                       hover:border-ni-rust hover:text-ni-rust hover:-translate-y-0.5
                       transition-all duration-300 min-w-[200px]"
          >
            Email Directly
          </Button>
        </div>

        {/* Proof points row */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          {proofPoints.map(({ icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-2.5 font-body text-[10px] font-bold uppercase tracking-wider text-ni-muted"
            >
              <Icon name={icon} />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
