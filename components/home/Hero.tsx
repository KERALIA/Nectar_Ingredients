'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import SwatchStrip from './SwatchStrip'
import Button from '../ui/Button'
import DecryptedText from '../ui/DecryptedText'
import Magnet from '../ui/Magnet'

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

          {/* Location indicator — grounded, unpretentious */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-black/40 text-neutral-300 backdrop-blur-md border border-white/15 mb-6 text-xs font-normal">
            <span>Surendranagar, Gujarat · Processing facility</span>
          </div>

          {/* Headline — editorial typography with Fraunces bold italic brand voice */}
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.12] sm:leading-[1.08] tracking-[-0.03em] mb-6 drop-shadow-md">
            <span className="font-fraunces font-bold italic text-amber-200 sm:whitespace-nowrap">
              <DecryptedText
                text="Pure Nectar Ingredients"
                animateOn="view"
                speed={40}
                maxIterations={10}
                sequential={true}
                className="font-fraunces font-bold italic text-amber-200"
                encryptedClassName="font-fraunces font-bold italic text-amber-200/50"
              />
            </span>
            <br />
            <span className="text-white font-extrabold">From field to powders.</span>
          </h1>

          {/* Clear, direct statement */}
          <p className="font-body text-base sm:text-lg text-neutral-200 font-normal leading-relaxed max-w-2xl mb-8 sm:mb-10 drop-shadow-sm">
            We make pure dehydrated vegetable, fruit, and spice powders for food businesses
            and commercial kitchens. Single-ingredient, low-temperature dehydration, zero fillers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-1 mb-10 sm:mb-12 items-center">
            <Magnet magnetStrength={3.5} padding={70} maxOffset={12}>
              <Button
                variant="primary"
                size="lg"
                href="/products"
                className="h-13 sm:h-14 px-8 flex items-center justify-center rounded-xl text-sm font-semibold
                           bg-ni-rust text-white hover:bg-ni-rust-lt shadow-md hover:-translate-y-0.5
                           transition-transform transition-colors duration-200 motion-reduce:transition-none motion-reduce:hover:translate-none
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 min-w-[180px] sm:min-w-[200px]"
              >
                Explore 40 Powders
              </Button>
            </Magnet>
            <Button
              variant="ghost"
              size="lg"
              href="/contact"
              className="h-13 sm:h-14 px-8 flex items-center justify-center rounded-xl text-sm font-semibold
                         border border-white/25 text-white bg-black/40 backdrop-blur-md
                         hover:border-ni-rust hover:text-white hover:-translate-y-0.5
                         transition-transform transition-colors duration-200 motion-reduce:transition-none motion-reduce:hover:translate-none
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 min-w-[180px] sm:min-w-[200px] btn-press"
            >
              Order Commercial Trial
            </Button>
          </div>

          {/* Technical specification credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-white/15 max-w-2xl">
            <div>
              <div className="text-white font-semibold text-sm">100% Single-source</div>
              <div className="text-neutral-300 text-xs mt-0.5">Whole produce, zero additives or carriers</div>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">80 to 100 Mesh Fineness</div>
              <div className="text-neutral-300 text-xs mt-0.5">Micro-milled for rapid dispersion</div>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">1 kg to 25 kg Packs</div>
              <div className="text-neutral-300 text-xs mt-0.5">R&amp;D trial pouches to commercial bags</div>
            </div>
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

