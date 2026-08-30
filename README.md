# 🌿 Nectar Ingredients – Digital B2B E-Commerce & Inquiry Platform

**Official website and digital B2B platform for Nectar Ingredients Pvt. Ltd.** — premier wholesale manufacturer of pure single-ingredient dehydrated vegetable, fruit, spice, and dairy powders based in Surendranagar, Gujarat, India. Est. 2021.

🌐 **Live Website:** [nectaringredients.vercel.app](https://nectaringredients.vercel.app)  
📦 **Product Catalog:** 40+ Pure Single-Source Dehydrated Powders  
🏭 **Manufacturing Unit:** Surendranagar, Gujarat, India  

---

## 📖 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [🤖 AI Conversational Assistant & In-Memory RAG Engine](#-ai-conversational-assistant--in-memory-rag-engine)
  - [1. In-Memory Pre-Retrieval RAG Engine](#1-in-memory-pre-retrieval-rag-engine)
  - [2. Official COA & Company Brochure Retrieval](#2-official-coa--company-brochure-retrieval)
  - [3. Function Tool Calling Pipeline](#3-function-tool-calling-pipeline)
  - [4. Multi-Order & Historical Tracking](#4-multi-order--historical-tracking)
  - [5. Resilient Multi-Model Fallback System](#5-resilient-multi-model-fallback-system)
  - [6. Strict Input Verification & Sales Routing](#6-strict-input-verification--sales-routing)
- [📊 Google Sheets Cloud Database & Apps Script Automation](#-google-sheets-cloud-database--apps-script-automation)
- [📱 Mobile Android & Desktop Performance Engineering](#-mobile-android--desktop-performance-engineering)
- [🛒 B2B Product Catalog & Sample Basket](#-b2b-product-catalog--sample-basket)
- [⚡ Asynchronous Background Tasks & Webhooks](#-asynchronous-background-tasks--webhooks)
- [🎯 SEO & Structured Data (JSON-LD)](#-seo--structured-data-json-ld)
- [📁 Project Structure](#-project-structure)
- [💻 Installation & Local Development](#-installation--local-development)
- [🔐 Environment Variables Configuration](#-environment-variables-configuration)
- [📬 Contact & Sales Information](#-contact--sales-information)
- [📄 License & Trademark](#-license--trademark)

---

## 🚀 Executive Overview

Nectar Ingredients manufactures single-source, additive-free dehydrated powders for industrial food processors, cloud kitchens, spice blenders, beverage formulators, and home kitchens across India. Every product is processed at low temperatures to preserve natural color, aroma, volatile oils, and bioactive compounds (lycopene, curcumin, allicin, gingerol).

This repository contains the complete production code for the B2B web application, dynamic catalog, AI-powered conversational sales consultant, Google Sheets cloud storage bridge, automated receipt processing, and transactional email infrastructure.

---

## 🏛️ System Architecture

```
                                  ┌──────────────────────────────┐
                                  │   Next.js 15 App (Vercel)    │
                                  │  React 19 + TypeScript + CSS │
                                  └──────────────┬───────────────┘
                                                 │
                  ┌──────────────────────────────┼──────────────────────────────┐
                  ▼                              ▼                              ▼
        ┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
        │  Product Catalog │           │  Sample Basket   │           │   Hero Parallax  │
        │ 40+ Items Grid   │           │ Multi-Item Cart  │           │ 120fps Lerp Flow │
        └──────────────────┘           └─────────┬────────┘           └──────────────────┘
                                                 │
                                                 ▼
        ┌────────────────────────────────────────────────────────────────────────────────┐
        │                          /api/chatbot & /api/web-form-router                   │
        │                  (Next.js Route Handlers with IPv4 Network Stack)              │
        └───────┬───────────────────────────────┬──────────────────────────────┬─────────┘
                │                               │                              │
                ▼                               ▼                              ▼
    ┌────────────────────────┐      ┌────────────────────────┐     ┌────────────────────────┐
    │ OpenCode Zen LLM Engine│      │  Google Apps Script    │     │ Telegram Bot API       │
    │ In-Memory RAG Indexer  │      │  Sheets DB & PDF Bills │     │ Zero-Latency Admin Msg │
    │ Real-time Tool Calling │      │  NVIDIA OCR v2 Parser  │     │ via next/server after()│
    └────────────────────────┘      └────────────────────────┘     └────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) / Next 16 (Turbopack) | App Router, Server Actions, Route Handlers, `after()` server API |
| **Frontend Core** | React 19, TypeScript | Server Components, Hooks, Context Providers |
| **Styling & Design** | Tailwind CSS v3 & Modern Vanilla CSS | Custom design tokens, dark/light theme, glassmorphism, responsive utilities |
| **Animation & Physics** | Custom rAF Lerp Loop & Lenis | 120fps GPU-composited background parallax, smooth momentum scroll |
| **AI / LLM Engine** | OpenCode Zen API | Multi-model candidate fallback, Function Tool Calling (`lookup_order`, `submit_new_order`) |
| **RAG Architecture** | In-Memory Pre-Retrieval Catalog RAG | Sub-millisecond indexed product specs, keyword scoring, COA PDF retrieval |
| **Cloud Database** | Google Sheets via Google Apps Script | Real-time order logging, status tracking, customer inquiries |
| **Receipt OCR** | NVIDIA OCR v2 API | 10-minute automated cron transaction receipt verification |
| **Email Infrastructure** | Brevo API & Apps Script Mailer | Custom domain DNS transactional emails, automated PDF invoice dispatch |
| **Notifications** | Telegram Bot API Webhooks | Real-time admin order & inquiry alert channel |
| **Payment Integration** | Dynamic UPI deep-links, QR generator | Custom VPA routing (`/pay` redirect) & Bank RTGS/NEFT wire details |
| **SEO & Schema** | Dynamic OpenGraph, JSON-LD, Sitemap | 27 static/dynamic routes, Product/Organization/FAQ schema markup |

---

## 🤖 AI Conversational Assistant & In-Memory RAG Engine

The platform features an intelligent AI Sales & Advisory Consultant (`/api/chatbot`) designed to provide instant product advice, technical specifications, order status tracking, and order intake.

```
                    ┌──────────────────────────────────────────────┐
                    │            User Chat Message                 │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │      In-Memory Pre-Retrieval RAG Engine      │
                    │   - Catalog Keyword & Specification Scoring  │
                    │   - Official Lab COA & Brochure Matching     │
                    └──────────────────────┬───────────────────────┘
                                           │ (<1ms)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │         Lean Augmented Prompt (~450T)        │
                    │  System Prompt + RAG Context + Turn History  │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │       OpenCode Zen Tool Calling Loop         │
                    ├──────────────────────┬───────────────────────┤
                    │   `lookup_order`     │   `submit_new_order`  │
                    │  (Google Sheets)     │ (Validation + Insert) │
                    └──────────────────────┴───────────────────────┘
```

### 1. In-Memory Pre-Retrieval RAG Engine
- **Sub-Millisecond Indexing**: Pre-indexes all 40+ standard products from `lib/data.ts` along with the `extendedRange` of made-to-order dehydrated botanicals.
- **Weighted Multi-Factor Keyword Scoring**: Evaluates product name, category, SKU, description, mesh size, and culinary/industrial applications to extract top-3 relevant product snippets.
- **Ultra-Lean Dynamic Prompt**: Keeps the system prompt around ~450 tokens, reducing latency to `<2s` per turn while eliminating LLM hallucination on mesh sizes and MOQ.

### 2. Official COA & Company Brochure Retrieval
The chatbot directly retrieves and delivers clickable download links for official laboratory Certificates of Analysis (COA) and company literature:
- `ALL REPORT.pdf`: Master batch analysis covering heavy metals, micro-biological safety, moisture (<8%), and mesh fineness.
- `tomato powder 12-8-2024.pdf`: Lycopene content and purity report.
- `Beetroot Powder coa.pdf`: Betalain pigment preservation and 80-mesh analysis.
- `Cheese Powder-A- COA.pdf`: Dairy specification and fat ratio test.
- `LIQUID CARAMEL.pdf`: Color intensity and specific gravity certificate.
- `SOUNTH.pdf`: Gingerol assay and volatile oil retention.
- `KOKUM.pdf`, `AJOWAIN.pdf`, `MULETHI.pdf`, `SENNA.pdf`, `HIMEJ.pdf`, `VIDANG.pdf`, `NISHOTH.pdf`, `WHITE NASOTAR.pdf`.
- `Nectar_Ingredients_Brochure.pdf`: Official 2026 Nectar Ingredients company profile and product range.

### 3. Function Tool Calling Pipeline
- **`lookup_order`**:
  - Parameters: `orderRef` (e.g., `NEC-20260815-122335`), `phone` (10-digit mobile), or `email`.
  - Communicates directly with the Google Apps Script webhook using resilient IPv4 HTTP requests with automated 301/302/307/308 redirect handling.
  - Returns real-time fulfillment status: `Received & Under Commercial Review`, `Payment Pending`, or `Dispatched 🚚`.
- **`submit_new_order`**:
  - Parameters: `name`, `email`, `phone`, `company`, `address`, `items`, `message`.
  - Performs strict real-time field validation (valid name length, RFC email standard, 10-digit Indian phone, and complete delivery address with 6-digit PIN code).
  - Automatically writes the order to Google Sheets and dispatches a background Telegram alert to the operations team.

### 4. Multi-Order & Historical Tracking
- When a customer inputs a phone number or email linked to multiple historical inquiries/orders, the assistant aggregates all records and presents them in a structured, sequential format:
  ```markdown
  📦 Found 2 active orders under your contact:
  1️⃣ Ref: NEC-20260815-122335 | 📌 Status: Dispatched 🚚
     • Items: Tomato Powder (25kg)
  2️⃣ Ref: NEC-20260810-091420 | 📌 Status: Under Commercial Review 📋
     • Items: Garlic Powder (50kg), Onion Powder (25kg)
  ```

### 5. Resilient Multi-Model Fallback System
To prevent downtime, the API client dynamically cycles through benchmarked LLM model endpoints:
1. `deepseek-v4-flash-free`
2. `mimo-v2.5-free`
3. `laguna-s-2.1-free`
4. `longcat-2.0-free`
5. `nemotron-3-ultra-free`

### 6. Strict Input Verification & Sales Routing
- **Anti-Repetition Engine**: Prevents echoing chat history or re-summarizing previous answers.
- **Direct Sales Links**: Automatically provides direct contact details for Key Account Manager (Mehul Patel, `+91 98798 38281`, [WhatsApp Link](https://wa.me/919879838281), [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com)).

---

## 📊 Google Sheets Cloud Database & Apps Script Automation

The backend leverages Google Sheets via Google Apps Script (`appsscript.js`) as a cost-efficient, human-readable cloud database.

- **Unified Webhook Router**: Handles both `POST` and `GET` requests with JSON payloads for order insertion, status lookup, and quote dispatch.
- **Automated Payment QR & Deep-Links**: Dynamically generates custom UPI payment intent URLs (`upi://pay?pa=...`) and routing through `/pay`.
- **Bank Transfer Wire Routing**: Supplies official State Bank of India (Surendranagar Main Branch) bank details for commercial orders $\ge$ ₹1,00,000.
- **Stamped PDF Invoice Generation**: Generates official PDF tax invoices with embedded Base64 company stamp and sends them via email upon order dispatch.
- **NVIDIA OCR v2 Automated Receipt Parser**: Runs on a 10-minute automated cron trigger to scan customer payment screenshots uploaded via chat or email, extract UTR/reference numbers, and mark orders as paid.

---

## 📱 Mobile Android & Desktop Performance Engineering

Extensive optimizations ensure buttery-smooth 60/120fps scrolling on Android Chrome, iOS Safari, and Desktop browsers.

1. **120fps Hardware-Accelerated Lerped Parallax (`Hero.tsx`)**:
   - Uses linear interpolation (`currentY += (targetY - currentY) * 0.12`) on `translate3d(0, y, 0)`.
   - Includes vertical container bleed (`-top-[12%] h-[124%]`) to eliminate edge clipping and empty black voids during kinetic scroll.
   - Decoupled from the main thread with no abrupt threshold cutoffs.
2. **Instant Pre-Emptive Section Rendering (`hooks.ts`, `ProductCard.tsx`)**:
   - Configured `useScrollReveal` with `rootMargin: '200px 0px'` and `useState(true)`.
   - Sections and product cards render instantly without blank transparent gaps or perceived scroll pauses.
3. **Decoupled Scroll Engine**:
   - Removed conflicting CSS `scroll-behavior: smooth` to eliminate double-smoothing stutter between browser kinetic touch scroll and Lenis wheel smoothing.
4. **Touch-Optimized Swatch Strip (`SwatchStrip.tsx`)**:
   - Features horizontal scrolling with `touch-action: pan-x` and native momentum `-webkit-overflow-scrolling: touch`.

---

## 🛒 B2B Product Catalog & Sample Basket

- **40+ Powder Varieties**: Vegetable (Tomato, Onion, Garlic, Beetroot, Spinach, Carrot), Fruit (Strawberry, Orange, Lemon, Pomegranate, Green Mango, Amla), Spice (Turmeric, Ginger, Annatto), and Dairy (Cheese, Butter, Curd).
- **Interactive Product Drawer**: Slide-in modal with technical specifications, particle mesh selection (40, 60, 80 mesh), harvest origin, moisture percentage, and packaging formats.
- **Sample Basket Context (`SampleBasketContext.tsx`)**: Allows adding up to $N$ sample varieties (1 kg trial packs or 25 kg commercial bags) and submitting a unified inquiry.
- **Debounced Instant Search (`SearchContext.tsx`)**: Client-side filtering by name, category, SKU, and applications with 300ms debounce.

---

## ⚡ Asynchronous Background Tasks & Webhooks

Utilizes Next.js 15 `after()` server API to decouple user response times from third-party webhook latency:
- **Instant Client Response**: HTTP 200 is returned to the user in `<100ms`.
- **Background Execution**:
  - Dispatches Telegram bot notifications with order items and address.
  - Posts records to Google Apps Script.
  - Sends transactional confirmation emails.

---

## 🎯 SEO & Structured Data (JSON-LD)

- **Metadata Generation**: Dynamic titles, descriptions, and Open Graph tags across 27 routes.
- **JSON-LD Schema**:
  - `Organization` (Nectar Ingredients Pvt. Ltd., Surendranagar, Gujarat)
  - `Product` (Per-SKU technical properties, availability, manufacturer)
  - `BreadcrumbList` (Hierarchical navigation)
  - `FAQPage` (Technical powders FAQ)
- **Automated Sitemaps**: Dynamic `sitemap.ts` and `robots.ts` indexing all active product slugs.

---

## 📁 Project Structure

```
Nectar_Ingredients/
├── app/
│   ├── layout.tsx                  # Root layout, theme script, providers, Navbar, Footer
│   ├── globals.css                 # Design tokens, dark mode, animations, scroll utilities
│   ├── page.tsx                    # Home page (Hero, StatsBar, SwatchStrip, Products, Process)
│   ├── about/page.tsx              # About Nectar Ingredients, facility, and farm sourcing
│   ├── contact/page.tsx            # Contact form & wholesale quote inquiry
│   ├── products/                   # Product catalog & dynamic slug routes
│   │   ├── page.tsx                # 40-product searchable grid & category filters
│   │   └── [slug]/page.tsx         # Dedicated product specification pages with SEO schema
│   ├── checkout/page.tsx           # Multi-step sample basket checkout flow
│   ├── pay/page.tsx                # Dynamic UPI payment routing & bank transfer instructions
│   ├── privacy/page.tsx            # Privacy policy
│   ├── terms/page.tsx              # Commercial terms & conditions
│   ├── api/
│   │   ├── chatbot/route.ts        # OpenCode Zen AI Chatbot with In-Memory RAG & Tools
│   │   ├── web-form-router/route.ts# Next.js 15 after() background inquiry pipeline
│   │   ├── admin/dispatch/route.ts # Order dispatch status handler
│   │   ├── payment/                # Payment webhook & verification handlers
│   │   └── sync-price/route.ts     # Real-time catalog price sync
│   ├── robots.ts                   # Automated robots.txt generator
│   └── sitemap.ts                  # Automated XML sitemap generator
│
├── components/
│   ├── home/                       # Hero.tsx, SwatchStrip.tsx, StatsBar.tsx, FeaturedProducts.tsx
│   │                               # B2BOverviewSection.tsx, B2BIndustrySolutions.tsx, ProcessSection.tsx
│   ├── products/                   # ProductCard.tsx, ProductGrid.tsx, ProductDrawer.tsx
│   ├── layout/                     # Navbar.tsx, Footer.tsx, MobileNav.tsx
│   ├── ui/                         # Button.tsx, SectionHeading.tsx, ThemeToggle.tsx, ChatWidget.jsx
│   └── providers/                  # SmoothScrollProvider.tsx, ThemeProvider.tsx
│
├── context/
│   ├── SampleBasketContext.tsx     # Sample cart state & localStorage persistence
│   └── SearchContext.tsx           # Global search query & category filter state
│
├── lib/
│   ├── data.ts                     # Master catalog dataset (40+ products, SKUs, mesh, applications)
│   ├── validation.ts               # Input validation (RFC email, 10-digit phone, complete address)
│   ├── hooks.ts                    # useScrollReveal, useDebounce custom hooks
│   └── supabase/                   # Supabase server & client database helpers
│
├── public/
│   ├── Certificates_of_ananalysis/ # Official batch COA lab reports (PDFs)
│   ├── Company_Brochure/           # Official Nectar Ingredients catalog brochure (PDF)
│   └── Images/                     # High-resolution WebP/PNG product flatlays & facility photos
│
├── appsscript.js                   # Google Apps Script (Sheets logging, PDF bill generator, OCR v2)
├── tailwind.config.ts              # Tailwind theme, typography, and color palette
├── next.config.ts                  # Next.js configuration (Turbopack, image domains)
└── tsconfig.json                   # TypeScript compiler configuration
```

---

## 💻 Installation & Local Development

### Prerequisites
- Node.js `>= 18.17.0` (Node 20+ recommended)
- npm `>= 9` or pnpm `>= 8`

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/KERALIA/Nectar_Ingredients.git
cd Nectar_Ingredients

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# (Fill in your OpenCode Zen API key, Google Apps Script URL, and Telegram tokens)

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Compile and build production bundle
npm run build

# Start production server
npm run start
```

---

## 🔐 Environment Variables Configuration

Create a `.env.local` file in the root directory:

```env
# AI Chatbot Engine
OPENCODE_ZEN_API_KEY=sk-gmdVSiR1KsbAOIwOT5txkEIqGMW5Q6a8BSAC0TWyvInJwkLLrz8yzChZCC1paxno

# Google Apps Script Cloud Database
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Telegram Admin Notifications
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ
TELEGRAM_CHAT_ID=123456789

# Optional: NVIDIA OCR v2 API (for receipt verification in Apps Script)
NVIDIA_API_KEY=nvapi-YOUR_NVIDIA_OCR_KEY

# Base URL
NEXT_PUBLIC_BASE_URL=https://nectaringredients.vercel.app
```

---

## 📬 Contact & Sales Information

**Nectar Ingredients Pvt. Ltd.**  
📍 **Office & Processing Unit:**  
Shop No. 18 & 19, Second Floor, Brahmanand Chamber  
Opp. M.P. Shah Arts & Science College, S.T. Road  
Surendranagar, Gujarat 363001, India  

- 👤 **Contact Person:** Mehul Patel (Key Account & Sales Director)
- 📞 **Direct Call / WhatsApp:** [+91 98798 38281](https://wa.me/919879838281)
- 📧 **Official Email:** [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com)
- 🌐 **Web:** [nectaringredients.vercel.app](https://nectaringredients.vercel.app)

---

## 📄 License & Trademark

All rights reserved © 2021–2026 **Nectar Ingredients Pvt. Ltd.**  
The Nectar Ingredients name, logo, product imagery, and technical documentation are proprietary assets.
