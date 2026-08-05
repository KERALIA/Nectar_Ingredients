'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const PAGE_SEQUENCE = ['/', '/products', '/about', '/contact']

export default function SwipeNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const touchStartRef = useRef<{ x: number; y: number; time: number; target: HTMLElement | null } | null>(null)

  useEffect(() => {
    // Only enable on mobile/touch screens
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window
    if (!isTouch) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      const target = e.target as HTMLElement | null

      // Ignore touches on form fields, buttons, interactive controls, or scrollable horizontal containers
      if (
        target?.closest(
          'input, textarea, select, button, label, a, [role="button"], [data-lenis-prevent], .overflow-x-auto, .overflow-y-auto'
        )
      ) {
        touchStartRef.current = null
        return
      }

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        target,
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1) return

      const start = touchStartRef.current
      touchStartRef.current = null

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - start.x
      const deltaY = touch.clientY - start.y
      const deltaTime = Date.now() - start.time

      // Must be a fast horizontal swipe (distance > 70px, time < 500ms, vertical delta < 50px)
      if (deltaTime > 500) return
      if (Math.abs(deltaY) > 50 || Math.abs(deltaY) > Math.abs(deltaX)) return
      if (Math.abs(deltaX) < 70) return

      // Find current page index
      const currentIndex = PAGE_SEQUENCE.indexOf(pathname)
      if (currentIndex === -1) return

      // deltaX < 0 = finger moved left (Swiping left -> Next page)
      // deltaX > 0 = finger moved right (Swiping right -> Prev page, or Next if on Home)
      if (deltaX < 0) {
        // Next page
        if (currentIndex < PAGE_SEQUENCE.length - 1) {
          router.push(PAGE_SEQUENCE[currentIndex + 1])
        }
      } else {
        // Prev page or forward if on homepage
        if (currentIndex > 0) {
          router.push(PAGE_SEQUENCE[currentIndex - 1])
        } else if (currentIndex === 0) {
          // If on home page and swiping right
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
