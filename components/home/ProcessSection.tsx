'use client'

import React from 'react'
import Image from 'next/image'
import { useScrollReveal } from '../../lib/hooks'
import SectionHeading from '../ui/SectionHeading'

const steps = [
  { num: '01', label: 'Source', desc: 'Raw produce sourced directly from farms across Gujarat and Maharashtra — whole, fresh, no concentrate.' },
  { num: '02', label: 'Wash & Sort', desc: 'Each batch washed, inspected, and sorted to remove sub-grade material before processing.' },
  { num: '03', label: 'Dehydrate', desc: 'Low-temperature drying retains colour, aroma, and nutritional profile without chemical preservatives.' },
  { num: '04', label: 'Grind', desc: 'Precision grinding to your mesh specification — 40, 60, or 80 mesh — for consistent particle size.' },
  { num: '05', label: 'Test', desc: 'Moisture, colour (Hunter Lab), and aroma benchmarks checked on every batch before release.' },
  { num: '06', label: 'Pack & Ship', desc: 'Sealed in food-grade multilayer pouches. 1 kg samples to 25 kg commercial bags, dispatched within 3–5 days.' },
]

export default function ProcessSection() {
  const { ref, visible } = useScrollReveal()

  return (
    <section className="py-[var(--space-section)] relative overflow-hidden bg-ni-surface border-t border-ni-border/10">
      {/* Subtle top rule */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ni-border/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start
                      transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >

          {/* ── Left: facility photo ── */}
          <div className="lg:sticky lg:top-28 w-full rounded-[var(--radius-xl)] overflow-hidden shadow-premium border border-ni-border/20 group z-10" style={{ aspectRatio: '4/3' }}>
            <div className="relative w-full h-full">
              <Image
                src="/Images/facility-process.jpg"
                alt="Nectar Ingredients processing facility — dehydration and grinding equipment in Surendranagar"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none transition-opacity duration-300" />
              {/* Caption badge */}
              <div className="absolute bottom-6 left-6">
                <span className="glass-panel px-4 py-2 rounded-full font-body text-[11px] font-bold uppercase tracking-widest text-white border border-white/20 shadow-lg backdrop-blur-md bg-black/30">
                  Surendranagar Facility
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: numbered steps ── */}
          <div className="space-y-2">
            <SectionHeading
              tag="HOW IT'S MADE"
              heading="From raw to refined — in one facility"
            />

            <div className="mt-8 space-y-0">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`reveal ${visible ? 'is-visible' : ''} reveal-delay-${Math.min(i + 1, 4)}
                               group flex gap-5 py-6 border-b border-ni-border/15 last:border-0
                               hover:pl-1 transition-all duration-300`}
                >
                  {/* Number */}
                  <span className="font-mono text-sm font-bold text-ni-rust/40 group-hover:text-ni-rust flex-shrink-0 w-8 pt-0.5 transition-colors duration-300">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-ni-primary mb-1 group-hover:text-ni-rust transition-colors duration-300">
                      {step.label}
                    </h3>
                    <p className="font-body text-sm text-ni-secondary leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ni-border/40 to-transparent" />
    </section>
  )
}
