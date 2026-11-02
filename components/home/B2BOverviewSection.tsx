'use client'

import React from 'react'
import Link from 'next/link'
import { useScrollReveal } from '../../lib/hooks'

export default function B2BOverviewSection() {
  const { ref, visible } = useScrollReveal()

  /* ponytail: Three core production pillars. Extend to full ISO/FSSAI compliance table when regulatory documentation hub ships. */
  return (
    <section className="py-16 sm:py-24 bg-ni-surface border-t border-b border-ni-border/20 relative" aria-label="Commercial supply and manufacturing">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-opacity transition-transform duration-500 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <p className="font-body text-xs font-medium text-ni-rust mb-3">
            Commercial Supply &amp; Direct Manufacturing
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ni-primary tracking-tight leading-[1.15]">
            Industrial Food Powders, Processed at the Source
          </h2>
          <p className="font-body text-ni-secondary text-base sm:text-lg mt-4 leading-relaxed max-w-2xl font-normal">
            Direct dehydration and micro-milling facility in Surendranagar, Gujarat. Supplying seasoning blenders, ready-to-eat manufacturers, cloud kitchens, and nutraceutical brands.
          </p>
        </div>

        {/* Technical Specifications Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {[
            { label: 'Particle fineness', val: '80 to 100 Mesh', sub: 'Micro-milled for instant dispersion' },
            { label: 'Purity standard', val: '0% Fillers', sub: 'No maltodextrin or anti-caking' },
            { label: 'Order scale', val: '1 kg to 50 MT', sub: 'Benchtop R&D to bulk production' },
            { label: 'Sourcing origin', val: 'Direct Farm', sub: 'Gujarat & Maharashtra agriculture' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-xl bg-ni-bg border border-ni-border/30"
            >
              <p className="font-body text-xs text-ni-muted">{item.label}</p>
              <p className="font-heading text-xl sm:text-2xl font-extrabold text-ni-primary mt-1">{item.val}</p>
              <p className="font-body text-xs text-ni-secondary mt-1">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* 3 Core Supply Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 font-body">
          {/* Card 1 */}
          <div className="p-7 sm:p-8 rounded-2xl bg-ni-bg border border-ni-border/30 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-lg bg-ni-rust/10 flex items-center justify-center text-ni-rust mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>

              <div className="flex gap-2 mb-3 text-xs text-ni-secondary">
                <span className="px-2 py-0.5 rounded bg-ni-surface border border-ni-border/40">Air-dried</span>
                <span className="px-2 py-0.5 rounded bg-ni-surface border border-ni-border/40">Spray-dried</span>
              </div>

              <h3 className="font-heading text-xl font-bold text-ni-primary mb-3">
                Bulk Dehydrated Powders
              </h3>

              <p className="text-sm text-ni-secondary leading-relaxed mb-6">
                Specialized in vegetable, fruit, and spice powders engineered for industrial dissolution, clean labeling, and long shelf stability.
              </p>

              <ul className="space-y-2 text-xs sm:text-sm text-ni-secondary mb-8">
                <li>Pink &amp; White Onion, Garlic (100 mesh)</li>
                <li>Spray-Dried Tomato, Tamarind &amp; Chilly</li>
                <li>Alphonso Mango, Strawberry &amp; Amla</li>
              </ul>
            </div>

            <Link
              href="/products"
              className="text-xs sm:text-sm font-semibold text-ni-rust hover:text-ni-rust-lt transition-colors"
            >
              View powder catalog
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-7 sm:p-8 rounded-2xl bg-ni-bg border border-ni-border/30 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-lg bg-ni-rust/10 flex items-center justify-center text-ni-rust mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              <div className="flex gap-2 mb-3 text-xs text-ni-secondary">
                <span className="px-2 py-0.5 rounded bg-ni-surface border border-ni-border/40">Lab verified</span>
                <span className="px-2 py-0.5 rounded bg-ni-surface border border-ni-border/40">Clean label</span>
              </div>

              <h3 className="font-heading text-xl font-bold text-ni-primary mb-3">
                Zero Preservatives &amp; Fillers
              </h3>

              <p className="text-sm text-ni-secondary leading-relaxed mb-6">
                No maltodextrin, no anti-caking chemicals, and no artificial colorants. Low-temperature dehydration retains the produce’s natural aroma and pigment.
              </p>

              <ul className="space-y-2 text-xs sm:text-sm text-ni-secondary mb-8">
                <li>Hunter Lab spectrophotometer color testing</li>
                <li>Moisture content checked on every lot</li>
                <li>Certificate of Analysis (CoA) with each batch</li>
              </ul>
            </div>

            <Link
              href="/about"
              className="text-xs sm:text-sm font-semibold text-ni-rust hover:text-ni-rust-lt transition-colors"
            >
              Review processing standards
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-7 sm:p-8 rounded-2xl bg-ni-bg border border-ni-border/30 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-lg bg-ni-rust/10 flex items-center justify-center text-ni-rust mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>

              <div className="flex gap-2 mb-3 text-xs text-ni-secondary">
                <span className="px-2 py-0.5 rounded bg-ni-surface border border-ni-border/40">1 kg trial packs</span>
                <span className="px-2 py-0.5 rounded bg-ni-surface border border-ni-border/40">25 kg bulk</span>
              </div>

              <h3 className="font-heading text-xl font-bold text-ni-primary mb-3">
                Flexible Order Scales
              </h3>

              <p className="text-sm text-ni-secondary leading-relaxed mb-6">
                We remove procurement barriers for R&amp;D formulation trials while maintaining commercial scale for multi-ton manufacturing schedules.
              </p>

              <ul className="space-y-2 text-xs sm:text-sm text-ni-secondary mb-8">
                <li>1 kg vacuum-sealed pouches for formulation testing</li>
                <li>25 kg food-grade HDPE moisture-barrier bags</li>
                <li>Dispatched within 3 to 5 business days</li>
              </ul>
            </div>

            <Link
              href="/contact"
              className="text-xs sm:text-sm font-semibold text-ni-rust hover:text-ni-rust-lt transition-colors"
            >
              Order trial or request quote
            </Link>
          </div>
        </div>

        {/* Technical Inquiries Callout */}
        <div className="mt-12 p-6 sm:p-8 rounded-xl bg-ni-bg border border-ni-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-ni-rust/10 flex items-center justify-center text-ni-rust flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="font-heading text-base font-bold text-ni-primary">Need a custom mesh size or custom formulation?</p>
              <p className="font-body text-xs text-ni-secondary mt-0.5">Our Surendranagar technical sales team answers within 24 hours.</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-lg bg-ni-rust text-white font-body text-xs sm:text-sm font-medium hover:bg-ni-rust-lt transition-colors flex-shrink-0"
          >
            Contact Technical Team
          </Link>
        </div>
      </div>
    </section>
  )
}

