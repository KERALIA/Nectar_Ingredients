'use client'

import React, { useState, useEffect } from 'react'
import { products } from '../../lib/data'
import { useSampleBasket } from '../../context/SampleBasketContext'
import OrderBanner from '@/components/ui/OrderBanner'
import CountryPhoneInput from '@/components/ui/CountryPhoneInput'

// ─── Styling helpers ────────────────────────────────────────────────────────
const inputBase = 'bg-ni-surface dark:bg-[#1A1A1D] border px-4 py-3.5 text-base sm:text-sm font-body text-ni-primary w-full transition-all duration-300 rounded-2xl outline-none focus:ring-2 focus:ring-ni-rust/50 shadow-sm'
const inputValid   = `${inputBase} border-ni-border/30 dark:border-white/10 focus:border-ni-rust`
const inputInvalid = `${inputBase} border-red-500 focus:border-red-400 focus:ring-red-400`

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  address?: string
  product?: string
}

function validate(
  name: string,
  email: string,
  phone: string,
  address: string,
  basketCount: number,
): FormErrors {
  const errors: FormErrors = {}
  if (!name.trim())              errors.name    = 'Your name is required.'
  if (!email.trim())             errors.email   = 'Email address is required.'
  else if (!isValidEmail(email)) errors.email   = 'Please enter a valid email address.'
  if (!phone.trim()) {
    errors.phone = 'Phone number is required.'
  } else if (!/^[0-9\s-]{7,20}$/.test(phone.trim())) {
    errors.phone = 'Please enter a valid phone number.'
  }
  if (!address.trim())           errors.address = 'Delivery address is required.'
  if (basketCount === 0)         errors.product = 'Please select at least one product sample.'
  return errors
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p role="alert" className="font-body text-xs text-red-500 mt-1.5 flex items-center gap-1">
      <span aria-hidden="true">⚠</span> {msg}
    </p>
  )
}

