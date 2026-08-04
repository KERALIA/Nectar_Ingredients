'use client'

import React from 'react'
import Button from '../ui/Button'
import Image from 'next/image'
import { useScrollReveal } from '../../lib/hooks'

export default function AboutTeaser() {
  const { ref, visible } = useScrollReveal()

  return (
    <section className="py-[var(--space-section)] bg-ni-surface relative border-t border-ni-border/10">
      {/* Subtle ambient glow */}
      <div
        className="absolute left-0 top-0 w-1/2 h-full pointer-events-none opacity-30"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 0% 50%, var(--glow-color) 0%, transparent 70%)' }}
      />

      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                    grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center
                    transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* ── Left: text ── */}
        <div className="space-y-6 order-2 lg:order-1">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-ni-rust">About</p>
          <h2
            className="font-heading font-bold text-ni-primary leading-[1.1] tracking-[-0.02em]"
            style={{ fontSize: 'var(--text-h2)' }}
          >
            We've been making powders since before it was trendy.
          </h2>
          <div className="space-y-4 font-body text-ni-secondary leading-[1.7]" style={{ fontSize: 'var(--text-base)' }}>
            <p>
              Established in 2021 in Surendranagar, Gujarat, Nectar Ingredients was built on one principle:
              your supply chain deserves an ingredient partner you can trust — not just one you can call.
              We began by serving regional food brands who needed consistent, clean-label raw materials,
              and we've grown without ever changing how we produce them.
            </p>
            <p>
              Today we supply ready-to-eat manufacturers, cloud kitchens, nutraceutical brands, and
              specialty importers across India. Every batch starts with whole raw produce, not concentrate.
              If it doesn't meet our moisture, color, and aroma benchmarks, it doesn't ship.
            </p>
          </div>

          {/* Proof points */}
          <div className="flex flex-wrap gap-4 pt-2">
            {[
              'Single-source produce',
              'No concentrates',
              'Batch certificates on request',
            ].map((pt) => (
              <span
                key={pt}
                className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wider text-ni-muted"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-ni-rust/60 flex-shrink-0" aria-hidden="true" />
                {pt}
              </span>
            ))}
          </div>

          <div className="pt-2">
            <Button variant="outline" size="md" href="/about" className="rounded-full">
              Our story →
            </Button>
          </div>
        </div>

        {/* ── Right: sleek showcase photo card ── */}
        <div className="relative order-1 lg:order-2 flex flex-col justify-center">
          <div className="relative w-full h-[420px] sm:h-[480px] rounded-[32px] overflow-hidden shadow-premium border border-ni-border/20 group">
            <Image
              src="/Images/facility-process.jpg"
              alt="Dehydration and quality processing at Nectar Ingredients facility in Surendranagar"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            
            {/* Top plant badge */}
            <div className="absolute top-6 left-6 z-20">
              <span className="glass-panel px-4 py-2 rounded-full shadow-card text-[10px] font-bold uppercase tracking-widest text-white bg-black/40 border border-white/20 backdrop-blur-md">
                Surendranagar Plant, Gujarat
              </span>
            </div>

            {/* Bottom floating info badge */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel bg-black/50 border border-white/15 backdrop-blur-md text-white">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-ni-rust animate-pulse" />
                <span className="font-body text-xs font-bold uppercase tracking-wider">
                  Established 2021 · Direct Facility Output
                </span>
              </div>
              <span className="font-mono text-xs text-orange-400 font-semibold">
                100% Pure Raw Produce
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
