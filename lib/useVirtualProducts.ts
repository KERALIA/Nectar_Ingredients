'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const VISIBLE_COUNT = 4 // only render 4 product cards in DOM at a time

export function useVirtualProducts<T>(items: T[], estimatedItemHeight = 560) {
  const [startIndex, setStartIndex] = useState(0)
  const sentinelTopRef = useRef<HTMLDivElement>(null)
  const sentinelBottomRef = useRef<HTMLDivElement>(null)

  const end = Math.min(startIndex + VISIBLE_COUNT, items.length)
  const visibleItems = items.slice(startIndex, end)

  const spacerTop = startIndex * estimatedItemHeight
  const spacerBottom = Math.max(0, (items.length - end)) * estimatedItemHeight

  useEffect(() => {
    const options = { rootMargin: '200px 0px', threshold: 0 }

    const topObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && startIndex > 0) {
        setStartIndex(i => Math.max(0, i - VISIBLE_COUNT))
      }
    }, options)

    const bottomObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && end < items.length) {
        setStartIndex(i => Math.min(items.length - VISIBLE_COUNT, i + VISIBLE_COUNT))
      }
    }, options)

    if (sentinelTopRef.current) topObs.observe(sentinelTopRef.current)
    if (sentinelBottomRef.current) bottomObs.observe(sentinelBottomRef.current)

    return () => { topObs.disconnect(); bottomObs.disconnect() }
  }, [startIndex, end, items.length])

  return { visibleItems, startIndex, spacerTop, spacerBottom, sentinelTopRef, sentinelBottomRef }
}
