// app/api/chatbot/route.ts
// Migrated from the Supabase Edge Function of the same name — identical
// logic, tools, system prompt, and product knowledge base, just running
// as a Next.js Route Handler on Vercel instead. Now also collects and
// requires "address" before submitting a new order, matching web-form-router,
// and sends a Telegram notification on new orders, same as web-form-router.

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

const appsScriptUrl = () => process.env.GOOGLE_APPS_SCRIPT_URL

function formatItemsPlain(items: { name: string, sku?: string, quantity: number, unit?: string }[]): string {
  return items.map(i => `• ${i.name}${i.sku ? ` (SKU: ${i.sku})` : ''} — ${i.quantity} ${i.unit || 'kg'}`).join('\n')
}

// ---- Telegram notification for chatbot-placed orders, mirroring the ----
// ---- pattern already used in web-form-router. Runs in the background ----
// ---- via after(), so it never delays the chatbot's reply to the customer. ----
async function notifyTelegramNewOrder(args: {
  name: string, email: string, phone?: string, company?: string, address: string,
  items: { name: string, sku?: string, quantity: number, unit?: string }[], message?: string
}) {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN
  const adminChatId = process.env.TELEGRAM_CHAT_ID
  if (!tgToken || !adminChatId) {
    console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set - skipping Telegram notification for chatbot order.")
    return
  }

  const itemsListPlain = formatItemsPlain(args.items)
  const tgPayload = {
    chat_id: adminChatId,
    text: `🌿 *New Inquiry for Nectar Ingredients!* (via chatbot)\n\n👤 *Name:* ${args.name}\n📧 *Email:* ${args.email}\n📞 *Phone:* ${args.phone || 'Not provided'}\n🏠 *Address:* ${args.address}\n🏢 *Company/Brand:* ${args.company || 'N/A'}\n📦 *Items:*\n${itemsListPlain}\n\n📝 *Message:* \n"${args.message || 'None'}"`,
    parse_mode: 'Markdown'
  }

  try {
    const res = await fetchWithTimeout(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tgPayload)
    })
    if (!res.ok) console.error(`Telegram send failed (${res.status}):`, await res.text())
  } catch (err) {
    console.error("Telegram error (or timeout) for chatbot order:", err)
  }
}

// ---- Tool implementations: each one calls the same Apps Script webhook, ----
// ---- just with a different `action`, matching the router added there. ----

async function toolLookupOrder(args: { phone?: string, email?: string }) {
  const res = await fetchWithTimeout(appsScriptUrl()!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'lookup', phone: args.phone, email: args.email })
  })
  return await res.json()
}

async function toolSubmitNewOrder(args: {
  name: string, email: string, phone?: string, company?: string, address: string,
  items: { name: string, sku?: string, quantity: number, unit?: string }[], message?: string
}) {
  const res = await fetchWithTimeout(appsScriptUrl()!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: args.name,
      customerEmail: args.email,
      customerPhone: args.phone || '',
      customerAddress: args.address,
      company: args.company || '',
      items: args.items,
      originalMessage: args.message || 'Order placed via website chatbot'
    })
  })
  const result = await res.json()

  // Fire Telegram in the background via after() — guaranteed to complete
  // even after the HTTP response for this request has already been sent.
  after(async () => {
    await notifyTelegramNewOrder(args)
  })

  return result
}

const tools = [
  {
    type: "function",
    function: {
      name: "lookup_order",
      description: "Look up a customer's past orders using their phone number or email. Use this whenever the customer asks about an existing order's status.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string", description: "Customer phone number, any format" },
          email: { type: "string", description: "Customer email address" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "submit_new_order",
      description: "Submit a brand new order once you have the customer's name, email, delivery address, and at least one item with a quantity. There is NO fixed pricing — do not quote or invent a price. Tell the customer the team will review and send a final quote with payment details shortly. Only call this after the customer has clearly confirmed all items and quantities, AND provided a delivery address — do not call this without an address, ask for it explicitly if missing.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          company: { type: "string" },
          address: { type: "string", description: "Full delivery address — shop/house no., street, city, state, PIN code. Required." },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                sku: { type: "string" },
                quantity: { type: "number" },
                unit: { type: "string" }
              },
              required: ["name", "quantity"]
            }
          },
          message: { type: "string" }
        },
        required: ["name", "email", "address", "items"]
      }
    }
  }
]

