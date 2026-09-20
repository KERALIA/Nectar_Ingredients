'use client'

import { products } from '../../lib/data'
import AnimatedCounter from '../ui/AnimatedCounter'
import { useScrollReveal } from '../../lib/hooks'

export default function StatsBar() {
  const { ref, visible } = useScrollReveal()
  const productCount = products.length

  return (
    <section className="relative mt-8 sm:mt-12 z-20" aria-label="Key facts">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="glass-panel-premium hairline-card rounded-[var(--radius-xl)] overflow-hidden shadow-premium">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x-0 md:divide-x divide-y md:divide-y-0 divide-ni-border/20">

            <div className="flex flex-col items-center justify-center text-center px-6 py-8 sm:py-10 gap-2 transition-colors duration-300 hover:bg-ni-rust/[0.03]">
              <span className="font-heading font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight tabular-nums" style={{ fontSize: 'var(--text-h2)' }}>
                <AnimatedCounter endValue={productCount} suffix="+" />
              </span>
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.14em] text-ni-muted">Powder Varieties</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-6 py-8 sm:py-10 gap-2 transition-colors duration-300 hover:bg-ni-rust/[0.03]">
              <span className="font-heading font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight tabular-nums" style={{ fontSize: 'var(--text-h2)' }}>
                <AnimatedCounter endValue={500} suffix=" kg" />
              </span>
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.14em] text-ni-muted">Min. Bulk Order</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-6 py-8 sm:py-10 gap-2 transition-colors duration-300 hover:bg-ni-rust/[0.03]">
              <span className="font-heading font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight tabular-nums" style={{ fontSize: 'var(--text-h2)' }}>
                <AnimatedCounter endValue={100} suffix="%" />
              </span>
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.14em] text-ni-muted">Additive-Free</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-6 py-8 sm:py-10 gap-2 transition-colors duration-300 hover:bg-ni-rust/[0.03]">
              <span className="font-heading font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight tabular-nums" style={{ fontSize: 'var(--text-h2)' }}>
                <AnimatedCounter endValue={2021} prefix="Est. " useGrouping={false} />
              </span>
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.14em] text-ni-muted">Trusted Since</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
