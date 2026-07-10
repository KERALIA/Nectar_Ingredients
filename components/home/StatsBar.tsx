import { products } from '../../lib/data'
import AnimatedCounter from '../ui/AnimatedCounter'

export default function StatsBar() {
  const productCount = products.length

  return (
    <section className="relative -mt-12 sm:-mt-16 z-20 bg-transparent py-0">
      <div className="max-w-6xl mx-auto px-6">
        <div className="glass-panel backdrop-blur-xl rounded-[24px] p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 shadow-premium">
          <div className="flex flex-col items-center justify-center text-center px-4 md:border-r border-ni-border/30 last:border-0">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
              <AnimatedCounter endValue={productCount} suffix="+" />
            </span>
            <span className="font-body text-xs font-bold uppercase tracking-widest text-ni-muted mt-2">
              Powder Varieties
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4 md:border-r border-ni-border/30 last:border-0">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
              <AnimatedCounter endValue={500} suffix="kg" />
            </span>
            <span className="font-body text-xs font-bold uppercase tracking-widest text-ni-muted mt-2">
              Min. Bulk Order
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4 md:border-r border-ni-border/30 last:border-0">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
              <AnimatedCounter endValue={100} suffix="%" />
            </span>
            <span className="font-body text-xs font-bold uppercase tracking-widest text-ni-muted mt-2">
              Additive-Free
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4 last:border-0">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
              <AnimatedCounter endValue={2011} prefix="Est. " />
            </span>
            <span className="font-body text-xs font-bold uppercase tracking-widest text-ni-muted mt-2">
              Trusted Since
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
