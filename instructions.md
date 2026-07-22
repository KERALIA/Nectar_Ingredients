# Nectar Ingredients — Feature Activation & Integration Guide

This document provides step-by-step instructions for re-enabling and reconnecting the **Customer Authentication (Google OAuth)**, **Online Cart & Paytm Checkout**, **Live Price Sync**, and **PDF Invoicing** features.

All underlying backend API routes, database models, payment utilities, and authentication handlers remain **fully preserved in the codebase**. Follow the steps below whenever your clients wish to activate direct online payments and user accounts.

---

## Architecture Overview

| Feature Module | Codebase Files | Current Status |
|---|---|---|
| **Google OAuth / Supabase Auth** | `lib/supabase/*`, `components/auth/*`, `app/auth/callback/route.ts` | Code preserved; UI elements hidden |
| **Online Shopping Cart** | `context/CartContext.tsx`, `components/cart/*` | Code preserved; UI triggers disconnected |
| **Paytm Payment Gateway** | `app/api/payment/initiate/route.ts`, `app/api/payment/webhook/route.ts`, `lib/paytm-checksum.ts` | Code preserved; credentials commented in `.env.local` |
| **PDF Bill Generator** | `lib/email-service.ts`, `lib/stamp-image.ts`, `components/orders/BillViewer.tsx` | Code preserved |
| **Admin Order Portal** | `app/admin/page.tsx`, `app/api/admin/dispatch/route.ts` | Code preserved |
| **Price Sync (Google Sheet → DB)** | `app/api/sync-price/route.ts` | Code preserved |

---

## Step 1: Re-enable Environment Variables

Open `.env.local` and uncomment the credentials required for Supabase and Paytm:

```env
# 1. Supabase Credentials (Required for Google Sign In & DB)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 2. Sheet-to-DB Price Sync
PRICE_SYNC_SECRET=your-sync-secret

# 3. Paytm Payment Gateway
PAYTM_MERCHANT_ID=your-merchant-id
PAYTM_MERCHANT_KEY=your-merchant-key
PAYTM_WEBSITE=DEFAULT
PAYTM_INDUSTRY_TYPE=Retail
PAYTM_CHANNEL_ID=WEB

# 4. Telegram Alerts (Optional)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

---

## Step 2: Database Setup (Supabase SQL)

Ensure the database schema from `docs/SCHEMA.sql` is executed in your Supabase SQL Editor:
1. `public.product_prices` (Stores live prices synced from Google Sheet).
2. `public.orders` (Stores order histories, item snapshots, billing data, and payment statuses).

Make sure Row Level Security (RLS) policies are active as specified in `docs/SCHEMA.sql`.

---

## Step 3: Re-connect Google OAuth & User Menu in Navbar

To show the **Sign In / User Profile** button in the header bar:
1. Open `components/layout/Navbar.tsx`.
2. Re-import `SignInButton` and `UserMenu`:
   ```tsx
   import SignInButton from '@/components/auth/SignInButton'
   import UserMenu from '@/components/auth/UserMenu'
   import CartIcon from '@/components/cart/CartIcon'
   ```
3. In the desktop actions div (`className="hidden md:flex items-center gap-4"`), re-add:
   ```tsx
   <CartIcon />
   {mounted && (
     <div className="flex items-center gap-3 border-l border-ni-border/30 pl-3 ml-1">
       {user ? <UserMenu /> : <SignInButton />}
     </div>
   )}
   ```
4. Configure Google OAuth provider in Supabase Dashboard -> **Authentication** -> **Providers** -> **Google** with Client ID and Client Secret from Google Cloud Console.

---

## Step 4: Re-connect "Add to Cart" & Cart Drawer

To allow customers to add items to an online cart and check out directly:
1. Open `app/layout.tsx` and re-add `<CartDrawer />` inside the provider tree.
2. In `components/products/ProductCard.tsx` and `components/products/ProductDrawer.tsx`:
   - Re-introduce the `addToCart` handler from `useCart()`.
   - Add the **"ADD TO CART"** button alongside or replacing the sample basket button.
3. Users will be able to click **Add to Cart**, open the slide-out cart drawer, and proceed to `/checkout`.

---

## Step 5: Paytm Payment Flow & Fallback Behavior

- If `PAYTM_MERCHANT_ID` and `PAYTM_MERCHANT_KEY` are provided in `.env.local`, clicking **Place Order & Pay** will redirect users to Paytm's hosted payment gateway.
- If Paytm environment variables are left blank, the system automatically runs in **Payment Setup Fallback Mode**:
  - The order is saved to Supabase Postgres as `pending_payment_setup`.
  - The customer receives an on-screen reference ID and instructions to contact management manually via email/WhatsApp to complete payment.

---

## Step 6: Admin Dashboard (`/admin`)

- Access `/admin` to view all submitted direct orders, filter by payment status (`pending_payment_setup`, `paid`, `dispatched`), generate live PDF bills, and update dispatch tracking numbers.
