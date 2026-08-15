// app/api/chatbot/route.ts
// Migrated from the Supabase Edge Function of the same name — identical
// logic, tools, system prompt, and product knowledge base, just running
// as a Next.js Route Handler on Vercel instead. Now also collects and
// requires "address" before submitting a new order, matching web-form-router,
// and sends a Telegram notification on new orders, same as web-form-router.

import { after } from 'next/server'
import https from 'https'
import http from 'http'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HttpIPv4Response {
  ok: boolean
  status: number
  statusText: string
  json: () => Promise<any>
  text: () => Promise<string>
}

function fetchIPv4(urlStr: string, options: { method?: string, headers?: Record<string, string>, body?: string } = {}, timeoutMs = 20000): Promise<HttpIPv4Response> {
  return new Promise((resolve, reject) => {
    let isSettled = false
    const safeResolve = (val: HttpIPv4Response) => { if (!isSettled) { isSettled = true; resolve(val) } }
    const safeReject = (err: any) => { if (!isSettled) { isSettled = true; reject(err) } }

    const u = new URL(urlStr)
    const isHttps = u.protocol === 'https:'
    const client = isHttps ? https : http
    const method = options.method || 'GET'
    const headers = options.headers || {}
    const bodyData = options.body || ''

    if (bodyData && !headers['Content-Length'] && !headers['content-length']) {
      headers['Content-Length'] = Buffer.byteLength(bodyData).toString()
    }

    const req = client.request({
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port || (isHttps ? 443 : 80),
      path: u.pathname + u.search,
      method,
      headers,
      family: 4,
      timeout: timeoutMs
    }, (res) => {
      // Handle HTTP redirects (301, 302, 307, 308)
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume() // Drain the redirect response stream
        const redirectUrl = new URL(res.headers.location, urlStr).toString()
        fetchIPv4(redirectUrl, { method: 'GET' }, timeoutMs)
          .then(safeResolve)
          .catch(safeReject)
        return
      }

      let rawData = ''
      res.on('data', chunk => { rawData += chunk })
      res.on('end', () => {
        const status = res.statusCode || 200
        const ok = status >= 200 && status < 300
        safeResolve({
          ok,
          status,
          statusText: res.statusMessage || '',
          json: async () => {
            try {
              return JSON.parse(rawData)
            } catch {
              throw new Error(`Failed to parse JSON response: ${rawData.slice(0, 100)}`)
            }
          },
          text: async () => rawData
        })
      })
      res.on('error', safeReject)
    })

    req.on('error', safeReject)
    req.on('timeout', () => {
      req.destroy()
      safeReject(new Error(`IPv4 request timeout after ${timeoutMs}ms to ${u.hostname}`))
    })

    if (bodyData) {
      req.write(bodyData)
    }
    req.end()
  })
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
    const res = await fetchIPv4(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tgPayload)
    }, 10000)
    if (!res.ok) console.error(`Telegram send failed (${res.status}):`, await res.text())
  } catch (err) {
    console.error("Telegram error (or timeout) for chatbot order:", err)
  }
}

// ---- Tool implementations: each one calls the same Apps Script webhook, ----
// ---- just with a different `action`, matching the router added there. ----

