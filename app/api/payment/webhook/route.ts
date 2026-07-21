import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifySignature } from '@/lib/paytm-checksum'
import { sendInvoiceEmail } from '@/lib/email-service'
import { formatINR } from '@/lib/pricing'

export async function POST(request: Request) {
  try {
    // 1. Paytm webhook sends parameters as URL-encoded form data (application/x-www-form-urlencoded)
    const formData = await request.formData()
    const paytmParams: Record<string, string> = {}

    formData.forEach((value, key) => {
      paytmParams[key] = String(value)
    })

    const checksum = paytmParams['CHECKSUMHASH']
    if (!checksum) {
      console.error('Webhook error: Missing CHECKSUMHASH')
      return new Response('Invalid Checksum', { status: 400 })
    }

    // Remove Checksum from params before verification
    const paytmParamsNoChecksum = { ...paytmParams }
    delete paytmParamsNoChecksum['CHECKSUMHASH']

    const mkey = process.env.PAYTM_MERCHANT_KEY
    if (!mkey) {
      console.error('Webhook error: Missing PAYTM_MERCHANT_KEY in env')
      return new Response('Configuration Error', { status: 500 })
    }

    // 2. Verify signature
    const isValid = verifySignature(paytmParamsNoChecksum, mkey, checksum)
    if (!isValid) {
      console.error('Webhook error: Signature verification failed')
      return new Response('Signature Mismatch', { status: 400 })
    }

    const paytmOrderId = paytmParams['ORDERID']
    const paytmTxnId = paytmParams['TXNID']
    const status = paytmParams['STATUS'] // TXN_SUCCESS or TXN_FAILURE

    if (!paytmOrderId) {
      return new Response('Missing ORDERID', { status: 400 })
    }

    // 3. Find matching order in Supabase using admin client (bypasses RLS)
    const adminSupabase = await createAdminClient()
    const { data: order, error: fetchError } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('paytm_order_id', paytmOrderId)
      .single()

    if (fetchError || !order) {
      console.error(`Webhook error: Order not found for paytm_order_id: ${paytmOrderId}`)
      return new Response('Order Not Found', { status: 404 })
    }

    // If order is already paid, return 200 immediately to prevent re-processing
    if (order.status === 'paid' || order.status === 'dispatched') {
      return NextResponse.json({ status: 'ok' })
    }

    // 4. Process Status update
    if (status === 'TXN_SUCCESS') {
      // Create detailed bill_data snapshot
      const billData = {
        order_id: order.id,
        paytm_order_id: paytmOrderId,
        paytm_transaction_id: paytmTxnId,
        date: new Date().toISOString(),
        items: order.items,
        delivery_address: order.delivery_address,
        payment_method: order.payment_method,
        list_total: order.list_total,
        payment_discount_pct: order.payment_discount_pct,
        final_total: order.final_total,
      }

      // Update status and save bill_data
      const { error: updateError } = await adminSupabase
        .from('orders')
        .update({
          status: 'paid',
          paytm_transaction_id: paytmTxnId,
          bill_data: billData,
        })
        .eq('id', order.id)

      if (updateError) {
        throw new Error(`Failed to update order to paid: ${updateError.message}`)
      }

      // 5. Trigger PDF generation & email sending (Phase 7)
      try {
        await sendInvoiceEmail(billData)
      } catch (emailErr) {
        console.error(`Failed to send invoice email for order ${order.id}:`, emailErr)
      }

      // 6. Send Telegram Notification (using existing TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID)
      try {
        const tgToken = process.env.TELEGRAM_BOT_TOKEN
        const chatId = process.env.TELEGRAM_CHAT_ID

        if (tgToken && chatId) {
          const itemsText = billData.items.map((i: any) =>
            `- ${i.name} (SKU: ${i.sku}) — ${i.qty_kg} kg @ ${formatINR(i.final_price)}/kg`
          ).join('\n')

          const tgPayload = {
            chat_id: chatId,
            text: `🛍️ *Direct Order Paid & Confirmed!*\n\n` +
                  `📦 *Order ID (Ref):* ${order.id.slice(0, 8)}\n` +
                  `💳 *Payment Method:* ${order.payment_method.toUpperCase()}\n` +
                  `💸 *Total Paid:* ${formatINR(order.final_total)}\n` +
                  `🔢 *Transaction ID:* ${paytmTxnId}\n\n` +
                  `👤 *Customer Info & Address:*\n${order.delivery_address}\n\n` +
                  `📋 *Items ordered:*\n${itemsText}\n\n` +
                  `🔗 [Open Admin Portal](${new URL(request.url).origin}/admin)`,
            parse_mode: 'Markdown'
          }

          await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tgPayload)
          })
        }
      } catch (tgErr) {
        console.error(`Failed to send Telegram notification for order ${order.id}:`, tgErr)
      }

      console.log(`Order ${order.id} paid successfully via Paytm webhook.`)

    } else {
      // Update order to failed
      const { error: updateError } = await adminSupabase
        .from('orders')
        .update({
          status: 'failed',
        })
        .eq('id', order.id)

      if (updateError) {
        throw new Error(`Failed to update order to failed: ${updateError.message}`)
      }

      console.log(`Order ${order.id} payment failed via Paytm webhook.`)
    }

    // Paytm expects '200 OK' response with a JSON payload or simple HTML/text to acknowledge webhook
    return NextResponse.json({ status: 'ok' })
  } catch (error: unknown) {
    console.error('Paytm Webhook API error:', error)
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return new Response(`Error: ${msg}`, { status: 500 })
  }
}
