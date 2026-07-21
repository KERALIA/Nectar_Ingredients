# Nectar Ingredients — Customer Auth, Ordering & Payment System
## Master Specification Document
**Version:** 1.1 (Adjusted for corrected rates and admin UI)  
**Date:** 2026-07-19  
**Status:** APPROVED

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Database Schema](#2-database-schema)
3. [Pricing Model & Worked Examples](#3-pricing-model--worked-examples)
4. [Google Sheet → DB Price Sync Flow](#4-google-sheet--db-price-sync-flow)
5. [Order State Machine](#5-order-state-machine)
6. [Auth Flow (Supabase + Google OAuth)](#6-auth-flow-supabase--google-oauth)
7. [Environment Variable Manifest](#7-environment-variable-manifest)
8. [File Structure — New & Modified Files](#8-file-structure--new--modified-files)
9. [API Route Contracts](#9-api-route-contracts)
10. [Admin Portal Requirements](#10-admin-portal-requirements)

---

## 1. System Overview

### What We're Building

A complete customer-facing ordering system layered on top of the existing Nectar Ingredients marketing site:

- **Authentication:** Google OAuth via Supabase — single "Continue with Google" button.
- **Public pricing:** Live product prices displayed on the Products page, fetched from Postgres.
- **Cart & Checkout:** Separate from the existing SampleBasket — new CartContext with its own localStorage key.
- **Payment:** Paytm payment gateway (env vars left blank until credentials available; graceful fallback).
- **Bills:** Server-side PDF generation on payment confirmation, attached directly to Brevo transactional emails and rendered live from DB snapshot in `/account`.
- **Price management:** Client edits a Google Sheet → Apps Script pushes to our API → Supabase Postgres.
- **Admin Portal:** Secure admin dashboard at `/admin` to view orders, dispatch shipments, and review bills.

### What We're NOT Touching

| Existing asset | Status |
|---|---|
| `app/api/chatbot/route.ts` | Untouched |
| `app/api/web-form-router/route.ts` | Untouched |
| `app/pay/page.tsx` | Untouched |
| `app/contact/ContactClient.tsx` + `page.tsx` | Untouched (one additive banner only) |
| `app/page.tsx` (home), `app/about/page.tsx` | Untouched |
| `context/SampleBasketContext.tsx` | Untouched — no shared state with new cart |
| `context/SearchContext.tsx` | Untouched |
| `components/ChatWidget.jsx` | Untouched |

---

## 2. Database Schema

All tables live in the `public` schema of the Supabase Postgres database. Auth tables are managed by Supabase in the `auth` schema.

### 2.1 `product_prices` — Source of Truth for Pricing

```sql
-- product_prices: the ONLY source of truth for product pricing
-- Populated by the Google Sheet → sync-price API push flow
-- Read by Products page and Checkout flow
CREATE TABLE public.product_prices (
  sku         TEXT PRIMARY KEY,
  base_price  NUMERIC(12, 2) NOT NULL CHECK (base_price > 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read prices — this is a public catalog
CREATE POLICY "anyone_can_read_prices"
  ON public.product_prices
  FOR SELECT
  USING (true);

-- Only the service_role key (used by our server-side sync endpoint) can write
CREATE POLICY "service_role_writes_prices"
  ON public.product_prices
  FOR ALL
  USING (auth.role() = 'service_role');
```

### 2.2 `orders` — One Row Per Customer Order

```sql
CREATE TABLE public.orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Order contents: snapshot at time of order creation
  items                 JSONB NOT NULL,
  -- items schema: Array<{
  --   sku: string,
  --   name: string,
  --   qty_kg: number,
  --   base_price: number,    -- per kg, at time of order
  --   list_price: number,    -- per kg (base_price × 1.05)
  --   final_price: number    -- per kg after payment method discount
  -- }>
  
  delivery_address      TEXT NOT NULL,
  
  -- Payment
  payment_method        TEXT NOT NULL 
                        CHECK (payment_method IN ('upi', 'debit_card', 'credit_card', 'netbanking')),
  list_total            NUMERIC(12, 2) NOT NULL,
  payment_discount_pct  NUMERIC(6, 5) NOT NULL,  -- e.g. 0.04750 for 4.75%
  final_total           NUMERIC(12, 2) NOT NULL,
  
  -- Order lifecycle
  status                TEXT NOT NULL DEFAULT 'pending_payment_setup'
                        CHECK (status IN (
                          'pending_payment_setup',  -- Paytm env not configured
                          'pending_payment',         -- Awaiting Paytm callback
                          'paid',                    -- Payment confirmed
                          'dispatched',              -- Shipped
                          'failed'                   -- Payment failed / declined
                        )),
  
  -- Paytm references (nullable until payment flow completes)
  paytm_order_id        TEXT,
  paytm_transaction_id  TEXT,
  
  -- Bill (populated after payment confirmation)
  bill_data             JSONB,      -- Full bill snapshot for on-site rendering
  
  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_paytm_order_id ON public.orders(paytm_order_id) 
  WHERE paytm_order_id IS NOT NULL;

-- Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can only view their own orders
CREATE POLICY "users_view_own_orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

-- Users can only create orders for themselves
CREATE POLICY "users_insert_own_orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only service_role can update orders (payment webhook, dispatch status)
CREATE POLICY "service_role_updates_orders"
  ON public.orders
  FOR UPDATE
  USING (auth.role() = 'service_role');
```

---

## 3. Pricing Model & Worked Examples

### 3.1 Constants (will live in `lib/pricing.ts`)

```typescript
export type PaymentMethod = 'upi' | 'debit_card' | 'credit_card' | 'netbanking'

export const MARKUP_FACTOR = 1.05            // 5% over base_price → list_price
export const UPI_THRESHOLD = 95_000          // ₹ — UPI unavailable at or above this

// Corrected discounts to prevent merchant absorption:
// UPI is scaled to 4.75% to net exactly base_price (1.05 × 0.9525 = 1.000125)
// Other tiers scaled proportionally in the same direction by factor of 0.95
export const PAYMENT_DISCOUNTS: Record<PaymentMethod, number> = {
  upi:         0.04750,    // 4.75% off list (nets to base cost)
  debit_card:  0.03800,    // 3.80% off list
  credit_card: 0.02375,    // 2.375% off list
  netbanking:  0.02375,    // 2.375% off list
}
```

### 3.2 Formulas

```
list_price_per_kg  = base_price × MARKUP_FACTOR
list_total         = Σ (list_price_per_kg × qty_kg)  for each cart item
discount_amount    = list_total × PAYMENT_DISCOUNTS[method]
final_total        = list_total − discount_amount
                   = list_total × (1 − PAYMENT_DISCOUNTS[method])
```

### 3.3 Worked Example A — Below UPI Threshold (₹95,000)

**Scenario:** Single product, base_price = ₹1,000/kg, order = 50 kg

| Step | Calculation | Value |
|---|---|---|
| base_price/kg | Given | ₹1,000.00 |
| list_price/kg | ₹1,000 × 1.05 | ₹1,050.00 |
| list_total | ₹1,050 × 50 | **₹52,500.00** |

Since ₹52,500 < ₹95,000 → **all four payment methods available:**

| Payment Method | Discount % | Discount Amount | Final Total |
|---|---|---|---|
| **UPI** | 4.75% | ₹2,493.75 | **₹50,006.25** |
| **Debit Card** | 3.80% | ₹1,995.00 | **₹50,505.00** |
| **Credit Card** | 2.375% | ₹1,246.88 | **₹51,253.13** |
| **Netbanking** | 2.375% | ₹1,246.88 | **₹51,253.13** |

*Note: UPI nets almost exactly to base_price (₹50,000.00) with a nominal difference of only ₹6.25 (0.0125%).*

### 3.4 Worked Example B — Above UPI Threshold (₹95,000)

**Scenario:** Single product, base_price = ₹2,500/kg, order = 40 kg

| Step | Calculation | Value |
|---|---|---|
| base_price/kg | Given | ₹2,500.00 |
| list_price/kg | ₹2,500 × 1.05 | ₹2,625.00 |
| list_total | ₹2,625 × 40 | **₹105,000.00** |

Since ₹105,000 ≥ ₹95,000 → **UPI is NOT available:**

| Payment Method | Discount % | Discount Amount | Final Total | Available? |
|---|---|---|---|---|
| **UPI** | 4.75% | — | — | ❌ No (at/above ₹95k) |
| **Debit Card** | 3.80% | ₹3,990.00 | **₹101,010.00** | ✅ Yes |
| **Credit Card** | 2.375% | ₹2,493.75 | **₹102,506.25** | ✅ Yes |
| **Netbanking** | 2.375% | ₹2,493.75 | **₹102,506.25** | ✅ Yes |

### 3.5 Worked Example C — Multi-item Cart, Near UPI Threshold

**Scenario:** 2 products in cart
- Product A: base_price = ₹800/kg, qty = 50 kg → list_price = ₹840/kg → line total = ₹42,000.00
- Product B: base_price = ₹1,200/kg, qty = 40 kg → list_price = ₹1,260/kg → line total = ₹50,400.00

| Step | Calculation | Value |
|---|---|---|
| list_total | ₹42,000 + ₹50,400 | **₹92,400.00** |

Since ₹92,400 < ₹95,000 → **all four methods available.**

| Payment Method | Discount % | Discount Amount | Final Total |
|---|---|---|---|
| **UPI** | 4.75% | ₹4,389.00 | **₹88,011.00** |
| **Debit Card** | 3.80% | ₹3,511.20 | **₹88,888.80** |
| **Credit Card** | 2.375% | ₹2,194.50 | **₹90,205.50** |
| **Netbanking** | 2.375% | ₹2,194.50 | **₹90,205.50** |

---

## 4. Google Sheet → DB Price Sync Flow

Identical to Spec v1.0. Endpoint `POST /api/sync-price` handles validation and secure upsert to Postgres.

---

## 5. Order State Machine

Identical to Spec v1.0. Checkouts without Paytm env vars default to `pending_payment_setup`. Real webhook transition confirms payment to `paid`.

---

## 6. Auth Flow (Supabase + Google OAuth)

Supabase-managed OAuth utilizing `@supabase/ssr` cookies and Next.js middleware token refresh.

---

## 7. Environment Variable Manifest

| # | Variable | Secret? | Prefix | Where to Set | Purpose |
|---|---|---|---|---|---|
| 1 | `NEXT_PUBLIC_SUPABASE_URL` | No | `NEXT_PUBLIC_` | `.env.local` + Vercel | Supabase URL |
| 2 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | `NEXT_PUBLIC_` | `.env.local` + Vercel | Supabase anon key |
| 3 | `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | None | `.env.local` + Vercel | Supabase service role key (secret) |
| 4 | `PRICE_SYNC_SECRET` | **Yes** | None | `.env.local` + Vercel + Script | Shared secret for Price Sync |
| 5 | `BREVO_API_KEY` | **Yes** | None | `.env.local` (blank) + Vercel | Brevo SMTP API Key for email sending |
| 6 | `PAYTM_MERCHANT_ID` | **Yes** | None | `.env.local` (blank) + Vercel | Paytm Merchant ID |
| 7 | `PAYTM_MERCHANT_KEY` | **Yes** | None | `.env.local` (blank) + Vercel | Paytm Merchant Key |
| 8 | `PAYTM_WEBSITE` | No | None | `.env.local` (blank) + Vercel | Paytm website identifier |
| 9 | `PAYTM_INDUSTRY_TYPE` | No | None | `.env.local` (blank) + Vercel | Paytm industry type |
| 10 | `PAYTM_CHANNEL_ID` | No | None | `.env.local` (blank) + Vercel | Paytm channel ID |
| 11 | `TELEGRAM_BOT_TOKEN` | **Yes** | None | Already in Vercel | Existing chatbot bot token |
| 12 | `TELEGRAM_CHAT_ID` | No | None | Already in Vercel | Existing chatbot chat ID |
| 13 | `GOOGLE_APPS_SCRIPT_URL` | No | None | Already in Vercel | Existing app form sync URL |
| 14 | `OPENCODE_ZEN_API_KEY` | **Yes** | None | Already in Vercel | Existing chatbot API Key |

---

## 8. File Structure — New & Modified Files

### 8.1 New Files

```
Nectar_Ingredients-main/
├── middleware.ts                           ← NEW: Supabase session refresh
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      ← NEW: Browser Supabase client
│   │   ├── server.ts                      ← NEW: Server Supabase client
│   │   └── middleware.ts                  ← NEW: Middleware helper
│   └── pricing.ts                         ← NEW: All pricing constants & helpers
├── context/
│   └── CartContext.tsx                     ← NEW: Shopping cart (separate from SampleBasket)
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts                   ← NEW: OAuth callback handler
│   ├── account/
│   │   └── page.tsx                       ← NEW: Order history dashboard
│   ├── checkout/
│   │   └── page.tsx                       ← NEW: Checkout page
│   ├── admin/
│   │   └── page.tsx                       ← NEW: Private Admin Order Panel
│   └── api/
│       ├── sync-price/
│       │   └── route.ts                   ← NEW: Google Sheet → DB price sync
│       └── payment/
│           ├── initiate/
│           │   └── route.ts              ← NEW: Create Paytm transaction
│           └── webhook/
│               └── route.ts              ← NEW: Paytm payment callback
├── components/
│   ├── auth/
│   │   ├── SignInButton.tsx              ← NEW: "Continue with Google" button
│   │   └── UserMenu.tsx                  ← NEW: Profile avatar + dropdown
│   ├── cart/
│   │   ├── CartDrawer.tsx                ← NEW: Slide-out cart panel
│   │   ├── CartItem.tsx                  ← NEW: Individual cart item row
│   │   └── CartIcon.tsx                  ← NEW: Cart icon with badge for Navbar
│   ├── checkout/
│   │   ├── CheckoutFlow.tsx             ← NEW: Multi-step checkout wrapper
│   │   ├── AddressStep.tsx              ← NEW: Delivery address form
│   │   ├── PaymentMethodStep.tsx        ← NEW: Payment method selector
│   │   └── OrderSummary.tsx             ← NEW: Final order review
│   ├── orders/
│   │   ├── OrderList.tsx                ← NEW: Order history list
│   │   ├── OrderCard.tsx                ← NEW: Single order card
│   │   ├── StatusBadge.tsx              ← NEW: Coloured status pill
│   │   └── BillViewer.tsx               ← NEW: In-app bill renderer
│   └── ui/
│       └── OrderBanner.tsx              ← NEW: Additive "Sign in to order" callout
└── docs/
    └── MASTER_SPEC.md                    ← THIS FILE
```

---

## 9. API Route Contracts

Identical to Spec v1.0.

---

## 10. Admin Portal Requirements

Access to `/admin` is restricted to users with `is_admin = true` metadata flags in their Supabase credentials.
The portal consists of:
- **Order Directory:** List of all customer orders in reverse-chronological order.
- **Status Control:** Inline buttons or dropdown options allowing admin to transition order status from `paid` to `dispatched`.
- **Bill Review:** Renders the Dynamic PDF invoice on-site from the order's `bill_data` JSONB.

---

## 11. Invoice Email Requirements

- **Brevo transactional API** is called directly in the Paytm webhook endpoint upon receiving a successful payment payload.
- The invoice PDF is generated live on the server, converted to base64, and attached to the email request inline.
- No files are stored externally in Supabase Storage or S3.
