'use client'

import React from 'react'
import Button from '../ui/Button'
import { useScrollReveal } from '../../lib/hooks'

const proofPoints = [
  { icon: 'box',      text: '1 kg trial packs dispatched' },
  { icon: 'factory',  text: 'Up to 2 MT monthly facility capacity' },
  { icon: 'location', text: 'Surendranagar, Gujarat plant' },
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

  /* ponytail: CTA contact anchor. Hook into direct WhatsApp commercial routing if needed for local buyers. */
  return (
    <section className="relative py-16 sm:py-24 bg-ni-surface border-t border-ni-border/20" aria-label="Contact and sample requests">
      <div
        ref={ref}
        className={`relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center
                    transition-opacity transition-transform duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <p className="font-body text-xs font-medium text-ni-rust mb-3">Direct procurement inquiries</p>

        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ni-primary tracking-tight mb-4">
          Request a Sample or Commercial Quote
        </h2>

        <p className="font-body text-ni-secondary text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8 font-normal">
          Share your target mesh specification and volume. Our Surendranagar technical sales team confirms availability, pricing, and trial dispatches within one business day.
        </p>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 items-center">
          <Button
            variant="primary"
            size="lg"
            href="/contact"
            className="h-12 sm:h-13 px-7 flex items-center justify-center rounded-xl text-sm font-semibold
                       bg-ni-rust text-white hover:bg-ni-rust-lt shadow-sm hover:-translate-y-0.5
                       transition-colors transition-transform min-w-[180px]"
          >
            Send Inquiry
          </Button>
          <Button
            variant="outline"
            size="lg"
            href="mailto:nectaringredients@gmail.com"
            className="h-12 sm:h-13 px-7 flex items-center justify-center rounded-xl text-sm font-semibold
                       border border-ni-border/40 text-ni-primary bg-ni-bg
                       hover:border-ni-rust hover:text-ni-rust hover:-translate-y-0.5
                       transition-colors transition-transform min-w-[180px]"
          >
            Email Directly
          </Button>
        </div>

        {/* Proof points row */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 pt-8 border-t border-ni-border/15">
          {proofPoints.map(({ icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-2 font-body text-xs text-ni-secondary"
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
