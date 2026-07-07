'use client'

import React, { useState, useEffect } from 'react'
import { products } from '../../lib/data'
import { useSampleBasket } from '../../context/SampleBasketContext'

// ─── Styling helpers ────────────────────────────────────────────────────────
const inputBase = 'bg-ni-surface border px-4 py-3 text-base sm:text-sm font-body text-ni-primary w-full transition-colors duration-200 rounded-none outline-none'
const inputValid   = `${inputBase} border-ni-border focus:border-ni-rust`
const inputInvalid = `${inputBase} border-red-500 focus:border-red-400`

// ─── Validation helpers ──────────────────────────────────────────────────────
const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

interface FormErrors {
  name?: string
  email?: string
  product?: string
}

function validate(
  name: string,
  email: string,
  hasBasketItems: boolean,
  productInterest: string,
): FormErrors {
  const errors: FormErrors = {}
  if (!name.trim())           errors.name    = 'Your name is required.'
  if (!email.trim())          errors.email   = 'Email address is required.'
  else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.'
  if (!hasBasketItems && !productInterest)
                              errors.product = 'Please select at least one product.'
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

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const { basket, totalItems, clearBasket, removeFromBasket } = useSampleBasket()

  const [name,            setName]            = useState('')
  const [company,         setCompany]         = useState('')
  const [email,           setEmail]           = useState('')
  const [productInterest, setProductInterest] = useState('')
  const [quantity,        setQuantity]        = useState('')
  const [message,         setMessage]         = useState('')
  const [mounted,         setMounted]         = useState(false)

  // Validation state
  const [errors,    setErrors]    = useState<FormErrors>({})
  const [touched,   setTouched]   = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  // Hydration guard — avoid SSR mismatch on basket-dependent UI
  useEffect(() => { setMounted(true) }, [])

  // Mark a field as touched when the user leaves it (blur)
  const handleBlur = (field: string) =>
    setTouched(prev => ({ ...prev, [field]: true }))

  // Re-validate whenever relevant state changes (after first submit attempt)
  useEffect(() => {
    if (submitted) {
      const hasBasketItems = mounted && basket.length > 0
      setErrors(validate(name, email, hasBasketItems, productInterest))
    }
  }, [name, email, productInterest, basket, mounted, submitted])

  const handleSendInquiry = () => {
    setSubmitted(true)
    const hasBasketItems = mounted && basket.length > 0
    const errs = validate(name, email, hasBasketItems, productInterest)
    setErrors(errs)

    // Stop if there are any validation errors
    if (Object.keys(errs).length > 0) {
      // Focus the first errored field for accessibility
      const firstErrId = errs.name
        ? 'contact-name'
        : errs.email
        ? 'contact-email'
        : 'contact-product'
      document.getElementById(firstErrId)?.focus()
      return
    }

    // Build WhatsApp message as a plain string, single encodeURIComponent at end
    let msg = 'Hello Nectar Ingredients, I would like to inquire about:\n\n'

    if (hasBasketItems) {
      basket.forEach(item => {
        msg += `• ${item.name} (SKU: ${item.sku})\n`
      })
    } else if (productInterest) {
      const sel = products.find(p => p.slug === productInterest)
      msg += `• ${sel?.name || productInterest}\n`
    }

    msg += `\n---\n`
    msg += `Name: ${name.trim()}\n`
    msg += `Company: ${company.trim() || 'Not provided'}\n`
    msg += `Email: ${email.trim()}\n`
    if (quantity) msg += `Quantity: ${quantity.trim()}\n`
    if (message)  msg += `Message: ${message.trim()}\n`

    window.open(`https://wa.me/919879838281?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // Helpers to decide whether to show an error (only after touched or submitted)
  const showError = (field: keyof FormErrors) =>
    (touched[field] || submitted) ? errors[field] : undefined

  const inputClass = (field: keyof FormErrors) =>
    showError(field) ? inputInvalid : inputValid

  return (
    <div className="pt-16 bg-ni-bg min-h-screen">

      {/* Page header */}
      <div className="border-b border-ni-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <p className="font-body text-xs tracking-widest text-ni-rust uppercase mb-4">CONTACT</p>
          <h1 className="font-heading text-display font-semibold text-ni-primary">Let's talk powder.</h1>
        </div>
      </div>

      {/* Two column layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-5 gap-16">

        {/* Left — form */}
        <div className="lg:col-span-3">
          <form
            noValidate
            onSubmit={e => { e.preventDefault(); handleSendInquiry() }}
            aria-label="Inquiry form"
            className="space-y-5"
          >

            {/* Name + Company row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">
                  Name <span className="text-red-500" aria-hidden="true">*</span>
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
                <label htmlFor="contact-company" className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">
                  Company / Brand
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
              <label htmlFor="contact-email" className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">
                Email <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@company.com"
                className={inputClass('email')}
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!showError('email')}
                aria-describedby={showError('email') ? 'contact-email-error' : undefined}
              />
              <FieldError msg={showError('email')} />
              {showError('email') && <span id="contact-email-error" className="sr-only">{showError('email')}</span>}
            </div>

            {/* Product Interest */}
            <div>
              <label htmlFor="contact-product" className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">
                Product Interest{' '}
                {mounted && totalItems > 0
                  ? <span className="text-ni-rust">({totalItems} in Sample Box)</span>
                  : <span className="text-red-500" aria-hidden="true">*</span>
                }
              </label>

              {mounted && totalItems > 0 ? (
                <div
                  id="contact-product"
                  className="bg-ni-surface border border-ni-border p-4"
                  role="list"
                  aria-label="Selected products"
                >
                  {basket.map(item => (
                    <div key={item.id} role="listitem" className="flex items-center justify-between py-2 border-b border-ni-border last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-ni-rust flex-shrink-0" aria-hidden="true" />
                        <span className="font-body text-sm text-ni-primary">{item.name}</span>
                        <span className="font-mono text-[11px] text-ni-muted">{item.sku}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromBasket(item.id)}
                        className="font-body text-xs text-ni-muted hover:text-ni-rust transition-colors"
                        aria-label={`Remove ${item.name} from sample box`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={clearBasket}
                    className="mt-3 font-body text-xs text-ni-muted hover:text-ni-rust transition-colors"
                  >
                    Clear all items
                  </button>
                </div>
              ) : (
                <>
                  <select
                    id="contact-product"
                    value={productInterest}
                    onChange={e => { setProductInterest(e.target.value); handleBlur('product') }}
                    onBlur={() => handleBlur('product')}
                    className={inputClass('product')}
                    aria-required="true"
                    aria-invalid={!!showError('product')}
                    aria-describedby={showError('product') ? 'contact-product-error' : undefined}
                  >
                    <option value="">Select a powder...</option>
                    {products.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                    <option value="multiple">Multiple products</option>
                  </select>
                  <FieldError msg={showError('product')} />
                  {showError('product') && <span id="contact-product-error" className="sr-only">{showError('product')}</span>}
                </>
              )}

              {mounted && totalItems > 0 && (
                <p className="font-body text-xs text-ni-muted mt-2">
                  Items selected from the product catalog. You can remove items above or browse more products to add.
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="contact-quantity" className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">
                Quantity Required
              </label>
              <input
                id="contact-quantity"
                type="text"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="e.g. 25kg, 100kg/month"
                className={inputValid}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="contact-message" className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">
                Message
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                placeholder="Tell us about your product and requirements..."
                className={`${inputValid} resize-none`}
              />
            </div>

            {/* Required fields note */}
            <p className="font-body text-xs text-ni-muted">
              <span className="text-red-500">*</span> Required fields
            </p>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center font-body font-medium text-base px-8 py-4
                  bg-ni-rust text-white hover:bg-ni-rust-lt
                  transition-all duration-200 cursor-pointer
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Inquiry via WhatsApp →
              </button>
              <p className="font-body text-xs text-ni-muted mt-3">
                We typically respond within 1 business day.
              </p>
            </div>

          </form>
        </div>

        {/* Right — contact info */}
        <div className="lg:col-span-2">
          <div className="bg-ni-surface p-8">
            <h2 className="font-heading text-lg font-semibold text-ni-primary mb-6">Contact Details</h2>

            <div className="space-y-4 font-body text-sm">
              <div>
                <p className="text-xs text-ni-muted uppercase tracking-widest mb-1">Address</p>
                <p className="text-ni-secondary leading-relaxed">
                  Nectar Ingredients<br/>
                  Shop No. 18 &amp; 19, Second Floor, Brahmanand Chamber<br/>
                  Opp. M.P. Shah Arts &amp; Science College, S.T. Road<br/>
                  Surendranagar, Gujarat 363001
                </p>
              </div>
              <div>
                <p className="text-xs text-ni-muted uppercase tracking-widest mb-1">Contact Persons</p>
                <p className="text-ni-secondary">Mehul Patel — +91 98798 38281</p>
              </div>
              <div>
                <p className="text-xs text-ni-muted uppercase tracking-widest mb-1">Phone</p>
                <a href="tel:+919879838281" className="text-ni-secondary hover:text-ni-rust transition-colors">
                  +91 98798 38281
                </a>
              </div>
              <div>
                <p className="text-xs text-ni-muted uppercase tracking-widest mb-1">Email</p>
                <a href="mailto:hello@nectaringredients.com" className="text-ni-rust hover:text-ni-rust-lt transition-colors">
                  hello@nectaringredients.com
                </a>
              </div>
              <div>
                <p className="text-xs text-ni-muted uppercase tracking-widest mb-1">WhatsApp</p>
                <a href="https://wa.me/919879838281" className="text-ni-rust hover:text-ni-rust-lt transition-colors">
                  +91 98798 38281
                </a>
              </div>
            </div>

            {/* Sample policy */}
            <div className="bg-ni-rust-bg border border-ni-rust-dim p-5 mt-8">
              <p className="font-body text-sm font-medium text-ni-rust mb-2">Sample Policy</p>
              <p className="font-body text-sm text-ni-muted leading-relaxed">
                1kg samples available for ₹350–₹600 depending on product. Sample cost is adjusted against your first bulk order.
              </p>
            </div>

            {/* Brochure download */}
            <div className="mt-8">
              <a
                href="/Nectar_Ingredients_Brochure.pdf"
                download
                className="inline-flex items-center gap-2 font-body text-sm font-medium text-ni-rust hover:text-ni-rust-lt border border-ni-rust hover:bg-ni-rust hover:text-white px-5 py-2.5 transition-all duration-200 w-full justify-center"
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
