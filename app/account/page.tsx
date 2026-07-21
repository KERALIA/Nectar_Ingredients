'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Order, OrderStatus } from '@/types'
import { formatINR } from '@/lib/pricing'
import BillViewer from '@/components/orders/BillViewer'
import Link from 'next/link'

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<any | null>(null)
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null)
  const [payError, setPayError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchSessionAndOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      setUser(user)

      // Fetch user's orders
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(data as Order[])
      }

      setLoading(false)
    }

    fetchSessionAndOrders()
  }, [router, supabase])

  const handlePayNow = async (orderId: string) => {
    setPayingOrderId(orderId)
    setPayError(null)

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId }),
      })

      const paymentResult = await response.json()

      if (!response.ok) {
        throw new Error(paymentResult.error || 'Failed to initiate payment')
      }

      if (paymentResult.fallback) {
        // Render fallback text
        setPayError(paymentResult.message)
      } else if (paymentResult.checkout_url && paymentResult.paytm_params) {
        // Redirect to Paytm
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = paymentResult.checkout_url
        form.name = 'paytm_form'

        Object.entries(paymentResult.paytm_params).forEach(([key, val]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = String(val)
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
      }
    } catch (err: unknown) {
      console.error(err)
      setPayError(err instanceof Error ? err.message : 'Failed to redirect to payment gateway.')
    } finally {
      setPayingOrderId(null)
    }
  }

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment_setup':
        return { label: 'Manual Pay Required', classes: 'bg-yellow-50 text-yellow-800 border-yellow-200' }
      case 'pending_payment':
        return { label: 'Awaiting Payment', classes: 'bg-blue-50 text-blue-800 border-blue-200' }
      case 'paid':
        return { label: 'Payment Confirmed', classes: 'bg-green-50 text-green-800 border-green-200' }
      case 'dispatched':
        return { label: 'Shipped / Dispatched', classes: 'bg-purple-50 text-purple-800 border-purple-200' }
      case 'failed':
        return { label: 'Payment Failed', classes: 'bg-red-50 text-red-800 border-red-200' }
      default:
        return { label: status, classes: 'bg-neutral-50 text-neutral-800 border-neutral-200' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ni-bg flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-ni-rust mx-auto mb-4"></div>
          <p className="font-body text-sm text-ni-muted">Loading account data...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-ni-bg pt-24 pb-16 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="font-heading text-display font-extrabold text-neutral-900 dark:text-neutral-50">
            My Orders History
          </h1>
          <p className="font-body text-sm text-ni-muted mt-2">
            View status and download invoices for all direct orders placed with {user.email}.
          </p>
        </div>

        {payError && (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 dark:border-red-950/30 dark:bg-red-950/20 text-xs rounded-xl leading-normal">
            {payError}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-ni-surface border border-ni-border/20 rounded-2xl p-12 text-center max-w-md mx-auto">
            <span className="text-3xl block mb-4" aria-hidden="true">
              📦
            </span>
            <h3 className="font-heading text-base font-bold text-ni-primary mb-1">
              No orders registered yet
            </h3>
            <p className="font-body text-xs text-ni-muted mb-6">
              Check out our catalog of food powders to place your first order.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[9px] px-5 py-3.5 bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-premium transition-all duration-300"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status)
              const itemsCount = order.items.reduce((sum, item) => sum + item.qty_kg, 0)

              return (
                <div
                  key={order.id}
                  className="bg-ni-surface border border-ni-border/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2.5">
                      <span className="font-mono text-xs font-bold text-ni-primary">
                        Ref: {order.id.slice(0, 8)}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${statusConfig.classes}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    <p className="font-body text-xs text-ni-muted">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN')} ·{' '}
                      {order.items.length} products ({itemsCount} kg total)
                    </p>

                    <div className="font-body text-xs text-ni-secondary line-clamp-1 truncate max-w-md">
                      Address: {order.delivery_address.replace(/\n/g, ', ')}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 justify-center">
                    <div className="text-right">
                      <span className="block font-body text-[10px] text-ni-muted uppercase tracking-wider">
                        Amount Paid
                      </span>
                      <span className="block font-body text-base font-bold text-ni-rust mt-0.5">
                        {formatINR(order.final_total)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {['pending_payment', 'pending_payment_setup', 'failed'].includes(order.status) && (
                        <button
                          disabled={payingOrderId === order.id}
                          onClick={() => handlePayNow(order.id)}
                          className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[9px] px-4 py-2 bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-premium transition-all duration-300 cursor-pointer disabled:opacity-50"
                        >
                          {payingOrderId === order.id ? 'Loading...' : 'Pay Now'}
                        </button>
                      )}

                      {order.bill_data && (
                        <button
                          onClick={() => setSelectedBill(order.bill_data)}
                          className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[9px] px-4 py-2 bg-transparent border border-ni-border2 text-ni-secondary hover:border-ni-secondary hover:text-ni-primary transition-all duration-300 cursor-pointer"
                        >
                          Invoice Detail
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bill Viewer Modal */}
      {selectedBill && (
        <BillViewer billData={selectedBill} onClose={() => setSelectedBill(null)} />
      )}
    </div>
  )
}
