import { products } from '../../lib/data'
import AnimatedCounter from '../ui/AnimatedCounter'

export default function StatsBar() {
  const productCount = products.length

  return (
    <section className="bg-ni-surface border-y border-ni-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ni-border">
          <div className="bg-ni-surface flex flex-col items-center justify-center py-10 px-4 text-center">
            <span className="font-heading text-4xl font-semibold text-ni-primary tracking-tight">
              <AnimatedCounter endValue={productCount} suffix="+" />
            </span>
            <span className="font-body text-sm text-ni-muted mt-2 tracking-wide">
              Powder Varieties
            </span>
          </div>
          <div className="bg-ni-surface flex flex-col items-center justify-center py-10 px-4 text-center">
            <span className="font-heading text-4xl font-semibold text-ni-primary tracking-tight">
              <AnimatedCounter endValue={500} suffix="kg" />
            </span>
            <span className="font-body text-sm text-ni-muted mt-2 tracking-wide">
              Min. Bulk Order
            </span>
          </div>
          <div className="bg-ni-surface flex flex-col items-center justify-center py-10 px-4 text-center">
            <span className="font-heading text-4xl font-semibold text-ni-primary tracking-tight">
              <AnimatedCounter endValue={100} suffix="%" />
            </span>
            <span className="font-body text-sm text-ni-muted mt-2 tracking-wide">
              Additive-Free
            </span>
          </div>
          <div className="bg-ni-surface flex flex-col items-center justify-center py-10 px-4 text-center">
            <span className="font-heading text-4xl font-semibold text-ni-primary tracking-tight">
              <AnimatedCounter endValue={2011} prefix="Est. " />
            </span>
            <span className="font-body text-sm text-ni-muted mt-2 tracking-wide">
              Trusted Since
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
