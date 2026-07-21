import { PaymentMethod } from '@/types'

export const MARKUP_FACTOR = 1.05
export const UPI_THRESHOLD = 95000

export const PAYMENT_DISCOUNTS: Record<PaymentMethod, number> = {
  upi: 0.0475,       // 4.75% off list (nets to exact base cost)
  debit_card: 0.038,  // 3.80% off list
  credit_card: 0.02375, // 2.375% off list
  netbanking: 0.02375,  // 2.375% off list
}

/** Compute list price from base price */
export function computeListPrice(basePrice: number): number {
  return basePrice * MARKUP_FACTOR
}

/** Compute final price after payment method discount */
export function computeFinalPrice(listTotal: number, method: PaymentMethod): number {
  return listTotal * (1 - PAYMENT_DISCOUNTS[method])
}

/** Compute discount amount */
export function computeDiscountAmount(listTotal: number, method: PaymentMethod): number {
  return listTotal * PAYMENT_DISCOUNTS[method]
}

/** Check if a payment method is available for a given list_total */
export function isPaymentMethodAvailable(method: PaymentMethod, listTotal: number): boolean {
  if (method === 'upi' && listTotal >= UPI_THRESHOLD) return false
  return true
}

/** Get all available payment methods for a given list_total */
export function getAvailablePaymentMethods(listTotal: number): PaymentMethod[] {
  const allMethods: PaymentMethod[] = ['upi', 'debit_card', 'credit_card', 'netbanking']
  return allMethods.filter((m) => isPaymentMethodAvailable(m, listTotal))
}

/** Human-readable payment method labels */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: 'UPI',
  debit_card: 'Debit Card',
  credit_card: 'Credit Card',
  netbanking: 'Net Banking',
}

/** Format currency in INR (using Indian numbering format) */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
