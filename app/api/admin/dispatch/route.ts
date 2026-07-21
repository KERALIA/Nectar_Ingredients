import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check Admin Role
    const isAdmin = !!user.user_metadata?.is_admin
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Parse body
    const body = await request.json()
    const { order_id } = body
    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    // 4. Update status to dispatched
    const adminSupabase = await createAdminClient()
    const { data: order, error: updateError } = await adminSupabase
      .from('orders')
      .update({ status: 'dispatched' })
      .eq('id', order_id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update order status: ${updateError.message}`)
    }

    return NextResponse.json({ success: true, order })
  } catch (error: unknown) {
    console.error('Admin dispatch API error:', error)
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
