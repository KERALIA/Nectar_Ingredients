'use client'

import React, { useState, useEffect } from 'react'
import { products } from '../../lib/data'
import { useSampleBasket } from '../../context/SampleBasketContext'
import OrderBanner from '@/components/ui/OrderBanner'

// ─── Styling helpers ────────────────────────────────────────────────────────
const inputBase = 'bg-[var(--input-bg)] border px-4 py-3 text-base sm:text-sm font-body text-ni-primary w-full transition-all duration-300 rounded-lg outline-none focus:ring-1 focus:ring-[var(--input-focus)]'
const inputValid   = `${inputBase} border-[var(--input-border)] focus:border-[var(--input-focus)]`
const inputInvalid = `${inputBase} border-red-500 focus:border-red-400 focus:ring-red-400`

// ─── Validation helpers ──────────────────────────────────────────────────────
const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

interface FormErrors {
  name?: string
  email?: string
  address?: string
  product?: string
}

function validate(
  name: string,
  email: string,
  address: string,
  basketCount: number,
): FormErrors {
  const errors: FormErrors = {}
  if (!name.trim())              errors.name    = 'Your name is required.'
  if (!email.trim())             errors.email   = 'Email address is required.'
  else if (!isValidEmail(email)) errors.email   = 'Please enter a valid email address.'
  if (!address.trim())           errors.address = 'Your address is required.'
  if (basketCount === 0)         errors.product = 'Please select at least one product.'
  return errors
}

