'use client'

import React, { useState } from 'react'
import { CartItem, PaymentMethod } from '@/types'
import {
  PAYMENT_DISCOUNTS,
  PAYMENT_METHOD_LABELS,
  computeFinalPrice,
  computeDiscountAmount,
  formatINR,
} from '@/lib/pricing'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useCart } from '@/context/CartContext'

interface AddressData {
  name: string
  email: string
  phone: string
  company: string
  address: string
}

interface OrderSummaryProps {
  user: User
  cart: CartItem[]
  listTotal: number
  addressData: AddressData
  paymentMethod: PaymentMethod
  onBack: () => void
}

export default function OrderSummary({
  user,
  cart,
  listTotal,
  addressData,
  paymentMethod,
  onBack,
}: OrderSummaryProps) {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const { clearCart } = useCart()
  const supabase = createClient()

  const discountPct = PAYMENT_DISCOUNTS[paymentMethod]
  const discountAmt = computeDiscountAmount(listTotal, paymentMethod)
  const finalTotal = computeFinalPrice(listTotal, paymentMethod)

  // Map cart items to DB schema items adding final_price
  const dbItems = cart.map((item) => ({
    sku: item.sku,
    name: item.name,
    qty_kg: item.qty_kg,
    base_price: item.base_price,
    list_price: item.list_price,
    final_price: item.list_price * (1 - discountPct),
  }))

  const handlePlaceOrder = async () => {
    setSubmitting(true)
    setMessage(null)

    try {
      const fullAddressString = [
        addressData.name,
        addressData.company ? `Company: ${addressData.company}` : '',
        addressData.address,
        addressData.phone ? `Phone: ${addressData.phone}` : '',
        `Email: ${addressData.email}`,
      ]
        .filter(Boolean)
        .join('\n')

      // 1. Insert order to DB
      const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items: dbItems,
          delivery_address: fullAddressString,
          payment_method: paymentMethod,
          list_total: listTotal,
          payment_discount_pct: discountPct,
          final_total: finalTotal,
          status: 'pending_payment_setup', // Defaults to setup pending
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      // 2. Initiate Paytm transaction
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: newOrder.id }),
      })

      const paymentResult = await response.json()

      if (!response.ok) {
        throw new Error(paymentResult.error || 'Failed to initiate payment transaction')
      }

      // 3. Handle Fallback (Paytm env vars missing) or Payment Redirect
      if (paymentResult.fallback) {
        // Clear cart since order is stored in DB
        clearCart()
        setMessage({
          type: 'info',
          text: paymentResult.message || 'Online payment is currently being finalized. Please contact Mehul Patel at +91-XXXXXXXXXX to complete your payment manually.',
        })
      } else if (paymentResult.checkout_url && paymentResult.paytm_params) {
        // Paytm credentials available!
        // Render a hidden form and submit to redirect to Paytm hosted page
        clearCart()
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = paymentResult.checkout_url
        form.name = 'paytm_form'

        Object.entries(paymentResult.paytm_params).forEach(([key, val]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = String(val)
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
      } else {
        throw new Error('Invalid payment parameters returned by server')
      }
    } catch (err: unknown) {
      console.error('Order error:', err)
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setMessage({
        type: 'error',
        text: `Failed to place order: ${errMsg}`,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-5 rounded-xl border text-sm font-body leading-normal ${
            message.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-950/30 dark:bg-red-950/20'
              : message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-950/30 dark:bg-green-950/20'
              : 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-950/30 dark:bg-yellow-950/20'
          }`}
        >
          {message.text}
          {message.type === 'info' && (
            <div className="mt-4 flex gap-4">
              <a
                href="/account"
                className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 bg-ni-rust text-white hover:bg-ni-rust-lt transition-colors"
              >
                Go to My Orders
              </a>
            </div>
          )}
        </div>
      )}

      {!message && (
        <div className="bg-ni-surface border border-ni-border/20 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-heading text-lg font-bold text-ni-primary mb-1">
              Review and Confirm Order
            </h3>
            <p className="font-body text-xs text-ni-muted">
              Please double check all items and addresses before placing your order.
            </p>
          </div>

          {/* Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-ni-border/10">
            {/* Delivery address details */}
            <div className="space-y-2">
              <span className="block font-body text-xs font-bold text-ni-muted uppercase tracking-wider">
                Ship To
              </span>
              <p className="font-body text-sm font-bold text-ni-primary">
                {addressData.name}
              </p>
              {addressData.company && (
                <p className="font-body text-xs text-ni-secondary">
                  {addressData.company}
                </p>
              )}
              <p className="font-body text-xs text-ni-secondary whitespace-pre-wrap leading-relaxed">
                {addressData.address}
              </p>
              <p className="font-body text-xs text-ni-muted pt-1">
                {addressData.phone ? `Phone: ${addressData.phone} · ` : ''}
                Email: {addressData.email}
              </p>
            </div>

            {/* Payment options details */}
            <div className="space-y-2">
              <span className="block font-body text-xs font-bold text-ni-muted uppercase tracking-wider">
                Payment Mode
              </span>
              <p className="font-heading text-sm font-bold text-ni-primary">
                {PAYMENT_METHOD_LABELS[paymentMethod]}
              </p>
              <span className="inline-block font-body text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded border border-green-200/50">
                {(discountPct * 100).toFixed(3)}% Discount
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <span className="block font-body text-xs font-bold text-ni-muted uppercase tracking-wider">
              Order Items
            </span>
            <div className="divide-y divide-ni-border/10 border-b border-ni-border/10">
              {cart.map((item) => (
                <div key={item.sku} className="flex justify-between items-center py-4 font-body">
                  <div className="min-w-0 pr-4">
                    <span className="block text-base sm:text-lg font-semibold text-ni-primary truncate">
                      {item.name}
                    </span>
                    <span className="block font-mono text-xs sm:text-sm text-ni-muted mt-1">
                      {item.sku} · {item.qty_kg} kg @ {formatINR(item.list_price)}/kg
                    </span>
                  </div>
                  <span className="text-base sm:text-lg font-semibold text-ni-secondary flex-shrink-0">
                    {formatINR(item.list_price * item.qty_kg)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="bg-ni-surface2/30 rounded-xl p-4 space-y-2 font-body text-xs text-ni-secondary border border-ni-border/10">
            <div className="flex justify-between">
              <span>List Total</span>
              <span className="font-medium">{formatINR(listTotal)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Payment Discount</span>
              <span>−{formatINR(discountAmt)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-ni-primary pt-2 border-t border-ni-border/15">
              <span>Final Amount Due</span>
              <span>{formatINR(finalTotal)}</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-4">
            <button
              onClick={onBack}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[10px] px-6 py-3.5 bg-transparent border border-ni-border2 text-ni-secondary hover:border-ni-secondary hover:text-ni-primary transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              ← Back to Payment
            </button>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[10px] px-8 py-3.5 bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-premium transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating Order...' : 'Place Order & Pay →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