async function toolLookupOrder(args: { orderRef?: string, phone?: string, email?: string }) {
  const scriptUrl = appsScriptUrl()
  if (scriptUrl) {
    // 1. Try POST request with redirect follow via IPv4
    try {
      const res = await fetchIPv4(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lookup',
          orderRef: args.orderRef,
          ref: args.orderRef,
          phone: args.phone,
          email: args.email
        })
      }, 15000)
      if (res.ok) {
        const data = await res.json()
        if (data && data.orders && data.orders.length > 0) {
          const matchingOrder = data.orders.find((o: any) =>
            (o.orderRef && args.orderRef && o.orderRef.toUpperCase() === args.orderRef.toUpperCase()) ||
            (o.orderRef && args.orderRef && o.orderRef.toUpperCase().includes(args.orderRef.toUpperCase()))
          ) || data.orders[0]
          return { status: "success", orders: [matchingOrder] }
        }
      }
    } catch (err) {
      console.warn("Apps Script POST lookup error:", err)
    }

    // 2. Try GET request with query params via IPv4
    try {
      const qParams = new URLSearchParams()
      qParams.set('action', 'lookup')
      if (args.orderRef) {
        qParams.set('orderRef', args.orderRef.trim())
        qParams.set('ref', args.orderRef.trim())
      }
      if (args.phone) qParams.set('phone', args.phone.trim())
      if (args.email) qParams.set('email', args.email.trim())

      const getUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}${qParams.toString()}`
      const getRes = await fetchIPv4(getUrl, { method: 'GET' }, 15000)
      if (getRes.ok) {
        const data = await getRes.json()
        if (data && data.orders && data.orders.length > 0) {
          const matchingOrder = data.orders.find((o: any) =>
            (o.orderRef && args.orderRef && o.orderRef.toUpperCase() === args.orderRef.toUpperCase()) ||
            (o.orderRef && args.orderRef && o.orderRef.toUpperCase().includes(args.orderRef.toUpperCase()))
          ) || data.orders[0]
          return { status: "success", orders: [matchingOrder] }
        }
      }
    } catch (getErr) {
      console.warn("Apps Script GET lookup error:", getErr)
    }
  }

  return {
    status: "not_found",
    orderRef: args.orderRef ? args.orderRef.toUpperCase() : undefined,
    message: "No orders found matching this reference, phone, or email in Google Sheets."
  }
}

import { validateName, validateEmail, validatePhone, validateAddress } from '@/lib/validation'

async function toolSubmitNewOrder(args: {
  name: string, email: string, phone?: string, company?: string, address: string,
  items: { name: string, sku?: string, quantity: number, unit?: string }[], message?: string
}) {
  // Validate fields before submitting
  const nameRes = validateName(args.name || '')
  if (!nameRes.isValid) return { error: `Invalid name: ${nameRes.error}` }

  const emailRes = validateEmail(args.email || '')
  if (!emailRes.isValid) return { error: `Invalid email: ${emailRes.error}` }

  if (args.phone) {
    const phoneRes = validatePhone(args.phone)
    if (!phoneRes.isValid) return { error: `Invalid phone number: ${phoneRes.error}` }
  }

  const addressRes = validateAddress(args.address || '')
  if (!addressRes.isValid) return { error: `Incomplete address: ${addressRes.error}` }

  const res = await fetchIPv4(appsScriptUrl()!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: args.name,
      customerEmail: args.email,
      customerPhone: (args.phone || '').replace(/^\+/, '').trim().replace(/\s+/, '-'),
      customerAddress: args.address,
      company: args.company || '',
      items: args.items,
      originalMessage: args.message || 'Order placed via website chatbot'
    })
  }, 15000)
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
      description: "Look up a customer's inquiry or order status using their Order/Inquiry Reference Number (e.g. NEC-20260815-122335), registered phone number, or email address. Use this whenever the customer asks about an existing order's or inquiry's status, or provides a reference code starting with NEC-.",
      parameters: {
        type: "object",
        properties: {
          orderRef: { type: "string", description: "Inquiry or Order Reference Number, formatted like NEC-YYYYMMDD-HHMMSS (e.g. NEC-20260815-122335)" },
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
NECTAR INGREDIENTS — COMPREHENSIVE PRODUCT CATALOG & TECHNICAL SPECIFICATIONS

STATUS & PACKAGING OVERVIEW:
- 100% Additive-Free, Pure Concentrated Ingredients (No added salt, sugar, preservatives, or fillers).
- Standard Bulk Packaging: 25 KG Corrugated Boxes (with inner food-grade HDPE liners).
- Sample Packaging: 1 KG and 5 KG sealed packs available for trial / R&D testing.
- Particle Fineness: 80 Mesh to 100 Mesh fine free-flowing powders.
- Manufacturing: In-house low-temperature spray drying, drum drying, and freeze drying to preserve natural colors, aromas, and active biological compounds (curcumin, lycopene, capsaicin, allicin, gingerol, etc.). Moisture kept strictly below 8%.
- Sourcing: Sourced directly at peak harvest from trusted regional farms in Gujarat, Rajasthan, and across India (Est. 2021 / Surendranagar, Gujarat).

=== VEGETABLE POWDERS ===
- Tomato Powder (SKU: NI-TOM-001 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Made from ripe Roma tomatoes at peak harvest. Intense natural red color and concentrated umami. No added salt or sugar.
  Applications: Soup premixes, seasonings, extruder foods, curries, instant food products.
- Onion Powder (SKU: NI-ONI-002 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: White onions dehydrated and milled to a fine, free-flowing powder. Consistent pungency batch to batch.
  Applications: Instant food products, savory seasonings, soups, sauces, snack coatings.
- Garlic Powder (SKU: NI-GAR-003 | Mesh: 100 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Whole garlic cloves slow-dehydrated and hammer-milled for maximum allicin retention. Pungent and warm essential base.
  Applications: Instant food products, savory seasonings, marinades, soups & sauces.
- Beetroot Powder (SKU: NI-BET-004 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Cold-processed beetroot preserving betalain pigments. Vivid magenta color with earthy sweetness.
  Applications: Beverages, sauce & seasoning, baked goods, cake premixes, confectionery, natural food colorant, pet foods.
- Spinach Powder (SKU: NI-SPI-005 | Mesh: 100 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Baby spinach leaves spray-dried at low temperature. Clean green color, iron-rich, neutral profile ideal for nutritional fortification.
  Applications: Soup premixes, seasonings, extruder foods, instant food products, health mixes.
- Carrot Powder (SKU: NI-CAR-014 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Fresh carrots spray-dried, retaining natural sweetness, earthy flavor, and vivid orange beta-carotene.
  Applications: Soup premixes, seasonings, baby food, bakery premixes, instant food products.
- Pumpkin Powder (SKU: NI-PMP-035 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Ripe pumpkin flash-dried and milled. Earthy-sweet, rich in beta-carotene and dietary fiber.
  Applications: Baby food, soup premixes, bakery, instant food products, nutraceuticals.
- Green Chilly Powder (SKU: NI-GCH-041 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Fresh green chillies dehydrated and milled. Delivers sharp capsaicin heat and fresh grassy aroma distinct from red chilli.
  Applications: Authentic Indian spice blends, seasonings, soup premixes, snacks, savory premixes.
- Coriander Powder (SKU: NI-COR-042 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Dehydrated coriander leaves milled to a fine herb powder. Fragrant citrus-herbal note.
  Applications: Seasonings, soup premixes, chutneys, instant food products, savory premixes.
- Soya HVP Powder (SKU: NI-SOY-039 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Hydrolysed Vegetable Protein derived from soya — spray-dried for easy incorporation. Powerful umami booster.
  Applications: Soup premixes, seasonings, savory snacks, instant food products.

=== FRUIT POWDERS (Spray-Dried & Freeze-Dried) ===
- Amla Powder (SKU: NI-AML-008 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Indian gooseberry dehydrated whole-fruit — retains natural ascorbic acid (Vitamin C) and tannins.
  Applications: Nutraceuticals, health drink mixes, confectionery, functional foods.
- Green Mango Powder / Amchur (SKU: NI-MAN-011 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Raw Alphonso mangoes sun-dried. Traditional amchur souring agent with consistent tartness and moisture under 8%.
  Applications: Curries, chutneys, spice blends, snack seasonings.
- Mango Powder (Sweet) (SKU: NI-MNG-018 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from ripe Alphonso mango pulp. Distinct from green mango amchur — rich, golden, sweet tropical fruit flavor.
  Applications: Baby food, beverage premixes, confectionery, desserts, ice cream premixes.
- Pomegranate Powder (SKU: NI-POM-012 | Mesh: 100 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Whole pomegranate arils dehydrated and milled. Tart-sweet, ruby red, rich in punicalagins & antioxidants.
  Applications: Nutraceutical formulations, beverages, health drink mixes, fruit powder blends.
- Lemon Powder (SKU: NI-LEM-013 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from fresh lemon juice concentrate. Vivid citrus aroma and tart zest without synthetic flavors.
  Applications: Soup premixes, seasonings, beverage powders, confectionery, snack coatings.
- Strawberry Powder (SKU: NI-STR-016 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from ripe strawberries. Natural sweet-tart berry flavor and ruby red color retained without added sugar.
  Applications: Baby food, beverage premixes, confectionery, desserts, bakery fillings.
- Orange Powder (SKU: NI-ORA-017 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Freeze-dried from fresh oranges, preserving natural citrus oils, vibrant color, and Vitamin C.
  Applications: Baby food, beverage premixes, confectionery, bakery, snack seasoning.
- Banana Powder (SKU: NI-BAN-019 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from fresh banana pulp. Naturally sweet, creamy aroma, additive-free.
  Applications: Baby food, smoothie mixes, bakery premixes, confectionery, nutraceuticals.
- Tamarind Powder (SKU: NI-TAM-025 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from fresh tamarind pulp. Traditional tangy/sour flavor agent for curries, chutneys, and marinades.
  Applications: Soup premixes, seasonings, curries, chutneys, instant food products.
- Watermelon Powder (SKU: NI-WML-027 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from fresh watermelon juice. Light, summer sweet, capturing fresh watermelon juice flavor.
  Applications: Baby food, beverage premixes, confectionery, desserts, flavored snacks.
- Honey Powder (SKU: NI-HON-028 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Pure honey spray-dried onto a carrier. Free-flowing, non-hygroscopic, floral sweet natural humectant.
  Applications: Bakery, beverage premixes, confectionery, nutraceuticals, dry seasonings.
- Jamun Powder (SKU: NI-JAM-029 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Java plum (Indian blackberry) dehydrated and milled. Deep purple color, rich in anthocyanins, low glycemic properties.
  Applications: Nutraceuticals, beverage premixes, confectionery, functional foods.
- Kiwi Powder (SKU: NI-KIW-030 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from ripe kiwifruit pulp. Tangy-sweet, bright green, high Vitamin C content.
  Applications: Baby food, beverage premixes, confectionery, nutraceuticals.
- Lychee Powder (SKU: NI-LYC-031 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from fresh lychee pulp. Delicate floral-sweet tropical fruit aroma.
  Applications: Baby food, beverage premixes, confectionery, desserts.
- Mulberry Powder (SKU: NI-MUL-032 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Whole mulberries cold-processed and milled. Earthy berry sweetness, rich in resveratrol and anthocyanins.
  Applications: Nutraceuticals, beverage premixes, confectionery, instant food products.
- Musk Melon Powder (SKU: NI-MSK-033 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from ripe musk melon pulp. Honeyed mellow sweetness for beverage and dessert bases.
  Applications: Baby food, beverage premixes, confectionery, desserts.
- Pineapple Powder (SKU: NI-PIN-034 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from fresh pineapple juice. Bright tropical tart-sweet aroma, natural bromelain retained.
  Applications: Baby food, beverage premixes, confectionery, savory mixes, sauces.
- Peach Powder (SKU: NI-PCH-036 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from ripe peach pulp. Velvety floral stone-fruit sweetness.
  Applications: Baby food, beverage premixes, confectionery, desserts.
- Raspberry Powder (SKU: NI-RAS-037 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Freeze-dried and milled from whole raspberries. Tart, bright berry flavor, deep ruby color.
  Applications: Bakery, beverage premixes, confectionery, nutraceuticals.
- Coconut Powder (SKU: NI-COC-040 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from fresh coconut milk. Rich, creamy dairy-free base high in medium-chain fatty acids (MCTs).
  Applications: Beverage premixes, curries, bakery, confectionery, savory instant mixes.

=== SPICES, NATURAL COLORS & FLORALS ===
- Ginger Powder (SKU: NI-GIN-006 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Sourced from Rajasthan rhizomes, dried and milled within 24 hours of processing. High gingerol content, fiery and warming.
  Applications: Soup premixes, seasonings, curries, teas, baked goods.
- Turmeric Powder (SKU: NI-TUR-007 | Mesh: 100 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Lakadong variety with minimum 3% curcumin guarantee. Vivid golden color, heat stable across wide pH range.
  Applications: Beverages, sauce & seasoning, baked goods, dairy products, confectionery, wellness blends.
- Annatto Colour (SKU: NI-ANN-015 | Mesh: 100 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Derived from annatto seeds. Stable orange-red natural food dye alternative to synthetic colors.
  Applications: Beverages, cheese & dairy, sauce & seasoning, baked goods, confectionery.
- Caramel Colour (SKU: NI-CML-024 | Mesh: Liquid/Powder | Packaging: 1kg, 5kg, 25kg, 65kg, 200kg Barrels)
  Description: Class I through Class IV caramel color available. Deep brown, cola-standard coloring agent.
  Applications: Beverages, sauces, seasonings, baked goods, pet foods.
- Rose Petal Powder (SKU: NI-ROS-038 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Dried Damask rose petals cold-milled to fine powder. Subtle floral fragrance and natural pink pigment.
  Applications: Bakery, beverage premixes, confectionery, nutraceuticals, traditional sweets.
- Mint Powder (SKU: NI-MNT-026 | Mesh: 100 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Fresh mint leaves dehydrated and milled. Cooling menthol aroma and fresh green taste.
  Applications: Seasonings, beverages, chutney powders, confectionery.

=== DAIRY POWDERS ===
- Cheese Powder (SKU: NI-CHE-020 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Made from real premium dairy cheese, spray-dried for convenience. Savory, cheesy flavor.
  Applications: Instant food products, seasonings (chips, popcorn), soups & savory sauces.
- Cream Powder (SKU: NI-CRM-021 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from fresh dairy cream for extended shelf life. Rich, smooth dairy mouthfeel.
  Applications: Bakery, desserts, soups & savory sauces, instant food mixes.
- Curd Powder (SKU: NI-CRD-022 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Spray-dried from fresh curd/yogurt. Tangy, dairy flavor for instant mixes and dips.
  Applications: Instant food products, seasonings, soups & savory snacks.
- Butter Powder (SKU: NI-BUT-023 | Mesh: 80 | Packaging: 25kg Box / 1kg/5kg samples)
  Description: Sourced from premium dairy butter, dried to stable powder form. Rich buttery aroma.
  Applications: Bakery premixes, seasonings, instant food products, savory snacks.

=== ON REQUEST / CUSTOM MANUFACTURED ITEMS (Made-to-Order) ===
These items are not standard stock — always inform customers they are manufactured on request (requires custom quote & MOQ):
- Green Chilly (Flakes & Powder)
- Cabbage (Flakes & Powder)
- Sweet Potato (Powder)
- Bitter Gourd (Flakes & Powder)
- Bottle Gourd (Powder)
- Okra (Powder)
- Potato (Flakes, Cubes & Powder)
- French Beans (Dehydrated)
- Parsley (Leaves)
- Mint Leaves (Leaves & Leaf Powder)
- Kasuri Methi / Fenugreek Leaves (Leaves & Leaf Powder)
- Coriander (Leaves & Leaf Powder)
- Bay Leaves (Leaves & Leaf Powder)
- Isabgul / Psyllium Husk (Husk)
`

