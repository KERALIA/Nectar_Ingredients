'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Order, OrderStatus } from '@/types'
import { formatINR } from '@/lib/pricing'
import BillViewer from '@/components/orders/BillViewer'

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<any | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchSessionAndOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      const isAdmin = !!user.user_metadata?.is_admin
      if (!isAdmin) {
        setUser(user)
        setLoading(false)
        return // Will render 403
      }

      setUser(user)

      // Fetch all customer orders (RLS allows admins)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(data as Order[])
      } else if (error) {
        console.error('Fetch orders error:', error.message)
        setError(error.message)
      }

      setLoading(false)
    }

    fetchSessionAndOrders()
  }, [router, supabase])

  const handleDispatch = async (orderId: string) => {
    setUpdatingOrderId(orderId)
    setError(null)

    try {
      const response = await fetch('/api/admin/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to dispatch order')
      }

      // Update state local order status
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'dispatched' } : o))
      )
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to update order status.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const getStatusBadgeClasses = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment_setup':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'pending_payment':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'paid':
        return 'bg-green-50 text-green-800 border-green-200'
      case 'dispatched':
        return 'bg-purple-50 text-purple-800 border-purple-200'
      case 'failed':
        return 'bg-red-50 text-red-800 border-red-200'
      default:
        return 'bg-neutral-50 text-neutral-800 border-neutral-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ni-bg flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-ni-rust mx-auto mb-4"></div>
          <p className="font-body text-sm text-ni-muted">Loading administrator dashboard...</p>
        </div>
      </div>
    )
  }

  // 403 Forbidden Access check
  if (!user || !user.user_metadata?.is_admin) {
    return (
      <div className="min-h-screen bg-ni-bg flex items-center justify-center pt-16">
        <div className="text-center max-w-md p-6 bg-ni-surface border border-ni-border/20 rounded-2xl shadow-premium">
          <span className="text-4xl block mb-4" aria-hidden="true">
            🚫
          </span>
          <h2 className="font-heading text-lg font-bold text-ni-primary mb-2">
            Access Denied
          </h2>
          <p className="font-body text-sm text-ni-muted mb-6">
            You do not have administrative privileges to access this page. Please log in with an authorized account.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[9px] px-5 py-3.5 bg-ni-rust text-white hover:bg-ni-rust-lt transition-all duration-300 cursor-pointer"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    )
  }

  // Aggregate metrics
  const totalOrdersCount = orders.length
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'dispatched')
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.final_total), 0)
  const shippedCount = orders.filter((o) => o.status === 'dispatched').length
  const pendingCount = orders.filter((o) => o.status === 'pending_payment' || o.status === 'pending_payment_setup').length

  return (
    <div className="min-h-screen bg-ni-bg pt-24 pb-16 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="font-heading text-display font-extrabold text-neutral-900 dark:text-neutral-50">
            Admin Orders Panel
          </h1>
          <p className="font-body text-sm text-ni-muted mt-2">
            Overview and dispatch management dashboard for direct powder checkouts.
          </p>
        </div>

        {error && (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 dark:border-red-950/30 dark:bg-red-950/20 text-xs rounded-xl">
            Error: {error}
          </div>
        )}

        {/* Stats Summary Widgets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-ni-surface border border-ni-border/15 rounded-xl p-5 shadow-sm">
            <span className="block font-body text-[10px] text-ni-muted font-bold uppercase tracking-wider">
              Total Revenue
            </span>
            <span className="block font-heading text-lg font-bold text-ni-rust mt-1.5">
              {formatINR(totalRevenue)}
            </span>
          </div>

          <div className="bg-ni-surface border border-ni-border/15 rounded-xl p-5 shadow-sm">
            <span className="block font-body text-[10px] text-ni-muted font-bold uppercase tracking-wider">
              Total Orders
            </span>
            <span className="block font-heading text-lg font-bold text-ni-primary mt-1.5">
              {totalOrdersCount}
            </span>
          </div>

          <div className="bg-ni-surface border border-ni-border/15 rounded-xl p-5 shadow-sm">
            <span className="block font-body text-[10px] text-ni-muted font-bold uppercase tracking-wider">
              Shipped / Dispatched
            </span>
            <span className="block font-heading text-lg font-bold text-ni-primary mt-1.5">
              {shippedCount}
            </span>
          </div>

          <div className="bg-ni-surface border border-ni-border/15 rounded-xl p-5 shadow-sm">
            <span className="block font-body text-[10px] text-ni-muted font-bold uppercase tracking-wider">
              Awaiting Payment
            </span>
            <span className="block font-heading text-lg font-bold text-ni-primary mt-1.5">
              {pendingCount}
            </span>
          </div>
        </div>

        {/* Table list */}
        <div className="bg-ni-surface border border-ni-border/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body text-xs text-ni-secondary">
              <thead>
                <tr className="bg-ni-surface2/50 border-b border-ni-border/10 font-bold text-ni-primary uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer Email</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ni-border/10">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-ni-muted">
                      No orders registered in the system database.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const badgeClasses = getStatusBadgeClasses(order.status)
                    const parsedLines = order.delivery_address.split('\n')
                    const customerEmail = parsedLines.find(l => l.toLowerCase().startsWith('email:'))?.split(/email:/i)[1]?.trim() || 'unknown@email.com'

                    return (
                      <tr key={order.id} className="hover:bg-ni-surface2/15 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-ni-primary">
                          {order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 truncate max-w-[150px]" title={customerEmail}>
                          {customerEmail}
                        </td>
                        <td className="px-6 py-4 uppercase">
                          {order.payment_method}
                        </td>
                        <td className="px-6 py-4 font-bold text-ni-primary">
                          {formatINR(order.final_total)}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${badgeClasses}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                          {order.status === 'paid' && (
                            <button
                              disabled={updatingOrderId === order.id}
                              onClick={() => handleDispatch(order.id)}
                              className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[9px] px-3.5 py-1.5 bg-ni-rust text-white hover:bg-ni-rust-lt transition-all duration-350 cursor-pointer disabled:opacity-50"
                            >
                              {updatingOrderId === order.id ? '...' : 'Ship'}
                            </button>
                          )}

                          {order.bill_data && (
                            <button
                              onClick={() => setSelectedBill(order.bill_data)}
                              className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[9px] px-3.5 py-1.5 bg-transparent border border-ni-border2 text-ni-secondary hover:border-ni-secondary hover:text-ni-primary transition-all duration-350 cursor-pointer"
                            >
                              Bill
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bill Viewer Modal */}
      {selectedBill && (
        <BillViewer billData={selectedBill} onClose={() => setSelectedBill(null)} />
      )}
    </div>
  )
}
