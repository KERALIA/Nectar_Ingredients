'use client'

import React, { useState, useEffect, useRef } from 'react'
import { products } from '../../lib/data'
import { useSampleBasket } from '../../context/SampleBasketContext'
import OrderBanner from '@/components/ui/OrderBanner'
import CountryPhoneInput from '@/components/ui/CountryPhoneInput'

import { validateName, validateEmail, validatePhone, validateAddress } from '@/lib/validation'

// ─── Styling helpers ────────────────────────────────────────────────────────
const inputBase = 'bg-ni-surface dark:bg-[#1A1A1D] border px-4 py-3.5 text-base font-body text-ni-primary w-full transition-all duration-300 rounded-2xl outline-none focus:ring-2 focus:ring-ni-rust/50 shadow-sm'
const inputValid   = `${inputBase} border-ni-border/30 dark:border-white/10 focus:border-ni-rust`
const inputInvalid = `${inputBase} border-red-500 focus:border-red-400 focus:ring-red-400`

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
  const nameRes = validateName(name)
  if (!nameRes.isValid) errors.name = nameRes.error

  const emailRes = validateEmail(email)
  if (!emailRes.isValid) errors.email = emailRes.error

  const phoneRes = validatePhone(phone)
  if (!phoneRes.isValid) errors.phone = phoneRes.error

  const addressRes = validateAddress(address)
  if (!addressRes.isValid) errors.address = addressRes.error

  if (basketCount === 0) errors.product = 'Please select at least one product sample.'
  return errors
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p role="alert" className="font-body text-xs text-red-500 mt-1.5 flex items-center gap-1">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>{msg}</span>
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
  const [categoryFilter,  setCategoryFilter]  = useState<'all' | 'vegetable' | 'fruit' | 'spice'>('all')
  const [mounted,         setMounted]         = useState(false)

  // Validation state
  const [errors,    setErrors]    = useState<FormErrors>({})
  const [touched,   setTouched]   = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  // Submission state
  const [isSubmitting,    setIsSubmitting]    = useState(false)
  const [errorMessage,    setErrorMessage]    = useState<string | null>(null)
  const [successMessage,  setSuccessMessage]  = useState<string | null>(null)
  const [orderRef,        setOrderRef]        = useState<string | null>(null)
  const [copiedRef,       setCopiedRef]       = useState(false)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  useEffect(() => {
    if (submitted) {
      setErrors(validate(name, email, phone, address, mounted ? basket.length : 0))
    }
  }, [name, email, phone, address, basket, mounted, submitted])

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
    const matchesSearch = !productFilter.trim() ||
      p.name.toLowerCase().includes(productFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(productFilter.toLowerCase()) ||
      p.sku.toLowerCase().includes(productFilter.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleCopyRef = () => {
    if (!orderRef) return
    navigator.clipboard.writeText(orderRef)
    setCopiedRef(true)
    setTimeout(() => setCopiedRef(false), 2500)
  }

  const handleOpenChatWithRef = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-nectar-chat', {
        detail: { message: orderRef ? `Track status for inquiry ${orderRef}` : 'Track inquiry status' }
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    setOrderRef(null)

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
        if (data.orderRef) {
          setOrderRef(data.orderRef)
        }
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

        // Auto-scroll smoothly down to the success box below the submit button
        setTimeout(() => {
          successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 120)
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
    <div className="pt-24 bg-ni-bg min-h-screen" data-no-swipe>

      {/* Page Header */}
      <div className="border-b border-ni-border/20 relative overflow-hidden bg-gradient-to-b from-ni-surface2/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-ni-surface border border-ni-border/30 text-ni-rust font-body text-xs font-medium mb-4">
            <span>Direct contact &amp; commercial inquiries</span>
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

          <form noValidate onSubmit={handleSubmit} className="space-y-6">

            {/* Name + Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className="font-body text-xs sm:text-sm font-semibold text-ni-primary block mb-2">
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
                <label htmlFor="contact-company" className="font-body text-xs sm:text-sm font-semibold text-ni-primary block mb-2">
                  Company / Brand <span className="text-ni-muted font-normal">(Optional)</span>
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
                <label htmlFor="contact-email" className="font-body text-xs sm:text-sm font-semibold text-ni-primary block mb-2">
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
                <label htmlFor="contact-phone" className="font-body text-xs sm:text-sm font-semibold text-ni-primary block mb-2">
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
                <label className="font-body text-xs sm:text-sm font-semibold text-ni-primary">
                  Select Ingredients / Order Items <span className="text-ni-rust">*</span>
                </label>
                {mounted && totalItems > 0 && (
                  <span className="font-body text-xs font-semibold text-ni-rust">
                    ({totalItems} selected)
                  </span>
                )}
              </div>

              {/* Quick Category Filter Chips */}
              <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto scrollbar-hide py-1">
                {[
                  { label: 'All (40)', value: 'all' },
                  { label: 'Vegetables', value: 'vegetable' },
                  { label: 'Fruits', value: 'fruit' },
                  { label: 'Spices & Herbs', value: 'spice' },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategoryFilter(cat.value as any)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-body font-medium transition-colors cursor-pointer ${
                      categoryFilter === cat.value
                        ? 'bg-ni-rust text-white shadow-xs'
                        : 'bg-ni-surface2 text-ni-secondary hover:text-ni-primary border border-ni-border/20'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Product Filter Search */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={productFilter}
                  onChange={e => setProductFilter(e.target.value)}
                  placeholder="Filter powders by name or sku..."
                  className="w-full bg-ni-surface border border-ni-border/30 px-4 py-2.5 pr-9 text-sm text-ni-primary rounded-xl outline-none focus:ring-2 focus:ring-ni-rust/50"
                />
                {productFilter && (
                  <button
                    type="button"
                    onClick={() => setProductFilter('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ni-muted hover:text-ni-primary text-xs font-bold p-1 cursor-pointer"
                    aria-label="Clear filter"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Scrollable Checkbox Grid */}
              <div
                id="contact-product"
                className={`rounded-2xl border overflow-hidden ${
                  showError('product') ? 'border-red-500' : 'border-ni-border/30'
                }`}
              >
                <div
                  data-lenis-prevent="true"
                  className="max-h-60 overflow-y-auto bg-ni-surface grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-ni-border/10 lenis-prevent"
                  style={{ touchAction: 'pan-y', overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch' }}
                >
                  {filteredProducts.map((p) => {
                    const isSelected = mounted && basket.some(i => i.id === p.id)
                    const basketItem = mounted ? basket.find(i => i.id === p.id) : undefined
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3.5 transition-colors ${
                          isSelected ? 'bg-ni-rust/10 border-ni-rust/30' : 'hover:bg-ni-surface2/50'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            toggleBasket({ id: p.id, slug: p.slug, name: p.name, sku: p.sku, category: p.category })
                            handleBlur('product')
                          }}
                          className="flex items-center gap-3 text-left flex-1 min-w-0 py-1 cursor-pointer"
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors duration-150 flex-shrink-0 text-xs font-bold ${
                              isSelected ? 'bg-ni-rust border-ni-rust text-white shadow-sm' : 'border-ni-border bg-transparent'
                            }`}
                          >
                            {isSelected && '✓'}
                          </span>
                          <span className={`font-body text-sm truncate ${isSelected ? 'text-ni-rust font-bold' : 'text-ni-primary font-medium'}`}>
                            {p.name}
                          </span>
                        </button>

                        {isSelected && basketItem && (
                          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setItemQuantity(p.id, (basketItem.quantity ?? 1) - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-ni-surface2 text-ni-primary text-sm font-bold active:scale-95"
                            >
                              −
                            </button>
                            <span className="font-mono text-sm font-bold text-ni-rust w-6 text-center">
                              {basketItem.quantity ?? 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setItemQuantity(p.id, (basketItem.quantity ?? 1) + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-ni-surface2 text-ni-primary text-sm font-bold active:scale-95"
                            >
                              +
                            </button>
                            <span className="text-xs font-semibold text-ni-muted">kg</span>
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
              <label htmlFor="contact-address" className="font-body text-xs sm:text-sm font-semibold text-ni-primary block mb-2">
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
              <label htmlFor="contact-message" className="font-body text-xs sm:text-sm font-semibold text-ni-primary block mb-2">
                Special Specs / Custom Message <span className="text-ni-muted font-normal">(Optional)</span>
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
              <div role="alert" className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 font-body text-sm font-medium">
                {errorMessage}
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-body font-semibold text-sm py-4 rounded-xl bg-ni-rust text-white shadow-sm hover:bg-ni-rust-lt transition-colors duration-200 disabled:opacity-50 min-h-[52px] cursor-pointer touch-manipulation relative z-10"
            >
              {isSubmitting ? 'Submitting Inquiry...' : 'Submit Commercial Order Inquiry'}
            </button>

            {/* Success Card with Reference Number and Chatbot Tracking Instructions Below Submit Button */}
            {successMessage && (
              <div
                ref={successRef}
                role="status"
                className="mt-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/15 via-emerald-500/10 to-emerald-500/5 p-6 text-emerald-950 dark:text-emerald-50 shadow-lg space-y-4 motion-safe:animate-fade-in"
              >
                {/* Header Icon + Title */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-emerald-800 dark:text-emerald-300">
                      Inquiry Successfully Received
                    </h3>
                    <p className="font-body text-xs sm:text-sm text-emerald-700 dark:text-emerald-200 mt-1 leading-relaxed">
                      {successMessage}
                    </p>
                  </div>
                </div>

                {/* Reference ID Pill & Copy Box */}
                {orderRef && (
                  <div className="p-4 rounded-xl bg-white/80 dark:bg-black/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-body text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                        Inquiry Reference Number
                      </span>
                      <span className="font-mono text-base sm:text-lg font-bold text-ni-rust dark:text-amber-400 tracking-wide select-all">
                        {orderRef}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyRef}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium font-body transition-colors cursor-pointer"
                    >
                      {copiedRef ? (
                        <>
                          <span>✓</span>
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy Ref ID</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Instructions Box */}
                <div className="rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/20 text-xs leading-relaxed space-y-1.5">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                    Save Your Reference Number:
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-300">
                    Please copy this reference number (<strong className="font-mono text-emerald-900 dark:text-white">{orderRef || 'NEC-...'}</strong>) or save it for updates. You can give this reference number to our chat assistant at any time to check status.
                  </p>
                </div>

                {/* Quick Action Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleOpenChatWithRef}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-ni-rust hover:bg-ni-rust-lt text-white font-body text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Track in Chatbot</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Info Sidebar */}
        <div className="lg:col-span-2">
          <div className="p-7 sm:p-8 rounded-2xl border border-ni-border/30 bg-ni-surface space-y-7 sticky top-28">
            <div>
              <h3 className="font-heading text-xl font-bold text-ni-primary mb-3">Head Office &amp; Facility</h3>
              <p className="font-body text-sm text-ni-secondary leading-relaxed">
                Nectar Ingredients<br />
                Shop No. 18 &amp; 19, Second Floor, Brahmanand Chamber<br />
                Opp. M.P. Shah Arts &amp; Science College, S.T. Road<br />
                Surendranagar, Gujarat 363001, India
              </p>
            </div>

            <div className="space-y-4 font-body border-t border-ni-border/20 pt-5 text-sm">
              <div>
                <p className="font-medium text-ni-rust text-xs mb-0.5">Key Contact Person</p>
                <p className="font-bold text-ni-primary">Mehul Patel</p>
              </div>

              <div>
                <p className="font-medium text-ni-rust text-xs mb-0.5">Direct Call &amp; WhatsApp</p>
                <a href="https://wa.me/919879838281" className="text-ni-primary hover:text-ni-rust font-bold transition-colors inline-block">
                  +91 98798 38281
                </a>
              </div>

              <div>
                <p className="font-medium text-ni-rust text-xs mb-0.5">Commercial Email</p>
                <a href="mailto:nectaringredients@gmail.com" className="text-ni-rust font-bold hover:underline inline-block">
                  nectaringredients@gmail.com
                </a>
              </div>
            </div>

            {/* Order & Trial Policy */}
            <div className="p-5 rounded-xl bg-ni-bg border border-ni-border/20">
              <p className="font-body text-xs font-semibold text-ni-rust mb-1.5">Order &amp; Trial Policy</p>
              <p className="font-body text-xs sm:text-sm text-ni-secondary leading-relaxed">
                1 kg commercial trial packs dispatched for ₹350 to ₹600 per powder. Trial fee is 100% credited against your first commercial bulk order.
              </p>
            </div>

            {/* PDF Brochure */}
            <a
              href="/NECTAR_BROCHURE.pdf"
              download
              className="inline-flex items-center justify-center gap-2 font-body text-xs sm:text-sm font-semibold text-ni-rust border border-ni-rust px-5 py-3 rounded-xl hover:bg-ni-rust hover:text-white transition-colors w-full text-center"
            >
              Download Full Brochure (PDF)
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
