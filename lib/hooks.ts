import { useEffect, useRef, useState } from 'react'

/**
 * H-1: useScrollReveal — reusable scroll-triggered visibility hook.
 * Replaces the copy-pasted IntersectionObserver pattern in 4 components.
 *
 * @param threshold - Intersection ratio to trigger visibility (default 0.15)
 * @returns { ref, visible } — attach ref to any element; visible flips true once it enters viewport
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.08) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // If reduced motion is requested, immediately show with no transition
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

/**
 * useDebounce — delays updating the returned value until after `delay` ms
 * have elapsed since the last change. Use for search inputs to avoid
 * re-rendering on every keystroke.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default 300)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
