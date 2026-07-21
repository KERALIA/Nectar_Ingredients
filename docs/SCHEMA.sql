-- =====================================================================
-- NECTAR INGREDIENTS DATABASE SCHEMA
-- Execute this script in the Supabase SQL Editor.
-- =====================================================================

-- 1. Create product_prices table (source of truth for live pricing)
CREATE TABLE IF NOT EXISTS public.product_prices (
  sku         TEXT PRIMARY KEY,
  base_price  NUMERIC(12, 2) NOT NULL CHECK (base_price > 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create orders table (stores customer orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items                 JSONB NOT NULL,
  delivery_address      TEXT NOT NULL,
  payment_method        TEXT NOT NULL CHECK (payment_method IN ('upi', 'debit_card', 'credit_card', 'netbanking')),
  list_total            NUMERIC(12, 2) NOT NULL,
  payment_discount_pct  NUMERIC(6, 5) NOT NULL,
  final_total           NUMERIC(12, 2) NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending_payment_setup'
                        CHECK (status IN ('pending_payment_setup', 'pending_payment', 'paid', 'dispatched', 'failed')),
  paytm_order_id        TEXT,
  paytm_transaction_id  TEXT,
  bill_data             JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_paytm_order_id ON public.orders(paytm_order_id) WHERE paytm_order_id IS NOT NULL;

-- 4. Enable Row Level Security (RLS) on both tables
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies

-- PRODUCT_PRICES POLICIES:
-- Any anonymous or authenticated user can view catalog prices
CREATE POLICY "anyone_can_read_prices"
  ON public.product_prices
  FOR SELECT
  USING (true);

-- Only our service role API (Google Sheets sync endpoint) can write prices
CREATE POLICY "service_role_writes_prices"
  ON public.product_prices
  FOR ALL
  USING (auth.role() = 'service_role');

-- ORDERS POLICIES:
-- Customers can view their own orders; admins (user metadata flag) can view all orders
CREATE POLICY "users_view_own_orders"
  ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Customers can create orders for themselves
CREATE POLICY "users_insert_own_orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only our server-side service role can update order details (webhook, status)
CREATE POLICY "service_role_updates_orders"
  ON public.orders
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- 6. Trigger to automatically update the updated_at timestamp on order modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
