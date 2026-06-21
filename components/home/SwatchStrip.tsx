'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { products } from '../../lib/data'

export default function SwatchStrip() {
  const router = useRouter()

  const handleSwatchClick = (slug: string) => {
    router.push(`/products#product-${slug}`)
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide border-y border-ni-border py-4">
      <div className="flex gap-px min-w-max px-6 lg:px-8">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => handleSwatchClick(product.slug)}
            className="group flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer bg-transparent border-0 p-0"
            aria-label={`View ${product.name}`}
          >
            {/* Image swatch box */}
            <div className="relative w-16 h-12 sm:w-20 sm:h-16 overflow-hidden flex-shrink-0">

              {/* The actual ingredient photo */}
              <Image
                src={product.swatchImageSrc}
                alt={product.name}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                sizes="80px"
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
  )
}