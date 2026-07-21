import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Nectar Ingredients Pvt. Ltd. direct customer checkout.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ni-bg pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 font-body text-sm text-ni-secondary leading-relaxed space-y-6">
        <div>
          <p className="text-xs font-bold text-ni-rust uppercase tracking-widest mb-2">LEGAL</p>
          <h1 className="font-heading text-display font-extrabold text-neutral-900 dark:text-neutral-50">
            Terms of Service
          </h1>
          <p className="text-xs text-ni-muted mt-2">Last updated: July 15, 2026</p>
        </div>

        <hr className="border-ni-border/15" />

        <section className="space-y-3">
          <p>
            Welcome to the direct ordering platform of <strong>Nectar Ingredients Pvt. Ltd.</strong> (https://nectaringredients.vercel.app). By registering an account, signing in with Google, or placing orders, you agree to comply with and be bound by the following Terms of Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">1. Account Registration & Security</h2>
          <p>To view live pricing and place orders, you must sign in using your Google Account. By using our service, you agree that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You are responsible for maintaining the confidentiality and security of your login session.</li>
            <li>You will provide accurate, current, and complete delivery and billing information.</li>
            <li>We reserve the right to suspend or terminate accounts that provide fraudulent or inaccurate details.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">2. Pricing, Market Rates & Discounts</h2>
          <p>Our pricing model is calculated dynamically inside our checkout system based on real-time parameters:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Live Market Fluctuations:</strong> Dehydrated agricultural and herbal powders are commodities subject to direct market volatility. Accordingly, prices for some or all items may drop or rise dynamically without prior notice. The price displayed at the exact time of checkout is final.</li>
            <li><strong>Payment Mode Discounts:</strong> Processing discounts are applied automatically at the checkout screen depending on your selected payment method (UPI, Debit Card, Credit Card, or Net Banking) to incentivize low-overhead transactions.</li>
            <li><strong>UPI Limits:</strong> Due to payment network restrictions, UPI payment is strictly unavailable for orders with a list total of ₹95,000 or above.</li>
            <li>All prices are displayed in Indian Rupees (INR / ₹).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">3. No Refund & No Return Policy</h2>
          <p>Due to the consumable nature of our food-grade dehydrated powders and strict quality control standards, all direct checkouts are subject to a strict fulfillment policy:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>All Sales Are Final:</strong> Once an order is successfully placed and payment is initiated, the transaction is strictly non-refundable and non-cancellable.</li>
            <li><strong>Non-Returnable:</strong> Dispatched items are strictly non-returnable. We advise all customers to double-check their technical specifications, mesh sizing, and product requirements carefully before finalizing payment.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">4. Payments & Paytm Webhooks</h2>
          <p>All direct payments are processed securely through Paytm. An order is only considered finalized and marked as `paid` once we receive an authorized webhook callback from Paytm. In the event of network delays or gateway timeout, order dispatch will be held until the transaction status is confirmed.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">5. Shipping & Delivery</h2>
          <p>All orders are packaged and dispatched from our manufacturing facility in Surendranagar, Gujarat:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Minimum Order Quantity (MOQ):</strong> We enforce a minimum order quantity of 1 kg per product at the cart level.</li>
            <li><strong>Verification:</strong> Upon successful payment confirmation, we generate a PDF invoice containing a digital verification stamp and email it to you.</li>
            <li><strong>Delivery Timelines:</strong> Dispatch details and estimated shipping times will be updated in your `/account` order history dashboard.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">6. Governing Law & Jurisdiction</h2>
          <p>These Terms of Service and any purchase contracts made through the website shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts located in Gujarat, India.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">7. Contact Information</h2>
          <p>For legal inquiries, contract support, or wholesale questions, reach out to us:</p>
          <p className="pl-4 border-l-2 border-ni-rust text-xs">
            <strong>Nectar Ingredients Pvt. Ltd.</strong><br />
            Surendranagar, Gujarat, India<br />
            Email: <a href="mailto:nectaringredients@gmail.com" className="underline hover:text-ni-rust">nectaringredients@gmail.com</a><br />
            Phone: +91 98798 38281
          </p>
        </section>
      </div>
    </div>
  )
}
