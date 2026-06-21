'use client'

import React, { useRef, useState, useEffect } from 'react'
import Button from '../ui/Button'

export default function ContactCTA() {
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
    <section className="py-20 bg-ni-surface border-t border-ni-border">
      <div
        ref={ref}
        className={`max-w-3xl mx-auto px-6 lg:px-8 text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >

        <p className="font-body text-xs tracking-widest text-ni-rust uppercase mb-4">GET IN TOUCH</p>
        <h2 className="font-heading text-section font-semibold text-ni-primary">
          Ready to talk powder?
        </h2>
        <p className="font-body text-base text-ni-secondary max-w-xl mx-auto mt-4 leading-relaxed">
          Send us your product spec and quantity. We'll respond with availability, pricing, and a free sample offer within one business day.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Button variant="primary" size="lg" href="/contact">Send an Inquiry →</Button>
          <Button variant="ghost" size="lg" href="mailto:hello@nectaringredients.com">Email Directly</Button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-8 font-body text-xs text-ni-muted">
          <span>📦 1kg samples available</span>
          <span>🏭 Up to 2MT/month capacity</span>
          <span>📍 Surendranagar, Gujarat</span>
        </div>

      </div>
    </section>
  )
}