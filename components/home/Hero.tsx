'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import SwatchStrip from './SwatchStrip'
import Button from '../ui/Button'

export default function Hero() {
  const imgRef = useRef<HTMLDivElement>(null)

  /* Continuous lerped physics parallax — 120fps buttery smooth depth across Android, iOS & Desktop */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rafId: number
    let targetY = 0
    let currentY = 0
    let isRunning = false

    const updateParallax = () => {
      // Smooth linear interpolation (lerp) for jitter-free momentum
      currentY += (targetY - currentY) * 0.12
      if (imgRef.current) {
        imgRef.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`
      }
      if (Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(updateParallax)
      } else {
        isRunning = false
      }
    }

    const handleScroll = () => {
      // Continuous smooth depth translation without any cutoff freeze
      targetY = -window.scrollY * 0.15
      if (!isRunning) {
        isRunning = true
        rafId = requestAnimationFrame(updateParallax)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section
      className="relative flex flex-col justify-end overflow-hidden bg-black"
      style={{ minHeight: 'var(--vh100)' }}
      aria-label="Hero"
    >
      {/* Full-bleed hero background image with ample vertical bleed for smooth depth */}
      <div
        ref={imgRef}
        className="absolute inset-x-0 -top-[12%] h-[124%] pointer-events-none z-0 will-change-transform transform-gpu"
        aria-hidden="true"
      >
        {/* Hero Background Image Container */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/Images/hero-powder-flatlay.jpg"
            alt="Pure dehydrated ingredient powders flat-lay background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-100 opacity-100"
          />
        </div>

        {/* Crisp Dark Vignette Overlay (NO white haze) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      </div>

      {/* Hero content — text scrolls cleanly over background */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12 sm:pb-16 pt-32 sm:pt-36 lg:pt-44">
        <div className="max-w-3xl">

          {/* Location & Brand Pill — stationary, clean grounded badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel border border-neutral-900/10 dark:border-white/20 shadow-sm mb-6 bg-white/90 dark:bg-black/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-ni-rust" />
            <span className="font-body text-[10px] font-bold tracking-[0.18em] text-neutral-900 dark:text-white uppercase">
              SURENDRANAGAR, GUJARAT — EST. 2021
            </span>
          </div>

          {/* Headline with guaranteed high-contrast styling */}
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] sm:leading-[1.1] tracking-[-0.03em] mb-6 drop-shadow-lg">
            <span className="font-serif italic font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-100 drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)] sm:whitespace-nowrap">
              Pure Nectar Ingredients
            </span>
            <br />
            From Field to Powders
          </h1>

          {/* Sub-text with high-contrast frosted glass card */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-neutral-900/10 dark:border-white/15 backdrop-blur-xl mb-8 sm:mb-10 max-w-2xl shadow-premium bg-white/90 dark:bg-black/60">
            <p className="font-body text-sm sm:text-lg text-neutral-900 dark:text-neutral-100 font-semibold leading-[1.6] sm:leading-[1.7]">
              We make pure dehydrated vegetable, fruit, and spice powders for food businesses
              and home kitchens. No fillers, no additives — just concentrated ingredient.
            </p>
          </div>

          {/* CTA Buttons — uniform h-14 height & px-8 padding */}
          <div className="flex flex-wrap gap-4 pt-2 mb-10 sm:mb-12 items-center">
            <Button
              variant="primary"
              size="lg"
              href="/products"
              className="group h-14 px-8 flex items-center justify-center rounded-full text-xs font-bold uppercase tracking-widest
                         bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-premium hover:-translate-y-0.5
                         transition-all duration-300 min-w-[180px] sm:min-w-[200px]"
            >
              Explore Products
              <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              href="/contact"
              className="h-14 px-8 flex items-center justify-center rounded-full text-xs font-bold uppercase tracking-widest
                         glass-panel border border-white/30 text-white bg-black/30 backdrop-blur-md
                         hover:border-ni-rust hover:text-orange-300 hover:-translate-y-0.5
                         transition-all duration-300 min-w-[180px] sm:min-w-[200px] btn-press"
            >
              Order Commercial Trial
            </Button>
          </div>

          {/* Proof Badges */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-x-6 sm:gap-y-3 pt-6 border-t border-white/15">
            {['100% additive-free', 'Batch-tested quality', '1 kg MOQ Trial Packs'].map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 font-body text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white glass-panel px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20 shadow-sm bg-white/80 dark:bg-black/40 backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* Swatch Pill Strip (Image #21) */}
      <div className="relative z-10 mt-6 sm:mt-8 w-full">
        <SwatchStrip />
      </div>
    </section>
  )
}