// ─── Inline error message component ─────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p role="alert" className="font-body text-xs text-red-500 mt-1.5 flex items-center gap-1">
      <span aria-hidden="true">⚠</span> {msg}
    </p>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ContactClient() {
  const { basket, totalItems, clearBasket, removeFromBasket, toggleBasket, setItemQuantity } = useSampleBasket()

  const [name,            setName]            = useState('')
  const [company,         setCompany]         = useState('')
  const [email,           setEmail]           = useState('')
  const [phone,           setPhone]           = useState('')
  const [address,         setAddress]         = useState('')
  const [message,         setMessage]         = useState('')
  const [mounted,         setMounted]         = useState(false)

  // Validation state
  const [errors,    setErrors]    = useState<FormErrors>({})
  const [touched,   setTouched]   = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  // Submission lifecycle state
  const [isSubmitting,    setIsSubmitting]    = useState(false)
  const [errorMessage,    setErrorMessage]    = useState<string | null>(null)
  const [successMessage,  setSuccessMessage]  = useState<string | null>(null)

  // Hydration guard — avoid SSR mismatch on basket-dependent UI
  useEffect(() => { setMounted(true) }, [])

  // Mark a field as touched when the user leaves it (blur)
  const handleBlur = (field: string) =>
    setTouched(prev => ({ ...prev, [field]: true }))

  // Re-validate whenever relevant state changes (after first submit attempt)
  useEffect(() => {
    if (submitted) {
      setErrors(validate(name, email, address, mounted ? basket.length : 0))
    }
  }, [name, email, address, basket, mounted, submitted])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    // Run client-side validation before hitting the network
    setSubmitted(true)
    const errs = validate(name, email, address, mounted ? basket.length : 0)
    setErrors(errs)

    if (Object.keys(errs).length > 0) {
      const firstErrId = errs.name
        ? 'contact-name'
        : errs.email
        ? 'contact-email'
        : errs.address
        ? 'contact-address'
        : 'contact-product'
      document.getElementById(firstErrId)?.focus()
      setIsSubmitting(false)
      return
    }

    // Build items array from basket — each entry carries per-product quantity
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
        // ── Success path ────────────────────────────────────────────────────
        setSuccessMessage(
          data.message ?? 'Thank you! Your inquiry has been received. We\'ll be in touch within 1 business day.',
        )
        // Reset all form fields
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
      // ── Error path — show human-readable message, never a raw stack trace ──
      const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helpers to decide whether to show an error (only after touched or submitted)
  const showError = (field: keyof FormErrors) =>
    (touched[field] || submitted) ? errors[field] : undefined

  const inputClass = (field: keyof FormErrors) =>
    showError(field) ? inputInvalid : inputValid

  return (
    <div className="pt-16 bg-ni-bg min-h-screen overflow-x-hidden">

      {/* Page header */}
      <div className="border-b border-ni-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-4">CONTACT US</p>
          <h1 className="font-heading text-display font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">Let's talk powder.</h1>
        </div>
      </div>

      {/* Two column layout: stacked on mobile/tablet, 5-col on lg */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

        {/* Left — form */}
        <div className="lg:col-span-3">
          <OrderBanner />
          {/* ── Success toast ──────────────────────────────────────────────── */}
          {successMessage && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/40 px-5 py-4 mb-2"
            >
              <span className="mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400 text-base" aria-hidden="true">✓</span>
              <p className="font-body text-sm text-green-800 dark:text-green-300 leading-relaxed">{successMessage}</p>
            </div>
          )}

          <form
            noValidate
            onSubmit={handleSubmit}
            aria-label="Inquiry form"
            className="space-y-5"
          >

            {/* Name + Company row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className="font-body text-[11px] font-semibold text-ni-primary uppercase tracking-widest block mb-2">
                  <span className="label-highlight-required">Name <span className="text-red-500" aria-hidden="true">*</span></span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Your name"
                  className={inputClass('name')}
                  autoComplete="name"
                  aria-required="true"
                  aria-invalid={!!showError('name')}
                  aria-describedby={showError('name') ? 'contact-name-error' : undefined}
                />
                <FieldError msg={showError('name')} />
                {showError('name') && <span id="contact-name-error" className="sr-only">{showError('name')}</span>}
              </div>

              <div>
                <label htmlFor="contact-company" className="font-body text-[11px] font-semibold text-ni-primary uppercase tracking-widest block mb-2">
                  <span className="label-highlight-optional">Company / Brand</span> <span className="normal-case tracking-normal font-normal text-ni-muted/70">(Optional)</span>
                </label>
                <input
                  id="contact-company"
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Your company"
                  className={inputValid}
                  autoComplete="organization"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contact-email" className="font-body text-[11px] font-semibold text-ni-primary uppercase tracking-widest block mb-2">
                <span className="label-highlight-required">Email <span className="text-red-500" aria-hidden="true">*</span></span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@gmail.com"
                className={inputClass('email')}
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!showError('email')}
                aria-describedby={showError('email') ? 'contact-email-error' : undefined}
              />
              <FieldError msg={showError('email')} />
              {showError('email') && <span id="contact-email-error" className="sr-only">{showError('email')}</span>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="contact-phone" className="font-body text-[11px] font-semibold text-ni-primary uppercase tracking-widest block mb-2">
                <span className="label-highlight-optional">Phone / WhatsApp</span> <span className="normal-case tracking-normal font-normal text-ni-muted/70">(Optional)</span>
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className={inputValid}
                autoComplete="tel"
              />
              <p className="font-body text-xs text-ni-muted mt-1.5">For faster replies, we may reach out via WhatsApp.</p>
            </div>

            {/* Product Interest — compact scrollable list */}
            <div>
              <label className="font-body text-[11px] font-semibold text-ni-primary uppercase tracking-widest block mb-2">
                <span className="label-highlight-required">Product Interest{' '}
                {mounted && totalItems > 0
                  ? <span className="text-ni-rust normal-case tracking-normal font-normal">({totalItems} selected)</span>
                  : <span className="text-red-500" aria-hidden="true">*</span>
                }
                </span>
              </label>

              {/* ── Scrollable checkbox list ────────────────────────────────── */}
              <div
                id="contact-product"
                role="group"
                aria-label="Select products"
                aria-required="true"
                aria-invalid={!!showError('product')}
                className={`rounded-lg border overflow-hidden transition-all duration-200 ${
                  showError('product')
                    ? 'border-red-500'
                    : 'border-[var(--input-border)]'
                }`}
              >
                <div className="max-h-44 overflow-y-auto scrollbar-hide bg-[var(--input-bg)] grid grid-cols-2">
                  {products.map((p, idx) => {
                    const isSelected = mounted && basket.some(i => i.id === p.id)
                    const basketItem = mounted ? basket.find(i => i.id === p.id) : undefined
                    const isOdd = idx % 2 === 0
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center border-b border-[var(--input-border)] last:border-b-0 ${
                          isSelected ? 'bg-ni-rust/10 dark:bg-ni-rust/20' : ''
                        } ${!isOdd ? 'border-l border-[var(--input-border)]' : ''}`}
                      >
                        {/* Toggle button — checkbox + name */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleBasket({ id: p.id, slug: p.slug, name: p.name, sku: p.sku, category: p.category })
                            handleBlur('product')
                          }}
                          aria-pressed={isSelected}
                          className={`flex items-center gap-2.5 px-3 py-2 text-left flex-1 min-w-0 transition-colors duration-150 ${
                            !isSelected ? 'hover:bg-[var(--surface)]' : ''
                          }`}
                        >
                          {/* Custom checkbox */}
                          <span
                            aria-hidden="true"
                            style={isSelected ? { background: 'var(--rust)', borderColor: 'var(--rust)' } : undefined}
                            className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 ${
                              isSelected ? '' : 'border-ni-border bg-transparent'
                            }`}
                          >
                            {isSelected && (
                              <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                          <span className={`font-body text-xs truncate ${isSelected ? 'text-ni-rust font-semibold' : 'text-ni-primary'}`}>
                            {p.name}
                          </span>
                        </button>

                        {/* Per-item quantity input — only visible when selected */}
                        {isSelected && basketItem && (
                          <div className="flex items-center gap-0.5 pr-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setItemQuantity(p.id, (basketItem.quantity ?? 1) - 1)}
                              aria-label={`Decrease quantity of ${p.name}`}
                              className="w-5 h-5 flex items-center justify-center rounded text-ni-muted hover:text-ni-rust hover:bg-ni-rust/10 transition-all text-xs font-bold"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={basketItem.quantity ?? 1}
                              onChange={(e) => setItemQuantity(p.id, parseInt(e.target.value, 10) || 1)}
                              aria-label={`Quantity for ${p.name} in kg`}
                              className="w-8 text-center font-body text-xs text-ni-rust font-semibold bg-transparent border border-ni-rust/30 rounded py-0.5 outline-none focus:ring-1 focus:ring-ni-rust appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => setItemQuantity(p.id, (basketItem.quantity ?? 1) + 1)}
                              aria-label={`Increase quantity of ${p.name}`}
                              className="w-5 h-5 flex items-center justify-center rounded text-ni-muted hover:text-ni-rust hover:bg-ni-rust/10 transition-all text-xs font-bold"
                            >
                              +
                            </button>
                            <span className="font-body text-[10px] text-ni-muted ml-0.5">kg</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              <p className="font-body text-xs text-ni-muted mt-1.5">Select one or more and set a quantity per product. Selections sync with your sample box.</p>
              <FieldError msg={showError('product')} />
              {showError('product') && <span id="contact-product-error" className="sr-only">{showError('product')}</span>}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="contact-address" className="font-body text-[11px] font-semibold text-ni-primary uppercase tracking-widest block mb-2">
                <span className="label-highlight-required">Address <span className="text-red-500" aria-hidden="true">*</span></span>
              </label>
              <textarea
                id="contact-address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                onBlur={() => handleBlur('address')}
                rows={3}
                placeholder="Shop no., street, city, state, PIN code."
                className={inputClass('address')}
                aria-required="true"
                aria-invalid={!!showError('address')}
                aria-describedby={showError('address') ? 'contact-address-error' : undefined}
              />
              <FieldError msg={showError('address')} />
              {showError('address') && <span id="contact-address-error" className="sr-only">{showError('address')}</span>}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="contact-message" className="font-body text-[11px] font-semibold text-ni-primary uppercase tracking-widest block mb-2">
                <span className="label-highlight-optional">Message</span> <span className="normal-case tracking-normal font-normal text-ni-muted/70">(Optional)</span>
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                placeholder="Tell us about your requirement — product idea, moisture levels, particle size, certifications needed, etc."
                className={`${inputValid} resize-none`}
              />
            </div>

            {/* Inline error alert */}
            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40 px-5 py-4"
              >
                <span className="mt-0.5 flex-shrink-0 text-red-500 text-base" aria-hidden="true">⚠</span>
                <p className="font-body text-sm text-red-800 dark:text-red-300 leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full inline-flex items-center justify-center font-body font-bold text-xs uppercase tracking-widest px-8 py-4
                  bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-premium
                  transition-all duration-300 cursor-pointer rounded-full
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2.5 h-3.5 w-3.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending Inquiry...
                  </>
                ) : (
                  'Submit Inquiry →'
                )}
              </button>
              <p className="font-body text-xs text-ni-muted mt-3">
                We typically respond within 1 business day.
              </p>
            </div>

          </form>
        </div>

        {/* Right — contact info */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-[24px] p-8 shadow-premium hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
            <h2 className="font-heading text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-6">Contact Details</h2>

            <div className="space-y-6 font-body text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-2">Address</p>
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Nectar Ingredients<br/>
                  Shop No. 18 &amp; 19, Second Floor, Brahmanand Chamber<br/>
                  Opp. M.P. Shah Arts &amp; Science College, S.T. Road<br/>
                  Surendranagar, Gujarat 363001
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-2">Contact Persons</p>
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-semibold">Mehul Patel — +91 98798 38281</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-2">Phone</p>
                <a href="tel:+919879838281" className="text-neutral-600 dark:text-neutral-300 hover:text-ni-rust transition-colors duration-300">
                  +91 98798 38281
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-2">Email</p>
                <a href="mailto:nectaringredients@gmail.com" className="text-ni-rust hover:text-ni-rust-lt transition-colors duration-300">
                  nectaringredients@gmail.com
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-2">WhatsApp</p>
                <a href="https://wa.me/919879838281" className="text-ni-rust hover:text-ni-rust-lt transition-colors duration-300">
                  +91 98798 38281
                </a>
              </div>
            </div>

            {/* Sample policy */}
            <div className="bg-ni-surface2 border border-ni-border/30 p-5 mt-8 rounded-xl shadow-sm">
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-2">Sample Policy</p>
              <p className="font-body text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                1kg samples available for ₹350–₹600 depending on product. Sample cost is adjusted against your first bulk order.
              </p>
            </div>

            {/* Brochure download */}
            <div className="mt-8">
              <a
                href="/NECTAR_BROCHURE.pdf"
                download
                className="inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest text-[11px] text-ni-rust hover:bg-ni-rust hover:text-white border border-ni-rust px-5 py-3.5 transition-all duration-300 w-full justify-center rounded-full hover:shadow-card hover:-translate-y-0.5"
              >
                Download Full Brochure (PDF) ↓
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