export default function ContactClient() {
  const { basket, totalItems, clearBasket, toggleBasket, setItemQuantity } = useSampleBasket()

  const [name,            setName]            = useState('')
  const [company,         setCompany]         = useState('')
  const [email,           setEmail]           = useState('')
  const [phone,           setPhone]           = useState('')
  const [address,         setAddress]         = useState('')
  const [message,         setMessage]         = useState('')
  const [productFilter,   setProductFilter]   = useState('')
  const [mounted,         setMounted]         = useState(false)

  // Validation state
  const [errors,    setErrors]    = useState<FormErrors>({})
  const [touched,   setTouched]   = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  // Submission state
  const [isSubmitting,    setIsSubmitting]    = useState(false)
  const [errorMessage,    setErrorMessage]    = useState<string | null>(null)
  const [successMessage,  setSuccessMessage]  = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  useEffect(() => {
    if (submitted) {
      setErrors(validate(name, email, phone, address, mounted ? basket.length : 0))
    }
  }, [name, email, phone, address, basket, mounted, submitted])

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productFilter.toLowerCase()) ||
    p.category.toLowerCase().includes(productFilter.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    setSubmitted(true)
    const errs = validate(name, email, phone, address, mounted ? basket.length : 0)
    setErrors(errs)

    if (Object.keys(errs).length > 0) {
      const firstErrId = errs.name
        ? 'contact-name'
        : errs.email
        ? 'contact-email'
        : errs.phone
        ? 'contact-phone'
        : errs.address
        ? 'contact-address'
        : 'contact-product'
      document.getElementById(firstErrId)?.focus()
      setIsSubmitting(false)
      return
    }

    const items = basket.map(item => ({
      name:     item.name,
      sku:      item.sku,
      quantity: item.quantity ?? 1,
      unit:     'kg',
    }))

    const formData = {
      name,
      email,
      phone,
      company,
      address,
      items,
      message,
    }

    try {
      const response = await fetch('/api/web-form-router', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccessMessage(
          data.message ?? 'Thank you! Your inquiry has been received. Our team will reach out within 1 business day.',
        )
        setName('')
        setCompany('')
        setEmail('')
        setPhone('')
        setAddress('')
        setMessage('')
        setErrors({})
        setTouched({})
        setSubmitted(false)
        clearBasket()
      } else {
        throw new Error(data.error || 'Submission failed. Please try again.')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const showError = (field: keyof FormErrors) => (touched[field] || submitted) ? errors[field] : undefined
  const inputClass = (field: keyof FormErrors) => showError(field) ? inputInvalid : inputValid

  return (
    <div className="pt-24 bg-ni-bg min-h-screen">

      {/* Page Header */}
      <div className="border-b border-ni-border/20 relative overflow-hidden bg-gradient-to-b from-ni-surface2/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ni-rust/10 border border-ni-rust/20 text-ni-rust font-body text-[10px] font-extrabold uppercase tracking-widest mb-4">
            <span>Direct Contact & Commercial Inquiries</span>
          </div>
          <h1 className="font-heading text-display font-black tracking-tight text-ni-primary">
            Let's talk powder.
          </h1>
          <p className="font-body text-ni-secondary text-base sm:text-lg mt-3 max-w-2xl leading-relaxed">
            Send bulk ingredient requirements, request 1 kg trial sample boxes, or ask for custom mesh fineness directly from our team in Surendranagar.
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Info Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">

        {/* Left Form */}
        <div className="lg:col-span-3">
          <OrderBanner />

          {/* Success Toast */}
          {successMessage && (
            <div
              role="status"
              className="flex items-start gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 mb-6 text-emerald-600 dark:text-emerald-400 backdrop-blur-md"
            >
              <span className="text-xl" aria-hidden="true">✓</span>
              <p className="font-body text-sm font-semibold leading-relaxed">{successMessage}</p>
            </div>
          )}

          <form noValidate onSubmit={handleSubmit} className="space-y-6">

            {/* Name + Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className="font-body text-[11px] font-extrabold uppercase tracking-wider text-ni-primary block mb-2">
                  Name <span className="text-ni-rust">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Your full name"
                  className={inputClass('name')}
                  aria-required="true"
                />
                <FieldError msg={showError('name')} />
              </div>

              <div>
                <label htmlFor="contact-company" className="font-body text-[11px] font-extrabold uppercase tracking-wider text-ni-primary block mb-2">
                  Company / Brand <span className="text-ni-muted font-normal uppercase tracking-normal">(Optional)</span>
                </label>
                <input
                  id="contact-company"
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Company name"
                  className={inputValid}
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-email" className="font-body text-[11px] font-extrabold uppercase tracking-wider text-ni-primary block mb-2">
                  Email Address <span className="text-ni-rust">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@company.com"
                  className={inputClass('email')}
                  aria-required="true"
                />
                <FieldError msg={showError('email')} />
              </div>

              <div>
                <label htmlFor="contact-phone" className="font-body text-[11px] font-extrabold uppercase tracking-wider text-ni-primary block mb-2">
                  Phone / WhatsApp <span className="text-ni-rust">*</span>
                </label>
                <CountryPhoneInput
                  id="contact-phone"
                  value={phone}
                  onChange={(formatted) => setPhone(formatted)}
                  onBlur={() => handleBlur('phone')}
                  error={!!showError('phone')}
                />
                <FieldError msg={showError('phone')} />
              </div>
            </div>

            {/* Product Interest Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-body text-[11px] font-extrabold uppercase tracking-wider text-ni-primary">
                  Select Product Samples <span className="text-ni-rust">*</span>
                </label>
                {mounted && totalItems > 0 && (
                  <span className="font-body text-xs font-bold text-ni-rust">
                    ({totalItems} selected)
                  </span>
                )}
              </div>

              {/* Product Filter Search */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={productFilter}
                  onChange={e => setProductFilter(e.target.value)}
                  placeholder="Filter powders by name..."
                  className="w-full bg-ni-surface/60 dark:bg-[#1A1A1D]/60 border border-ni-border/20 dark:border-white/10 px-3.5 py-2 text-xs text-ni-primary rounded-xl outline-none focus:ring-1 focus:ring-ni-rust"
                />
              </div>

              {/* Scrollable Checkbox Grid */}
              <div
                id="contact-product"
                className={`rounded-2xl border overflow-hidden transition-all ${
                  showError('product') ? 'border-red-500' : 'border-ni-border/30 dark:border-white/10'
                }`}
              >
                <div className="max-h-56 overflow-y-auto bg-ni-surface/80 dark:bg-[#161618]/80 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-ni-border/10">
                  {filteredProducts.map((p) => {
                    const isSelected = mounted && basket.some(i => i.id === p.id)
                    const basketItem = mounted ? basket.find(i => i.id === p.id) : undefined
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3 transition-colors ${
                          isSelected ? 'bg-ni-rust/10 border-ni-rust/30' : 'hover:bg-ni-surface2/50'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            toggleBasket({ id: p.id, slug: p.slug, name: p.name, sku: p.sku, category: p.category })
                            handleBlur('product')
                          }}
                          className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                        >
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              isSelected ? 'bg-ni-rust border-ni-rust text-white' : 'border-ni-border bg-transparent'
                            }`}
                          >
                            {isSelected && '✓'}
                          </span>
                          <span className={`font-body text-xs truncate ${isSelected ? 'text-ni-rust font-bold' : 'text-ni-primary'}`}>
                            {p.name}
                          </span>
                        </button>

                        {isSelected && basketItem && (
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setItemQuantity(p.id, (basketItem.quantity ?? 1) - 1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-ni-surface2 text-ni-primary text-xs font-bold"
                            >
                              −
                            </button>
                            <span className="font-mono text-xs font-bold text-ni-rust w-5 text-center">
                              {basketItem.quantity ?? 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setItemQuantity(p.id, (basketItem.quantity ?? 1) + 1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-ni-surface2 text-ni-primary text-xs font-bold"
                            >
                              +
                            </button>
                            <span className="text-[10px] text-ni-muted">kg</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              <FieldError msg={showError('product')} />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="contact-address" className="font-body text-[11px] font-extrabold uppercase tracking-wider text-ni-primary block mb-2">
                Delivery Address <span className="text-ni-rust">*</span>
              </label>
              <textarea
                id="contact-address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                onBlur={() => handleBlur('address')}
                rows={3}
                placeholder="Complete delivery address with PIN code..."
                className={inputClass('address')}
              />
              <FieldError msg={showError('address')} />
            </div>

            {/* Additional Message */}
            <div>
              <label htmlFor="contact-message" className="font-body text-[11px] font-extrabold uppercase tracking-wider text-ni-primary block mb-2">
                Special Specs / Custom Message <span className="text-ni-muted font-normal uppercase tracking-normal">(Optional)</span>
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="Mention particle size requirements (e.g. 80 mesh), target monthly volume, moisture specs..."
                className={`${inputValid} resize-none`}
              />
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div role="alert" className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500 font-body text-xs">
                {errorMessage}
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-body font-extrabold text-xs uppercase tracking-widest py-4 rounded-full bg-ni-rust text-white shadow-card hover:bg-ni-rust-lt hover:shadow-hover transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Inquiry...' : 'Submit Inquiry & Request Samples →'}
            </button>
          </form>
        </div>

        {/* Right Info Sidebar */}
        <div className="lg:col-span-2">
          <div className="glass-panel-premium p-8 rounded-[32px] border border-ni-border/30 dark:border-white/10 shadow-premium space-y-8 sticky top-28">
            <div>
              <h3 className="font-heading text-xl font-extrabold text-ni-primary mb-4">Head Office & Inquiries</h3>
              <p className="font-body text-xs text-ni-secondary leading-relaxed">
                Nectar Ingredients<br />
                Shop No. 18 &amp; 19, Second Floor, Brahmanand Chamber<br />
                Opp. M.P. Shah Arts &amp; Science College, S.T. Road<br />
                Surendranagar, Gujarat 363001, India
              </p>
            </div>

            <div className="space-y-4 font-body text-xs border-t border-ni-border/20 pt-6">
              <div>
                <p className="font-bold text-ni-rust uppercase tracking-wider text-[10px] mb-1">Key Contact Person</p>
                <p className="font-bold text-ni-primary text-sm">Mehul Patel</p>
              </div>

              <div>
                <p className="font-bold text-ni-rust uppercase tracking-wider text-[10px] mb-1">Direct Call & WhatsApp</p>
                <a href="https://wa.me/919879838281" className="text-ni-primary hover:text-ni-rust font-bold text-sm transition-colors">
                  +91 98798 38281
                </a>
              </div>

              <div>
                <p className="font-bold text-ni-rust uppercase tracking-wider text-[10px] mb-1">Commercial Email</p>
                <a href="mailto:nectaringredients@gmail.com" className="text-ni-rust font-bold hover:underline">
                  nectaringredients@gmail.com
                </a>
              </div>
            </div>

            {/* Sample Policy */}
            <div className="p-5 rounded-2xl bg-ni-surface2/50 dark:bg-white/[0.04] border border-ni-border/20">
              <p className="font-body text-xs font-extrabold uppercase tracking-wider text-ni-rust mb-1">Sample Box Policy</p>
              <p className="font-body text-xs text-ni-secondary leading-relaxed">
                1 kg commercial samples dispatched for ₹350–₹600 per powder. Sample fee is 100% credited against your first commercial bulk order.
              </p>
            </div>

            {/* PDF Brochure */}
            <a
              href="/NECTAR_BROCHURE.pdf"
              download
              className="inline-flex items-center justify-center gap-2 font-body text-xs font-bold uppercase tracking-wider text-ni-rust border border-ni-rust px-5 py-3.5 rounded-full hover:bg-ni-rust hover:text-white transition-all w-full text-center"
            >
              Download Full Brochure (PDF) ↓
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
