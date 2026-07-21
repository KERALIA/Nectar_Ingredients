import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // 1. Verify Secret Header
    const authHeader = request.headers.get('X-Sync-Secret')
    const secret = process.env.PRICE_SYNC_SECRET

    if (!secret) {
      console.error('Price Sync Error: PRICE_SYNC_SECRET not configured in server env')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (!authHeader || authHeader !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse and validate body
    const body = await request.json()
    const { sku, base_price } = body

    if (!sku || typeof sku !== 'string' || sku.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid sku' }, { status: 400 })
    }

    // 0 is a VALID price meaning "currently unavailable" (renders as "Price on request").
    // Reject only genuinely invalid input: non-numeric or negative.
    const price = Number(base_price)
    if (base_price === '' || base_price === null || isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Invalid base_price (must be >= 0)' }, { status: 400 })
    }

    // 3. Upsert to product_prices using admin client (bypasses RLS write restriction)
    const adminSupabase = await createAdminClient()
    const { data, error } = await adminSupabase
      .from('product_prices')
      .upsert(
        {
          sku: sku.trim(),
          base_price: price,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'sku' }
      )
      .select()

    if (error) {
      throw new Error(`Database upsert failed: ${error.message}`)
    }

    console.log(`Price sync success: SKU ${sku.trim()} updated to base price Rs. ${price}`)

    return NextResponse.json({
      success: true,
      sku: sku.trim(),
      base_price: price,
    })
  } catch (error: unknown) {
    console.error('Price Sync API error:', error)
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
