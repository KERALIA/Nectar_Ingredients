import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Nectar Ingredients Pvt. Ltd. direct customer checkout.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ni-bg pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 font-body text-sm text-ni-secondary leading-relaxed space-y-6">
        <div>
          <p className="text-xs font-bold text-ni-rust uppercase tracking-widest mb-2">LEGAL</p>
          <h1 className="font-heading text-display font-extrabold text-neutral-900 dark:text-neutral-50">
            Privacy Policy
          </h1>
          <p className="text-xs text-ni-muted mt-2">Last updated: July 15, 2026</p>
        </div>

        <hr className="border-ni-border/15" />

        <section className="space-y-3">
          <p>
            At <strong>Nectar Ingredients Pvt. Ltd.</strong>, we prioritize the protection of your privacy. This Privacy Policy details how we collect, use, and safe-guard your information when you register, sign in, or place orders on our direct checkout system (https://nectaringredients.vercel.app).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">1. Information We Collect</h2>
          <p>We collect only the essential details necessary to authenticate your account and fulfill your commercial orders:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Identity (Google Profile):</strong> When you sign in via Google OAuth, we collect your full name, email address, and profile picture URL.</li>
            <li><strong>Order Details:</strong> Delivery address, company/brand name, contact phone number, email address, and your item selection list (SKUs, quantities, and weights).</li>
            <li><strong>Transaction History:</strong> Paytm transaction reference IDs and payment status (we do not see or store credit card, debit card, or net banking numbers on our servers; these are handled entirely by Paytm).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">2. How We Use Your Data</h2>
          <p>We use the collected information for the following specific purposes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To verify your user session and maintain security settings.</li>
            <li>To process orders, verify payments via Paytm, and ship packages to your address.</li>
            <li>To generate dynamic invoice PDFs and send a single transactional confirmation email to your inbox.</li>
            <li>To notify our warehouse logistics team (via secure Telegram bot alerts) to pack and dispatch your shipment.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">3. Data Sharing & Third Parties</h2>
          <p>We do not sell or lease your personal information. We share data only with the following vetted third-party service providers required for business operations:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase:</strong> For secure database hosting and Google OAuth session management.</li>
            <li><strong>Paytm Payment Gateway:</strong> For processing online payments securely.</li>
            <li><strong>Brevo SMTP API:</strong> For dispatching your order confirmation emails and attaching invoice PDFs.</li>
            <li><strong>Telegram Bot:</strong> To send instant internal dispatch notifications to our operational team.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">4. Session Cookies</h2>
          <p>We use standard, secure HTTP-only cookies managed by Supabase to maintain your login session across browser sessions. These cookies do not track your browsing habits on third-party sites and are used purely for account authentication.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ni-primary">5. Contact Us</h2>
          <p>If you have any questions regarding this privacy statement, please contact us:</p>
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
