'use client'

import { useRef, useState, useEffect } from 'react'
import { useLiquidShader } from '../../lib/useLiquidShader'

interface Props {
  product: {
    id: string
    slug: string
    name: string
    tagline?: string
    category?: string
    image?: string
  }
  index: number
  isVisible: boolean
}

const PARALLAX_AMOUNT = 24 // px

export default function ArtisticProductCard({ product, index, isVisible }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)
  const isEven = index % 2 === 0

  // Liquid shader on canvas
  useLiquidShader(canvasRef, product.image || '')

  // Scroll reveal via IntersectionObserver
  useEffect(() => {
    if (!cardRef.current) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setRevealed(true); obs.disconnect() }
    }, { threshold: 0.15 })
    obs.observe(cardRef.current)
    return () => obs.disconnect()
  }, [])

  // Parallax on mouse move
  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const cx = (e.clientX - rect.left) / rect.width - 0.5
      const cy = (e.clientY - rect.top) / rect.height - 0.5
      const canvas = canvasRef.current
      if (canvas) {
        canvas.style.transform = `translate(${cx * PARALLAX_AMOUNT}px, ${cy * PARALLAX_AMOUNT}px) scale(1.04)`
      }
    }
    const onLeave = () => {
      const canvas = canvasRef.current
      if (canvas) canvas.style.transform = 'translate(0,0) scale(1)'
    }
    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave) }
  }, [])

  return (
    <div
      ref={cardRef}
      data-cursor
      data-cursor-label="Explore"
      className={`
        relative w-full py-16 flex items-center
        ${isEven ? 'flex-row' : 'flex-row-reverse'}
        gap-10 lg:gap-20 overflow-hidden
        opacity-0 translate-y-12
      `}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(48px)',
        transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Floating image via WebGL canvas */}
      <div className="relative flex-shrink-0 w-full max-w-[320px] sm:max-w-[400px]" style={{ aspectRatio: '3/4' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)' }}
        />
        {/* Fallback image if WebGL unavailable */}
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ opacity: 0 }} // hidden; canvas takes over
            loading="lazy"
          />
        )}
        {/* Ambient glow behind image */}
        <div
          className="absolute inset-0 -z-10 blur-[60px] opacity-30"
          style={{ background: 'var(--rust)', transform: 'scale(0.7)' }}
        />
      </div>

      {/* Text block — no card, just text floating in space */}
      <div className="flex-1 space-y-4 min-w-0">
        {product.category && (
          <span className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-ni-rust block">
            {product.category}
          </span>
        )}
        <h2
          className="font-heading font-bold text-ni-primary leading-[1.0]"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '-0.03em' }}
        >
          {product.name}
        </h2>
        {product.tagline && (
          <p className="font-body text-ni-secondary leading-relaxed" style={{ fontSize: 'var(--text-lead)', maxWidth: '40ch' }}>
            {product.tagline}
          </p>
        )}
        <a
          href={`/products#product-${product.slug}`}
          className="inline-flex items-center gap-3 font-body text-[11px] font-bold uppercase tracking-widest
                     text-ni-rust border-b border-ni-rust/30 pb-1
                     hover:border-ni-rust transition-colors duration-300 group mt-4"
        >
          Sample this powder
          <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
        </a>
      </div>

      {/* Large index number — decorative, background element */}
      <span
        className="absolute font-heading font-bold text-ni-primary/5 select-none pointer-events-none"
        style={{ fontSize: 'clamp(8rem, 20vw, 18rem)', lineHeight: 1, [isEven ? 'right' : 'left']: '-2rem', bottom: '-1rem' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  )
}