// ============================================================================
// PRODUCT KNOWLEDGE BASE — unchanged from the Supabase version.
// ============================================================================
const PRODUCT_KNOWLEDGE = `
NECTAR INGREDIENTS — PRODUCT CATALOG & KNOWLEDGE BASE

STATUS KEY:
- "In Production" = currently manufactured in-house via spray drying, ready to quote/order now
- "Featured" = actively offered on the website's main product selection
- "On Request" = not standard stock; manufactured to order, contact for pricing/MOQ — always tell the customer this explicitly, don't imply it's in-stock

=== IN PRODUCTION (spray-dried, core manufacturing line) ===
- Tomato Powder (Plain / PJR / RT Premium variants) — rich in lycopene and natural umami; used as a base for soups, sauces, seasoning blends, and as a natural red colorant/flavor enhancer.
- Tamarind Powder — tangy/sour flavor from tamarind pulp; used in chutneys, marinades, candies, and South/Southeast Asian seasoning blends.
- Watermelon Powder — natural fruity sweetness; used in beverage mixes, smoothie powders, and flavored snacks.
- Green Chilies Powder — pungent heat (capsaicin); used in spice blends, snack seasonings, and sauces.
- Green Coriander Powder — fresh herbal aroma; used in seasoning blends, chutney powders, and instant soup mixes.
- Ginger Powder — pungent, aromatic; gingerol content is associated with digestive and anti-inflammatory culinary use; common in spice blends, teas, and baked goods.
- Garlic Powder — strong allium flavor; a staple in savory seasoning blends, marinades, and snack coatings.
- Honey Powder — spray-dried honey; used as a natural sweetener in dry mixes, bakery premixes, and beverage powders where liquid honey isn't practical.
- Jamun Powder — from Indian blackberry; tart flavor, popular in nutraceutical/health-food formulations.
- Kiwi Powder — tangy-sweet; used in fruit snack bars, smoothie mixes, and flavored confectionery.
- Lychee Powder — floral-sweet tropical fruit flavor; used in beverage and dessert mixes.
- Lemon Powder — bright citrus flavor and acidity; used in seasoning blends, beverage mixes, and snack coatings.
- Mulberry Powder — mild berry sweetness; used in health/nutraceutical blends and natural colorant applications.
- Mint Powder — cooling, aromatic; used in seasoning blends, chutney powders, and confectionery.
- Musk Melon Powder — mild sweet fruit flavor; used in beverage and dessert powder mixes.
- Orange Powder — citrus flavor and natural color; used in beverage mixes, bakery, and snack seasoning.
- Onion Powder — savory allium base flavor; one of the most widely used seasoning powders across snack, sauce, and spice blend applications.
- Pineapple Powder — tropical sweet-tart flavor; used in beverage and snack mixes.
- Potato Powder — neutral starchy base; used as a thickener/binder and in instant snack/soup mixes.
- Papaya Powder — mild tropical sweetness; used in fruit snack and health mix applications.
- Pomegranate Powder — tart-sweet, antioxidant-associated; used in health drink mixes and seasoning blends (amchur-style tang).
- Pumpkin Powder — mild earthy-sweet flavor; used in bakery premixes and health food formulations.
- Peach Powder — sweet stone-fruit flavor; used in beverage and dessert mixes.
- Purple Carrot Powder — natural purple/red colorant plus mild earthy-sweet flavor; used in natural food coloring applications.
- Raspberry Powder — tart berry flavor; used in beverage, bakery, and confectionery applications.
- Rose Petal Powder — delicate floral flavor and aroma; used in desserts, beverage mixes, and traditional sweets (gulkand-style applications).
- Raw Mango Powder (Amchur-style) — sour tangy flavor; a staple souring agent in Indian seasoning blends and chutney powders.
- Strawberry Powder — sweet-tart berry flavor; used in beverage, bakery, and confectionery mixes.
- Spinach Powder — mild earthy flavor, natural green color; used in health mixes, pasta/bakery formulations, and seasoning blends.
- Soya HVP Powder (for seasoning) — hydrolyzed vegetable protein; savory/umami flavor enhancer used in snack seasonings and instant food applications.
- Tender Coconut Powder — mild sweet coconut flavor; used in beverage mixes and dessert applications.

=== FEATURED ON WEBSITE (may overlap with above, customer-facing selection) ===
- Turmeric Powder — earthy, slightly bitter; curcumin content, widely used for natural yellow color and flavor in spice blends and health formulations.
- Beetroot Powder — earthy-sweet, natural red/pink colorant; popular in health mixes and natural food coloring.
- Amla Powder (Indian Gooseberry) — tart, vitamin-C associated; common in health/nutraceutical and traditional wellness formulations.
- Carrot Powder — mild sweet flavor, natural orange color; used in health mixes and bakery applications.
- Annatto Colour — natural orange-red colorant derived from annatto seeds; used as a natural food dye alternative to synthetic colors.
- Mango Powder — sweet tropical flavor (distinct from the tangy Raw Mango/Amchur variant above); used in beverage and dessert mixes.
- Banana Powder — mild sweet flavor; used in bakery premixes, infant/health food formulations, and smoothie mixes.
- Cheese Powder — savory dairy flavor; used in snack seasonings (chips, popcorn) and instant sauce mixes.
- Cream Powder — rich dairy flavor/mouthfeel; used in bakery, dessert, and instant mix applications.
- Curd Powder — tangy dairy flavor; used in seasoning blends and instant mix applications.
- Butter Powder — rich buttery flavor; used in bakery premixes and snack seasonings.
- Caramel Colour — natural brown colorant with mild caramel flavor note; used in beverages, sauces, and bakery applications.

=== AVAILABLE ON REQUEST (not standard stock — always tell the customer this is made-to-order, needs a quote/MOQ discussion) ===
- Green Chilly (Flakes, Powder)
- Cabbage (Flakes, Powder)
- Sweet Potato (Powder)
- Bitter Gourd (Flakes, Powder)
- Bottle Gourd (Powder)
- Okra (Powder)
- Potato (Flakes, Cubes, Powder)
- French Beans (Dehydrated)
- Parsley (Leaves)
- Mint Leaves (Leaves, Leaf Powder)
- Kasuri Methi / Fenugreek Leaves (Leaves, Leaf Powder)
- Coriander (Leaves, Leaf Powder)
- Bay Leaves (Leaves, Leaf Powder)
- Isabgul / Psyllium Husk (Husk)
`

