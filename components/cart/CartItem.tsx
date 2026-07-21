'use client'

import React from 'react'
import Image from 'next/image'
import { CartItem as CartItemType } from '@/types'
import { useCart } from '@/context/CartContext'
import { formatINR } from '@/lib/pricing'
import { products } from '@/lib/data'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()

  // Find the product in local static data to grab the image
  const productData = products.find((p) => p.sku === item.sku)
  const imageSrc = productData?.imageSrc

  return (
    <div className="flex gap-4 py-4 border-b border-ni-border/10">
      {/* Product Image */}
      {imageSrc && (
        <div className="relative w-16 h-16 bg-ni-surface2/50 rounded-lg overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            className="object-contain p-1"
            sizes="64px"
          />
        </div>
      )}

      {/* Item info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-heading text-xs font-bold text-ni-primary truncate">
          {item.name}
        </h4>
        <p className="font-mono text-[9px] text-ni-muted mt-0.5">
          {item.sku}
        </p>
        <p className="font-body text-xs font-medium text-ni-rust mt-1.5">
          {formatINR(item.list_price)} / kg
        </p>

        {/* Quantity and Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-ni-border/20 rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(item.sku, item.qty_kg - 1)}
              disabled={item.qty_kg <= 1}
              className="px-2 py-1 text-xs font-bold text-ni-secondary hover:bg-ni-surface2 disabled:opacity-30 cursor-pointer"
              aria-label="Decrease quantity by 1 kg"
            >
              −
            </button>
            <input
              type="number"
              value={item.qty_kg}
              onChange={(e) => updateQuantity(item.sku, parseInt(e.target.value) || 1)}
              className="w-10 text-center font-body text-xs text-ni-primary bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Quantity in kg"
              min="1"
            />
            <button
              onClick={() => updateQuantity(item.sku, item.qty_kg + 1)}
              className="px-2 py-1 text-xs font-bold text-ni-secondary hover:bg-ni-surface2 cursor-pointer"
              aria-label="Increase quantity by 1 kg"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item.sku)}
            className="text-[10px] font-semibold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider cursor-pointer"
            aria-label={`Remove ${item.name} from cart`}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Line Total */}
      <div className="text-right flex-shrink-0">
        <span className="font-body text-xs font-bold text-ni-primary">
          {formatINR(item.list_price * item.qty_kg)}
        </span>
      </div>
    </div>
  )
}
