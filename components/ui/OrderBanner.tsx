'use client'

import React from 'react'
import Link from 'next/link'

export default function OrderBanner() {
  return (
    <div className="mb-8 rounded-xl border border-ni-rust/20 bg-ni-rust-bg/30 px-5 py-4 text-sm text-ni-secondary">
      <p>
        <span className="font-semibold text-ni-rust">Place an Order or Inquiry — Bulk Orders Accepted Here.</span>{' '}
        Select powders from our{' '}
        <Link href="/products" className="underline underline-offset-2 hover:text-ni-rust transition-colors font-semibold">
          catalog
        </Link>{' '}
        or enter your custom requirements below for direct pricing, commercial specs, and 1 kg sample dispatches.
      </p>
    </div>
  )
}
