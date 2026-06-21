'use client'

import React, { useRef, useState, useEffect } from 'react'
import { processSteps } from '../../lib/data'
import SectionHeading from '../ui/SectionHeading'

export default function ProcessSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-24 border-y border-ni-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <SectionHeading
          tag="HOW IT'S MADE"
          heading="From raw to refined — in one facility"
        />

        <div
          ref={ref}
          className={`mt-16 grid grid-cols-1 lg:grid-cols-3 gap-px bg-ni-border transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {processSteps.map((step, i) => (
            <div key={step.tag} className="bg-ni-bg p-8 lg:p-10">
              <p className="font-body text-xs font-medium tracking-widest text-ni-rust uppercase mb-6">
                {step.tag}
              </p>
              <h3 className="font-heading text-xl font-semibold text-ni-primary mb-3">
                {step.heading}
              </h3>
              <p className="font-body text-sm text-ni-muted leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}