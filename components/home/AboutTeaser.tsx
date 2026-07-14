'use client'

import React from 'react'
import Button from '../ui/Button'
import Image from 'next/image'
import { useScrollReveal } from '../../lib/hooks'

export default function AboutTeaser() {
  // H-1: useScrollReveal replaces the copy-pasted IntersectionObserver pattern
  const { ref, visible } = useScrollReveal()

  return (
    <section className="py-32 bg-ni-surface relative shadow-premium border-t border-ni-border/10">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >

        {/* Left — text */}
        <div className="space-y-6">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621]">ABOUT</p>
          <h2 className="font-heading text-display font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
            We've been making powders since before it was trendy.
          </h2>
          <div className="space-y-4 font-body text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
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
          <div className="pt-2">
            <Button variant="outline" size="md" href="/about">Our story →</Button>
          </div>
        </div>

        {/* Right — Facility photo */}
        <div className="relative w-full overflow-hidden rounded-[24px] shadow-premium border border-ni-border/20 group" style={{ aspectRatio: '4/3' }}>
          <Image
            src="/Images/Facility_Photo.jpg"
            alt="Nectaringredients premium food powder manufacturing facility in Surendranagar, Gujarat"
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Subtle overlay gradient to add premium mood */}
          <div className="absolute inset-0 bg-gradient-to-t from-ni-bg/40 to-transparent pointer-events-none" />
        </div>

      </div>
    </section>
  )
}