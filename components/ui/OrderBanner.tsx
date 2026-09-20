'use client'

import React from 'react'
import Link from 'next/link'

export default function OrderBanner() {
  return (
    <div className="mb-8 rounded-2xl border border-ni-rust/30 bg-ni-rust-bg/40 dark:bg-ni-rust/10 p-5 sm:p-6 text-base sm:text-lg text-ni-secondary leading-relaxed shadow-sm">
      <p>
        <span className="font-bold text-ni-rust">Place an Order or Inquiry — Bulk Orders Accepted Here.</span>{' '}
        Select powders from our{' '}
        <Link href="/products" className="underline underline-offset-4 text-ni-rust font-bold hover:text-ni-rust-lt transition-colors">
          catalog
        </Link>{' '}
        or enter your custom requirements below for direct pricing, commercial specs, and 1 kg trial packs or bulk dispatches.
      </p>
    </div>
  )
}
