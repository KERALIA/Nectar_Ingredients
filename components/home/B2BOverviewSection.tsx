'use client'

import React from 'react'
import Link from 'next/link'
import { useScrollReveal } from '../../lib/hooks'

export default function B2BOverviewSection() {
  const { ref, visible } = useScrollReveal()

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-ni-bg via-ni-surface2/30 to-ni-bg border-t border-b border-ni-border/15 relative overflow-hidden">
      {/* Subtle Background Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-ni-rust/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-ni-rust/5 rounded-full blur-3xl pointer-events-none" />

      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ni-rust/10 border border-ni-rust/20 text-ni-rust font-body text-xs font-extrabold uppercase tracking-widest mb-5">
            <span className="w-2 h-2 rounded-full bg-ni-rust animate-pulse" />
            <span>Commercial Supply & Direct Manufacturing</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-ni-primary tracking-tight leading-[1.15]">
            Premium Food Ingredients &amp; Dehydration Facility
          </h2>
          <p className="font-body text-ni-secondary text-base sm:text-xl mt-5 leading-relaxed max-w-2xl font-normal">
            Operating direct from Surendranagar, Gujarat — powering food processors, seasoning blenders, cloud kitchens, and nutraceutical brands across India &amp; globally.
          </p>
        </div>

        {/* Highlight Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-14">
          {[
            { label: 'Particle Fineness', val: '80–100 Mesh', sub: 'Micro-milled powders' },
            { label: 'Purity Guarantee', val: '0% Fillers', sub: 'Clean label formulation' },
            { label: 'Batch Range', val: '1kg to 50+ Tons', sub: 'Flexible commercial supply' },
            { label: 'Origin Quality', val: '100% Traceable', sub: 'Gujarat processing plant' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-ni-surface/80 dark:bg-[#1A1A1D]/80 border border-ni-border/30 dark:border-white/10 backdrop-blur-md hairline-card"
            >
              <p className="font-body text-xs sm:text-sm font-bold uppercase tracking-wider text-ni-muted">{item.label}</p>
              <p className="font-heading text-2xl sm:text-3xl font-black text-ni-rust mt-1.5">{item.val}</p>
              <p className="font-body text-xs sm:text-sm text-ni-secondary mt-1">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* 3 Main Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-body">
          {/* Card 1 */}
          <div className="group p-8 sm:p-9 rounded-[28px] bg-ni-surface/90 dark:bg-[#1A1A1D]/90 border border-ni-border/30 dark:border-white/10 shadow-card hover:shadow-hover hover:border-ni-rust/40 transition-all duration-300 flex flex-col justify-between hairline-card">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-ni-rust/10 border border-ni-rust/20 flex items-center justify-center text-ni-rust mb-6 group-hover:scale-110 group-hover:bg-ni-rust group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-lg bg-ni-rust/10 text-ni-rust font-bold text-xs uppercase">Spray-Dried</span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">Air-Dried</span>
              </div>

              <h3 className="font-heading text-xl sm:text-2xl font-black text-ni-primary mb-3 group-hover:text-ni-rust transition-colors leading-snug">
                Bulk Dehydrated Powders
              </h3>

              <p className="text-sm sm:text-base text-ni-secondary leading-relaxed mb-6">
                Specialized in high-purity vegetable, fruit, and spice powders. Engineered for seamless B2B manufacturing and high-volume commercial runs.
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-ni-primary font-medium mb-8">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" />
                  <span>Tomato, Pink &amp; White Onion, Garlic Powders</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" />
                  <span>Ginger, Turmeric, Tamarind &amp; Culinary Herbs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" />
                  <span>Spray-dried fruit powders (Watermelon, Mango, Amla)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-ni-rust group-hover:translate-x-1 transition-transform"
            >
              <span>Explore Powders</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card 2 */}
          <div className="group p-8 sm:p-9 rounded-[28px] bg-ni-surface/90 dark:bg-[#1A1A1D]/90 border border-ni-border/30 dark:border-white/10 shadow-card hover:shadow-hover hover:border-ni-rust/40 transition-all duration-300 flex flex-col justify-between hairline-card">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-ni-rust/10 border border-ni-rust/20 flex items-center justify-center text-ni-rust mb-6 group-hover:scale-110 group-hover:bg-ni-rust group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase">80–100 Mesh</span>
                <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">Zero Fillers</span>
              </div>

              <h3 className="font-heading text-xl sm:text-2xl font-black text-ni-primary mb-3 group-hover:text-ni-rust transition-colors leading-snug">
                Clean Label &amp; Precision Milling
              </h3>

              <p className="text-sm sm:text-base text-ni-secondary leading-relaxed mb-6">
                Engineered for food processors &amp; blenders with low-temperature drying protocols that preserve original aroma and color.
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-ni-primary font-medium mb-8">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" />
                  <span>Zero anti-caking agents &amp; zero preservatives</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" />
                  <span>Uniform mesh particle size for instant dissolution</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" />
                  <span>Full batch origin traceability &amp; lab verification</span>
                </li>
              </ul>
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-ni-rust group-hover:translate-x-1 transition-transform"
            >
              <span>Our Facility Standards</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card 3 */}
          <div className="group p-8 sm:p-9 rounded-[28px] bg-ni-surface/90 dark:bg-[#1A1A1D]/90 border border-ni-border/30 dark:border-white/10 shadow-card hover:shadow-hover hover:border-ni-rust/40 transition-all duration-300 flex flex-col justify-between hairline-card">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-ni-rust/10 border border-ni-rust/20 flex items-center justify-center text-ni-rust mb-6 group-hover:scale-110 group-hover:bg-ni-rust group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase">Trial Scale</span>
                <span className="px-3 py-1 rounded-lg bg-ni-rust/10 text-ni-rust font-bold text-xs uppercase">Factory Direct</span>
              </div>

              <h3 className="font-heading text-xl sm:text-2xl font-black text-ni-primary mb-3 group-hover:text-ni-rust transition-colors leading-snug">
                Flexible Order Quantities
              </h3>

              <p className="text-sm sm:text-base text-ni-secondary leading-relaxed mb-6">
                From 1 kg sample trial boxes for new product development to multi-metric-ton dispatches, we support all business scales.
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-ni-primary font-medium mb-8">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" />
                  <span>1 kg trial boxes credited on first bulk order</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" />
                  <span>Custom packaging (25 kg corrugated / moisture-barrier)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" />
                  <span>Fast nationwide &amp; export dispatch logistics</span>
                </li>
              </ul>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-ni-rust group-hover:translate-x-1 transition-transform"
            >
              <span>Order Trial or Bulk</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Bottom Callout */}
        <div className="mt-14 p-7 sm:p-8 rounded-[24px] bg-ni-rust/10 border border-ni-rust/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hairline-card">
          <div className="flex items-center gap-4">
            <span className="text-3xl flex-shrink-0">🏭</span>
            <div>
              <p className="font-heading text-base sm:text-lg font-extrabold text-ni-primary">Need a custom mesh size or proprietary blend formulation?</p>
              <p className="font-body text-xs sm:text-sm text-ni-secondary mt-0.5">Our Surendranagar technical sales team responds within 24 hours.</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="px-7 py-3.5 rounded-full bg-ni-rust text-white font-body text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-ni-rust-lt transition-all shadow-md flex-shrink-0 btn-press"
          >
            Contact Technical Team →
          </Link>
        </div>
      </div>
    </section>
  )
}