const SYSTEM_PROMPT = `You are the AI assistant for Nectar Ingredients, a wholesale spice/powder ingredients supplier. Prices are NOT fixed — they vary daily and are quoted manually by the team after an order is placed. You never state or guess a price.

You have a detailed product knowledge base below — use it to answer questions about what's available, product descriptions, and typical uses. Always be accurate about status: if something is "On Request," tell the customer plainly that it's made-to-order and not standard stock, don't imply it's ready to ship.

You help website visitors:
1. Check the status of an existing order (ask for their phone number or email if not given, then use lookup_order — report the order status and total exactly as returned, e.g. "Not yet quoted", "Awaiting Payment", "Dispatched"). You can ONLY check status — you cannot modify, change, or cancel an existing order. If a customer asks to change or cancel an order, politely tell them to contact the team directly (via the contact form or email) since you're not able to make changes to existing orders.
2. Answer questions about products — what's available, descriptions, typical uses — using the knowledge base below.
3. Place a brand new order — gather product names + quantities AND a full delivery address (shop/house no., street, city, state, PIN code), confirm the full list and address back to the customer BEFORE calling submit_new_order, make sure you have their name and email, and tell them the team will follow up with a quote and payment link — do NOT mention a price. Do not call submit_new_order without an address — if the customer hasn't given one, ask for it before proceeding.

Be concise, friendly, and professional. Never invent prices, order details, or confirmations — always rely on tool results for anything factual about orders. If someone asks for something outside these three things, politely redirect them to the contact form or let them know a team member will follow up.

${PRODUCT_KNOWLEDGE}`

async function callOpenCodeZen(messages: any[], apiKey: string) {
  const response = await fetchWithTimeout('https://opencode.ai/zen/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash-free',
      messages,
      tools,
      temperature: 0.4
    })
  }, 12000)

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenCode Zen HTTP ${response.status}: ${errText}`)
  }
  return await response.json()
}

export async function OPTIONS() {
  return new Response('ok', { headers: corsHeaders })
}

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json()
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'A message is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
      })
    }

    const apiKey = process.env.OPENCODE_ZEN_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Chatbot is not configured yet.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
      })
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history : []),
      { role: 'user', content: message }
    ]

    // Tool-calling loop: the model may call a tool, we execute it and feed
    // the result back, repeating until it gives a final text answer.
    // Capped at 4 rounds so a confused model can't loop forever.
    let finalReply = ''
    for (let round = 0; round < 4; round++) {
      const result = await callOpenCodeZen(messages, apiKey)
      const choice = result.choices?.[0]?.message

      if (!choice) throw new Error('No response from model.')

      if (choice.tool_calls && choice.tool_calls.length > 0) {
        messages.push(choice)
        for (const toolCall of choice.tool_calls) {
          const args = JSON.parse(toolCall.function.arguments || '{}')
          let toolResult
          try {
            if (toolCall.function.name === 'lookup_order') toolResult = await toolLookupOrder(args)
            else if (toolCall.function.name === 'submit_new_order') toolResult = await toolSubmitNewOrder(args)
            else toolResult = { error: 'Unknown tool' }
          } catch (toolErr) {
            toolResult = { error: toolErr instanceof Error ? toolErr.message : 'Tool call failed' }
          }
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult)
          })
        }
        continue // let the model see the tool results and respond again
      }

      finalReply = choice.content || "Sorry, I couldn't process that — could you try rephrasing?"
      break
    }

    if (!finalReply) {
      finalReply = "I'm having trouble completing that right now — please try again or use the contact form."
    }

    return new Response(JSON.stringify({ reply: finalReply, history: messages.filter(m => m.role !== 'system') }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
    })

  } catch (error) {
    console.error("Chatbot error:", error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
    })
  }
}