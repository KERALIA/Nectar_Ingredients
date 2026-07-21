'use client'

import React, { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'

export default function CartIcon() {
  const { totalItems, setIsCartOpen, isCartOpen } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      onClick={() => setIsCartOpen(!isCartOpen)}
      className="relative text-ni-secondary hover:text-ni-primary p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust rounded-full transition-colors cursor-pointer"
      aria-label={`Open shopping cart. ${mounted ? totalItems : 0} items in cart.`}
    >
      <svg
        className="w-5 h-5 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {mounted && totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-ni-rust text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-glow-pulse">
          {totalItems}
        </span>
      )}
    </button>
  )
}
