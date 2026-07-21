'use client'

import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useCart } from '@/context/CartContext'
import { PaymentMethod } from '@/types'
import AddressStep from './AddressStep'
import PaymentMethodStep from './PaymentMethodStep'
import OrderSummary from './OrderSummary'
import Link from 'next/link'

interface CheckoutFlowProps {
  user: User
}

type CheckoutStep = 'address' | 'payment' | 'summary'

interface AddressData {
  name: string
  email: string
  phone: string
  company: string
  address: string
}

export default function CheckoutFlow({ user }: CheckoutFlowProps) {
  const { cart, listTotal } = useCart()
  const [step, setStep] = useState<CheckoutStep>('address')
  const [addressData, setAddressData] = useState<AddressData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)

  if (cart.length === 0) {
    return (
      <div className="bg-ni-surface border border-ni-border/20 rounded-2xl p-8 text-center max-w-md mx-auto my-12">
        <span className="text-3xl block mb-4" aria-hidden="true">
          🛒
        </span>
        <h3 className="font-heading text-lg font-bold text-ni-primary mb-2">
          Your cart is empty
        </h3>
        <p className="font-body text-sm text-ni-muted mb-6">
          You must add items to your cart before checking out.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[10px] px-6 py-3.5 bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-premium transition-all duration-300"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  const handleAddressNext = (data: AddressData) => {
    setAddressData(data)
    setStep('payment')
  }

  const handlePaymentNext = (method: PaymentMethod) => {
    setPaymentMethod(method)
    setStep('summary')
  }

  // Visual helper for step indicators
  const steps = [
    { id: 'address', label: 'Address' },
    { id: 'payment', label: 'Payment' },
    { id: 'summary', label: 'Review' },
  ]

  return (
    <div className="space-y-8">
      {/* Progress Tracker Bar */}
      <div className="flex justify-between items-center max-w-md mx-auto">
        {steps.map((s, idx) => {
          const isActive = step === s.id
          const isCompleted =
            (step === 'payment' && s.id === 'address') ||
            (step === 'summary' && (s.id === 'address' || s.id === 'payment'))

          return (
            <React.Fragment key={s.id}>
              {idx > 0 && (
                <div
                  className={`flex-1 h-[3px] mx-4 transition-all duration-500 rounded-full ${
                    isCompleted ? 'bg-ni-rust shadow-[0_0_8px_rgba(188,75,32,0.5)]' : 'bg-ni-border/20'
                  }`}
                />
              )}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-heading text-xs font-bold transition-all transition-spring duration-500 ${
                    isActive
                      ? 'bg-ni-rust text-white ring-4 ring-ni-rust-bg scale-115 shadow-[0_4px_12px_var(--glow-color-strong)]'
                      : isCompleted
                      ? 'bg-ni-rust text-white'
                      : 'bg-ni-surface border border-ni-border/20 text-ni-muted'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`font-body text-[10px] font-bold uppercase tracking-wider mt-2 transition-all duration-500 ${
                    isActive ? 'text-ni-rust' : 'text-ni-muted'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          )
        })}
      </div>

      {/* Main Steps Content */}
      <div className="transition-all duration-300">
        {step === 'address' && (
          <AddressStep
            user={user}
            initialData={addressData}
            onNext={handleAddressNext}
          />
        )}

        {step === 'payment' && (
          <PaymentMethodStep
            listTotal={listTotal}
            selectedMethod={paymentMethod}
            onBack={() => setStep('address')}
            onNext={handlePaymentNext}
          />
        )}

        {step === 'summary' && (
          <OrderSummary
            user={user}
            cart={cart}
            listTotal={listTotal}
            addressData={addressData}
            paymentMethod={paymentMethod!}
            onBack={() => setStep('payment')}
          />
        )}
      </div>
    </div>
  )
}
