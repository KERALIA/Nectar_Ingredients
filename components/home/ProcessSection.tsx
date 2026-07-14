'use client'

import React from 'react'
import { processSteps } from '../../lib/data'
import SectionHeading from '../ui/SectionHeading'
import { useScrollReveal } from '../../lib/hooks'

export default function ProcessSection() {
  const { ref, visible } = useScrollReveal()

  const icons: Record<string, React.ReactNode> = {
    'HARVEST': (
      <svg className="w-6 h-6 stroke-[#C05621] stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0a5 5 0 00-5 5c0 3 5 5 5 5m0-10a5 5 0 015 5c0 3-5 5-5 5" />
      </svg>
    ),
    'DRY': (
      <svg className="w-6 h-6 stroke-[#C05621] stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
    'GRIND & PACK': (
      <svg className="w-6 h-6 stroke-[#C05621] stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 11a7 7 0 0014 0H5zM11 11l4-7M8 18h8" />
      </svg>
    )
  }

  return (
    <section className="py-32 bg-transparent relative overflow-hidden">
      {/* Subtle top/bottom gradient divider fades */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ni-border/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ni-border/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <SectionHeading
          tag="HOW IT'S MADE"
          heading="From raw to refined — in one facility"
          align="center"
        />

        <div
          ref={ref}
          className={`mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {/* Connecting dotted line on desktop */}
          <div className="hidden md:block absolute top-[68px] left-[15%] right-[15%] h-px border-t-2 border-dashed border-ni-border/40 -z-10" />

          {processSteps.map((step, idx) => (
            <div 
              key={step.tag} 
              className="relative bg-ni-surface p-8 lg:p-10 flex flex-col items-start rounded-[24px] shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 border border-ni-border/10"
            >
              {/* Number indicator */}
              <span className="absolute top-6 right-6 font-mono text-3xl font-bold text-ni-rust/10 select-none">
                {`0${idx + 1}`}
              </span>

              {/* Icon wrapper with soft circular tinted background */}
              <div className="w-14 h-14 rounded-full bg-ni-rust/10 flex items-center justify-center mb-6">
                {icons[step.tag] || null}
              </div>

              <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-3">
                {step.tag}
              </p>
              <h3 className="font-heading text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
                {step.heading}
              </h3>
              <p className="font-body text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}