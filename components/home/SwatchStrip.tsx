'use client'

import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { products } from '../../lib/data'

export default function SwatchStrip() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // O-1: Track scroll position to show/hide arrow indicators
  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    // Also update on resize
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [])

  const scrollBy = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth',
    })
  }

  const handleSwatchClick = (slug: string) => {
    router.push(`/products#product-${slug}`)
  }

  return (
    <div className="relative w-full border-y border-ni-border py-4">
      {/* O-1: Left scroll arrow — only visible on desktop when there's content to the left */}
      <button
        onClick={() => scrollBy('left')}
        className={`
          hidden md:flex
          absolute left-0 top-0 bottom-0 z-10 w-12
          items-center justify-center
          bg-gradient-to-r from-ni-bg via-ni-bg/80 to-transparent
          text-ni-muted hover:text-ni-rust transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust
          ${canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        aria-label="Scroll swatches left"
        tabIndex={canScrollLeft ? 0 : -1}
      >
        ‹
      </button>

      {/* Scrollable swatch container */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x proximity' }}
      >
        <div className="flex gap-px min-w-max px-6 lg:px-8">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSwatchClick(product.slug)}
              className="group flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer bg-transparent border-0 p-0"
              aria-label={`View ${product.name}`}
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Image swatch box */}
              <div className="relative w-16 h-12 sm:w-20 sm:h-16 overflow-hidden flex-shrink-0">

                {/* The actual ingredient photo */}
                <Image
                  src={product.swatchImageSrc}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 64px, 80px"
                />

                {/* Rust overlay — fades in on hover */}
                <div className="absolute inset-0 bg-ni-rust opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" />

                {/* Bottom gradient for label legibility */}
                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

              </div>

              {/* Product name label */}
              <span className="
                text-xs font-body whitespace-nowrap px-1
                text-ni-muted
                group-hover:text-ni-rust
                transition-colors duration-200
              ">
                {product.name.replace(' Powder', '')}
              </span>

            </button>
          ))}
        </div>
      </div>

      {/* O-1: Right scroll arrow — only visible on desktop when there's content to the right */}
      <button
        onClick={() => scrollBy('right')}
        className={`
          hidden md:flex
          absolute right-0 top-0 bottom-0 z-10 w-12
          items-center justify-center
          bg-gradient-to-l from-ni-bg via-ni-bg/80 to-transparent
          text-ni-muted hover:text-ni-rust transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust
          ${canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        aria-label="Scroll swatches right"
        tabIndex={canScrollRight ? 0 : -1}
      >
        ›
      </button>
    </div>
  )
}