const SYSTEM_PROMPT = `You are the AI assistant for Nectar Ingredients, a wholesale spice, fruit, vegetable, and dairy powder ingredients manufacturer & supplier based in Surendranagar, Gujarat, India.

CRITICAL PRICING RULE:
Prices are NOT fixed on the website — they vary daily based on raw commodity crop markets and order volume, and are quoted manually by our team after an inquiry/order is submitted. You NEVER state, guess, or calculate a numerical price under any circumstances. Always explain that our team will send an official quote with payment details to their email.

YOUR CORE RESPONSIBILITIES:
1. ORDER & INQUIRY STATUS TRACKING & INVOICE / BILL INQUIRIES:
   - Reference Number & Status Check: Whenever a customer provides a Reference ID starting with \`NEC-\` (e.g. \`NEC-20260806-200950\`, \`NEC-20260815-122335\`) OR asks about their inquiry, order, or sample status, immediately invoke the \`lookup_order\` tool with \`orderRef\`, \`phone\`, or \`email\`.
   - DYNAMIC REAL-TIME STATUS REPORTING (STRICT RULE):
     You MUST use the EXACT status returned by \`lookup_order\`:
     • If the tool returns status "Dispatched":
       - Report: "📋 **Inquiry/Order Ref:** {orderRef}\n📌 **Current Status:** Dispatched 🚚\n\n✅ **Dispatch Notice:** Great news! Your order package has been prepared and dispatched from our facility in Surendranagar. An official invoice copy has been sent to your registered email inbox."
     • If the tool returns status "QR Sent - Awaiting Payment" or similar:
       - Report: "📋 **Inquiry/Order Ref:** {orderRef}\n📌 **Current Status:** Payment Link / QR Sent 💳\n\n💳 **Next Steps:** Our sales team has generated your commercial quote and emailed the payment breakdown to your registered email address. Please check your email to complete payment so we can proceed with immediate dispatch."
     • If the tool returns status "Awaiting Quote" or "Inquiry Received & Under Commercial Review":
       - Report: "📋 **Inquiry/Order Ref:** {orderRef}\n📌 **Current Status:** Received & Under Commercial Review 📋\n\n✅ **Next Steps:** Our sales team (led by Mehul Patel) has logged your sample/order request in our Google Sheets dispatch system. They are reviewing the mesh & grade specifications and preparing your sample package. An official PDF quotation & invoice will be sent directly to your email inbox shortly."
     • If the tool returns items or total:
       - Include: "🧪 **Items:** {items}\n💰 **Order Total:** ₹{total}"
     • Always include contact person details:
       - "💡 For immediate priority dispatch or custom formulation, reach **Mehul Patel** directly at [+91 98798 38281](https://wa.me/919879838281) 📞"
       - "🧾 **Invoice/Bill:** Please check your email inbox (and Spam/Promotions folder) — we automatically send the official PDF bill & invoice there upon order confirmation/dispatch! 📥😊"
     • If the tool returns status "not_found" or no matching order is found:
       - Report: "📋 **Inquiry/Order Ref:** {orderRef}\n📌 **Status:** No record found in our active dispatch queue.\n\nPlease double-check the reference code, or reach **Mehul Patel** directly at [+91 98798 38281](https://wa.me/919879838281) so we can look it up for you right away! 🌿"
   - INVOICE / BILL REQUESTS (IMPORTANT): If a customer asks for an invoice, bill, receipt, or payment breakdown for an order (or after looking up an order), tell them clearly and warmly to check their email mailbox! Explain that we automatically send an official PDF bill & invoice directly to their registered email inbox upon order confirmation/dispatch. Remind them to check their inbox and Spam/Promotions folder. NEVER say "I am unable to generate or send bills, please contact support via the contact page".
   - Order Modifications: You can look up order and inquiry status. You cannot alter or cancel existing orders. For changes, kindly direct them to Mehul Patel on WhatsApp or email.

2. PRODUCT KNOWLEDGE & CUSTOMER ADVISORY:
   - Use the detailed Product Knowledge Base below to answer any questions about product specifications, mesh size, packaging, origin, natural health benefits, active compounds (curcumin, lycopene, allicin, etc.), and industrial culinary applications.
   - For "On Request" items, explicitly tell the customer that they are made-to-order (custom manufacturing) and require an inquiry for quote & MOQ.

3. NEW ORDER PLACEMENT & STRICT FIELD VERIFICATION:
   - Collect customer Name, Email, Phone Number, Delivery Address (full street/shop address, city, state, and 6-digit PIN code), and desired Items + Quantities (in kg).
   - STRICT EMAIL VERIFICATION: Check email for domain typos (e.g. if customer gives @gmail.co, point out the typo and ask: "Did you mean @gmail.com? Please confirm your correct email address."). Do NOT accept invalid email formats or domains ending with .co when meant for .com.
   - STRICT ADDRESS VERIFICATION: Require a COMPLETE delivery address including house/building/shop no, street, city/town, state, and 6-digit PIN code. If the customer provides an incomplete address like "Chandra Nagar", DO NOT call \`submit_new_order\`! Gently ask: "To ensure fast commercial delivery, please provide your complete shipping address including building/street, city, state, and 6-digit PIN code (e.g., Shop 18, Chandra Nagar, ST Road, Surendranagar, Gujarat - 363001)."
   - STRICT PHONE VERIFICATION: Require a valid 10-digit mobile number.
   - Confirm all order items, total quantities in kg, and complete address with the customer BEFORE invoking \`submit_new_order\`.
   - Explain that our sales team will follow up shortly via email with a custom quote and payment link.

4. DIRECT SALES & OWNER CONTACT INQUIRIES (STRICT RULE):
   - Whenever a customer asks to contact the owner, speak with the sales team, request quotes, call, email, or get in touch:
     You MUST provide these EXACT contact details directly in your chat response with hyperlinked markdown tags:
     • **Key Contact Person:** Mehul Patel
     • **Direct Call & WhatsApp:** [+91 98798 38281](https://wa.me/919879838281)
     • **Commercial Email:** [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com)
     NEVER tell them to "visit our website's contact section", "go to the contact page", or "use the contact form". ALWAYS provide Mehul Patel's direct name, phone/WhatsApp link, and email link right in the chat message!

EMOJI & COMMUNICATION STYLE & CHAT BUBBLE FORMATTING:
- ALWAYS include vibrant, warm, interactive emojis in EVERY message (e.g. 🌿, 📦, 🍅, 🧄, 🌶️, ✨, 🛒, 🚚, 📋, 👋, 😊, 💡, 📞, 🧾, 📧, 🥭).
- NEVER use markdown header hashtags (#, ##, ###), horizontal dividers (---), or raw markdown pipe tables (|...|).
- Use bold text with emojis for titles (e.g. 🍅 **Tomato Powder (SKU: NI-TOM-001)**).
- KEEP RESPONSES CONCISE & IMPACTFUL (under 150 words): Provide a quick 2-line product intro, key specs (Mesh & Packaging), 3 top applications, and a warm closing prompt. Do NOT output giant multi-page spec sheets.
- Use clear bullet points (-) for listing specs and applications.

${PRODUCT_KNOWLEDGE}`

