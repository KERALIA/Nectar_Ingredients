export interface Product {
  id: string
  slug: string
  name: string
  tagline: string
  category: 'vegetable' | 'fruit' | 'spice'
  swatchColor: string
  swatchHex: string
  weights: string[]
  sku: string
  mesh: string
  description: string
  featured: boolean
  imageSrc: string
  rawImageSrc: string
  swatchImageSrc: string
  packagingSize?: string
  usageApplications?: string[]
}

export interface Stat {
  value: string
  label: string
}

export interface ProcessStep {
  tag: string
  heading: string
  body: string
}

export interface ExtendedRangeItem {
  name: string
  forms: string
}

// === ORDERING SYSTEM TYPES ===

export type PaymentMethod = 'upi' | 'debit_card' | 'credit_card' | 'netbanking'

export type OrderStatus =
  | 'pending_payment_setup'
  | 'pending_payment'
  | 'paid'
  | 'dispatched'
  | 'failed'

export interface CartItem {
  sku: string
  name: string
  qty_kg: number
  base_price: number    // per kg, from product_prices at add-time
  list_price: number    // per kg (base_price × MARKUP_FACTOR)
}

export interface OrderItem extends CartItem {
  final_price: number   // per kg, after payment method discount
}

export interface Order {
  id: string
  user_id: string
  items: OrderItem[]
  delivery_address: string
  payment_method: PaymentMethod
  list_total: number
  payment_discount_pct: number
  final_total: number
  status: OrderStatus
  paytm_order_id: string | null
  paytm_transaction_id: string | null
  bill_pdf_url: string | null
  bill_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface ProductPrice {
  sku: string
  base_price: number
  updated_at: string
}