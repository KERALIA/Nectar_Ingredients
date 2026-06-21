'use client'

import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import { products } from '../../lib/data'

const inputClass = 'bg-ni-surface border border-ni-border focus:border-ni-rust outline-none px-4 py-3 text-sm font-body text-ni-primary w-full transition-colors duration-200 rounded-none'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [productInterest, setProductInterest] = useState('')
  const [quantity, setQuantity] = useState('')
  const [message, setMessage] = useState('')

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

        {/* Left — form (3/5 width on desktop) */}
        <div className="lg:col-span-3">
          <div className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputClass} />
              </div>
              <div>
                <label className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">Company / Brand</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Your company" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
            </div>

            <div>
              <label className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">Product Interest</label>
              <select value={productInterest} onChange={e => setProductInterest(e.target.value)} className={inputClass}>
                <option value="">Select a powder...</option>
                {products.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                <option value="multiple">Multiple products</option>
              </select>
            </div>

            <div>
              <label className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">Quantity Required</label>
              <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 25kg, 100kg/month" className={inputClass} />
            </div>

            <div>
              <label className="font-body text-xs text-ni-muted uppercase tracking-widest block mb-2">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Tell us about your product and requirements..." className={`${inputClass} resize-none`} />
            </div>

            <div className="pt-2">
              <Button variant="primary" size="lg" className="w-full justify-center" type="button">Send Inquiry →</Button>
              <p className="font-body text-xs text-ni-muted mt-3">We typically respond within 1 business day.</p>
            </div>

          </div>
        </div>

        {/* Right — contact info (2/5 width on desktop) */}
        <div className="lg:col-span-2">

          <div className="bg-ni-surface p-8">
            <h3 className="font-heading text-lg font-semibold text-ni-primary mb-6">Contact Details</h3>

            <div className="space-y-4 font-body text-sm">
              <div>
                <p className="text-xs text-ni-muted uppercase tracking-widest mb-1">Address</p>
                <p className="text-ni-secondary leading-relaxed">
                  Nectar Ingredients Pvt. Ltd.<br/>
                  GIDC Industrial Estate<br/>
                  Surendranagar, Gujarat 363002
                </p>
              </div>
              <div>
                <p className="text-xs text-ni-muted uppercase tracking-widest mb-1">Email</p>
                <a href="mailto:hello@nectaringredients.com" className="text-ni-rust hover:text-ni-rust-lt transition-colors">
                  hello@nectaringredients.com
                </a>
              </div>
              <div>
                <p className="text-xs text-ni-muted uppercase tracking-widest mb-1">WhatsApp</p>
                <p className="text-ni-secondary">+91 94270 XXXXX</p>
              </div>
            </div>

            {/* Sample policy box */}
            <div className="bg-ni-rust-bg border border-ni-rust-dim p-5 mt-8">
              <p className="font-body text-sm font-medium text-ni-rust mb-2">Sample Policy</p>
              <p className="font-body text-sm text-ni-muted leading-relaxed">
                1kg samples available for ₹350–₹600 depending on product. Sample cost is adjusted against your first bulk order.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}