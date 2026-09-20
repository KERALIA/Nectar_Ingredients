import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found | Nectar Ingredients',
  description: 'The requested page could not be found. Explore our 40 pure single-ingredient dehydrated food powders.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ni-bg flex items-center justify-center pt-24 pb-16 px-4">
      <div className="max-w-md w-full text-center p-8 sm:p-10 rounded-[32px] glass-panel-premium hairline-card shadow-premium border border-ni-border/20">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-ni-rust/10 border border-ni-rust/20 flex items-center justify-center text-3xl mb-6 animate-float-slow">
          🌿
        </div>

        <span className="font-body text-[10px] font-extrabold uppercase tracking-widest text-ni-rust block mb-2">
          404 — PAGE NOT FOUND
        </span>

        <h1 className="font-heading text-2xl sm:text-3xl font-black text-ni-primary tracking-tight mb-3">
          Powder Not Located
        </h1>

        <p className="font-body text-xs sm:text-sm text-ni-secondary leading-relaxed mb-8">
          The batch or page you are searching for might have moved or is no longer available. Explore our complete botanical catalog below.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-ni-rust text-white font-body text-xs font-bold uppercase tracking-wider hover:bg-ni-rust-lt shadow-card hover:shadow-hover transition-all btn-press"
          >
            Explore 40 Powders →
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-ni-border/40 text-ni-primary hover:border-ni-rust font-body text-xs font-bold uppercase tracking-wider transition-all btn-press hover:bg-ni-surface2/50"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
