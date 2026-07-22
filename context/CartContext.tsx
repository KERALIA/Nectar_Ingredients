'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { CartItem } from '@/types'
import { MARKUP_FACTOR } from '@/lib/pricing'

interface CartContextType {
  cart: CartItem[]
  addToCart: (sku: string, name: string, basePrice: number) => void
  removeFromCart: (sku: string) => void
  updateQuantity: (sku: string, qty: number) => void
  clearCart: () => void
  listTotal: number
  totalItems: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const STORAGE_KEY = 'ni-cart'

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setCart(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e)
    }
    setHydrated(true)
  }, [])

  // Save cart to localStorage on changes
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch (e) {
      console.error('Failed to save cart to localStorage', e)
    }
  }, [cart, hydrated])

  const addToCart = useCallback((sku: string, name: string, basePrice: number) => {
    if (basePrice <= 0) {
      console.warn(`[Cart] Blocked programmatic addition of SKU ${sku} due to invalid or zero price: ${basePrice}`)
      return
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.sku === sku)
      if (existing) {
        return prev.map((item) =>
          item.sku === sku ? { ...item, qty_kg: item.qty_kg + 1 } : item
        )
      }
      return [
        ...prev,
        {
          sku,
          name,
          qty_kg: 1,
          base_price: basePrice,
          list_price: basePrice * MARKUP_FACTOR,
        },
      ]
    })
    setIsCartOpen(true) // Automatically open drawer on add
  }, [])

  const removeFromCart = useCallback((sku: string) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku))
  }, [])

  const updateQuantity = useCallback((sku: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, qty_kg: Math.max(1, qty) } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  // Compute totals
  const listTotal = cart.reduce((sum, item) => sum + item.list_price * item.qty_kg, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.qty_kg, 0)

  // Hydration safety: render default/empty values on server
  const value = {
    cart: hydrated ? cart : [],
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    listTotal: hydrated ? listTotal : 0,
    totalItems: hydrated ? totalItems : 0,
    isCartOpen,
    setIsCartOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
