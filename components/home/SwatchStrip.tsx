'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { products } from '../../lib/data'

// All products displayed in a single scrollable strip on mobile,
// and a structured multi-row layout on desktop.
const STRIP_SLUGS = [
  'tomato-powder',
  'onion-powder',
  'garlic-powder',
  'beetroot-powder',
  'spinach-powder',
  'ginger-powder',
  'turmeric-powder',
  'amla-powder',
  'green-mango-powder',
  'pomegranate-powder',
  'lemon-powder',
  'carrot-powder',
  'annatto-colour',
  'strawberry-powder',
  'orange-powder',
]

const ROW_1_SLUGS = [
  'tomato-powder', 'onion-powder', 'garlic-powder',
  'beetroot-powder', 'spinach-powder', 'ginger-powder', 'turmeric-powder',
]
const ROW_2_SLUGS = [
  'amla-powder', 'green-mango-powder', 'pomegranate-powder',
  'lemon-powder', 'carrot-powder', 'annatto-colour',
]
const ROW_3_SLUGS = ['strawberry-powder', 'orange-powder']

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
      className="group flex items-center gap-3 cursor-pointer bg-white dark:bg-ni-surface border border-ni-border/10 py-3 px-5 sm:py-4 sm:px-8 rounded-full hover:border-ni-rust hover:-translate-y-0.5 transition-all duration-300 shadow-sm hover:shadow-card flex-shrink-0"
      style={{ borderLeft: `5px solid ${product.swatchHex}` }}
      aria-label={`View ${product.name}`}
    >
      {/* Circular image */}
      <div
        className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: `${product.swatchHex}18` }}
      >
        <div className="relative w-8 h-8 sm:w-10 sm:h-10">
          <Image
            src={product.swatchImageSrc}
            alt={product.name}
            fill
            className="object-contain p-0.5"
            sizes="56px"
          />
        </div>
      </div>

      {/* Name */}
      <span className="font-heading text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-ni-rust transition-colors duration-200 whitespace-nowrap">
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

  const allProducts = getProducts(STRIP_SLUGS)
  const row1 = getProducts(ROW_1_SLUGS)
  const row2 = getProducts(ROW_2_SLUGS)
  const row3 = getProducts(ROW_3_SLUGS)

  return (
    <div className="relative w-full py-8 sm:py-14 bg-transparent overflow-hidden">
      {/* Editorial label with crisp contrast on hero background */}
      <div className="text-center mb-6 sm:mb-10 px-4">
        <span className="font-body text-[10px] sm:text-xs font-bold tracking-[0.22em] text-neutral-300 dark:text-neutral-400 uppercase drop-shadow-sm">
          CLICK ANY VARIETY TO VIEW FULL SPECIFICATIONS
        </span>
      </div>

      {/* ── Mobile: horizontal scroll strip (hides scrollbar) ── */}
      <div className="md:hidden px-4">
        <div
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 pr-6 overscroll-x-contain"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
        >
          {allProducts.map((product) => (
            <SwatchButton
              key={product.id}
              product={product}
              onClick={() => handleClick(product.slug)}
            />
          ))}
        </div>
      </div>

      {/* ── Desktop: structured 3-row grid ── */}
      <div className="hidden md:block max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          {/* Row 1 */}
          <div className="flex flex-wrap justify-center gap-5 lg:gap-7 w-full">
            {row1.map((product) => (
              <SwatchButton
                key={product.id}
                product={product}
                onClick={() => handleClick(product.slug)}
              />
            ))}
          </div>
          {/* Row 2 */}
          <div className="flex flex-wrap justify-center gap-5 lg:gap-7 w-full">
            {row2.map((product) => (
              <SwatchButton
                key={product.id}
                product={product}
                onClick={() => handleClick(product.slug)}
              />
            ))}
          </div>
          {/* Row 3 */}
          <div className="flex flex-wrap justify-center gap-5 lg:gap-7 w-full">
            {row3.map((product) => (
              <SwatchButton
                key={product.id}
                product={product}
                onClick={() => handleClick(product.slug)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}