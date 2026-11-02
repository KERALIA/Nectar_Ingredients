'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { products } from '../../lib/data'
import { Marquee } from '../ui/marquee'

// All products displayed in a fluid, continuous marquee with pause-on-hover
const ROW_1_SLUGS = [
  'tomato-powder', 'onion-powder', 'garlic-powder',
  'beetroot-powder', 'spinach-powder', 'ginger-powder', 'turmeric-powder', 'amla-powder'
]
const ROW_2_SLUGS = [
  'green-mango-powder', 'pomegranate-powder', 'lemon-powder',
  'carrot-powder', 'annatto-colour', 'strawberry-powder', 'orange-powder', 'banana-powder'
]

function getProducts(slugs: string[]) {
  return slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean) as typeof products
}

interface SwatchButtonProps {
  product: typeof products[number]
  onClick: () => void
}

function SwatchButton({ product, onClick }: SwatchButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 cursor-pointer bg-white dark:bg-ni-surface border border-ni-border/20 py-2.5 px-5 sm:py-3 sm:px-6 rounded-full hover:border-ni-rust hover:-translate-y-0.5 transition-transform transition-colors duration-200 motion-reduce:transition-none shadow-sm hover:shadow-card flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 mx-1.5"
      aria-label={`View ${product.name}`}
    >
      {/* Circular image */}
      <div
        className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: `${product.swatchHex}18` }}
      >
        <div className="relative w-7 h-7 sm:w-9 sm:h-9">
          <Image
            src={product.swatchImageSrc}
            alt={product.name}
            fill
            className="object-contain p-0.5"
            sizes="44px"
          />
        </div>
      </div>

      {/* Name */}
      <span className="font-heading text-xs sm:text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-ni-rust transition-colors duration-200 whitespace-nowrap">
        {product.name.replace(' Powder', '').replace(' Colour', '')}
      </span>
    </button>
  )
}

export default function SwatchStrip() {
  const router = useRouter()

  const handleClick = (slug: string) => {
    router.push(`/products#product-${slug}`)
  }

  const row1 = getProducts(ROW_1_SLUGS)
  const row2 = getProducts(ROW_2_SLUGS)

  return (
    <div className="relative w-full py-6 sm:py-10 bg-transparent overflow-hidden">
      {/* Editorial label with crisp contrast on hero background */}
      <div className="text-center mb-5 sm:mb-7 px-4">
        <span className="font-body text-xs text-neutral-300 drop-shadow-sm font-medium">
          Select any variety to view specifications (hover to pause)
        </span>
      </div>

      {/* Marquee Row 1 */}
      <div className="w-full overflow-hidden mb-3">
        <Marquee pauseOnHover className="[--duration:35s]">
          {row1.map((product) => (
            <SwatchButton
              key={product.id}
              product={product}
              onClick={() => handleClick(product.slug)}
            />
          ))}
        </Marquee>
      </div>

      {/* Marquee Row 2 (Reverse) */}
      <div className="w-full overflow-hidden">
        <Marquee reverse pauseOnHover className="[--duration:38s]">
          {row2.map((product) => (
            <SwatchButton
              key={product.id}
              product={product}
              onClick={() => handleClick(product.slug)}
            />
          ))}
        </Marquee>
      </div>
    </div>
  )
}