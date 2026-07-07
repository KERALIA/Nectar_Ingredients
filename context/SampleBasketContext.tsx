'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface BasketItem {
  id: string
  slug: string
  name: string
  sku: string
  category: string
}

interface SampleBasketContextType {
  basket: BasketItem[]
  addToBasket: (item: BasketItem) => void
  removeFromBasket: (id: string) => void
  toggleBasket: (item: BasketItem) => void
  isInBasket: (id: string) => boolean
  clearBasket: () => void
  totalItems: number
}

const STORAGE_KEY = 'ni-sample-basket'

const defaultContext: SampleBasketContextType = {
  basket: [],
  addToBasket: () => {},
  removeFromBasket: () => {},
  toggleBasket: () => {},
  isInBasket: () => false,
  clearBasket: () => {},
  totalItems: 0,
}

const SampleBasketContext = createContext<SampleBasketContextType>(defaultContext)

export function SampleBasketProvider({ children }: { children: React.ReactNode }) {
  const [basket, setBasket] = useState<BasketItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setBasket(parsed)
        }
      }
    } catch {
      // Corrupted storage — start fresh
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever basket changes (after hydration)
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(basket))
      } catch {
        // Storage full or unavailable — silently degrade
      }
    }
  }, [basket, hydrated])

  const addToBasket = useCallback((item: BasketItem) => {
    setBasket((prev) => {
      if (prev.some((b) => b.id === item.id)) return prev
      return [...prev, item]
    })
  }, [])

  const removeFromBasket = useCallback((id: string) => {
    setBasket((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const toggleBasket = useCallback((item: BasketItem) => {
    setBasket((prev) => {
      const exists = prev.find((b) => b.id === item.id)
      if (exists) {
        return prev.filter((b) => b.id !== item.id)
      }
      return [...prev, item]
    })
  }, [])

  const isInBasket = useCallback(
    (id: string) => basket.some((b) => b.id === id),
    [basket]
  )

  const clearBasket = useCallback(() => {
    setBasket([])
  }, [])

  // During SSR, return defaults
  if (!hydrated) {
    return (
      <SampleBasketContext.Provider value={defaultContext}>
        {children}
      </SampleBasketContext.Provider>
    )
  }

  return (
    <SampleBasketContext.Provider
      value={{
        basket,
        addToBasket,
        removeFromBasket,
        toggleBasket,
        isInBasket,
        clearBasket,
        totalItems: basket.length,
      }}
    >
      {children}
    </SampleBasketContext.Provider>
  )
}

export const useSampleBasket = () => useContext(SampleBasketContext)

export default SampleBasketProvider
