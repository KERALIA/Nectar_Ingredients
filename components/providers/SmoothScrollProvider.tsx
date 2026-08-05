'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Disable on touch screens/mobile devices to prevent touch input hijacking on forms & inputs
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || isTouch) return

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
      prevent: (node) => node.classList.contains('lenis-prevent') || node.hasAttribute('data-lenis-prevent') || node.closest('[data-lenis-prevent]') !== null,
    })
    lenisRef.current = lenis

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
