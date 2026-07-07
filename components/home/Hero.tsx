'use client'

import SwatchStrip from './SwatchStrip'
import Button from '../ui/Button'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative flex flex-col justify-start md:justify-center overflow-hidden bg-ni-bg pt-28 md:pt-24 pb-12 md:pb-0"
      style={{ minHeight: 'var(--vh100)' }}
    >

      {/* Subtle radial rust accent — no image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 75% 0%, rgba(212,82,26,0.07) 0%, transparent 65%)'
        }}
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full animate-fade-up">

        {/* Eyebrow tag */}
        <span className="font-body text-xs tracking-widest text-ni-muted border border-ni-border2 px-4 py-1.5 inline-block mb-10 uppercase">
          Surendranagar, Gujarat · Est. 2011
        </span>

        {/* Headline — "powder" in ni-rust, everything else ni-primary */}
        <h1 className="font-heading text-hero font-semibold text-ni-primary leading-[1.05] tracking-tight max-w-4xl">
          From field to{' '}
          <span className="text-ni-rust">powder</span>,{' '}
          <span className="block sm:inline">nothing in between.</span>
        </h1>

        {/* Subtext */}
        <p className="font-body text-xl text-ni-secondary max-w-xl leading-relaxed mt-6">
          We make pure dehydrated vegetable, fruit, and spice powders for food businesses
          and home kitchens. No fillers, no additives — just concentrated ingredient.
        </p>

        {/* CTA row */}
        <div className="flex flex-wrap gap-4 mt-10">
          <Button variant="primary" size="lg" href="/products">Explore Products →</Button>
          <Button variant="ghost" size="lg" href="/contact">Request a Sample</Button>
        </div>

      </div>

      {/* Swatch strip — full bleed, below hero content */}
      <div className="relative mt-16 w-full">
        <SwatchStrip />
      </div>

    </section>
  )
}