'use client'

import React from 'react'
import Button from '../ui/Button'
import Image from 'next/image'
import { useScrollReveal } from '../../lib/hooks'

export default function AboutTeaser() {
  const { ref, visible } = useScrollReveal()

  /* ponytail: Core company intro. Expand to virtual facility tour module when video walkthrough assets are ready. */
  return (
    <section className="py-16 sm:py-24 bg-ni-surface relative border-t border-ni-border/20" aria-label="About Nectar Ingredients">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                    grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center
                    transition-opacity transition-transform duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        {/* ── Left: text ── */}
        <div className="space-y-6 order-2 lg:order-1">
          <p className="font-body text-xs font-medium text-ni-rust">
            About the facility
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-ni-primary tracking-tight leading-[1.15]">
            Built in Surendranagar around direct agricultural supply
          </h2>
          <div className="space-y-4 font-body text-ni-secondary text-base leading-relaxed">
            <p>
              Founded in 2021 in Surendranagar, Gujarat, Nectar Ingredients was established to give food manufacturers and commercial kitchens consistent, clean-label raw materials directly from the processing plant.
            </p>
            <p>
              We supply ready-to-eat manufacturers, cloud kitchen networks, nutraceutical brands, and institutional food processors across India. Every batch begins with whole raw produce, never imported concentrates. If a batch does not meet our moisture, color, and aroma benchmarks, it does not leave the facility.
            </p>
          </div>

          {/* Proof points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-ni-bg border border-ni-border/30">
              <p className="font-heading text-xs font-bold text-ni-primary">Direct farm produce</p>
              <p className="text-[11px] text-ni-muted mt-0.5">Whole agricultural origin</p>
            </div>
            <div className="p-3.5 rounded-lg bg-ni-bg border border-ni-border/30">
              <p className="font-heading text-xs font-bold text-ni-primary">Zero concentrates</p>
              <p className="text-[11px] text-ni-muted mt-0.5">No maltodextrin or fillers</p>
            </div>
            <div className="p-3.5 rounded-lg bg-ni-bg border border-ni-border/30">
              <p className="font-heading text-xs font-bold text-ni-primary">Batch lab tested</p>
              <p className="text-[11px] text-ni-muted mt-0.5">CoA on request with each order</p>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="outline" size="md" href="/about" className="rounded-lg text-xs sm:text-sm px-5 py-2.5">
              Read Our Facility Story
            </Button>
          </div>
        </div>

        {/* ── Right: showcase photo card ── */}
        <div className="relative order-1 lg:order-2 flex flex-col justify-center">
          <div className="relative w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border border-ni-border/30 group">
            <Image
              src="/Images/Facility_Photo.jpg"
              alt="Dehydration and quality processing at Nectar Ingredients facility in Surendranagar"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Plant info bar */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between p-3.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-white">
              <div>
                <p className="font-body text-xs font-semibold">Surendranagar Plant, Gujarat</p>
                <p className="text-[11px] text-neutral-300">Operational since 2021</p>
              </div>
              <span className="text-xs font-medium text-orange-300 px-2 py-0.5 rounded bg-white/10">
                Direct facility
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
