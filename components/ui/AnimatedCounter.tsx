'use client'

import { useEffect, useState, useRef } from 'react'

interface AnimatedCounterProps {
  endValue: number
  duration?: number
  prefix?: string
  suffix?: string
}

export default function AnimatedCounter({
  endValue,
  duration = 1200,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const elementRef = useRef<HTMLSpanElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    // O-5 Fix: Respect prefers-reduced-motion — skip animation for users
    // who have indicated they prefer reduced motion (vestibular disorders, etc.)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true

          if (prefersReducedMotion) {
            // Immediately show the final value with no animation
            setCount(endValue)
            return
          }

          let startTime: number | null = null

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const runtime = timestamp - startTime
            const progress = Math.min(runtime / duration, 1)
            const easeProgress = progress * (2 - progress)
            setCount(Math.floor(easeProgress * endValue))
            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCount(endValue)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    if (elementRef.current) observer.observe(elementRef.current)
    return () => observer.disconnect()
  }, [endValue, duration])

  return <span ref={elementRef}>{prefix}{count.toLocaleString()}{suffix}</span>
}