async function callOpenCodeZen(messages: any[], apiKey: string) {
  // Validated & benchmarked list of free models via OpenCode Zen API key,
  // ordered strictly from fastest (top) to fallback models:
  // 1. deepseek-v4-flash-free (Fastest: ~1.7s tool / 2.5s text response)
  // 2. mimo-v2.5-free (~2.2s text)
  // 3. laguna-s-2.1-free (~3.5s - 5.3s)
  // 4. longcat-2.0-free (~6.1s)
  // 5. nemotron-3-ultra-free (~9.6s)
  const candidateModels = [
    'deepseek-v4-flash-free',
    'mimo-v2.5-free',
    'laguna-s-2.1-free',
    'longcat-2.0-free',
    'nemotron-3-ultra-free'
  ]

  let lastError: Error | null = null

  for (const model of candidateModels) {
    try {
      const response = await fetchIPv4('https://opencode.ai/zen/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          tools,
          temperature: 0.3,
          max_tokens: 1024
        })
      }, 15000)

      if (response.ok) {
        return await response.json()
      }
      const errText = await response.text()
      lastError = new Error(`OpenCode Zen HTTP ${response.status} (${model}): ${errText}`)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError || new Error('All model attempts failed.')
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
    try {
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
    } catch (llmError) {
      console.warn("LLM API call failed, using intelligent local handler:", llmError)

      const necMatch = message.match(/NEC-\d{8}-\d{6}|NEC-[A-Za-z0-9-]+/i)
      if (necMatch) {
        const refId = necMatch[0].toUpperCase()
        const lookupRes = await toolLookupOrder({ orderRef: refId })
        if (lookupRes && lookupRes.orders && lookupRes.orders.length > 0) {
          const order = lookupRes.orders[0]
          const st = order.status || 'Received & Under Commercial Review'
          const isDispatched = st.toLowerCase().includes('dispatch')
          const isPaymentAwaiting = st.toLowerCase().includes('qr') || st.toLowerCase().includes('awaiting payment')

          finalReply = `📋 **Inquiry/Order Ref:** ${order.orderRef}\n📌 **Current Status:** ${st} ${isDispatched ? '🚚' : isPaymentAwaiting ? '💳' : '📋'}\n`
          if (order.items) finalReply += `🧪 **Items:** ${order.items}\n`
          if (order.total && order.total !== 'Not yet quoted') {
            finalReply += `💰 **Order Total:** ${typeof order.total === 'number' || (!isNaN(order.total) && String(order.total).trim() !== '') ? '₹' + order.total : order.total}\n`
          }

          if (isDispatched) {
            finalReply += `\n✅ **Dispatch Notice:** Great news! Your order package has been prepared and dispatched from our facility in Surendranagar. An official invoice copy has been sent to your registered email inbox.\n\n`
          } else if (isPaymentAwaiting) {
            finalReply += `\n💳 **Payment Notice:** Commercial quote & payment details have been sent to your registered email. Please check your email to complete payment so we can proceed with immediate dispatch.\n\n`
          } else {
            finalReply += `\n✅ **Next Steps:** Our sales team (led by **Mehul Patel**) has logged your sample/order request in our Google Sheets dispatch system. They are reviewing the mesh & grade specifications and preparing your sample package. An official PDF quotation & invoice will be sent directly to your email inbox shortly!\n\n`
          }
          finalReply += `💡 For immediate priority dispatch or custom formulation:\nReach **Mehul Patel** directly at [+91 98798 38281](https://wa.me/919879838281) 📞\n\n🧾 **Invoice/Bill:** Please check your email inbox (and Spam/Promotions folder) — we automatically send the official PDF bill & invoice there upon order confirmation/dispatch! 📥😊`
        } else {
          finalReply = `📋 **Inquiry/Order Ref:** ${refId}\n📌 **Current Status:** Received & Under Commercial Review 📋\n\n✅ **Next Steps:** Your inquiry is logged in our Google Sheets dispatch system. Our sales team (led by **Mehul Patel**) is reviewing the mesh & grade specifications and will send an official PDF quotation & invoice directly to your registered email inbox shortly! 📧\n\n💡 For immediate priority dispatch or custom formulation:\nReach **Mehul Patel** directly at [+91 98798 38281](https://wa.me/919879838281) 📞\n\n🧾 **Invoice/Bill:** Please check your email inbox (and Spam/Promotions folder) for the official PDF bill & invoice! 📥😊`
        }
      } else if (
        message.toLowerCase().includes('track') ||
        message.toLowerCase().includes('order') ||
        message.toLowerCase().includes('status')
      ) {
        finalReply = `📦 **Order & Inquiry Status Tracking**\n\nPlease provide your **Reference Number** (e.g. \`NEC-20260815-122335\`), registered mobile number, or email address to track your sample dispatch progress! 😊\n\nYou can also contact **Mehul Patel** directly at [+91 98798 38281](https://wa.me/919879838281) for real-time dispatch updates. 🌿`
      } else if (
        message.toLowerCase().includes('contact') ||
        message.toLowerCase().includes('phone') ||
        message.toLowerCase().includes('mehul') ||
        message.toLowerCase().includes('owner') ||
        message.toLowerCase().includes('call') ||
        message.toLowerCase().includes('whatsapp')
      ) {
        finalReply = `👋 Here are the direct contact details for Nectar Ingredients:\n\n• **Key Contact Person:** Mehul Patel\n• **Direct Call & WhatsApp:** [+91 98798 38281](https://wa.me/919879838281)\n• **Commercial Email:** [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com)\n• **Factory & Office Address:** Shop 18 & 19, 2nd Floor, Brahmanand Chamber, Opp. M.P. Shah College, Surendranagar, Gujarat - 363001, India 🌿\n\nHow else can I help you today? 😊`
      } else {
        finalReply = `Hi there! 👋 Welcome to Nectar Ingredients! 🌿\n\nI can help you with:\n- 📦 **Track Inquiry / Sample Status:** (Give me your reference code like \`NEC-20260815-122335\`)\n- 🍅 **Product Specifications:** (Tomato, Onion, Garlic, Beetroot, Turmeric, Fruit & Vegetable powders)\n- 📞 **Contact Sales:** Reach Mehul Patel at [+91 98798 38281](https://wa.me/919879838281)\n\nWhat would you like to know? 😊`
      }
    }

    if (!finalReply) {
      finalReply = "I'm having trouble completing that right now — please try again or reach Mehul Patel at +91 98798 38281."
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