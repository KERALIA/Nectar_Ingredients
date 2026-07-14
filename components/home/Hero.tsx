'use client'

import Image from 'next/image'
import SwatchStrip from './SwatchStrip'
import Button from '../ui/Button'

export default function Hero() {
  return (
    <section
      className="relative flex flex-col justify-between overflow-hidden bg-ni-bg pt-20 md:pt-24 pb-16"
      style={{ minHeight: 'var(--vh100)' }}
    >
      {/* Ambient Glow — soft terracotta radial flare from upper-right */}
      <div
        className="absolute right-0 top-0 w-[60%] h-[70%] pointer-events-none -z-10 animate-glow-pulse"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 85% 0%, var(--glow-color-strong) 0%, transparent 70%)'
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center">
        {/* Responsive grid — stacks on mobile, side-by-side on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center py-8 lg:py-0">

          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 animate-fade-up relative z-10 w-full lg:max-w-[90%]">
            {/* Eyebrow tag */}
            <span className="font-body text-[10px] font-semibold tracking-[0.15em] text-ni-rust border border-ni-rust/20 px-4 py-1.5 inline-block uppercase rounded-2xl bg-ni-rust/5">
              SURENDRANAGAR, GUJARAT — EST. 2011
            </span>

            {/* Headline */}
            <h1 className="font-heading text-[2rem] sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
              <span className="block whitespace-nowrap">
                Pure{' '}
                <span className="font-serif italic font-medium text-brand-orange">Nectaringredients</span>
              </span>
              <span className="block whitespace-nowrap mt-1 sm:mt-2">From Field to Powders</span>
            </h1>

            {/* Subtext */}
            <p className="font-body text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed">
              We make pure dehydrated vegetable, fruit, and spice powders for food businesses
              and home kitchens. No fillers, no additives — just concentrated ingredient.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                href="/products"
                className="group relative rounded-full px-6 sm:px-7 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider bg-ni-rust text-white overflow-hidden transition-all duration-300 hover:bg-ni-rust-lt hover:shadow-premium hover:-translate-y-0.5"
              >
                Explore Products
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2">→</span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                href="/contact"
                className="rounded-full px-6 sm:px-7 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider glass-panel border border-ni-border2/30 text-ni-primary hover:border-ni-rust hover:text-ni-rust transition-all duration-300 hover:-translate-y-0.5"
              >
                Request a Sample
              </Button>
            </div>
          </div>

          {/* Right — Floating Mosaic Showcase */}
          {/* On mobile: reduced size + no aggressive translate that causes overflow */}
          <div className="relative w-full flex items-center justify-center lg:justify-end lg:h-[450px]">
            {/* Ambient glow behind showcase */}
            <div className="absolute w-[240px] lg:w-[280px] h-[240px] lg:h-[280px] rounded-full bg-ni-rust/10 blur-[80px] pointer-events-none -z-10 animate-float" />

            {/* Cards container — fixed height on all sizes, no overflow-causing translate */}
            <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[400px] h-[300px] sm:h-[340px] lg:h-[380px] mt-4 lg:mt-0 lg:translate-y-8">

              {/* Card 1: Tomato — top-left */}
              <div
                className="absolute top-0 left-0 w-[150px] sm:w-[170px] lg:w-[180px] h-[190px] sm:h-[210px] lg:h-[220px] glass-panel rounded-[20px] lg:rounded-[24px] p-3 sm:p-4 shadow-premium animate-float flex flex-col justify-between"
                style={{ animationDelay: '0s' }}
              >
                <div className="relative w-full h-[100px] sm:h-[115px] lg:h-[120px] flex items-center justify-center bg-pw-tomato/10 rounded-[14px] lg:rounded-[16px] p-2 overflow-hidden">
                  <Image
                    src="/Images/Tomato_Powder.webp"
                    alt="Pure single-source dehydrated Tomato Powder from Nectaringredients"
                    fill
                    className="object-contain p-2 hover:scale-110 transition-transform duration-300"
                    sizes="180px"
                    priority
                  />
                </div>
                <div className="text-center pt-2">
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-ni-rust uppercase">Tomato</span>
                  <p className="font-heading text-xs sm:text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-50 truncate mt-0.5">
                    Lycopene Rich
                  </p>
                </div>
              </div>

              {/* Card 2: Turmeric — bottom-right */}
              <div
                className="absolute bottom-0 right-0 w-[150px] sm:w-[170px] lg:w-[180px] h-[190px] sm:h-[210px] lg:h-[220px] glass-panel rounded-[20px] lg:rounded-[24px] p-3 sm:p-4 shadow-premium animate-float flex flex-col justify-between"
                style={{ animationDelay: '1.5s' }}
              >
                <div className="relative w-full h-[100px] sm:h-[115px] lg:h-[120px] flex items-center justify-center bg-pw-turmeric/10 rounded-[14px] lg:rounded-[16px] p-2 overflow-hidden">
                  <Image
                    src="/Images/Turmeric_Powder.webp"
                    alt="Traceable single-ingredient dehydrated Turmeric Powder by Nectaringredients"
                    fill
                    className="object-contain p-2 hover:scale-110 transition-transform duration-300"
                    sizes="180px"
                    priority
                  />
                </div>
                <div className="text-center pt-2">
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-ni-rust uppercase">Turmeric</span>
                  <p className="font-heading text-xs sm:text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-50 truncate mt-0.5">
                    3% Curcumin
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Swatch strip below hero content */}
      <div className="relative mt-8 md:mt-12 lg:mt-16 w-full">
        <SwatchStrip />
      </div>
    </section>
  )
}