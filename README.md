# Nectar Ingredients – Digital B2B E-Commerce & Inquiry Platform

**Official website and digital B2B platform for Nectar Ingredients Pvt. Ltd.** — manufacturer of single-ingredient dehydrated vegetable, fruit, and spice powders based in Surendranagar, Gujarat, India. Est. 2011.

🌐 **Live site:** [nectaringredients.vercel.app](https://nectaringredients.vercel.app)

---

## 🚀 Overview

Nectar Ingredients supplies clean-label dehydrated powders to food businesses, nutraceutical companies, cloud kitchens, and home kitchens across India. No fillers, no additives — just concentrated, single-ingredient powder.

This repository contains the full source code for the B2B product catalog, automated inquiry pipeline, AI-powered customer assistant, and serverless backend integrations.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, `after()` Server API) |
| **Frontend** | React 19, TypeScript, [Tailwind CSS v3](https://tailwindcss.com/), GSAP, Lenis Smooth Scroll |
| **Database & Automation** | Google Sheets (via [Google Apps Script](https://developers.google.com/apps-script) Webhooks) |
| **AI Chatbot** | OpenCode Zen LLM with Function Tool Calling (`lookup_order`, `submit_new_order`) |
| **OCR & Processing** | NVIDIA OCR v2 API (10-minute automated cron receipt parsing) |
| **Email Infrastructure** | Brevo API (Custom Domain DNS authentication, 300 free daily emails) |
| **Notifications** | Telegram Bot API Webhooks |
| **Auth & Payments** | Supabase Auth (Google OAuth), Paytm / Razorpay & UPI Payment APIs (Pre-configured) |
| **SEO & Performance** | Dynamic OpenGraph, JSON-LD Structured Data, `sitemap.ts`, `robots.ts`, AVIF/WebP `next/image` |
| **Deployment** | Vercel (Edge Network) |

---

## ✨ Key Features & Architecture Highlights

### 🛒 B2B Product Catalog & Sample Basket
- **Interactive UI**: Slide-up/slide-in product drawer, horizontal swatch strip, and iOS safe-area optimizations.
- **Multi-Attribute Search & Filter**: Real-time filtering by category (Vegetables, Fruits, Spices), weight, mesh size, and SKU across all catalog items.
- **Sample Basket**: Add up to $N$ products and submit unified inquiry requests.
- **Theme Persistence**: System-aware Dark / Light mode with FOUC-free `localStorage` state.

### 🤖 AI Conversational Assistant (OpenCode Zen LLM)
- Integrated AI chatbot with real-time **Function Tool Calling**:
  - `lookup_order`: Fetches past customer orders and status using registered phone numbers or emails.
  - `submit_new_order`: Validates customer credentials, items, and address before triggering inquiry workflows.
- Built-in technical product knowledge base covering mesh fineness, harvest origins, active bio-compounds (curcumin, lycopene, capsaicin), and industrial applications.

### 📊 Google Sheets Cloud Storage & Apps Script Automation
- Replaced traditional SQL databases with a cost-effective Google Sheets architecture via Google Apps Script webhooks for unlimited storage scalability.
- Auto-generates client quotes tailored to customer inputs, custom UPI payment deep-links, QR codes, and bank transfer routing.
- Automatically generates and emails official **stamped PDF invoices** upon payment verification.

### ✉️ Brevo API Transactional Email Infrastructure
- Integrated Brevo API using custom domain DNS authentication.
- Reliably delivers up to 300 automated transactional emails per day (quotes, payment instructions, and PDF bills) without third-party payment gateway transaction fees.

### 🔍 NVIDIA OCR v2 Automated Receipt Processing
- Automated 10-minute cron pipeline scanning customer payment receipt screenshots uploaded via chat or email.
- Parses transaction reference numbers and payment details using the **NVIDIA OCR v2 API** to auto-update Google Sheets records without manual data entry.

### ⚡ Zero-Latency Server Background Tasks
- Utilizes Next.js 15 `after()` background execution to decouple user HTTP responses from slow third-party API calls.
- Triggers instant, zero-latency Telegram admin notifications whenever a new order or inquiry is submitted.

### 🎯 Top-Notch Per-Product SEO
- Individual per-product dynamic metadata generation.
- Full Open Graph social tags, JSON-LD schema markup, automated `sitemap.ts`, and `robots.ts` optimization.

### 🔐 Pre-Configured Future Modules (Preserved in Codebase)
- **Google OAuth (Supabase Auth)**: Implemented and tested Google Sign-In authentication; currently paused but preserved in the codebase for future user account deployment.
- **Paytm Payment & Online Billing Pipeline**: Built full online payment verification pipeline and automated online billing via Paytm API; retained in the codebase for future transaction processing.

---

## 📁 Project Structure

```
nectar-ingredients/
├── app/
│   ├── layout.tsx              # Root layout with Navbar, Footer, Providers
│   ├── globals.css             # Custom CSS tokens & Tailwind overrides
│   ├── page.tsx                # Home page
│   ├── about/page.tsx          # About page
│   ├── contact/page.tsx        # Contact & Inquiry form
│   ├── products/               # Products catalog & dynamic product pages
│   ├── checkout/               # Checkout flow
│   ├── api/
│   │   ├── chatbot/            # OpenCode Zen AI Chatbot with Tool Calling
│   │   ├── web-form-router/    # Next.js 15 after() async inquiry pipeline
│   │   └── payment/            # Payment gateway handlers
│   ├── robots.ts               # Automated robots.txt generation
│   └── sitemap.ts              # Automated sitemap generation
│
├── components/
│   ├── home/                   # Hero, StatsBar, SwatchStrip, ProcessSection
│   ├── layout/                 # Navbar, Footer
│   ├── products/               # ProductCard, ProductGrid, ProductDrawer
│   ├── checkout/               # CheckoutFlow, AddressStep, OrderSummary
│   └── ui/                     # Button, Tag, ThemeToggle, ChatWidget
│
├── context/
│   ├── SampleBasketContext.tsx
│   └── SearchContext.tsx
│
├── lib/
│   ├── data.ts                 # Product master dataset (SKUs, mesh, applications)
│   └── validation.ts           # Input verification (Email, Phone, Address)
│
├── appsscript.js               # Google Apps Script (Sheets logging & PDF bill generator)
└── types/                      # TypeScript type definitions
```

---

## 💻 Getting Started

### Prerequisites

- Node.js `>= 18.17.0`
- npm `>= 9`

### Installation

```bash
# Clone the repository
git clone https://github.com/KERALIA/Nectar_Ingredients.git
cd Nectar_Ingredients

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## 📬 Contact & Support

**Nectar Ingredients Pvt. Ltd.**  
Shop No. 18 & 19, Second Floor, Brahmanand Chamber  
Opp. M.P. Shah Arts & Science College, S.T. Road  
Surendranagar, Gujarat 363001, India  

📞 +91 98798 38281  
📧 hello@nectaringredients.com  
💬 [WhatsApp](https://wa.me/919879838281)  

---

## 📄 License

All rights reserved © Nectar Ingredients Pvt. Ltd.  
This source code is provided for reference and portfolio presentation.
