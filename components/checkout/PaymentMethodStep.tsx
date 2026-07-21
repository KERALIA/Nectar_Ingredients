'use client'

import React, { useState } from 'react'
import { PaymentMethod } from '@/types'
import {
  PAYMENT_DISCOUNTS,
  PAYMENT_METHOD_LABELS,
  isPaymentMethodAvailable,
  computeFinalPrice,
  computeDiscountAmount,
  formatINR,
  UPI_THRESHOLD,
} from '@/lib/pricing'

interface PaymentMethodStepProps {
  listTotal: number
  selectedMethod: PaymentMethod | null
  onBack: () => void
  onNext: (method: PaymentMethod) => void
}

export default function PaymentMethodStep({
  listTotal,
  selectedMethod,
  onBack,
  onNext,
}: PaymentMethodStepProps) {
  const [method, setMethod] = useState<PaymentMethod>(selectedMethod || 'debit_card')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(method)
  }

  const methods: PaymentMethod[] = ['upi', 'debit_card', 'credit_card', 'netbanking']

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-ni-surface border border-ni-border/20 rounded-2xl p-6 sm:p-8">
      <div>
        <h3 className="font-heading text-lg font-bold text-ni-primary mb-2">
          Select Payment Method
        </h3>
        <p className="font-body text-xs text-ni-muted">
          Select a payment option to apply its specific processing discount.
        </p>
      </div>

      {/* Pricing Summary */}
      <div className="bg-ni-surface2/30 border border-ni-border/10 rounded-xl p-4 flex items-center justify-between">
        <span className="font-body text-xs font-bold text-ni-secondary uppercase tracking-wider">
          Items List Total
        </span>
        <span className="font-body text-base font-bold text-ni-primary">
          {formatINR(listTotal)}
        </span>
      </div>

      {/* Methods List */}
      <div className="space-y-3" role="radiogroup" aria-label="Payment methods">
        {methods.map((m) => {
          const available = isPaymentMethodAvailable(m, listTotal)
          const discountPct = PAYMENT_DISCOUNTS[m]
          const discountAmt = computeDiscountAmount(listTotal, m)
          const finalTotal = computeFinalPrice(listTotal, m)

          return (
            <label
              key={m}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-300 ${
                !available
                  ? 'opacity-40 border-ni-border/10 bg-ni-surface2/10 cursor-not-allowed'
                  : method === m
                  ? 'border-ni-rust bg-ni-rust-bg/25 cursor-pointer ring-1 ring-ni-rust'
                  : 'border-ni-border/20 bg-transparent hover:border-ni-secondary cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment_method"
                  value={m}
                  checked={method === m}
                  disabled={!available}
                  onChange={() => setMethod(m)}
                  className="h-4 w-4 text-ni-rust border-ni-border/40 focus:ring-ni-rust bg-transparent"
                />
                <div>
                  <span className="block font-heading text-sm font-bold text-ni-primary">
                    {PAYMENT_METHOD_LABELS[m]}
                  </span>
                  <span className="block font-body text-[11px] text-green-600 dark:text-green-400 font-semibold mt-0.5">
                    {(discountPct * 100).toFixed(3)}% Discount Applied
                  </span>
                </div>
              </div>

              {available ? (
                <div className="text-right sm:pl-4">
                  <p className="font-body text-xs text-ni-muted">
                    Discount: <span className="text-red-500 font-medium">−{formatINR(discountAmt)}</span>
                  </p>
                  <p className="font-body text-sm font-bold text-ni-primary mt-0.5">
                    Final Price: {formatINR(finalTotal)}
                  </p>
                </div>
              ) : (
                <div className="text-right sm:pl-4 max-w-[200px]">
                  <p className="font-body text-[10px] text-red-500 font-medium leading-normal">
                    Unavailable for orders ≥ {formatINR(UPI_THRESHOLD)} (Network Limit).
                  </p>
                </div>
              )}
            </label>
          )
        })}
      </div>

      <div className="pt-6 border-t border-ni-border/10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[10px] px-6 py-3.5 bg-transparent border border-ni-border2 text-ni-secondary hover:border-ni-secondary hover:text-ni-primary transition-all duration-300 cursor-pointer"
        >
          ← Back to Address
        </button>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[10px] px-6 py-3.5 bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-premium transition-all duration-300 cursor-pointer"
        >
          Review Order Details →
        </button>
      </div>
    </form>
  )
}
