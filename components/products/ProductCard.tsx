'use client'

import React, { useState } from 'react'
import { Product } from '../../types'
import Tag from '../ui/Tag'
import Image from 'next/image'
import { useSampleBasket } from '../../context/SampleBasketContext'

interface ProductCardProps {
  product: Product
  showDescription?: boolean
  highlighted?: boolean
  onOpenDrawer?: (product: Product) => void
  priority?: boolean
}

export default function ProductCard({ product, showDescription = false, highlighted = false, onOpenDrawer, priority = false }: ProductCardProps) {
  const [imgError, setImgError] = useState(false)
  const { toggleBasket, isInBasket } = useSampleBasket()
  const inBasket = isInBasket(product.id)

  // C-3 Fix: Handle keyboard activation (Enter / Space) so keyboard users
  // can open the drawer without a mouse click.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (onOpenDrawer && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onOpenDrawer(product)
    }
  }

  return (
    <article
      id={`product-${product.slug}`}
      // C-3 Fix: role="button" + tabIndex make the card discoverable & activatable
      // by screen readers and keyboard navigation.
      role={onOpenDrawer ? 'button' : undefined}
      tabIndex={onOpenDrawer ? 0 : undefined}
      onClick={onOpenDrawer ? () => onOpenDrawer(product) : undefined}
      onKeyDown={onOpenDrawer ? handleKeyDown : undefined}
      aria-label={onOpenDrawer ? `View details for ${product.name}` : undefined}
      className={`
        flex flex-col h-full group cursor-pointer
        transition-all duration-300
        ${highlighted
          ? 'bg-ni-rust-bg ring-2 ring-ni-rust ring-inset'
          : 'bg-ni-surface hover:bg-ni-surface2'
        }
        ${onOpenDrawer ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-inset' : ''}
      `}
    >
      {/* IMAGE AREA — top of card, editorial crop */}
      {!imgError && product.imageSrc && (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/2' }}>
          <Image
            src={product.imageSrc}
            alt={`${product.name} — close-up texture`}
            fill
            priority={priority}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImgError(true)}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, var(--surface))' }}
          />
        </div>
      )}

      {/* TEXT AREA */}
      <div className="p-6 flex flex-col flex-1">
        {/* Top: swatch circle + category tag */}
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex-shrink-0"
            style={{ backgroundColor: product.swatchHex }}
            aria-hidden="true"
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

        {/* Description */}
        {showDescription && (
          <p className="font-body text-sm text-ni-muted leading-relaxed mt-3">
            {product.description}
          </p>
        )}

        {/* Usage applications */}
        {showDescription && product.usageApplications && (
          <div className="flex flex-wrap gap-1.5 mt-3 mb-1" aria-label="Usage applications">
            {product.usageApplications.slice(0, 3).map((use) => (
              <span
                key={use}
                className="font-body text-[10px] uppercase tracking-wide text-ni-muted border border-ni-border px-2 py-0.5"
              >
                {use}
              </span>
            ))}
          </div>
        )}

        {/* Spacer + bottom info */}
        <div className="mt-auto pt-5 border-t border-ni-border">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-ni-muted break-words">
              {product.weights.join(' · ')}
            </span>
            <span className="font-mono text-xs text-ni-border2">
              {product.sku}
            </span>
          </div>
          <p className="font-mono text-xs text-ni-border2 mt-1">
            {product.mesh}
          </p>

          {/* Action button — Add to Sample Box */}
          <div className="mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleBasket({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  sku: product.sku,
                  category: product.category,
                })
              }}
              aria-label={inBasket ? `Remove ${product.name} from sample box` : `Add ${product.name} to sample box`}
              aria-pressed={inBasket}
              className={`w-full font-body text-xs font-medium px-3 py-2.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust ${
                inBasket
                  ? 'bg-ni-border2 text-ni-primary hover:bg-ni-border'
                  : 'bg-ni-rust text-white hover:bg-ni-rust-lt'
              }`}
            >
              {inBasket ? '✓ In Sample Box' : 'Add to Sample Box'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
