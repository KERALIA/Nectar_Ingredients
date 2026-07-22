import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateSignature } from '@/lib/paytm-checksum'
import { formatINR } from '@/lib/pricing'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { order_id } = body
    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    // 3. Fetch order from database
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate ownership
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Send Telegram Notification immediately on order creation
    try {
      const tgToken = process.env.TELEGRAM_BOT_TOKEN
      const chatId = process.env.TELEGRAM_CHAT_ID

      if (tgToken && chatId) {
        const items = Array.isArray(order.items) ? order.items : []
        const itemsText = items.map((i: any) =>
          `- ${i.name} (SKU: ${i.sku}) — ${i.qty_kg} kg @ ${formatINR(i.list_price)}/kg`
        ).join('\n')

        const tgPayload = {
          chat_id: chatId,
          text: `🛍️ *New Order Placed (Pending Payment/Setup)!*\n\n` +
                `📦 *Order ID (Ref):* ${order.id.slice(0, 8)}\n` +
                `💳 *Payment Method:* ${order.payment_method.toUpperCase()}\n` +
                `💸 *Total Amount:* ${formatINR(order.final_total)}\n\n` +
                `👤 *Customer Info & Address:*\n${order.delivery_address}\n\n` +
                `📋 *Items ordered:*\n${itemsText}\n\n` +
                `🔗 [Open Admin Portal](${new URL(request.url).origin}/admin)`,
          parse_mode: 'Markdown'
        }

        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tgPayload)
        }).then(res => {
          if (!res.ok) {
            console.error(`Telegram bot API returned non-OK status: ${res.status} ${res.statusText}`)
          } else {
            console.log(`Telegram notification sent successfully for order ${order.id}`)
          }
        })
      } else {
        console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set - skipping Telegram notification.")
      }
    } catch (tgErr) {
      console.error(`Failed to send Telegram notification for order ${order.id}:`, tgErr)
    }

    // Validate state (must be payable)
    if (!['pending_payment_setup', 'pending_payment', 'failed'].includes(order.status)) {
      return NextResponse.json({ error: 'Order is not in a payable state' }, { status: 400 })
    }

    // 4. Verify Paytm Env vars
    const mid = process.env.PAYTM_MERCHANT_ID
    const mkey = process.env.PAYTM_MERCHANT_KEY
    const website = process.env.PAYTM_WEBSITE
    const channelId = process.env.PAYTM_CHANNEL_ID || 'WEB'
    const industryType = process.env.PAYTM_INDUSTRY_TYPE || 'Retail'

    const credentialsMissing = !mid || !mkey || !website

    if (credentialsMissing) {
      // Fallback Mode! Returns friendly message, leaves order as pending_payment_setup
      return NextResponse.json({
        fallback: true,
        message: `Online payment gateway setup is being finalized. Your order has been registered successfully. Please contact Mehul Patel to complete payment manually.\nEmail: sales@nectaringredients.com | Phone: +91-XXXXXXXXXX\nReference Order ID: ${order.id.slice(0, 8)}`,
      })
    }

    // 5. Construct Paytm parameters
    const origin = new URL(request.url).origin
    const paytmOrderId = `${order.id.slice(0, 8)}-${Date.now()}` // Unique ID for Paytm transaction mapping
    const finalAmountString = Number(order.final_total).toFixed(2)

    const paytmParams: Record<string, string> = {
      MID: mid,
      WEBSITE: website,
      INDUSTRY_TYPE_ID: industryType,
      CHANNEL_ID: channelId,
      ORDER_ID: paytmOrderId,
      CUST_ID: order.user_id,
      TXN_AMOUNT: finalAmountString,
      CALLBACK_URL: `${origin}/api/payment/webhook`,
      EXCLUDE_PAYMENT_MODES: 'PPI',
    }

    // Calculate Checksum signature
    const checksum = generateSignature(paytmParams, mkey)
    paytmParams['CHECKSUMHASH'] = checksum

    // Update order row in Supabase using admin client
    const adminSupabase = await createAdminClient()
    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({
        paytm_order_id: paytmOrderId,
        status: 'pending_payment',
      })
      .eq('id', order.id)

    if (updateError) {
      throw new Error(`Failed to update order references: ${updateError.message}`)
    }

    // Paytm API URLs:
    const isStaging = website.toUpperCase().includes('STAGE') || website.toUpperCase().includes('WEBSTAGING')
    const checkoutUrl = isStaging
      ? 'https://securegw-stage.paytm.in/order/process'
      : 'https://securegw.paytm.in/order/process'

    return NextResponse.json({
      fallback: false,
      paytm_params: paytmParams,
      checkout_url: checkoutUrl,
    })
  } catch (error: unknown) {
    console.error('Payment initiation API error:', error)
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
