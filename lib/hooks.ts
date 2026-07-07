import { useEffect, useRef, useState } from 'react'

/**
 * H-1: useScrollReveal — reusable scroll-triggered visibility hook.
 * Replaces the copy-pasted IntersectionObserver pattern in 4 components.
 *
 * @param threshold - Intersection ratio to trigger visibility (default 0.15)
 * @returns { ref, visible } — attach ref to any element; visible flips true once it enters viewport
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}
