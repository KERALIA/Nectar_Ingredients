'use client'

import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'

interface AddressData {
  name: string
  email: string
  phone: string
  company: string
  address: string
}

interface AddressStepProps {
  user: User
  initialData: AddressData
  onNext: (data: AddressData) => void
}

const inputBase = 'bg-[var(--input-bg)] border px-4 py-3 text-base sm:text-sm font-body text-ni-primary w-full transition-all duration-300 rounded-lg outline-none focus:ring-1 focus:ring-[var(--input-focus)]'
const inputValid = `${inputBase} border-[var(--input-border)] focus:border-[var(--input-focus)]`
const inputInvalid = `${inputBase} border-red-500 focus:border-red-400 focus:ring-red-400`

export default function AddressStep({ user, initialData, onNext }: AddressStepProps) {
  const [formData, setFormData] = useState<AddressData>({
    name: initialData.name || user.user_metadata?.full_name || '',
    email: initialData.email || user.email || '',
    phone: initialData.phone || '',
    company: initialData.company || '',
    address: initialData.address || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!formData.name.trim()) nextErrors.name = 'Your name is required.'
    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.'
    }
    if (!formData.address.trim()) nextErrors.address = 'Delivery address is required.'
    return nextErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setTouched({ name: true, email: true, address: true })

      // Focus first error
      const firstErrorKey = Object.keys(nextErrors)[0]
      const el = document.getElementsByName(firstErrorKey)[0]
      el?.focus()
      return
    }
    onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-ni-surface border border-ni-border/20 rounded-2xl p-6 sm:p-8">
      <div>
        <h3 className="font-heading text-lg font-bold text-ni-primary mb-2">
          Delivery & Billing Address
        </h3>
        <p className="font-body text-xs text-ni-muted">
          Please enter the delivery details for your shipment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contact Name */}
        <div>
          <label className="block font-body text-xs font-bold text-ni-secondary uppercase tracking-wider mb-2">
            Contact Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.name && touched.name ? inputInvalid : inputValid}
            required
          />
          {errors.name && touched.name && (
            <p className="text-red-500 font-body text-[11px] mt-1.5">{errors.name}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block font-body text-xs font-bold text-ni-secondary uppercase tracking-wider mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.email && touched.email ? inputInvalid : inputValid}
            required
          />
          {errors.email && touched.email && (
            <p className="text-red-500 font-body text-[11px] mt-1.5">{errors.email}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block font-body text-xs font-bold text-ni-secondary uppercase tracking-wider mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputValid}
          />
        </div>

        {/* Company Name */}
        <div>
          <label className="block font-body text-xs font-bold text-ni-secondary uppercase tracking-wider mb-2">
            Company Name
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className={inputValid}
          />
        </div>
      </div>

      {/* Delivery Address */}
      <div>
        <label className="block font-body text-xs font-bold text-ni-secondary uppercase tracking-wider mb-2">
          Full Delivery Address *
        </label>
        <textarea
          name="address"
          rows={3}
          value={formData.address}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.address && touched.address ? inputInvalid : inputValid}
          required
        />
        {errors.address && touched.address && (
          <p className="text-red-500 font-body text-[11px] mt-1.5">{errors.address}</p>
        )}
      </div>

      <div className="pt-4 border-t border-ni-border/10 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[10px] px-6 py-3.5 bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-premium transition-all duration-300 cursor-pointer"
        >
          Continue to Payment Method →
        </button>
      </div>
    </form>
  )
}
