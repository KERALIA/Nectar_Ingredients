'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import CheckoutFlow from '@/components/checkout/CheckoutFlow'
import Link from 'next/link'

export default function CheckoutPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Redirect to products if not logged in
        router.push('/products')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-ni-bg flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-ni-rust mx-auto mb-4"></div>
          <p className="font-body text-sm text-ni-muted">Loading checkout session...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-ni-bg pt-24 pb-16 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs font-body text-ni-muted">
          <Link href="/products" className="hover:text-ni-rust transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-ni-primary font-semibold">Checkout</span>
        </div>

        <CheckoutFlow user={user} />
      </div>
    </div>
  )
}
