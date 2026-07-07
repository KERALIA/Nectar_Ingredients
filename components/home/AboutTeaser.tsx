'use client'

import React from 'react'
import Button from '../ui/Button'
import Image from 'next/image'
import { useScrollReveal } from '../../lib/hooks'

export default function AboutTeaser() {
  // H-1: useScrollReveal replaces the copy-pasted IntersectionObserver pattern
  const { ref, visible } = useScrollReveal()

  return (
    <section className="py-24 border-y border-ni-border">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >

        {/* Left — text */}
        <div>
          <p className="font-body text-xs tracking-widest text-ni-rust uppercase mb-4">ABOUT</p>
          <h2 className="font-heading text-section font-semibold text-ni-primary">
            We've been making powders since before it was trendy.
          </h2>
          <p className="font-body text-base text-ni-muted leading-relaxed mt-6">
            Nectar Ingredients started in 2011 as a small dehydration unit in Surendranagar, Gujarat.
            Our first customers were local spice traders. Today we supply ready-to-eat manufacturers,
            cloud kitchens, nutraceutical companies, and specialty importers across India.
          </p>
          <p className="font-body text-base text-ni-muted leading-relaxed mt-4">
            We haven't changed what we do — just the scale. Every batch starts with raw produce,
            not concentrate. If it doesn't meet our moisture, color, and aroma specs, it doesn't ship.
          </p>
          <div className="mt-8">
            <Button variant="outline" size="md" href="/about">Our story →</Button>
          </div>
        </div>

        {/* Right — Facility photo */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <Image
            src="/Images/Facility_Photo.jpg"
            alt="Nectar Ingredients manufacturing facility in Surendranagar, Gujarat"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

      </div>
    </section>
  )
}