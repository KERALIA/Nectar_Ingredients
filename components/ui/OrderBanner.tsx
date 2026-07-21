'use client'

import React from 'react'
import Link from 'next/link'

export default function OrderBanner() {
  return (
    <div className="mb-8 rounded-xl border border-ni-rust/20 bg-ni-rust-bg/30 px-5 py-4 text-sm text-ni-secondary">
      <p>
        <span className="font-semibold text-ni-rust">Want to place a direct order?</span>{' '}
        <Link href="/products" className="underline underline-offset-2 hover:text-ni-rust transition-colors">
          Sign in with Google
        </Link>{' '}
        to see live pricing and check out instantly — the form below is for general enquiries.
      </p>
    </div>
  )
}
