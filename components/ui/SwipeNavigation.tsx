'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const PAGE_SEQUENCE = ['/', '/products', '/about', '/contact']

// Comprehensive selector — any touch whose target IS or is INSIDE one of these
// elements will never be counted as a swipe start or end.
// Crucially includes `form` so that tapping *anywhere* inside the contact form
// (labels, spacing divs, the product grid wrapper, address textarea, etc.)
// is completely ignored by swipe detection.
const SWIPE_IGNORE_SELECTOR = [
  'input',
  'textarea',
  'select',
  'button',
  'label',
  'a',
  'form',               // every touch inside any <form> is off-limits
  '[data-no-swipe]',    // explicit opt-out attribute you can add to any element
  '[data-lenis-prevent]',
  '[role="button"]',
  '[role="slider"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="listbox"]',
  '[role="combobox"]',
  '.overflow-x-auto',
  '.overflow-y-auto',
  '.overflow-y-scroll',
  '.overflow-scroll',
].join(', ')

export default function SwipeNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  useEffect(() => {
    // Only enable on touch/mobile devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window
    if (!isTouch) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return

      const target = e.target as HTMLElement | null

      // If the finger started on or inside any form/interactive element → abort
      if (target?.closest(SWIPE_IGNORE_SELECTOR)) {
        touchStartRef.current = null
        return
      }

      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1) return

      const start = touchStartRef.current
      touchStartRef.current = null

      // Also guard the end-target — finger may have slid into a form area
      const endTarget = e.target as HTMLElement | null
      if (endTarget?.closest(SWIPE_IGNORE_SELECTOR)) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - start.x
      const deltaY = touch.clientY - start.y
      const deltaTime = Date.now() - start.time

      // Gate: fast (<450ms), clearly horizontal (>80px), minimal vertical drift
      if (deltaTime > 450) return
      if (Math.abs(deltaY) > 45) return
      if (Math.abs(deltaY) >= Math.abs(deltaX) * 0.6) return
      if (Math.abs(deltaX) < 80) return

      const currentIndex = PAGE_SEQUENCE.indexOf(pathname)
      if (currentIndex === -1) return

      if (deltaX < 0) {
        // Swipe left → next page
        if (currentIndex < PAGE_SEQUENCE.length - 1) {
          router.push(PAGE_SEQUENCE[currentIndex + 1])
        }
      } else {
        // Swipe right → prev page (or Products if on Home)
        if (currentIndex > 0) {
          router.push(PAGE_SEQUENCE[currentIndex - 1])
        } else {
          router.push(PAGE_SEQUENCE[1])
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pathname, router])

  return null
}
