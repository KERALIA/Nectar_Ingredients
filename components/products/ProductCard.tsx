import React, { useState } from 'react'
import { Product } from '../../types'
import Tag from '../ui/Tag'
import Image from 'next/image'

interface ProductCardProps {
  product: Product
  showDescription?: boolean
  highlighted?: boolean
}

export default function ProductCard({ product, showDescription = false, highlighted = false }: ProductCardProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <article
      id={`product-${product.slug}`}
      className={`
        flex flex-col h-full group
        transition-all duration-300
        ${highlighted
          ? 'bg-ni-rust-bg ring-2 ring-ni-rust ring-inset'
          : 'bg-ni-surface hover:bg-ni-surface2'
        }
      `}
    >
      {/* IMAGE AREA — top of card, editorial crop */}
      {!imgError && product.imageSrc && (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/2' }}>
          <Image
            src={product.imageSrc}
            alt={`${product.name} — close-up texture`}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImgError(true)}
          />
          {/* Subtle gradient at bottom of image — blends into card surface */}
          <div
            className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, var(--surface))' }}
          />
        </div>
      )}

      {/* TEXT AREA — same as before, but now below the image */}
      <div className="p-6 flex flex-col flex-1">
        {/* Top: swatch circle + category tag */}
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex-shrink-0"
            style={{ backgroundColor: product.swatchHex }}
          />
          <Tag>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Tag>
        </div>

        {/* Product name */}
        <h3 className="font-heading text-xl font-semibold text-ni-primary leading-tight mt-4">
          {product.name}
        </h3>

        {/* Tagline */}
        <p className="font-body text-sm text-ni-secondary mt-1">{product.tagline}</p>

        {/* Description — only when showDescription=true */}
        {showDescription && (
          <p className="font-body text-sm text-ni-muted leading-relaxed mt-3">
            {product.description}
          </p>
        )}

        {/* Spacer + bottom info */}
        <div className="mt-auto pt-5 border-t border-ni-border">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-ni-muted">
              {product.weights.join(' · ')}
            </span>
            <span className="font-mono text-xs text-ni-border2">
              {product.sku}
            </span>
          </div>
          <p className="font-mono text-xs text-ni-border2 mt-1">
            {product.mesh}
          </p>
          <a
            href="/contact"
            className="mt-4 inline-block font-body text-sm font-medium text-ni-rust hover:text-ni-rust-lt transition-colors"
          >
            Request a Sample →
          </a>
        </div>
      </div>
    </article>
  )
}