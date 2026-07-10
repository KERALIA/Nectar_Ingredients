'use client'

import React from 'react'
import Button from '../ui/Button'
import { useScrollReveal } from '../../lib/hooks'

export default function ContactCTA() {
  const { ref, visible } = useScrollReveal()

  return (
    <section className="relative py-32 bg-ni-surface overflow-hidden border-t border-ni-border/15">
      {/* Mirror Ambient Glow: bottom-left terracotta bleed */}
      <div
        className="absolute left-0 bottom-0 w-[50%] h-[60%] pointer-events-none -z-10 opacity-70"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 0% 100%, var(--glow-color) 0%, transparent 70%)'
        }}
        aria-hidden="true"
      />

      {/* Subtle Noise / grain texture overlay (CSS-only) */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none -z-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div
        ref={ref}
        className={`max-w-3xl mx-auto px-6 lg:px-8 text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-4">GET IN TOUCH</p>
        <h2 className="font-heading text-display font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Ready to talk powder?
        </h2>
        <p className="font-body text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto mt-6 leading-relaxed">
          Send us your product spec and quantity. We'll respond with availability, pricing, and a free sample offer within one business day.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Button variant="primary" size="lg" href="/contact" className="group rounded-full px-7 py-4 text-xs font-bold uppercase tracking-widest bg-ni-rust text-white transition-all duration-300 hover:bg-ni-rust-lt hover:shadow-premium hover:-translate-y-0.5">
            Send an Inquiry
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2">→</span>
          </Button>
          <Button variant="ghost" size="lg" href="mailto:hello@nectaringredients.com" className="rounded-full px-7 py-4 text-xs font-bold uppercase tracking-widest glass-panel border border-ni-border2/30 text-ni-primary hover:border-ni-rust hover:text-ni-rust transition-all duration-300 hover:-translate-y-0.5">
            Email Directly
          </Button>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 font-body text-xs font-bold uppercase tracking-wider text-ni-muted">
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-ni-rust flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            1kg samples available
          </span>
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-ni-rust flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Up to 2MT/month capacity
          </span>
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-ni-rust flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Surendranagar, Gujarat
          </span>
        </div>
      </div>
    </section>
  )
}