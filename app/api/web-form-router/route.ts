// app/api/web-form-router/route.ts
// Migrated from the Supabase Edge Function of the same name — identical
// logic (including the new required `address` field), just running as a
// Next.js Route Handler on Vercel instead.

import { after } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

type CartItem = { name: string, sku?: string, quantity: number, unit?: string }

function formatItemsPlain(items: CartItem[]): string {
  return items.map(i => `• ${i.name}${i.sku ? ` (SKU: ${i.sku})` : ''} — ${i.quantity} ${i.unit || 'kg'}`).join('\n')
}

// All slow, non-critical work (Telegram + Sheets/Email) runs here, in the
// background, AFTER the response has already gone back to the browser —
// this is what keeps form submission fast.
async function processInquiry(payload: {
  name: string, email: string, phone?: string, company?: string,
  items: CartItem[], message?: string, address: string
}) {
  const { name, email, phone, company, items, message, address } = payload

  const tgToken = process.env.TELEGRAM_BOT_TOKEN
  const adminChatId = process.env.TELEGRAM_CHAT_ID
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL

  const itemsListPlain = formatItemsPlain(items)
  const backgroundTasks: Promise<unknown>[] = []

  // ---- Telegram notification (admin-facing, no pricing/UPI needed here) ----
  if (tgToken && adminChatId) {
    const tgPayload = {
      chat_id: adminChatId,
      text: `🌿 *New Inquiry for Nectar Ingredients!*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n📞 *Phone:* ${phone || 'Not provided'}\n🏠 *Address:* ${address}\n🏢 *Company/Brand:* ${company || 'N/A'}\n📦 *Items:*\n${itemsListPlain}\n\n📝 *Message:* \n"${message || 'None'}"`,
      parse_mode: 'Markdown'
    }
    backgroundTasks.push(
      fetchWithTimeout(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgPayload)
      }).then(async (res) => {
        if (!res.ok) console.error(`Telegram send failed (${res.status}):`, await res.text())
      }).catch(err => console.error("Telegram error (or timeout):", err))
    )
  } else {
    console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set - skipping Telegram notification.")
  }

  // ---- Google Apps Script: writes the Sheet row and sends the ----
  // ---- "order received" email. No pricing here — team quotes manually. ----
  if (appsScriptUrl) {
    backgroundTasks.push(
      fetchWithTimeout(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone || '',
          customerAddress: address,
          company: company || '',
          items: items,
          originalMessage: message || ''
        })
      }).then(async (res) => {
        if (!res.ok) console.error(`Google Apps Script call failed (${res.status}):`, await res.text())
      }).catch(err => console.error("Google script pipeline error (or timeout):", err))
    )
  } else {
    console.warn("GOOGLE_APPS_SCRIPT_URL not set - skipping sheet/email pipeline.")
  }

  await Promise.allSettled(backgroundTasks)
}

export async function OPTIONS() {
  return new Response('ok', { headers: corsHeaders })
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, company, items, message, address } = await req.json()

    // ---- Basic input validation ----
    if (!name || !email || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, and at least one item are required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    if (!address || typeof address !== 'string' || !address.trim()) {
      return new Response(
        JSON.stringify({ error: 'Address is required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    for (const item of items) {
      if (!item.name || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return new Response(
          JSON.stringify({ error: 'Each item needs a name and a positive numeric quantity.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    // Vercel/Next.js equivalent of Supabase's EdgeRuntime.waitUntil —
    // keeps this function alive to finish background work after the
    // response below has already been sent to the browser.
    after(async () => {
      await processInquiry({ name, email, phone, company, items, message, address })
        .catch(err => console.error("Background processing error:", err))
    })

    return new Response(JSON.stringify({ success: true, message: 'Inquiry received! We will be in touch shortly.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Unhandled error in inquiry handler:", error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}
