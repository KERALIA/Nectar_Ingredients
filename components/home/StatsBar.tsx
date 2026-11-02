'use client'

import { products } from '../../lib/data'
import AnimatedCounter from '../ui/AnimatedCounter'
import { useScrollReveal } from '../../lib/hooks'

export default function StatsBar() {
  const { ref, visible } = useScrollReveal()
  const productCount = products.length

  /* ponytail: Smooth requestAnimationFrame counting animation with prefers-reduced-motion fallback. */
  return (
    <section className="relative mt-6 sm:mt-10 z-20" aria-label="Facility and supply capacity">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-4 sm:px-6 transition-opacity transition-transform motion-reduce:transition-none duration-500 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="bg-ni-surface border border-ni-border/40 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ni-border/20">

            <div className="flex flex-col justify-center px-6 py-6 sm:py-8">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-ni-primary tracking-tight tabular-nums">
                <AnimatedCounter endValue={productCount} suffix="+" />
              </span>
              <span className="font-body text-xs text-ni-secondary mt-1">Powder varieties</span>
              <span className="text-[11px] text-ni-muted mt-0.5">Vegetables, fruits &amp; spices</span>
            </div>

            <div className="flex flex-col justify-center px-6 py-6 sm:py-8">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-ni-primary tracking-tight tabular-nums">
                1 kg to <AnimatedCounter endValue={50} suffix=" MT" />
              </span>
              <span className="font-body text-xs text-ni-secondary mt-1">Supply range</span>
              <span className="text-[11px] text-ni-muted mt-0.5">R&amp;D trials to bulk supply</span>
            </div>

            <div className="flex flex-col justify-center px-6 py-6 sm:py-8">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-ni-primary tracking-tight tabular-nums">
                <AnimatedCounter endValue={100} suffix="%" />
              </span>
              <span className="font-body text-xs text-ni-secondary mt-1">Purity standard</span>
              <span className="text-[11px] text-ni-muted mt-0.5">Zero carriers or preservatives</span>
            </div>

            <div className="flex flex-col justify-center px-6 py-6 sm:py-8">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-ni-primary tracking-tight tabular-nums">
                Surendranagar
              </span>
              <span className="font-body text-xs text-ni-secondary mt-1">Direct facility</span>
              <span className="text-[11px] text-ni-muted mt-0.5">Gujarat plant, operating since 2021</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
