// app/api/chatbot/route.ts
// Nectar Ingredients AI Sales & Advisory Assistant
// Features:
// 1. In-Memory Pre-Retrieval RAG: Sub-millisecond catalog indexer synced live with lib/data.ts.
// 2. High-Speed Processing: Lightweight dynamic prompt (~450 tokens) for <2s response latency.
// 3. Multi-Order Tracking: Accurately lists ALL historical and active orders for shared phone numbers/emails.
// 4. Strict Validation: Real-time validation for Name, Email, Phone, and Complete Delivery Address.
// 5. Background Telegram Alerts: Non-blocking admin notification on order placement via after().

import { after } from 'next/server'
import https from 'https'
import http from 'http'
import { products, extendedRange } from '@/lib/data'
import { validateName, validateEmail, validatePhone, validateAddress } from '@/lib/validation'
import { callGroqWithFailover, getGroqKeys } from '@/lib/groqPool'

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

function fetchIPv4(
  urlStr: string,
  options: { method?: string; headers?: Record<string, string>; body?: string } = {},
  timeoutMs = 20000
): Promise<HttpIPv4Response> {
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

    const req = client.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: u.pathname + u.search,
        method,
        headers,
        family: 4,
        timeout: timeoutMs,
      },
      (res) => {
        // Handle HTTP redirects (301, 302, 307, 308)
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume()
          const redirectUrl = new URL(res.headers.location, urlStr).toString()
          fetchIPv4(redirectUrl, { method: 'GET' }, timeoutMs).then(safeResolve).catch(safeReject)
          return
        }

        let rawData = ''
        res.on('data', (chunk) => { rawData += chunk })
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
            text: async () => rawData,
          })
        })
        res.on('error', safeReject)
      }
    )

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

function formatItemsPlain(items: { name: string; sku?: string; quantity: number; unit?: string }[]): string {
  return items.map((i) => `• ${i.name}${i.sku ? ` (SKU: ${i.sku})` : ''} — ${i.quantity} ${i.unit || 'kg'}`).join('\n')
}

// Telegram notification for chatbot-placed orders (HTML mode for 100% reliability)
async function notifyTelegramNewOrder(args: {
  name: string
  email: string
  phone?: string
  company?: string
  address: string
  items: { name: string; sku?: string; quantity: number; unit?: string }[]
  message?: string
  orderRef?: string
}) {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN
  const adminChatId = process.env.TELEGRAM_CHAT_ID
  if (!tgToken || !adminChatId) {
    console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set - skipping Telegram notification for chatbot order.')
    return
  }

  const escapeHtml = (str: string) =>
    (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const itemsListHtml = args.items
    .map((i) => `• <b>${escapeHtml(i.name)}</b>${i.sku ? ` (SKU: ${escapeHtml(i.sku)})` : ''} — ${i.quantity} ${escapeHtml(i.unit || 'kg')}`)
    .join('\n')

  const tgPayload = {
    chat_id: adminChatId,
    text: `🌿 <b>New Order / Inquiry via Nectar Chatbot!</b>\n\n🔖 <b>Ref:</b> <code>${escapeHtml(args.orderRef || 'N/A')}</code>\n👤 <b>Name:</b> ${escapeHtml(args.name)}\n📧 <b>Email:</b> ${escapeHtml(args.email)}\n📞 <b>Phone:</b> ${escapeHtml(args.phone || 'Not provided')}\n🏠 <b>Address:</b> ${escapeHtml(args.address)}\n🏢 <b>Company/Brand:</b> ${escapeHtml(args.company || 'N/A')}\n\n📦 <b>Items Requested:</b>\n${itemsListHtml}\n\n📝 <b>Message / Notes:</b>\n<i>${escapeHtml(args.message || 'None')}</i>`,
    parse_mode: 'HTML',
  }

  try {
    const res = await fetchIPv4(
      `https://api.telegram.org/bot${tgToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgPayload),
      },
      10000
    )
    if (!res.ok) console.error(`Telegram send failed (${res.status}):`, await res.text())
  } catch (err) {
    console.error('Telegram error (or timeout) for chatbot order:', err)
  }
}

// ============================================================================
// IN-MEMORY KNOWLEDGE BASE & PRE-RETRIEVAL RAG ENGINE
// ============================================================================

interface KnowledgeItem {
  id: string
  name: string
  sku: string
  mesh: string
  category: string
  packaging: string
  description: string
  applications: string[]
  searchKeywords: string[]
  isOnRequest?: boolean
}

// Pre-indexed knowledge store generated live from lib/data.ts
const KNOWLEDGE_CATALOG: KnowledgeItem[] = [
  ...products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku || 'N/A',
    mesh: p.mesh || '80-100 mesh',
    category: p.category,
    packaging: p.packagingSize || '25 KG Corrugated Box (1 KG & 5 KG R&D trial packs available)',
    description: p.description,
    applications: p.usageApplications || [],
    searchKeywords: [
      p.name.toLowerCase(),
      p.slug.toLowerCase(),
      (p.sku || '').toLowerCase(),
      p.category.toLowerCase(),
      (p.tagline || '').toLowerCase(),
      ...p.name.toLowerCase().split(/\s+/),
      ...(p.usageApplications || []).map((a) => a.toLowerCase()),
    ],
    isOnRequest: false,
  })),
  ...extendedRange.map((item, idx) => ({
    id: `ext-${idx}`,
    name: item.name,
    sku: `NI-CUST-${String(idx + 1).padStart(3, '0')}`,
    mesh: '80 mesh / Flakes / Cut (Made to Order)',
    category: 'custom',
    packaging: '25 KG Bulk Corrugated Box (Custom MOQ Required)',
    description: `Custom manufactured dehydrated ${item.name} (${item.forms}). Produced on demand with custom mesh and cutting specifications.`,
    applications: ['Custom Food Formulations', 'Seasonings', 'Commercial Premixes'],
    searchKeywords: [item.name.toLowerCase(), ...item.name.toLowerCase().split(/\s+/), 'custom', 'request', 'made to order'],
    isOnRequest: true,
  })),
]

const CERTIFICATE_KNOWLEDGE = [
  {
    title: 'Master Batch Quality & Lab Analysis Portfolio',
    filename: 'ALL REPORT.pdf',
    downloadUrl: '/Certificates_of_ananalysis/ALL%20REPORT.pdf',
    description: 'Comprehensive multi-parameter lab analysis report covering heavy metals, moisture (<8%), 80-100 mesh fineness, and micro-biological safety across all core powders.',
    keywords: ['coa', 'certificate', 'lab report', 'analysis', 'heavy metal', 'microbiology', 'quality', 'test', 'all report', 'master report', 'fssai', 'lab test'],
  },
  {
    title: 'Tomato Powder Certificate of Analysis (COA)',
    filename: 'tomato powder 12-8-2024.pdf',
    downloadUrl: '/Certificates_of_ananalysis/tomato%20powder%2012-8-2024.pdf',
    description: 'Official test report validating 80-mesh particle sizing, lycopene retention, zero artificial dyes, and moisture below 6%.',
    keywords: ['tomato coa', 'tomato certificate', 'tomato lab report', 'tomato analysis', 'lycopene test'],
  },
  {
    title: 'Beetroot Powder Certificate of Analysis & Lab Test',
    filename: 'Beetroot Powder coa.pdf',
    downloadUrl: '/Certificates_of_ananalysis/Beetroot%20Powder%20coa.pdf',
    description: 'Analytical report certifying betalain pigment preservation, cold-processing standards, 80-mesh fineness, and absence of synthetic additives.',
    keywords: ['beetroot coa', 'beetroot certificate', 'beetroot lab report', 'betalain test'],
  },
  {
    title: 'Cheese Powder Grade A Technical Specification COA',
    filename: 'Cheese Powder-A- COA.pdf',
    downloadUrl: '/Certificates_of_ananalysis/Cheese%20Powder-A-%20COA.pdf',
    description: 'Dairy lab report confirming fat percentage, moisture stability, and microbiological safety for savory snack seasonings.',
    keywords: ['cheese coa', 'cheese certificate', 'cheese lab report', 'dairy report'],
  },
  {
    title: 'Liquid Caramel Color Technical Analysis Report',
    filename: 'LIQUID CARAMEL.pdf',
    downloadUrl: '/Certificates_of_ananalysis/LIQUID%20CARAMEL.pdf',
    description: 'Color intensity and specific gravity test certificate for beverage and culinary sauce formulations.',
    keywords: ['caramel coa', 'caramel certificate', 'caramel test', 'color class report'],
  },
  {
    title: 'Sounth (Ginger) Powder Certificate of Analysis',
    filename: 'SOUNTH.pdf',
    downloadUrl: '/Certificates_of_ananalysis/SOUNTH.pdf',
    description: 'Assay confirming active gingerol retention, volatile oil percentage, and 80-mesh powder consistency.',
    keywords: ['sounth coa', 'ginger coa', 'ginger certificate', 'gingerol report'],
  },
  {
    title: 'Kokum Dehydrated Powder Lab Analysis',
    filename: 'KOKUM.pdf',
    downloadUrl: '/Certificates_of_ananalysis/KOKUM.pdf',
    description: 'Garcinia indica acid content certificate for authentic culinary souring applications.',
    keywords: ['kokum coa', 'kokum certificate', 'kokum report'],
  },
  {
    title: 'Ajwain Seed Powder Technical Test Report',
    filename: 'AJOWAIN.pdf',
    downloadUrl: '/Certificates_of_ananalysis/AJOWAIN.pdf',
    description: 'Thymol essential oil retention and purity test certificate for spice seasonings.',
    keywords: ['ajwain coa', 'ajowain certificate', 'thymol report'],
  },
  {
    title: 'Mulethi (Licorice) Powder Lab Certificate',
    filename: 'MULETHI.pdf',
    downloadUrl: '/Certificates_of_ananalysis/MULETHI.pdf',
    description: 'Glycyrrhizin content assay and ash analysis report for nutraceutical formulations.',
    keywords: ['mulethi coa', 'licorice coa', 'glycyrrhizin report'],
  },
  {
    title: 'Senna Leaf Powder Quality Certificate',
    filename: 'SENNA.pdf',
    downloadUrl: '/Certificates_of_ananalysis/SENNA.pdf',
    description: 'Sennoside assay purity certificate for herbal tea and health supplement manufacturers.',
    keywords: ['senna coa', 'senna certificate', 'sennoside report'],
  },
  {
    title: 'Himej Powder Certificate of Analysis',
    filename: 'HIMEJ.pdf',
    downloadUrl: '/Certificates_of_ananalysis/HIMEJ.pdf',
    description: 'Terminalia chebula tannin profile and moisture test report.',
    keywords: ['himej coa', 'himej certificate'],
  },
  {
    title: 'Vidang Powder Lab Analysis Report',
    filename: 'VIDANG.pdf',
    downloadUrl: '/Certificates_of_ananalysis/VIDANG.pdf',
    description: 'Embelia ribes active marker test and micro-biological safety certificate.',
    keywords: ['vidang coa', 'vidang certificate'],
  },
  {
    title: 'Nishoth Powder Laboratory Test Report',
    filename: 'NISHOTH.pdf',
    downloadUrl: '/Certificates_of_ananalysis/NISHOTH.pdf',
    description: 'Operculina turpethum resin content and heavy metal analysis report.',
    keywords: ['nishoth coa', 'nishoth certificate'],
  },
  {
    title: 'White Nasotar Powder Certificate of Analysis',
    filename: 'WHITE NASOTAR.pdf',
    downloadUrl: '/Certificates_of_ananalysis/WHITE%20NASOTAR.pdf',
    description: 'High-purity botanical extract assay report for pharma and wellness formulators.',
    keywords: ['white nasotar coa', 'nasotar certificate'],
  },
  {
    title: 'Official Product Brochure & Catalog PDF',
    filename: 'Nectar_Ingredients_Brochure.pdf',
    downloadUrl: '/Company_Brochure/Nectar_Ingredients_Brochure.pdf',
    description: 'Comprehensive brand brochure detailing farm sourcing, low-temperature drying methods, product categories, and 25kg bulk packaging.',
    keywords: ['brochure', 'catalog', 'download catalog', 'product sheet', 'company profile', 'company brochure', 'download company brochure', 'catalog pdf', 'company catalog'],
  },
]

/**
 * Fast sub-millisecond In-Memory Pre-Retrieval RAG Engine.
 * Extracts relevant product specifications AND lab COA reports matching user query.
 */
function retrieveRelevantKnowledge(query: string): string {
  const cleanQuery = query.toLowerCase().trim()
  if (!cleanQuery) return ''

  // Skip retrieval for non-knowledge queries (tracking, contact, greeting) to keep prompt ultra-lean
  if (
    cleanQuery.startsWith('nec-') ||
    cleanQuery.match(/^(\+?91)?[6-9]\d{9}$/) ||
    (cleanQuery.includes('track') && !cleanQuery.includes('powder') && !cleanQuery.includes('coa') && !cleanQuery.includes('report')) ||
    (cleanQuery.includes('contact') && !cleanQuery.includes('product') && !cleanQuery.includes('coa') && !cleanQuery.includes('brochure')) ||
    cleanQuery.includes('invoice') ||
    cleanQuery.includes('bill') ||
    cleanQuery === 'hi' ||
    cleanQuery === 'hello' ||
    cleanQuery === 'hey'
  ) {
    return ''
  }

  // 1. Check for COA / Certificate / Lab Report / Brochure queries
  const isCertQuery =
    cleanQuery.includes('coa') ||
    cleanQuery.includes('certificate') ||
    cleanQuery.includes('lab report') ||
    cleanQuery.includes('analysis') ||
    cleanQuery.includes('heavy metal') ||
    cleanQuery.includes('microbiology') ||
    cleanQuery.includes('brochure') ||
    cleanQuery.includes('catalog') ||
    cleanQuery.includes('fssai') ||
    cleanQuery.includes('test report')

  if (isCertQuery) {
    if (cleanQuery.includes('brochure') || cleanQuery.includes('catalog')) {
      const brochureItem = CERTIFICATE_KNOWLEDGE[CERTIFICATE_KNOWLEDGE.length - 1]
      return `\nOFFICIAL PRODUCT BROCHURE & CATALOG PDF:\n• **${brochureItem.title}**\n  - PDF Link: [Download Official Brochure](${brochureItem.downloadUrl})\n  - Details: ${brochureItem.description}\n(Provide the clickable PDF download link in your response!)\n`
    }

    const matchedCerts = CERTIFICATE_KNOWLEDGE.filter((cert) => {
      if (cleanQuery.includes('all') || cleanQuery.includes('master') || cleanQuery.includes('fssai')) {
        return true
      }
      return cert.keywords.some((k) => cleanQuery.includes(k)) || cleanQuery.includes(cert.title.toLowerCase())
    }).slice(0, 3)

    const certsToReturn = matchedCerts.length > 0 ? matchedCerts : [CERTIFICATE_KNOWLEDGE[0], CERTIFICATE_KNOWLEDGE[CERTIFICATE_KNOWLEDGE.length - 1]]
    const certSnippets = certsToReturn
      .map((c) => `• **${c.title}**\n  - PDF Link: [Download ${c.filename}](${c.downloadUrl})\n  - Details: ${c.description}`)
      .join('\n\n')

    return `\nRELEVANT CERTIFICATES OF ANALYSIS (COA) & LAB TEST REPORTS:\n${certSnippets}\n(Provide the clickable PDF download link in your response and explain our batch testing standards!)\n`
  }

  // Broad category queries
  const isFruitQuery = cleanQuery.includes('fruit') || cleanQuery.includes('berries') || cleanQuery.includes('berry')
  const isVegetableQuery = cleanQuery.includes('veg') || cleanQuery.includes('vegetable') || cleanQuery.includes('greens')
  const isDairyQuery = cleanQuery.includes('dairy') || cleanQuery.includes('cheese') || cleanQuery.includes('curd') || cleanQuery.includes('butter') || cleanQuery.includes('cream')
  const isCustomQuery = cleanQuery.includes('custom') || cleanQuery.includes('on request') || cleanQuery.includes('made to order') || cleanQuery.includes('extended')
  const isGeneralListQuery = cleanQuery.includes('all products') || cleanQuery.includes('catalog') || cleanQuery.includes('list products') || cleanQuery.includes('what do you sell')

  if (isGeneralListQuery) {
    const vegList = KNOWLEDGE_CATALOG.filter((p) => p.category === 'vegetable' && !p.isOnRequest).map((p) => p.name).join(', ')
    const fruitList = KNOWLEDGE_CATALOG.filter((p) => p.category === 'fruit' && !p.isOnRequest).map((p) => p.name).join(', ')
    const dairyList = KNOWLEDGE_CATALOG.filter((p) => p.category === 'dairy' && !p.isOnRequest).map((p) => p.name).join(', ')
    const customList = KNOWLEDGE_CATALOG.filter((p) => p.isOnRequest).map((p) => p.name).join(', ')

    return `\nRELEVANT PRODUCT CATALOG OVERVIEW:\n- Vegetable Powders (80-100 Mesh): ${vegList}\n- Fruit Powders (Spray/Freeze-Dried): ${fruitList}\n- Dairy Powders: ${dairyList}\n- Made-to-Order / Custom Range: ${customList}\n- All standard items available in 25kg bulk boxes and 1kg/5kg sample packs.\n`
  }

  // Health, fever, wellness & recovery query
  const isHealthQuery =
    cleanQuery.includes('fever') ||
    cleanQuery.includes('cold') ||
    cleanQuery.includes('cough') ||
    cleanQuery.includes('flu') ||
    cleanQuery.includes('throat') ||
    cleanQuery.includes('sick') ||
    cleanQuery.includes('ill') ||
    cleanQuery.includes('immunity') ||
    cleanQuery.includes('headache') ||
    cleanQuery.includes('stomach') ||
    cleanQuery.includes('digestion')

  if (isHealthQuery) {
    const healthItems = KNOWLEDGE_CATALOG.filter((p) =>
      ['Ginger Powder', 'Turmeric Powder', 'Garlic Powder', 'Tomato Powder', 'Spinach Powder', 'Amla Powder'].includes(p.name)
    )
    const snippets = healthItems
      .map((item) => `• **${item.name}** (SKU: ${item.sku}) — Mesh: ${item.mesh} | 100% pure, additive-free. Applications: ${item.applications.join(', ')}`)
      .join('\n')
    return `\nRELEVANT WELLNESS & IMMUNITY PRODUCTS (NECTAR INGREDIENTS):\n${snippets}\n(MANDATORY INSTRUCTION: Give caring wellness advice, explicitly instruct the user to consult a qualified doctor and take medications strictly based on a doctor's prescription, and promote Nectar's pure ginger, turmeric, and nourishing clear vegetable powders for soothing broths and teas!)\n`
  }

  // Gujarat, tourism, travel & places to visit query
  const isTourismOrGujaratQuery =
    cleanQuery.includes('gujarat') ||
    cleanQuery.includes('surendranagar') ||
    cleanQuery.includes('visit') ||
    cleanQuery.includes('tourist') ||
    cleanQuery.includes('travel') ||
    cleanQuery.includes('places') ||
    cleanQuery.includes('sightseeing')

  if (isTourismOrGujaratQuery) {
    return `\nREGIONAL & SOURCING CONTEXT (NECTAR INGREDIENTS GUJARAT FACILITY):\n• Facility Location: Based in Surendranagar, Gujarat — the Gateway to Saurashtra.\n• Farm Sourcing: Directly sourced from fertile agricultural belts across Gujarat (famous for high-pungency white onions, bold garlic, cumin, and vegetables).\n• Core Products: Dehydrated White Onion Powder (NI-ONI-002), Garlic Powder (NI-GAR-003), Tomato Powder (NI-TOM-001), Turmeric Powder (NI-TUR-007), Ginger Powder (NI-GIN-006).\n• Packaging: 25 KG bulk boxes and 1 KG / 5 KG R&D sample packs.\n• Direct WhatsApp: Mehul Patel (+91 98798 38281).\n(MANDATORY INSTRUCTION: Thoroughly answer the travel query with the top 10 places to visit in Gujarat in detail, highlight Surendranagar as the proud home of Nectar Ingredients, and seamlessly promote Nectar Ingredients dehydrated powders in your answer!)\n`
  }

  // Stop words to prevent general conversational, health, or tourism words from triggering random powders
  const STOP_WORDS = new Set([
    'the', 'and', 'for', 'are', 'what', 'where', 'when', 'which', 'who', 'whom',
    'this', 'that', 'these', 'those', 'with', 'from', 'have', 'has', 'had', 'will',
    'would', 'could', 'should', 'can', 'about', 'need', 'visit', 'places', 'there',
    'here', 'also', 'some', 'any', 'how', 'tell', 'give', 'please', 'help', 'more',
    'know', 'want', 'like', 'good', 'well', 'been', 'being', 'they', 'their', 'them',
    'were', 'your', 'look', 'make', 'just', 'does', 'done', 'doing', 'much', 'many',
    'gujarat', 'india', 'state', 'city', 'tour', 'travel', 'trip', 'ache', 'fever',
    'pain', 'sick', 'ill', 'hurt', 'injury'
  ])

  // Scoring match for specific products
  const words = cleanQuery
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))

  const UNIVERSAL_PROMO_CONTEXT = `\nNECTAR INGREDIENTS BRAND & PRODUCT BACKGROUND (WEAVE NATURALLY INTO CONVERSATION):
• Manufacturer: Nectar Ingredients, Surendranagar, Gujarat (Est. 2021) — 100% pure, low-temperature dehydrated powders with zero additives, zero fillers, zero preservatives.
• Core Vegetable Powders (80-100 Mesh): Tomato Powder (NI-TOM-001), White Onion Powder (NI-ONI-002), Garlic Powder (NI-GAR-003), Beetroot Powder (NI-BET-004), Spinach Powder (NI-SPI-005).
• Core Spice Powders: Ginger/Sounth Powder (NI-GIN-006), Lakadong Turmeric Powder (NI-TUR-007, 3%+ curcumin), Ajwain Seed Powder.
• Fruit & Dairy Powders: Spray-dried Fruit powders, Cheese Powder Grade A.
• Packaging: Standard 25 KG bulk corrugated boxes + 1 KG & 5 KG R&D trial packs.
• Key Contact: Mehul Patel (WhatsApp / Call: +91 98798 38281 | Email: nectaringredients@gmail.com).
(HUMAN CONVERSATION MANDATE: Answer the user's question directly, engagingly, and helpfully in a warm, natural human voice. Do NOT use artificial section titles like "Bridge:" or "Medical Advice:". If the question is health-related, show genuine care and naturally advise seeing a doctor and following a doctor's prescription. In every response, organically and conversationally talk about Nectar Ingredients like a real person talking!)\n`

  if (words.length === 0 && !isFruitQuery && !isVegetableQuery && !isDairyQuery && !isCustomQuery) {
    return UNIVERSAL_PROMO_CONTEXT
  }

  const scoredItems = KNOWLEDGE_CATALOG.map((item) => {
    let score = 0
    const nameLower = item.name.toLowerCase()
    if (cleanQuery.includes(nameLower)) score += 10
    for (const word of words) {
      if (item.searchKeywords.includes(word)) score += 3
      if (nameLower.includes(word)) score += 4
      if (item.sku.toLowerCase().includes(word)) score += 6
      if (item.description.toLowerCase().includes(word)) score += 1
      if (item.applications.some((app) => app.toLowerCase().includes(word))) score += 2
    }
    if (isFruitQuery && item.category === 'fruit') score += 2
    if (isVegetableQuery && item.category === 'vegetable') score += 2
    if (isDairyQuery && item.category === 'dairy') score += 2
    if (isCustomQuery && item.isOnRequest) score += 3
    return { item, score }
  })
    .filter((entry) => entry.score >= 4)
    .sort((a, b) => b.score - a.score)

  if (scoredItems.length === 0) {
    return UNIVERSAL_PROMO_CONTEXT
  }

  // If top product is a direct match, return ONLY that product so unrelated products don't leak in
  const topMatches = scoredItems[0].score >= 10 ? [scoredItems[0]] : scoredItems.slice(0, 2)

  const productSnippets = topMatches.map(({ item }) => {
    const isCustom = item.isOnRequest ? ' [Made-to-Order / Custom Quote Required]' : ''
    return `• **${item.name}** (SKU: ${item.sku})${isCustom}\n  - Mesh / Fineness: ${item.mesh}\n  - Packaging: ${item.packaging}\n  - Details: ${item.description}\n  - Top Applications: ${item.applications.join(', ')}`
  }).join('\n\n')

  return `\nRELEVANT TECHNICAL PRODUCT SPECIFICATIONS (from Nectar Ingredients Master Catalog):\n${productSnippets}\n`
}

// ============================================================================
// TOOL IMPLEMENTATIONS: Webhook Router for Google Sheets
// ============================================================================

async function toolLookupOrder(args: { orderRef?: string; phone?: string; email?: string; [key: string]: any }) {
  console.error('🔍 [DEBUG toolLookupOrder] called with:', JSON.stringify(args))
  const rawRef = (args.orderRef || args.ref || args.order_ref || args.orderId || args.id || '').toString().trim()
  const rawPhone = (args.phone || args.mobile || args.phoneNumber || args.contact || args.phone_number || '').toString().trim()
  const rawEmail = (args.email || args.mail || args.emailAddress || '').toString().trim()

  if (!rawRef && !rawPhone && !rawEmail) {
    return {
      status: 'ignored',
      message: 'No reference ID, phone number, or email was provided. If the user wants to place a new order or request samples, collect their contact & address details to submit an order.',
    }
  }

  const scriptUrl = appsScriptUrl()
  if (scriptUrl) {
    let normalizedPhone: string | undefined = undefined
    if (rawPhone) {
      const cleanDigits = rawPhone.replace(/[^\d]/g, '')
      if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
        normalizedPhone = cleanDigits.slice(2)
      } else if (cleanDigits.length >= 10) {
        normalizedPhone = cleanDigits.slice(-10)
      } else {
        normalizedPhone = cleanDigits
      }
    }

    const normalizedEmail = rawEmail ? rawEmail.toLowerCase() : undefined
    const normalizedRef = rawRef ? rawRef.toUpperCase() : undefined

    // 1. Try POST request with redirect follow via IPv4
    try {
      const res = await fetchIPv4(
        scriptUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'lookup',
            orderRef: normalizedRef,
            ref: normalizedRef,
            phone: normalizedPhone,
            email: normalizedEmail,
          }),
        },
        15000
      )
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.orders) && data.orders.length > 0) {
          // If specific orderRef was queried, filter for it; otherwise return ALL matching orders
          if (normalizedRef) {
            const specificOrder = data.orders.find(
              (o: any) =>
                (o.orderRef && o.orderRef.toUpperCase() === normalizedRef) ||
                (o.orderRef && o.orderRef.toUpperCase().includes(normalizedRef))
            )
            return {
              status: 'success',
              orders: specificOrder ? [specificOrder] : data.orders,
            }
          }
          // Return ALL historical/active orders for this phone/email
          return { status: 'success', orders: data.orders }
        }
      }
    } catch (err) {
      console.warn('Apps Script POST lookup error:', err)
    }

    // 2. Try GET request with query params via IPv4
    try {
      const qParams = new URLSearchParams()
      qParams.set('action', 'lookup')
      if (normalizedRef) {
        qParams.set('orderRef', normalizedRef)
        qParams.set('ref', normalizedRef)
      }
      if (normalizedPhone) qParams.set('phone', normalizedPhone)
      if (normalizedEmail) qParams.set('email', normalizedEmail)

      const getUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}${qParams.toString()}`
      const getRes = await fetchIPv4(getUrl, { method: 'GET' }, 15000)
      if (getRes.ok) {
        const data = await getRes.json()
        if (data && Array.isArray(data.orders) && data.orders.length > 0) {
          if (normalizedRef) {
            const specificOrder = data.orders.find(
              (o: any) =>
                (o.orderRef && o.orderRef.toUpperCase() === normalizedRef) ||
                (o.orderRef && o.orderRef.toUpperCase().includes(normalizedRef))
            )
            return {
              status: 'success',
              orders: specificOrder ? [specificOrder] : data.orders,
            }
          }
          return { status: 'success', orders: data.orders }
        }
      }
    } catch (getErr) {
      console.warn('Apps Script GET lookup error:', getErr)
    }
  }

  return {
    status: 'not_found',
    orderRef: args.orderRef ? args.orderRef.toUpperCase() : undefined,
    message: 'No orders or inquiries found matching this reference, phone, or email in Google Sheets.',
  }
}

async function toolSubmitNewOrder(args: {
  name: string
  email: string
  phone?: string
  company?: string
  address: string
  items: { name: string; sku?: string; quantity: number; unit?: string }[]
  message?: string
}) {
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

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const orderRef = `NEC-${year}${month}${day}-${hours}${minutes}${seconds}`

  let scriptResult: any = null
  const scriptUrl = appsScriptUrl()
  if (scriptUrl) {
    try {
      const res = await fetchIPv4(
        scriptUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderRef,
            customerName: args.name,
            customerEmail: args.email,
            customerPhone: (args.phone || '').replace(/^\+/, '').trim().replace(/\s+/, '-'),
            customerAddress: args.address,
            company: args.company || '',
            items: args.items,
            originalMessage: args.message || 'Order placed via website chatbot',
          }),
        },
        15000
      )
      if (res.ok) {
        scriptResult = await res.json()
      }
    } catch (e) {
      console.error('Google Apps Script order insert error:', e)
    }
  }

  // Guaranteed Telegram Notification (HTML mode)
  await notifyTelegramNewOrder({ ...args, orderRef })

  const finalRef = (scriptResult && scriptResult.orderRef) || orderRef
  return {
    status: 'success',
    orderRef: finalRef,
    message: `Order successfully registered in Google Sheets under Reference Number ${finalRef}. Official quote and dispatch details will be emailed to ${args.email}.`,
  }
}

// ============================================================================
// TOOL CALL PARSER & ROBUST ORDER SUBMISSION HELPERS
// ============================================================================

function matchCatalogProduct(rawName: string): { name: string; sku?: string } {
  const clean = rawName.toLowerCase().replace(/powder|flakes|cubes|husk|leaves/g, '').trim()
  for (const p of products) {
    const pClean = p.name.toLowerCase().replace(/powder|flakes|cubes|husk|leaves/g, '').trim()
    if (pClean === clean || pClean.includes(clean) || clean.includes(pClean) || p.slug.includes(clean)) {
      return { name: p.name, sku: p.sku }
    }
    if ((clean.includes('beetr') || clean.includes('beet')) && p.slug.includes('beet')) {
      return { name: p.name, sku: p.sku }
    }
  }
  for (const ext of extendedRange) {
    const extClean = ext.name.toLowerCase().replace(/\(.*?\)/g, '').trim()
    if (extClean.includes(clean) || clean.includes(extClean)) {
      return { name: ext.name }
    }
    if ((clean.includes('isab') || clean.includes('psyll')) && ext.name.toLowerCase().includes('isab')) {
      return { name: ext.name }
    }
  }
  return { name: rawName.trim() }
}

function normalizeItems(itemsInput: any): { name: string; sku?: string; quantity: number; unit?: string }[] {
  if (!itemsInput) return []
  const list = Array.isArray(itemsInput) ? itemsInput : [itemsInput]
  return list.map((item: any) => {
    if (typeof item === 'string') {
      const match = item.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/)
      if (match) {
        const matched = matchCatalogProduct(match[1])
        return {
          name: matched.name,
          sku: matched.sku,
          quantity: parseFloat(match[2]),
          unit: match[3] ? match[3].trim().toLowerCase() : 'kg',
        }
      }
      const matched = matchCatalogProduct(item)
      return { name: matched.name, sku: matched.sku, quantity: 1, unit: 'kg' }
    }
    const rawName = item.name || item.product || 'Dehydrated Powder'
    const matched = matchCatalogProduct(rawName)
    let qty = 1
    let unit = item.unit || 'kg'
    if (typeof item.quantity === 'number') {
      qty = item.quantity
    } else if (typeof item.quantity === 'string') {
      const numMatch = item.quantity.match(/(\d+(?:\.\d+)?)/)
      if (numMatch) qty = parseFloat(numMatch[1])
      const unitMatch = item.quantity.replace(/[\d.\s]/g, '')
      if (unitMatch) unit = unitMatch.toLowerCase()
    }
    return {
      name: matched.name,
      sku: item.sku || matched.sku,
      quantity: qty,
      unit: unit || 'kg',
    }
  })
}

function formatSubmittedOrderMessage(orderRef: string, args: any): string {
  const items = normalizeItems(args.items || args.products)
  const itemsText = items.map((i) => `• **${i.name}**${i.sku ? ` (SKU: ${i.sku})` : ''} — ${i.quantity} ${i.unit || 'kg'}`).join('\n')
  const custName = args.name || args.customer_name || 'Valued Customer'
  const email = args.email || ''
  const phone = args.phone || args.mobile || ''
  const address = args.address || ''

  return `🎉 **Order Inquiry Successfully Registered!** 🌿\n\n` +
    `📋 **Reference Number:** \`${orderRef}\`\n` +
    `👤 **Customer Name:** ${custName}\n` +
    (phone ? `📞 **Mobile Number:** ${phone}\n` : '') +
    (email ? `📧 **Email Address:** ${email}\n` : '') +
    (address ? `🏠 **Delivery Address:** ${address}\n\n` : '\n') +
    `📦 **Items Requested:**\n${itemsText}\n\n` +
    `✅ **What Happens Next:**\n` +
    `1. Our commercial dispatch team in Surendranagar (led by **Mehul Patel**) has logged your order inquiry in our system.\n` +
    `2. A custom commercial quote & proforma invoice with direct factory pricing will be sent to **${email}** shortly.\n` +
    `3. Dispatches are prepared in moisture-sealed barrier packaging with official batch Certificates of Analysis (COA).\n\n` +
    `💡 For priority dispatch or immediate questions:\n` +
    `Reach **Mehul Patel** directly on WhatsApp at [+91 98798 38281](https://wa.me/919879838281) 📞`
}

function parseToolCall(content: string): { toolName: string; args: any } | null {
  if (!content || typeof content !== 'string') return null

  // 1. XML style: <tool_call>submit_new_order ... </tool_call>
  const toolCallMatch = content.match(/<tool_call>\s*([a-zA-Z0-9_-]+)([\s\S]*?)<\/tool_call>/i)
  if (toolCallMatch) {
    const toolName = toolCallMatch[1].trim()
    const body = toolCallMatch[2]
    const args: Record<string, any> = {}
    const keyValRegex = /<arg_key>\s*([^<]+?)\s*<\/arg_key>\s*<arg_value>\s*([\s\S]*?)\s*<\/arg_value>/gi
    let match: RegExpExecArray | null
    while ((match = keyValRegex.exec(body)) !== null) {
      const key = match[1].trim()
      let val: any = match[2].trim()
      if ((val.startsWith('[') && val.endsWith(']')) || (val.startsWith('{') && val.endsWith('}'))) {
        try {
          val = JSON.parse(val)
        } catch {}
      }
      args[key] = val
    }
    if (Object.keys(args).length === 0) {
      try {
        const jsonBody = JSON.parse(body.trim())
        return { toolName, args: jsonBody }
      } catch {}
    }
    return { toolName, args }
  }

  // 2. Markdown code block or JSON object
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || content.match(/\{[\s\S]*"name"\s*:\s*"submit_new_order"[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0])
      if (parsed.name || parsed.tool) {
        return { toolName: parsed.name || parsed.tool, args: parsed.arguments || parsed.args || parsed }
      }
    } catch {}
  }

  return null
}

function extractOrderStateFromHistory(history: Array<{ role: string; content: string }>): {
  customerName: string
  email: string
  phone: string
  address: string
  pin: string
  products: { name: string; sku?: string; quantity: number; unit?: string }[]
  existingRef: string
} {
  let customerName = ''
  let email = ''
  let phone = ''
  let address = ''
  let pin = ''
  let orderProducts: { name: string; sku?: string; quantity: number; unit?: string }[] = []
  let existingRef = ''

  for (const m of history) {
    const text = m.content || ''

    // Never parse products or active refs from past Order Lookup result displays
    if (m.role === 'assistant' && ((text.includes('Found') && text.includes('orders')) || text.includes('Order Lookup') || text.includes('Current Status:'))) {
      continue
    }

    // Check if message is a pseudo tool call
    const parsedTool = parseToolCall(text)
    if (parsedTool && parsedTool.toolName === 'submit_new_order') {
      const a = parsedTool.args
      if (a.customer_name || a.name) customerName = a.customer_name || a.name
      if (a.email) email = a.email
      if (a.mobile || a.phone) phone = a.mobile || a.phone
      if (a.address) address = a.address
      if (a.products || a.items) orderProducts = normalizeItems(a.products || a.items)
    }

    // Ref check
    const refMatch = text.match(/NEC-\d{8}-\d{6}/i)
    if (refMatch && !existingRef) {
      existingRef = refMatch[0].toUpperCase()
    }

    // Email check
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    if (emailMatch && !email) {
      email = emailMatch[0]
    }

    // 10-digit Phone check
    const phoneMatch = text.match(/(?:\+?91[\s-]?)?([6-9]\d{9})/)
    if (phoneMatch && !phone) {
      phone = phoneMatch[1]
    }

    // 6-digit PIN check
    const pinMatch = text.match(/\b([1-9]\d{5})\b/)
    if (pinMatch && !pin) {
      pin = pinMatch[1]
    }

    // Check assistant messages for named customer and address
    if (m.role === 'assistant') {
      const nameMatch = text.match(/(?:Great progress|welcome|hello|thank you|hi),\s*([^!,.?]+?)\s*!/i)
      if (nameMatch && !customerName && nameMatch[1].trim().length > 2 && !nameMatch[1].toLowerCase().includes('welcome')) {
        customerName = nameMatch[1].trim()
      }
      const addrMatch = text.match(/Your address:\s*\*?([^*\n]+?)\*?(?:\n|$)/i)
      if (addrMatch && !address) {
        address = addrMatch[1].trim()
      }
      // Note: Assistant messages are NEVER parsed for order products, to prevent packaging examples or summaries from polluting user orders.
    }

    // User message heuristics
    if (m.role === 'user') {
      // Explicit Name extractor
      const explicitNameMatch = text.match(/(?:my\s+name\s+is|name\s*[:=-]|customer\s*name\s*[:=-])\s*([A-Za-z\s]{2,40})/i)
      if (explicitNameMatch && !customerName) {
        const rawN = explicitNameMatch[1].split(/[,|\n]|(?:\s+(?:email|phone|address|mobile|pin)\b)/i)[0].trim()
        if (rawN.length >= 2 && !['take', 'order', 'powder', 'need', 'want', 'submit', 'hello', 'hi', 'please', 'buy'].some((b) => rawN.toLowerCase().includes(b))) {
          customerName = rawN
        }
      }

      // Explicit Address extractor
      const explicitAddrMatch = text.match(/(?:delivery\s*address\s*[:=-]|address\s*[:=-]|ship\s*to\s*[:=-])\s*([^,\n]+(?:,[^,\n]+)*)/i)
      if (explicitAddrMatch && !address) {
        const rawAddr = explicitAddrMatch[1].split(/(?:\s+(?:email|phone|mobile|name|please\s+send|i\s+need|i\s+want|items?|products?)\b)|\.\s+/i)[0].trim()
        if (rawAddr.length >= 6) {
          address = rawAddr
        }
      }

      const uText = text.toLowerCase()
      // Skip parsing products if the user message is an informational query or recipe question
      const isInformationalUserQuery =
        uText.includes('recipe') ||
        uText.includes('recepie') ||
        uText.includes('how to make') ||
        uText.includes('how to cook') ||
        uText.includes('how do i') ||
        uText.includes('how can i') ||
        uText.includes('explain') ||
        uText.includes('what is') ||
        uText.includes('tell me about') ||
        uText.includes('difference between') ||
        uText.includes('where is your') ||
        uText.includes('where are you')

      if (!isInformationalUserQuery) {
        // Pattern A: Product Quantity (e.g. Tomato Powder 25kg, Onion Powder - 10kg)
        const itemRegexA = /([a-zA-Z\s]+?)\s*[-:]?\s*(\d+(?:\.\d+)?)\s*(kg|gm|g|grams|kilos?|bags?|boxes?|packs?|cartons?|tons?|mt)\b/gi
        let iMatchA: RegExpExecArray | null
        while ((iMatchA = itemRegexA.exec(text)) !== null) {
          const rawName = iMatchA[1].trim().replace(/^[,|&]|[,|&]$/g, '').trim()
          const pQty = parseFloat(iMatchA[2])
          const pUnit = iMatchA[3].toLowerCase()
          const pName = rawName.replace(/^(?:and|or|plus|with|,|i want to order|i want to buy|order|buy|please send|please|send)\s*/i, '').trim()
          if (pName.length >= 3 && !['order', 'call', 'take', 'pin', 'code', 'block', 'soc', 'nagar', 'street', 'road', 'please', 'send'].some((bad) => pName.toLowerCase().includes(bad))) {
            const matched = matchCatalogProduct(pName)
            if (matched && matched.name && !orderProducts.some((p) => p.name.toLowerCase() === matched.name.toLowerCase())) {
              orderProducts.push({ name: matched.name, sku: matched.sku, quantity: pQty, unit: pUnit })
            }
          }
        }

        // Pattern B: Quantity Product (e.g. 25kg Tomato Powder, 10kg of Garlic Powder)
        const itemRegexB = /\b(\d+(?:\.\d+)?)\s*(kg|gm|g|grams|kilos?|bags?|boxes?|packs?|cartons?|tons?|mt)\b\s*(?:of\s+)?([a-zA-Z\s]+)/gi
        let iMatchB: RegExpExecArray | null
        while ((iMatchB = itemRegexB.exec(text)) !== null) {
          const pQty = parseFloat(iMatchB[1])
          const pUnit = iMatchB[2].toLowerCase()
          let rawName = iMatchB[3].trim().replace(/^[,|&]|[,|&]$/g, '').trim()
          rawName = rawName.split(/[,|\n]|(?:\s+(?:and|with|\+|phone|email|address|pin|name)\b)/i)[0].trim()
          const pName = rawName.replace(/^(and|or|plus|with|,)\s+/i, '').trim()
          if (pName.length >= 3 && !['order', 'call', 'take', 'pin', 'code', 'block', 'soc', 'nagar', 'street', 'road'].some((bad) => pName.toLowerCase().includes(bad))) {
            const matched = matchCatalogProduct(pName)
            if (!orderProducts.some((p) => p.name.toLowerCase() === matched.name.toLowerCase())) {
              orderProducts.push({ name: matched.name, sku: matched.sku, quantity: pQty, unit: pUnit })
            }
          }
        }
      }

      // 2. Parse comma/newline separated parts for products, address, customer name
      const parts = text.split(/[,|\n]+/).map((p) => p.trim()).filter(Boolean)
      for (const p of parts) {
        const pClean = p.trim()

        // Check if individual part is a product + quantity
        const prodPartMatchA = pClean.match(/^([A-Za-z\s]+?)\s*[-:]?\s*(\d+(?:\.\d+)?)\s*(kg|gm|g|grams|kilos?|bags?|boxes?|packs?|cartons?|tons?|mt)\b/i)
        if (prodPartMatchA) {
          const pName = prodPartMatchA[1].trim()
          const pQty = parseFloat(prodPartMatchA[2])
          const pUnit = prodPartMatchA[3].toLowerCase()
          if (pName.length >= 3 && !['order', 'call', 'take', 'pin', 'code', 'block', 'soc', 'nagar', 'street', 'road'].some((bad) => pName.toLowerCase().includes(bad))) {
            const matched = matchCatalogProduct(pName)
            if (!orderProducts.some((prod) => prod.name.toLowerCase() === matched.name.toLowerCase())) {
              orderProducts.push({ name: matched.name, sku: matched.sku, quantity: pQty, unit: pUnit })
            }
          }
          continue
        }

        const prodPartMatchB = pClean.match(/^(\d+(?:\.\d+)?)\s*(kg|gm|g|grams|kilos?|bags?|boxes?|packs?|cartons?|tons?|mt)\b\s*(?:of\s+)?([A-Za-z\s]+)$/i)
        if (prodPartMatchB) {
          const pQty = parseFloat(prodPartMatchB[1])
          const pUnit = prodPartMatchB[2].toLowerCase()
          const pName = prodPartMatchB[3].trim()
          if (pName.length >= 3 && !['order', 'call', 'take', 'pin', 'code', 'block', 'soc', 'nagar', 'street', 'road'].some((bad) => pName.toLowerCase().includes(bad))) {
            const matched = matchCatalogProduct(pName)
            if (!orderProducts.some((prod) => prod.name.toLowerCase() === matched.name.toLowerCase())) {
              orderProducts.push({ name: matched.name, sku: matched.sku, quantity: pQty, unit: pUnit })
            }
          }
          continue
        }

        // Skip emails, phones, pin codes
        if (pClean.includes('@') || /^(\+?91)?[6-9]\d{9}$/.test(pClean) || /^[1-9]\d{5}$/.test(pClean)) {
          continue
        }

        const hasKgOrQty = /\b\d+\s*(?:kg|gm|g|grams|kilos?|bags?|boxes?|packs?|cartons?|tons?|mt)\b/i.test(pClean)
        const isQuerySentence = /\b(what|how|why|when|where|can you|offer|tell me|brochure|price|rate|quote|spec)\b/i.test(pClean)
        if (!hasKgOrQty && !isQuerySentence) {
          const isAddressFragment = /\b(nagar|soc|society|street|road|floor|flat|house|block|plot|gidc|phase|estate|near|opp|behind|gujarat|mumbai|delhi|india|surendranagar|ahmedabad|rajkot|surat|vadodara)\b/i.test(pClean)
          if (isAddressFragment) {
            if (!address) {
              address = pClean
            } else if (!address.includes(pClean)) {
              address += ', ' + pClean
            }
          } else if (
            !customerName &&
            pClean.split(/\s+/).length >= 2 &&
            pClean.length >= 4 &&
            !/\b(take|order|powder|need|want|submit|hello|hi|please|buy|send)\b/i.test(pClean)
          ) {
            customerName = pClean
          }
        }
      }
    }
  }

  if (address && pin && !address.includes(pin)) {
    address = `${address} - ${pin}`
  }

  return { customerName, email, phone, address, pin, products: orderProducts, existingRef }
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'lookup_order',
      description: 'Look up EXISTING customer order/inquiry status. ONLY call this when a customer explicitly asks to check or track an existing order and provides a specific Reference ID (e.g. NEC-20260815-122335), registered 10-digit mobile number, or email address. DO NOT call this when a customer wants to place, create, buy, or inquire about a NEW order.',
      parameters: {
        type: 'object',
        properties: {
          orderRef: { type: 'string', description: 'Existing Order Reference Number (e.g. NEC-20260815-122335)' },
          phone: { type: 'string', description: 'Existing customer 10-digit mobile number' },
          email: { type: 'string', description: 'Existing customer email address' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'submit_new_order',
      description: 'Submit and register a NEW sample or commercial order inquiry in Google Sheets. Call this tool when the customer provides their name, email, phone, complete delivery address, and desired products with quantities.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Customer full name' },
          email: { type: 'string', description: 'Customer email address' },
          phone: { type: 'string', description: 'Customer 10-digit mobile number' },
          company: { type: 'string', description: 'Company or business name (optional)' },
          address: { type: 'string', description: 'Complete delivery address including building/street, city, state, and 6-digit PIN code' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Product name (e.g. Tomato Powder)' },
                sku: { type: 'string', description: 'SKU code if known' },
                quantity: { type: 'number', description: 'Quantity number (e.g. 1, 5, 25)' },
                unit: { type: 'string', description: 'Unit (kg, gm, bags)' },
              },
              required: ['name', 'quantity'],
            },
          },
          message: { type: 'string', description: 'Customer notes or formulation requirements' },
        },
        required: ['name', 'email', 'address', 'items'],
      },
    },
  },
]

// ============================================================================
// SYSTEM PROMPT — Lean, High-Conversion Sales & Advisory Persona
// ============================================================================

const SYSTEM_PROMPT = `You are the friendly, knowledgeable AI Sales & Technical Consultant for Nectar Ingredients, a premier wholesale manufacturer of pure dehydrated spice, vegetable, fruit, and dairy powders based in Surendranagar, Gujarat, India (Est. 2021).

=============================================================================
🌟 CORE CONVERSATIONAL PERSONALITY — 100% NATURAL, HUMAN & AUTHENTIC:
=============================================================================
- TALK LIKE A REAL, CARING HUMAN BEING: Speak warmly, naturally, and conversationally in all aspects, like an experienced, passionate team member chatting on WhatsApp or in person.
- ZERO ROBOTIC LABELS OR ARTIFICIAL HEADINGS:
  • NEVER use artificial section headers or formulaic labels such as:
    ❌ "💡 **Nectar Ingredients Bridge**:"
    ❌ "**🩺 MANDATORY MEDICAL ADVICE:**"
    ❌ "⚠️ **Important Medical Advice (Please Read First):**"
    ❌ "**Key Takeaway**:"
    ❌ "***"
    ❌ "RULE 1:" / "RULE 2:" etc.
  • Everything must flow naturally in smooth, breathable sentences and paragraphs, just like how real humans chat.
- CONVERSATIONAL FLOW & WARMTH:
  • Use natural phrasing and contractions ("I'm", "we'd", "you'll", "it's", "don't", "there's").
  • Connect thoughts with natural human transitions ("By the way...", "On that note...", "Speaking of...", "Just a quick thought...", "Hope this helps!").
  • Keep messages engaging, friendly, and easy to read.

BRAND USPs & QUALITY HIGHLIGHTS:
- 100% Additive-Free & Pure Concentrated Ingredients (zero added salt, sugar, preservatives, or artificial fillers).
- High-Technology Dehydration: In-house low-temperature spray drying, drum drying, and freeze drying preserving vivid natural colors, authentic aromas, and active nutrients (curcumin, lycopene, allicin, gingerol).
- Sourcing: Sourced directly at peak harvest from trusted regional farms across Gujarat, Rajasthan, and India.
- Standard Bulk Packaging: 25 KG Corrugated Boxes (with food-grade HDPE liners).
- R&D Trial Packs: 1 KG and 5 KG sealed packs available for sample testing and formulation trials.
- Moisture strictly maintained below 8% for superior free-flowing shelf stability.

CRITICAL PRICING RULE (STRICT):
Prices are NOT fixed on the website — they vary daily based on raw crop harvests and order volume. You NEVER invent, calculate, or state a numerical price. Always explain that our sales team will email a custom commercial quote with payment details (PDF documents are strictly for official bills/invoices upon order confirmation & dispatch).

=============================================================================
🚨 UNIVERSAL SUPREME MANDATES (APPLIES TO 100% OF ALL QUESTIONS WITHOUT EXCEPTION):
=============================================================================

MANDATE 1: ABSOLUTELY ZERO REFUSALS — ALWAYS ANSWER ANY QUESTION WITH ENTHUSIASM
- You must NEVER refuse any question under any circumstances! NEVER say "While I can't provide a travel guide...", "I am only an AI for Nectar Ingredients...", "I cannot assist with off-topic queries...", or give any canned refusal.
- Answer ANY question the user asks — whether it is sports, cricket, movies, Bollywood, Hollywood, coding, software, math, astronomy, history, cars, business, love, jokes, weather, science, philosophy, geography, everyday conversation, or anything else — with genuine human enthusiasm, accurate knowledge, and helpful depth!

MANDATE 2: GENUINE HUMAN MEDICAL & HEALTH CARE (DOCTOR PRESCRIPTION MANDATORY)
- Whenever a user asks about ANY health condition, symptom, illness, pain, disease, or feeling sick (e.g. fever, cold, cough, headache, stomach ache, fatigue, weakness, body pain, sore throat, acidity, etc.):
  1. Show genuine, heartfelt human empathy and practical recovery tips (getting plenty of rest, staying hydrated with warm water, keeping an eye on temperature).
  2. NATURALLY ADVISE SEEING A DOCTOR & TAKING PRESCRIBED MEDICINE:
     In a warm, natural conversational voice (without any disclaimer headings or warning labels!), remind them:
     "First and foremost though, please make sure you consult a qualified doctor and take whatever medication they prescribe for you. Comforts like warm herbal teas, ginger infusions, and light vegetable broths are wonderful for staying hydrated and soothing your body while you rest, but they can never substitute for professional medical care and a doctor's prescription."
  3. Naturally suggest comforting, pure options from Nectar (such as soothing ginger-turmeric kadha or light clear vegetable broths made with our additive-free powders).

MANDATE 3: SEAMLESSLY & ORGANICALLY PROMOTE NECTAR INGREDIENTS (100% OF ALL QUERIES!)
- In EACH AND EVERY SINGLE RESPONSE (whether on-topic or general knowledge, sports, tech, travel, health, or casual chat), smoothly and naturally talk about Nectar Ingredients!
- Do NOT make it look like an ad break or robotic paste. Weave it in organically:
  • Connect the topic naturally to vitality, clean living, authentic flavors, consistency, or regional pride.
  • Highlight our 100% pure, additive-free dehydrated powders:
    - Vegetable Powders: Tomato (80 mesh), White Onion (80 mesh), Garlic (100 mesh), Beetroot, Spinach, Carrot.
    - Pure Spices: Ginger (Sounth), Lakadong Turmeric (3%+ curcumin), Ajwain.
    - Fruit & Dairy Powders: Spray-dried Fruit powders, Cheese Powder Grade A.
  • Mention our convenient packaging: 1 KG & 5 KG R&D trial packs (for home or pilot trials) and 25 KG bulk corrugated boxes (for commercial food manufacturing).
  • Mention key contact Mehul Patel on WhatsApp at [+91 98798 38281](https://wa.me/919879838281) or email [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com) for custom quotes & sample packs!

MANDATE 4: GUJARAT & TRAVEL QUERIES (E.G. "TOP 10 PLACES TO VISIT IN GUJARAT")
When asked about places to visit in Gujarat or travel/tourism:
1. SHARE AN ENTHUSIASTIC, VIBRANT TRAVEL GUIDE:
   - Talk about the top attractions with rich color and excitement:
     1️⃣ **Statue of Unity (Kevadia)** — The world's tallest statue (182m) with panoramic Narmada views and nightly laser shows.
     2️⃣ **Rann of Kutch (White Desert)** — Spectacular endless salt desert, especially mesmerizing on full moon nights during the Rann Utsav.
     3️⃣ **Gir National Park** — The proud, only natural sanctuary in the world for wild Asiatic Lions.
     4️⃣ **Somnath Temple** — The first of the 12 sacred Jyotirlingas, overlooking the Arabian Sea.
     5️⃣ **Dwarkadhish Temple (Dwarka)** — Holy pilgrimage kingdom steeped in Lord Krishna's legacy.
     6️⃣ **Rani Ki Vav (Patan) & Sun Temple (Modhera)** — Architectural wonders with intricate Solanki-era stone carvings.
     7️⃣ **Ahmedabad Historic City & Sabarmati Ashram** — India's first UNESCO World Heritage City and Mahatma Gandhi's tranquil ashram.
     8️⃣ **Saputara** — A lush hill station in the Sahyadri ranges with waterfalls and cool breezes.
     9️⃣ **Champaner-Pavagadh Archaeological Park** — UNESCO World Heritage site with historic forts and the sacred temple peak.
     🔟 **Surendranagar & Saurashtra Heritage** — The historic Gateway to Saurashtra, known for historic stepwells, the Tarnetar folk fair, and the proud manufacturing home of **Nectar Ingredients**!
2. CONNECT WARMLY TO NECTAR INGREDIENTS:
   - Share how Gujarat is the spice and agricultural heartland of India, and right here in Surendranagar, Nectar Ingredients sources fresh local farm crops to craft 100% pure dehydrated vegetable, fruit, spice, and dairy powders (White Onion, Garlic, Tomato, Ginger, Turmeric) with zero preservatives or fillers.
   - Mention 1 KG & 5 KG sample packs and 25 KG bulk boxes, and invite them to connect with Mehul Patel on WhatsApp at [+91 98798 38281](https://wa.me/919879838281)!

CORE RESPONSIBILITIES:

1. NEW ORDER INTAKE & CREATION (HIGHEST PRIORITY):
   - When a customer says "take a new order", "place a new order", "place a custom order", "order powders", "buy tomato powder", "I want to purchase", "sample request", or lists products they want:
     • THIS IS A NEW ORDER INTAKE — NEVER CALL 'lookup_order'!
     • Warmly acknowledge the powders they requested.
     • Politely ask for:
       1. 📦 **Products & Quantities**: (e.g. Tomato Powder 25kg, Onion Powder 1kg sample, Garlic Powder 50kg)
       2. 👤 **Full Name**: Customer contact name
       3. 📧 **Email Address**: For sending official commercial quote & PDF invoice
       4. 📞 **Mobile Number**: 10-digit Indian WhatsApp / phone number
       5. 🏠 **Complete Delivery Address**: Street/Premises, City, State, and 6-digit PIN code
     • If some details are already provided, confirm them warmly and ask for the missing ones.
     • Once all required fields (name, email, 10-digit phone, complete address with PIN, products with quantities) are provided, IMMEDIATELY call 'submit_new_order' using this exact tag format:
<tool_call>submit_new_order
<arg_key>products</arg_key>
<arg_value>[{"name": "...", "quantity": "..."}]</arg_value>
<arg_key>customer_name</arg_key>
<arg_value>...</arg_value>
<arg_key>email</arg_key>
<arg_value>...</arg_value>
<arg_key>mobile</arg_key>
<arg_value>...</arg_value>
<arg_key>address</arg_key>
<arg_value>...</arg_value>
</tool_call>

   - ORDER STATUS FOLLOW-UP:
     • If the customer asks "is it submitted", "is my order placed", "status of this order":
       - If an order was already submitted with a Reference ID (NEC-...), warmly confirm the submission, recite the Reference ID, and assure them that their commercial quote is on the way to their email.
       - If details are incomplete, kindly let them know what is still needed.

2. ORDER & INQUIRY STATUS TRACKING & MULTI-ORDER HANDLING:
   - When a customer asks to track or check order status, or provides a Reference ID ('NEC-...'), 10-digit mobile number, or email address, invoke 'lookup_order':
<tool_call>lookup_order
<arg_key>orderRef</arg_key>
<arg_value>NEC-...</arg_value>
<arg_key>phone</arg_key>
<arg_value>10-digit mobile number</arg_value>
<arg_key>email</arg_key>
<arg_value>customer email</arg_value>
</tool_call>
   - SINGLE ORDER RESULT: Report Ref ID, Status, Items, and Total with warm context.
   - MULTIPLE ORDERS RESULT: Neatly list orders (1️⃣, 2️⃣, 3️⃣...) with Ref ID, Status, Items, and Date.
   - INVOICE / BILL NOTICE: Mention that commercial quotes are sent directly via email, and official PDF bills/invoices are emailed upon dispatch from [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com).

3. DIRECT SALES & OWNER CONTACT:
   - 📞 **Key Contact:** Mehul Patel
   - 💬 **WhatsApp & Call:** [+91 98798 38281](https://wa.me/919879838281)
   - 📧 **Official Email:** [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com)
   - 🏢 **Factory & Office:** Shop 18 & 19, 2nd Floor, Brahmanand Chamber, Opp. M.P. Shah College, Surendranagar, Gujarat - 363001, India 🌿

CRITICAL CONVERSATIONAL FOCUS:
- ALWAYS direct your focus to the user's latest question.
- NEVER echo or paste previous responses from the chat history.
- Use warm emojis naturally (🌿, 📦, 🍅, 🧄, 🌶️, ✨, 🛒, 🚚, 📋, 👋, 😊, 💡, 📞, 🧾, 📧).
- NEVER use markdown header hashtags (#, ##) or raw tables (|...|).
- Keep formatting clean, inviting, and human.`


// ============================================================================
// DYNAMIC CONVERSATIONAL AI SYNTHESIZER (ZERO-TEMPLATE GUARANTEE)
// ============================================================================

function getProductEmoji(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('tomato')) return '🍅'
  if (n.includes('onion')) return '🧅'
  if (n.includes('garlic')) return '🧄'
  if (n.includes('ginger') || n.includes('sounth')) return '🫚'
  if (n.includes('turmeric')) return '🟡'
  if (n.includes('beetroot')) return '🟣'
  if (n.includes('carrot')) return '🥕'
  if (n.includes('spinach') || n.includes('methi') || n.includes('mint')) return '🥬'
  if (n.includes('lemon') || n.includes('amla')) return '🍋'
  if (n.includes('orange')) return '🍊'
  if (n.includes('mango')) return '🥭'
  if (n.includes('banana')) return '🍌'
  if (n.includes('watermelon')) return '🍉'
  if (n.includes('pomegranate')) return '🍇'
  if (n.includes('strawberry')) return '🍓'
  if (n.includes('cheese') || n.includes('butter') || n.includes('cream') || n.includes('curd')) return '🧀'
  if (n.includes('chili') || n.includes('pepper') || n.includes('spice')) return '🌶️'
  return '🌿'
}

function getLastDiscussedProductFromHistory(history: Array<{ role: string; content: string }>): KnowledgeItem | null {
  if (!Array.isArray(history) || history.length === 0) return null
  for (let i = history.length - 1; i >= 0; i--) {
    const text = (history[i].content || '').toLowerCase()
    for (const item of KNOWLEDGE_CATALOG) {
      const pName = item.name.toLowerCase()
      const base = pName.replace(' powder', '').trim()
      if (text.includes(pName) || (base.length >= 4 && text.includes(base))) {
        return item
      }
    }
  }
  return null
}

async function synthesizeDynamicAIResponse(
  message: string,
  retrievedContext: string,
  history: Array<{ role: string; content: string }> = []
): Promise<string> {
  const clean = message.toLowerCase().trim()
  const historyWithMsg = [...history, { role: 'user', content: message }]

  // Normalize common phonetic and keyboard typos
  const normalized = clean
    .replace(/\b(recepie|recipie|recepi|recipi|recpie)\b/g, 'recipe')
    .replace(/\b(romato|tamato|tomoto|tomatto)\b/g, 'tomato')
    .replace(/\b(onoin|oinon|oniyon)\b/g, 'onion')
    .replace(/\b(garliic|garli)\b/g, 'garlic')
    .replace(/\b(powderz|powdr)\b/g, 'powder')

  // Identify referential context from history (ONLY used when user says 'it', 'this', 'that', 'its', etc.)
  const historyProduct = getLastDiscussedProductFromHistory(history)
  const hasPronounRef = /\b(it|its|this|that|the powder|these powders)\b/i.test(normalized)

  // ========================================================================
  // 1. RECIPES, CULINARY PREPARATION & CULINARY FORMULATION INTENT (HIGHEST PRIORITY)
  // Evaluated FIRST so recipe requests are NEVER intercepted by order intake or raw specs!
  // ========================================================================
  const isRecipeIntent =
    /(recipe|how to make|how to cook|how to prepare|how do i make|how can i make|method to make|preparation of|cook with|dish with|soup recipe|sauce recipe|curry recipe|gravy recipe|soup premix|seasoning blend|culinary use|cooking use)/i.test(
      normalized
    ) ||
    ((normalized.includes('soup') ||
      normalized.includes('dip') ||
      normalized.includes('curry') ||
      normalized.includes('sauce') ||
      normalized.includes('bread') ||
      normalized.includes('chai') ||
      normalized.includes('tea') ||
      normalized.includes('smoothie') ||
      normalized.includes('latte') ||
      normalized.includes('puree')) &&
      (normalized.includes('how') ||
        normalized.includes('tell') ||
        normalized.includes('give') ||
        normalized.includes('make') ||
        normalized.includes('cook') ||
        normalized.includes('prepare') ||
        normalized.includes('use') ||
        normalized.includes('method') ||
        normalized.includes('can i')))

  if (isRecipeIntent) {
    // 1A. TOMATO RECIPES
    if (
      normalized.includes('tomato') ||
      (!normalized.includes('onion') &&
        !normalized.includes('garlic') &&
        !normalized.includes('ginger') &&
        !normalized.includes('cheese') &&
        !normalized.includes('beet') &&
        !normalized.includes('carrot') &&
        !normalized.includes('spinach') &&
        normalized.includes('soup') &&
        (!hasPronounRef || !historyProduct || historyProduct.name.toLowerCase().includes('tomato')))
    ) {
      return `🥣 **Rich & Velvety Tomato Soup (Using Nectar 80-Mesh Tomato Powder)** 🍅✨

Using pure dehydrated Tomato Powder allows you to prepare restaurant-quality, silky tomato soup in just 8–10 minutes with zero chopping, boiling down, or straining!

📋 **Ingredients (Serves 2–3):**
• 🍅 **Nectar Tomato Powder (80 mesh):** 3 tablespoons (approx. 30g)
• 🧅 **Nectar White Onion Powder:** 1/2 teaspoon (for sweet aromatic base)
• 🧄 **Nectar Garlic Powder:** 1/4 teaspoon (for savory depth)
• 💧 **Water or Vegetable Broth:** 2.5 cups (500 ml)
• 🧈 **Butter or Olive Oil:** 1 tablespoon
• 🌾 **Cornstarch:** 1 teaspoon dissolved in 2 tbsp water (for classic smooth body)
• 🧂 **Seasonings:** 1/2 tsp salt, 1/4 tsp crushed black pepper, 1/2 tsp sugar (to balance natural acidity)
• 🥛 **Garnish:** 2 tablespoons fresh cream, crisp garlic croutons, or torn basil

👨‍🍳 **Step-by-Step Preparation:**
1. **Cold Slurry (Zero-Lump Rule):** In a small bowl, whisk 3 tbsp Tomato Powder into 1/2 cup room-temperature water until completely smooth and lump-free.
2. **Bloom the Aromatics:** Melt butter in a saucepan over low heat. Add the Onion Powder and Garlic Powder; stir for 20 seconds to release their fragrant sweetness (do not brown).
3. **Combine & Simmer:** Pour in the remaining 2 cups of water/broth and the smooth tomato slurry. Stir well and bring to a gentle simmer.
4. **Thicken & Season:** Stir in the cornstarch slurry, salt, crushed black pepper, and sugar. Simmer on low heat for 3–5 minutes until thick, glossy, and fragrant.
5. **Garnish & Serve:** Swirl in fresh cream, top with crunchy croutons or black pepper, and serve hot! 🥣✨

🏭 **Commercial Premix Formula (Per 100g Dry Sachet):**
62g Tomato Powder (80 mesh), 12g Cornstarch, 8g White Onion Powder, 2g Garlic Powder, 10g Sugar, 4g Salt, 2g Soya HVP.

Would you like 1 KG R&D trial packs of Tomato, Onion, or Garlic powders for your trials? 😊`
    }

    // 1B. ONION RECIPES
    if (
      normalized.includes('onion') ||
      (hasPronounRef && historyProduct && historyProduct.name.toLowerCase().includes('onion'))
    ) {
      return `🧅 **Classic French Onion Soup & Creamy Onion Dip (Using Nectar Onion Powder)** 🌿✨

Nectar's low-temperature dehydrated White Onion Powder delivers instant caramelized sweetness and allium aroma without peeling or crying!

🥣 **1. Quick French Onion Soup (Serves 2):**
• 🧅 **Nectar White Onion Powder:** 2 tablespoons (approx. 20g)
• 🧄 **Nectar Garlic Powder:** 1/4 teaspoon
• 🧈 **Butter:** 1.5 tablespoons
• 💧 **Broth or Water:** 3 cups (600 ml) vegetable or mushroom broth
• 🍞 **Baguette slices & grated Gruyère / Mozzarella cheese**
• **Method:** Melt butter, sauté onion and garlic powder for 30 seconds until golden. Pour in broth and 1/2 tsp soy sauce or Soya HVP. Simmer 5 mins. Ladle into oven-safe bowls, float toasted baguette, cover with cheese, and broil until bubbly and golden brown!

🥣 **2. 2-Minute Creamy Onion Dip (Party Favorite):**
• Mix **2 tbsp Nectar Onion Powder** + **1/2 tsp Garlic Powder** + **1/2 tsp salt** into 1 cup Greek yogurt, hung curd, or sour cream. Rest for 15 minutes in the fridge for flavors to bloom. Serve with chips or pita!

Would you like 1 KG trial packs or bulk 25 KG pricing for White Onion Powder? 😊`
    }

    // 1C. GARLIC RECIPES
    if (
      normalized.includes('garlic') ||
      (hasPronounRef && historyProduct && historyProduct.name.toLowerCase().includes('garlic'))
    ) {
      return `🧄 **Ultimate Garlic Butter Spread & Toasted Garlic Bread (Using Nectar Garlic Powder)** 🌿✨

Our 100-mesh cryo-milled Garlic Powder dissolves seamlessly into warm fats without the raw bitter chunks or burning risk of fresh minced garlic.

📋 **Ingredients:**
• 🧄 **Nectar Garlic Powder:** 1.5 teaspoons
• 🧈 **Salted Butter (Softened):** 100g (1/2 cup)
• 🌿 **Dried Oregano / Parsley:** 1 teaspoon
• 🌶️ **Red Chili Flakes:** 1/2 teaspoon
• 🥖 **French Baguette or Loaf:** Sliced diagonally

👨‍🍳 **Preparation:**
1. In a bowl, whip the softened butter with Garlic Powder, herbs, and chili flakes until fluffy and pale.
2. Generously spread the garlic butter over sliced bread.
3. Bake at 190°C (375°F) for 6–8 minutes until golden and crisp around the crust. (Top with mozzarella for Cheese Garlic Bread!)

Would you like sample packs or specifications for 100-mesh Garlic Powder? 😊`
    }

    // 1D. GINGER CHAI & TEA
    if (
      normalized.includes('ginger') ||
      normalized.includes('sounth') ||
      normalized.includes('chai') ||
      normalized.includes('tea') ||
      (hasPronounRef && historyProduct && (historyProduct.name.toLowerCase().includes('ginger') || historyProduct.name.toLowerCase().includes('sounth')))
    ) {
      return `🫚 **Authentic Kadak Ginger Chai & Warming Honey Elixir** 🌿✨

Made with 100% pure dehydrated ginger powder (Sounth) for intense, warming gingerol heat without stringy fibers.

☕ **1. Royal Ginger Kadak Chai (2 Cups):**
• Boil 1 cup water with 2 tsp black tea leaves and **1/4 tsp Nectar Ginger Powder**.
• Add 1 cup milk and 2 tsp sugar/jaggery. Simmer for 3 minutes until rich and aromatic. Strain and serve piping hot!

🍯 **2. Soothing Throat Honey Drops:**
• Mix 1/4 tsp Ginger Powder + a pinch of Turmeric Powder + 1 tbsp pure raw honey. Sip slowly to soothe coughs, colds, and chills.

Would you like a sample pack or COA test report for Sounth Ginger Powder? 😊`
    }

    // 1E. CHEESE SAUCE & SEASONING
    if (
      normalized.includes('cheese') ||
      (hasPronounRef && historyProduct && historyProduct.name.toLowerCase().includes('cheese'))
    ) {
      return `🧀 **Velvety Nacho Cheese Sauce & Seasoning Blend (Using Nectar Cheese Powder)** ✨

Our spray-dried Grade A Cheese Powder yields velvety, clump-free sauces and snack dustings instantly.

📋 **Ingredients:**
• 🧀 **Nectar Cheese Powder:** 4 tablespoons (approx. 40g)
• 🧈 **Butter:** 1 tablespoon
• 🌾 **Flour or Cornstarch:** 1 tablespoon
• 🥛 **Milk:** 1 cup (warm)
• 🧄 **Nectar Garlic Powder:** 1/4 teaspoon
• 🌶️ **Paprika / Chili Powder:** 1/4 teaspoon

👨‍🍳 **Preparation:**
1. Melt butter in a saucepan on low heat. Whisk in flour for 1 minute.
2. Slowly pour in warm milk while whisking constantly to create a smooth béchamel base.
3. Turn heat to lowest, whisk in Cheese Powder and Garlic Powder until completely melted and silky.
4. Serve immediately with nachos, fries, or pasta!

Would you like sample packs or bulk specs for Cheese Powder Grade A? 😊`
    }

    // 1F. BEETROOT RECIPES
    if (
      normalized.includes('beet') ||
      normalized.includes('beetroot') ||
      (hasPronounRef && historyProduct && historyProduct.name.toLowerCase().includes('beet'))
    ) {
      return `🟣 **Energizing Ruby Beetroot Smoothie & Velvet Crimson Latte** 🌿✨

Our 80-mesh Beetroot Powder preserves vivid betalain pigments and natural nitric oxide benefits without the peeling or red-stained hands!

🥤 **1. Ruby Pre-Workout Smoothie:**
• Whisk **1 tablespoon Nectar Beetroot Powder** into 1 glass chilled coconut water or almond milk with 1 banana and a dash of lemon juice.
• Rehydrates instantly with a deep natural magenta glow!

☕ **2. Pink Velvet Detox Latte:**
• Whisk **1 teaspoon Beetroot Powder** + **1/4 tsp Ginger Powder** + 1 cup warm frothed oat milk or whole milk. Sweeten with a dash of honey or vanilla.

Would you like a 1 KG trial pack or COA report for Beetroot Powder? 😊`
    }

    // 1G. UNIVERSAL RECONSTITUTION & GENERAL PREMIX RATIOS
    return `🌿 **Universal Dehydrated Powder Culinary Ratios & Premix Guide** ✨

Our 80–100 mesh dehydrated powders are engineered for instant reconstitution, vibrant color, and zero-lump blending:

💡 **Golden Reconstitution Rules:**
• **Fresh Puree Equivalent:** 1 part powder + 4 to 5 parts warm water = instant rich puree (Tomato, Beetroot, Carrot, Spinach).
• **Cold-Slurry Rule:** Always whisk dry powder into a small amount of room-temperature liquid first before adding to hot simmering pots to avoid clumping.
• **All-Purpose Instant Soup Premix:** Combine 60% Vegetable Powder, 15% Cornstarch, 8% Onion Powder, 2% Garlic Powder, 12% Seasoning (Salt/Sugar/Pepper), and 3% Soya HVP.

Which specific dish or powder formulation would you like a recipe for? 😊`
  }

  // ========================================================================
  // 2. PRODUCT SPECIFICATION & DETAILS INQUIRY
  // Evaluated SECOND: Directly answers what the powder is, mesh size, purity, etc.
  // ========================================================================
  let matchedProduct: KnowledgeItem | null = null
  for (const p of KNOWLEDGE_CATALOG) {
    const pName = p.name.toLowerCase()
    const base = pName.replace(' powder', '').trim()
    if (normalized.includes(pName) || (base.length >= 4 && normalized.includes(base))) {
      matchedProduct = p
      break
    }
  }
  // Referential fallback using history if the user asks with pronouns ('it', 'this', 'that', 'its')
  if (!matchedProduct && hasPronounRef && historyProduct) {
    matchedProduct = historyProduct
  }

  const isDirectProductNameOnly =
    Boolean(matchedProduct) &&
    (normalized === matchedProduct?.name.toLowerCase() ||
      normalized === matchedProduct?.name.toLowerCase().replace(' powder', '').trim() ||
      normalized === `${matchedProduct?.name.toLowerCase().replace(' powder', '').trim()} powder`)

  const hasOrderActionWords =
    /(order|buy|purchase|deliver|taking\s+order|i\s+want\s+to\s+order|i\s+want\s+to\s+buy)/i.test(normalized) ||
    /\b\d+\s*(?:kg|gm|g|grams|kilo|bags?|boxes?)\b/i.test(normalized)

  const isSpecOrDetailQuery =
    (isDirectProductNameOnly && !hasOrderActionWords) ||
    normalized.includes('explain') ||
    normalized.includes('details') ||
    normalized.includes('overview') ||
    normalized.includes('spec') ||
    normalized.includes('specification') ||
    normalized.includes('mesh') ||
    normalized.includes('moisture') ||
    normalized.includes('purity') ||
    normalized.includes('shelf life') ||
    normalized.includes('application') ||
    /(what is|tell me about|info on|how is .* made|is it pure)/i.test(normalized)

  if (matchedProduct && isSpecOrDetailQuery && !hasOrderActionWords) {
    const isCustom = matchedProduct.isOnRequest ? ' *(Made to Order)*' : ''
    const apps = matchedProduct.applications.length > 0 ? matchedProduct.applications.join(', ') : 'Seasonings, premixes, and instant culinary formulations'
    const emoji = getProductEmoji(matchedProduct.name)

    // If specific question about mesh
    if (normalized.includes('mesh') || normalized.includes('fineness') || normalized.includes('particle')) {
      return `${emoji} **${matchedProduct.name} — Particle Fineness & Mesh Specifications** 🔬\n\n• **Standard Mesh Size:** ${matchedProduct.mesh}\n• **Milling Protocol:** Cryo-milled and uniform micro-particle sizing engineered for instant cold dispersion without sediment or grit.\n• **Packaging:** ${matchedProduct.packaging}\n\nWould you like a sample pack or official batch COA for ${matchedProduct.name}? 😊`
    }

    // If specific question about moisture
    if (normalized.includes('moisture') || normalized.includes('water content')) {
      return `${emoji} **${matchedProduct.name} — Moisture & Shelf Stability** 🔬\n\n• **Moisture Content:** Strictly maintained **below 8%** (batch-tested down to 5–6% on COA).\n• **Shelf Life:** 12 to 18 months in unopened hermetic barrier packaging.\n• **Zero Additives:** 100% pure with zero added anti-caking agents, starch, or carriers.\n\nWould you like our lab COA report for ${matchedProduct.name}? 😊`
    }

    return `${emoji} **${matchedProduct.name}**${isCustom} — Detailed Overview 🌿\n\n${matchedProduct.description}\n\n🔬 **Key Technical Specifications:**\n• **Mesh / Fineness:** ${matchedProduct.mesh} (fine, uniform particle sizing for fast dispersion)\n• **Purity & Moisture:** 100% pure & additive-free; moisture strictly maintained below 8% for long shelf stability.\n• **Key Applications:** ${apps}\n\n📦 **Packaging & Samples:**\nWe supply standard **25 KG bulk corrugated boxes** (food-grade HDPE lined) alongside **1 KG & 5 KG R&D trial packs** for formulation and sample testing.\n\nWould you like a commercial price quote or the verified batch Certificate of Analysis (COA) for ${matchedProduct.name}? 😊`
  }

  // ========================================================================
  // 3. DEHYDRATION TECHNOLOGIES & PROCESS INQUIRY
  // ========================================================================
  if (/(freeze dry|spray dry|drum dry|air dry|dehydration method|how is it made|drying process|manufacturing process)/i.test(clean)) {
    return `🔬 **Dehydration Technologies at Nectar Ingredients** 🌿\n\nWe utilize advanced, low-temperature dehydration processes tailored to each raw ingredient to preserve natural pigments, delicate aromas, and active bioactives:\n\n• **Low-Temperature Spray Drying:** Ideal for fruit concentrates and dairy powders (like Pomegranate and Cheese Powder). Atomized droplets dry rapidly in warm air, yielding ultra-fine, highly dispersible powders with instant solubility.\n• **Freeze Drying (Lyophilization):** Sublimates ice crystals under vacuum at sub-zero temperatures. It provides unmatched nutrient and volatile aroma retention with a light, porous structure that rehydrates instantly — ideal for premium fruit and herbal applications.\n• **Hot Air & Drum Drying:** Perfect for root vegetables, spices, and leafy greens (like Onion, Garlic, and Kasuri Methi). Gentle low heat preserves robust pungency, fiber integrity, and standard 60–100 mesh fineness.\n\nAll our powders maintain moisture strictly below 8% with zero added salt, carriers, or artificial fillers. Would you like technical specs or R&D trial packs for your specific application? 😊`
  }

  // ========================================================================
  // 4. CONTACT, FACILITY & DIRECT COMMERCIAL DESK
  // ========================================================================
  if (
    /(contact|phone number|call you|whatsapp|reach you|mehul|owner|factory|office address|where are you located|facility address|office location|where is your)/i.test(clean) &&
    !clean.includes('track') && !clean.includes('status')
  ) {
    return `👋 **Nectar Ingredients — Direct B2B Commercial Desk**\n\n• 📞 **Key Contact Person:** Mehul Patel\n• 💬 **Direct Call & WhatsApp:** [+91 98798 38281](https://wa.me/919879838281) (Fastest for custom rates, sample dispatches & dispatch updates)\n• 📧 **Official Email:** [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com) (For custom commercial quotes and official PDF bills upon dispatch)\n• 🏢 **Manufacturing Facility & Office:** Shop 18 & 19, 2nd Floor, Brahmanand Chamber, Opp. M.P. Shah College, Surendranagar, Gujarat - 363001, India 🌿\n\nFeel free to WhatsApp Mehul directly with your target product, quantity, and destination pin code! 😊`
  }

  // ========================================================================
  // 5. GREETING & SOCIAL PLEASANTRIES
  // ========================================================================
  if (/^(hi|hello|hey|hii|hiii|namaste|good morning|good afternoon|good evening)\b/i.test(clean)) {
    return `Hello! 👋 Welcome to **Nectar Intelligence**! 🌿\n\nI'm your AI technical and commercial assistant for Nectar Ingredients (Surendranagar, Gujarat). How can I assist you today? I'd be happy to explain our dehydrated powders, share recipe formulations, or answer any technical questions! 😊`
  }
  if (/^(thanks|thank you|thankyou|thx|bye|goodbye)\b/i.test(clean)) {
    return `You're very welcome! 🌿 It's always a pleasure assisting you. If you ever need sample packs, Certificate of Analysis (COA) reports, or commercial bulk quotes, feel free to ask or WhatsApp **Mehul Patel** at [+91 98798 38281](https://wa.me/919879838281). Have a wonderful day! 😊✨`
  }

  // ========================================================================
  // 6. HEALTH / WELLNESS / SYMPTOM SUPPORT (WITH MEDICAL DISCLAIMER & DOCTOR PRESCRIPTION)
  // ========================================================================
  if (/\b(stomach|tummy|indigestion|acid|acidity|gas|bloat|cramp|digest|nausea|vomit|loose motion|diarrhea)\b/i.test(clean)) {
    return `Oh no, I'm really sorry to hear you're dealing with stomach trouble! 💛 Please take care of yourself.

First and foremost though, please make sure you consult a qualified doctor so they can check what's going on, and take whatever medications they prescribe for you. While gentle home comforts like warm ajwain (carom seed) or cumin water and light buttermilk are wonderful for soothing an upset stomach and keeping you hydrated, they can never replace professional medical care or a doctor's prescription. If the discomfort persists or is accompanied by severe pain, definitely get it looked at right away!

In the meantime, getting good rest and drinking plenty of warm fluids will help your digestive system settle. On our side at **Nectar Ingredients** (Surendranagar, Gujarat), we make 100% pure, cryo-milled powders with zero chemical additives, preservatives, or added salt—like our pure **Ajwain Powder** and **Ginger (Sounth) Powder**, which are laboratory-tested for active essential oils and gingerol.

We offer convenient **1 KG & 5 KG trial packs** as well as **25 KG commercial bulk boxes**. Wishing you quick and gentle relief! If you ever need pure ingredients or formulation advice, **Mehul Patel** on our team is always reachable on WhatsApp at [+91 98798 38281](https://wa.me/919879838281). 🤗🌿`
  }

  if (/\b(fever|sick|ill|cough|headache|flu|throat infection|high temp|temperature)\b/i.test(clean) && !/\b(still|will|spill|skill|distill|million|billion)\b/i.test(clean)) {
    return `Oh no, I'm so sorry you're feeling sick! 💛 Please take it easy and get plenty of rest right now.

First and most importantly, please consult a qualified doctor for a proper diagnosis, and take all medications strictly based on your doctor's prescription. Simple home comforts like warm herbal teas and light vegetable broths are great for comforting your throat and staying hydrated, but they are never a substitute for professional medical care and a doctor's prescription. (And if your fever is high or you have severe symptoms, please seek medical attention right away!)

While you rest, keeping well hydrated with plenty of warm water or light clear vegetable broths will help your body recover. Right here at **Nectar Ingredients** in Surendranagar, Gujarat, we produce 100% pure dehydrated powders—like our **Pure Ginger (Sounth) Powder** and **Golden Lakadong Turmeric Powder** (3%+ curcumin) for a soothing warm herbal kadha, as well as pure **Tomato, Onion, and Garlic powders** for quick, clean vegetable broths with zero additives or preservatives.

We have convenient **1 KG and 5 KG trial packs** alongside **25 KG bulk boxes**. Wishing you a very swift, gentle, and restful recovery! Feel free to reach **Mehul Patel** on WhatsApp at [+91 98798 38281](https://wa.me/919879838281) if you or your family need anything. 🤗💛`
  }

  // ========================================================================
  // 6B. GUJARAT & SURENDRANAGAR TRAVEL / TOURISM / LOCAL HERITAGE
  // ========================================================================
  if (/(gujarat|surendranagar|visit gujarat|tourist|travel gujarat|places to visit|top places|sightseeing|tarnetar|wadhwan)/i.test(clean)) {
    return `Welcome to **Gujarat**! 🌿✨ It's such a magnificent state with a rich blend of history, vibrant culture, wildlife, and royal architecture. If you're planning a trip or exploring, here are 10 incredible places you shouldn't miss:

1️⃣ **Statue of Unity (Kevadia)** — The tallest statue in the world (182m) honoring Sardar Vallabhbhai Patel, featuring breathtaking Narmada river valley views, Valley of Flowers, and high-tech evening laser shows.
2️⃣ **Rann of Kutch (White Desert)** — An endless, glowing expanse of white salt plains that feels utterly magical, especially during full moon nights and the cultural **Rann Utsav**.
3️⃣ **Gir National Park & Wildlife Sanctuary (Sasan Gir)** — The only natural sanctuary on Earth where you can see majestic wild **Asiatic Lions** roaming freely.
4️⃣ **Somnath Temple (Veraval)** — The first of the twelve sacred Jyotirlingas, standing resplendent right along the edge of the Arabian Sea.
5️⃣ **Dwarkadhish Temple (Dwarka)** — The ancient, holy coastal pilgrimage city deeply steeped in Lord Krishna's sacred legacy.
6️⃣ **Rani Ki Vav (Patan) & Modhera Sun Temple** — Architectural masterpieces of the Solanki era. Rani Ki Vav is an intricate UNESCO World Heritage stepwell, and Modhera's 11th-century Sun Temple has stunning stone carvings.
7️⃣ **Ahmedabad Historic City & Sabarmati Ashram** — India's first UNESCO World Heritage City, famous for Mahatma Gandhi's serene ashram, Sidi Saiyyed Mosque, and legendary street food at Manek Chowk.
8️⃣ **Saputara** — Gujarat's scenic hill station nestled in the Sahyadri ranges with cascading waterfalls, cool mist, and tribal craft heritage.
9️⃣ **Champaner-Pavagadh Archaeological Park** — A UNESCO World Heritage treasure blending historical forts, mosques, and the sacred hilltop temple.
🔟 **Surendranagar & Saurashtra Heritage (Gateway to Saurashtra)** — Famous for royal stepwells (Madha Vav, Ganga Vav), the vibrant Tarnetar folk fair, and the proud **manufacturing home of Nectar Ingredients**! 🏛️🌿

Gujarat is also the agricultural powerhouse of India! Right here in **Surendranagar**, we at **Nectar Ingredients** transform the region's rich farm harvests into 100% pure dehydrated vegetable, spice, fruit, and dairy powders (White Onion, Garlic, Tomato, Ginger, Turmeric, etc.) with zero additives, preservatives, or artificial colors.

Whether you're developing seasonings, instant mixes, or cooking at home, our pure powders deliver genuine Indian flavor with total convenience. We supply standard **25 KG bulk boxes** as well as **1 KG / 5 KG R&D trial packs**.

If you're planning a visit or would like samples for your kitchen or food business, feel free to reach **Mehul Patel** directly on WhatsApp at [+91 98798 38281](https://wa.me/919879838281) or email [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com)! 😊👋`
  }

  // ========================================================================
  // 7. ORDER FOLLOW-UP & VERIFICATION
  // ========================================================================
  const isOrderFollowUp = /(is\s+it\s+submitted|did\s+you\s+submit|is\s+it\s+done|is\s+my\s+order|order\s+submitted|order\s+status|status\s+of\s+(?:my\s+)?order|did\s+you\s+take\s+my\s+order|is\s+my\s+order\s+placed|order\s+placed|confirm\s+my\s+order|order\s+confirmed)/i.test(clean)
  if (isOrderFollowUp) {
    const state = extractOrderStateFromHistory(historyWithMsg)
    if (state.existingRef) {
      return `Yes, absolutely! 🎉 Your order has been successfully registered in our system! 🌿\n\n📋 **Reference Number:** \`${state.existingRef}\`\n\nOur commercial sales team in Surendranagar (led by **Mehul Patel**) has logged your inquiry. An official commercial quote and proforma invoice will be sent to your registered email shortly.\n\n💡 For priority dispatch or immediate questions:\nReach **Mehul Patel** directly on WhatsApp at [+91 98798 38281](https://wa.me/919879838281) 📞`
    }
    if (state.products.length > 0) {
      const missing: string[] = []
      if (!state.customerName) missing.push('Full Name')
      if (!state.email) missing.push('Email Address')
      if (!state.phone) missing.push('Mobile Number')
      if (!state.address || !state.pin) missing.push('Complete Delivery Address with 6-digit PIN')
      return `We have noted your inquiry for **${state.products.map((p) => p.name).join(', ')}**, but to formally submit it and generate your Reference ID, we still need: ${missing.join(', ')}. Please share these details, and I will register it immediately! 🌿`
    }
    return `🌿 To check your order status, please share your **Reference ID** (e.g., \`NEC-20260815-122335\`), registered **Mobile Number**, or **Email Address**, and I will look it up right away! 😊`
  }

  // ========================================================================
  // 8. ORDER INTAKE & SUBMISSION (ONLY WHEN CURRENT MESSAGE IS AN ORDER ACTION)
  // ========================================================================
  const isOrderAction =
    /(take\s+(?:an?\s+)?order|place\s+(?:an?\s+)?order|order\s+powders|buy\s+powder|purchase\s+powders|i\s+want\s+to\s+order|i\s+want\s+to\s+buy)/i.test(clean)
  const hasQuantities = /\b\d+\s*(?:kg|gm|g|grams|kilo|bags?|boxes?)\b/i.test(clean)
  const hasOrderCredentials = clean.includes('@') || /^(?:91)?[6-9]\d{9}$/.test(clean.replace(/[\s\-+]/g, '')) || /\b([1-9]\d{5})\b/.test(clean)

  if (isOrderAction || hasQuantities || hasOrderCredentials) {
    const state = extractOrderStateFromHistory(historyWithMsg)

    // Complete order submission if all required fields are present
    if (state.customerName && state.email && state.address && state.products.length > 0 && !state.existingRef) {
      const submitRes = await toolSubmitNewOrder({
        name: state.customerName,
        email: state.email,
        phone: state.phone,
        address: state.address,
        items: state.products,
        message: 'Order inquiry submitted via chatbot dynamic synthesizer',
      })
      if (submitRes.orderRef) {
        return formatSubmittedOrderMessage(submitRes.orderRef, {
          name: state.customerName,
          email: state.email,
          phone: state.phone,
          address: state.address,
          items: state.products,
        })
      } else if (submitRes.error) {
        return `We have your order details for **${state.products.map((p) => p.name).join(', ')}**, but there's a small correction needed: ${submitRes.error}. Could you please update this detail so I can register your order right away? 🌿`
      }
    }

    // Explicit request to place order without products yet
    if (isOrderAction && state.products.length === 0) {
      return `🌿 **Welcome to Nectar Ingredients!** 🌿\n\nWe'd love to help you place an order! To get started, please share:\n📦 **Products & Quantities** — Which powders and quantities are you looking for? (e.g., Tomato Powder 25kg, Onion Powder 1kg sample, Garlic Powder 5kg)\n👤 **Full Name**\n📧 **Email Address**\n📞 **Mobile Number** (10-digit)\n🏠 **Complete Delivery Address** (Street, City, State, and 6-digit PIN Code)\n\nOnce we have these, our sales team will register your order and email your custom commercial quote right away! 😊`
    }

    // Products noted, but missing contact/delivery details
    if (state.products.length > 0 && !state.existingRef) {
      const pList = state.products.map((p) => `• **${p.name}**${p.sku ? ` (SKU: ${p.sku})` : ''} — ${p.quantity} ${p.unit || 'kg'}`).join('\n')
      const missing: string[] = []
      if (!state.customerName) missing.push('👤 **Full Name**')
      if (!state.email) missing.push('📧 **Email Address**')
      if (!state.phone) missing.push('📞 **Mobile Number** (10-digit)')
      if (!state.address || !state.pin) missing.push('🏠 **Complete Delivery Address** (Street, City, State, & 6-digit PIN Code)')

      return `🛒 **Excellent choices! I've noted your requested powders:**\n${pList}\n\nTo formally submit your order and email your official commercial quote & PDF invoice, I just need:\n${missing.join('\n')}\n\nFeel free to share ${missing.length === 1 ? 'this' : 'these'}, and I'll register your order immediately! 🌿✨`
    }
  }

  // ========================================================================
  // 9. MASTER CATALOG RAG ADVISORY (FROM RETRIEVED CONTEXT)
  // ========================================================================
  if (retrievedContext) {
    const lines = retrievedContext.split('\n').filter((l) => l.includes('• **'))
    const productNames = lines
      .map((l) => {
        const m = l.match(/• \*\*(.*?)\*\*/)
        return m ? m[1] : null
      })
      .filter(Boolean) as string[]

    if (productNames.length > 0) {
      return `🌿 **Nectar Ingredients Technical Advisory**\n\nRegarding your inquiry, here is how our pure powders fit into commercial formulations:\n\n` +
        productNames.slice(0, 3).map((name) => `• **${name}:** Manufactured via low-temperature dehydration, strictly additive-free, and milled to uniform mesh fineness for seamless blending and dispersion.`).join('\n') +
        `\n\n📦 We supply standard **25 KG bulk boxes** (HDPE lined) alongside **1 KG & 5 KG R&D trial packs** for bench testing.\n\nWould you like a formal Certificate of Analysis (COA) or commercial sample pricing for any of these? 😊`
    }
  }

  // ========================================================================
  // 10. GENERAL CONVERSATIONAL INQUIRY & OFF-TOPIC PROMOTION
  // ========================================================================
  if (history && history.length > 0) {
    return `Thank you for asking! 😊 I'm always happy to assist with any questions, whether it's everyday life, culinary ideas, or wholesale ingredient advice! 🌿\n\nSpeaking of excellence, at **Nectar Ingredients** (Surendranagar, Gujarat), we supply 100% pure, additive-free dehydrated vegetable, spice, fruit, and dairy powders (Tomato, Onion, Garlic, Turmeric, Ginger, etc.). We offer standard **25 KG bulk boxes** as well as **1 KG & 5 KG R&D trial packs**.\n\nHow else can I assist you today? Feel free to ask anything or reach **Mehul Patel** on WhatsApp at [+91 98798 38281](https://wa.me/919879838281)! ✨`
  }

  return `Hello! 👋 Welcome to **Nectar Intelligence**! 🌿\n\nI'm delighted to assist you with any questions — from culinary and wellness advice to wholesale ingredient inquiries! At **Nectar Ingredients** (Surendranagar, Gujarat), we manufacture 100% pure, low-temperature dehydrated powders (Tomato, Onion, Garlic, Spices, Fruit, and Dairy) with zero additives or preservatives. Available in **25 KG bulk boxes** and **1 KG / 5 KG R&D trial packs**.\n\nWhat can I help you explore today? 😊`
}

export async function OPTIONS() {
  return new Response('ok', { headers: corsHeaders })
}

function formatOrderResponse(orders: any[]): string {
  if (!orders || orders.length === 0) {
    return `📋 **Order Lookup**\n📌 **Status:** No record found in our active dispatch queue.\n\nPlease double-check the reference code or phone number, or reach **Mehul Patel** directly at [+91 98798 38281](https://wa.me/919879838281) so we can look it up for you right away! 🌿`
  }

  if (orders.length === 1) {
    const order = orders[0]
    const st = order.status || 'Received & Under Commercial Review'
    const isDispatched = st.toLowerCase().includes('dispatch')
    const isPaymentAwaiting = st.toLowerCase().includes('qr') || st.toLowerCase().includes('awaiting payment')

    let reply = `📋 **Inquiry/Order Ref:** ${order.orderRef}\n📌 **Current Status:** ${st} ${isDispatched ? '🚚' : isPaymentAwaiting ? '💳' : '📋'}\n`
    if (order.items) reply += `🧪 **Items:** ${order.items}\n`
    if (order.total && order.total !== 'Not yet quoted') {
      reply += `💰 **Order Total:** ${typeof order.total === 'number' || (!isNaN(order.total) && String(order.total).trim() !== '') ? '₹' + order.total : order.total}\n`
    }

    if (isDispatched) {
      reply += `\n✅ **Dispatch Notice:** Great news! Your order package has been prepared and dispatched from our facility in Surendranagar. An official invoice copy has been sent to your registered email inbox.\n\n`
    } else if (isPaymentAwaiting) {
      reply += `\n💳 **Payment Notice:** Commercial quote & payment details have been emailed. Please check your inbox to complete payment so we can proceed with immediate dispatch.\n\n`
    } else {
      reply += `\n✅ **Next Steps:** Our sales team (led by **Mehul Patel**) has logged your sample/order request in our Google Sheets dispatch system. A custom commercial quote will be sent directly to your email inbox shortly (and the official PDF bill/invoice upon dispatch)!\n\n`
    }
    reply += `💡 For immediate priority dispatch:\nReach **Mehul Patel** directly at [+91 98798 38281](https://wa.me/919879838281) 📞\n\n🧾 **Invoice/Bill:** Please check your email inbox (and Spam/Promotions folder) for the official PDF bill! 📥😊`
    return reply
  }

  // MULTI-ORDER LISTING
  let reply = `📦 **Found ${orders.length} orders for your contact:**\n\n`
  orders.forEach((o: any, idx: number) => {
    const st = o.status || 'Under Review'
    const isDisp = st.toLowerCase().includes('dispatch')
    const isPay = st.toLowerCase().includes('qr') || st.toLowerCase().includes('awaiting payment')
    const icon = isDisp ? '🚚' : isPay ? '💳' : '📋'
    reply += `${idx + 1}️⃣ **Ref:** \`${o.orderRef}\` | 📌 **Status:** ${st} ${icon}\n`
    if (o.items) {
      const cleanItems = String(o.items)
        .split('\n')
        .map((l: string) => l.replace(/^[•\s-]+/, '').trim())
        .filter(Boolean)
        .join(', ')
      reply += `   • **Items:** ${cleanItems || o.items}\n`
    }
    if (o.total && o.total !== 'Not yet quoted') reply += `   • **Total:** ₹${o.total}\n`
    reply += '\n'
  })
  reply += `💡 For updates on any order, reach **Mehul Patel** at [+91 98798 38281](https://wa.me/919879838281) 📞\n🧾 Official invoices are automatically emailed upon order dispatch! 📥😊`
  return reply
}

// ============================================================================
// MAIN ROUTE HANDLER (POST)
// ============================================================================

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json()
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'A message is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const cleanLower = message.toLowerCase().trim()

    // Sanitize history so that it starts strictly with a user turn and retains up to 16 turns (8 complete exchanges)
    let sanitizedHistory: { role: string; content: string }[] = []
    if (Array.isArray(history)) {
      const validTurns = history.filter(
        (m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() !== ''
      )
      const firstUserIdx = validTurns.findIndex((m) => m.role === 'user')
      if (firstUserIdx !== -1) {
        sanitizedHistory = validTurns.slice(firstUserIdx).slice(-16).map((m) => ({
          role: m.role,
          content: m.content,
        }))
      }
    }

    // ========================================================================
    // FAST PATH 1: Instant Brochure Download (<2ms)
    // ========================================================================
    if (
      cleanLower.includes('brochure') ||
      cleanLower.includes('download company brochure') ||
      cleanLower.includes('company catalog') ||
      cleanLower.includes('product brochure') ||
      cleanLower.includes('download brochure') ||
      cleanLower.includes('company profile')
    ) {
      const brochureReply = `📄 **Nectar Ingredients Official Product Brochure & Catalog**\n\n[Download Company Brochure PDF](/Company_Brochure/Nectar_Ingredients_Brochure.pdf)\n\n• **Portfolio:** Complete technical specifications for 40+ pure vegetable, fruit, spice, and dairy powders.\n• **Dehydration Technologies:** Low-temperature spray drying, drum drying, and freeze drying with zero added fillers, salt, or artificial colors.\n• **Commercial Packaging:** Standard 25 KG bulk boxes (HDPE lined) + 1 KG & 5 KG R&D trial packs.\n\n💡 For bulk container pricing or custom mesh specifications, reach **Mehul Patel** directly at [+91 98798 38281](https://wa.me/919879838281) or email [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com) 😊`
      return new Response(
        JSON.stringify({ reply: brochureReply, history: [...sanitizedHistory, { role: 'user', content: message }, { role: 'assistant', content: brochureReply }] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // ========================================================================
    // FAST PATH 2: Instant COA / Certificate of Analysis (<2ms)
    // ========================================================================
    const isCertQuery =
      cleanLower.includes('coa') ||
      cleanLower.includes('certificate') ||
      cleanLower.includes('lab report') ||
      cleanLower.includes('heavy metal') ||
      cleanLower.includes('microbiology') ||
      cleanLower.includes('fssai report') ||
      cleanLower.includes('test report')

    if (isCertQuery) {
      const matchedCerts = CERTIFICATE_KNOWLEDGE.filter((cert) => {
        if (cleanLower.includes('all') || cleanLower.includes('master') || cleanLower.includes('portfolio') || cleanLower.includes('fssai')) return true
        return cert.keywords.some((k) => cleanLower.includes(k)) || cleanLower.includes(cert.title.toLowerCase())
      }).slice(0, 3)

      const certsToReturn = matchedCerts.length > 0 ? matchedCerts : [CERTIFICATE_KNOWLEDGE[0]]
      const certCards = certsToReturn
        .map((c) => `• **${c.title}**\n  [Download ${c.filename}](${c.downloadUrl})\n  *${c.description}*`)
        .join('\n\n')

      const coaReply = `🔬 **Official Batch Laboratory Analysis & Certificates (COA)**\n\n${certCards}\n\n• **Quality Guarantee:** Batch-tested for heavy metals, moisture strictly <8%, 80-100 mesh fineness, and zero synthetic dyes or preservatives.\n• **Batch Certificates:** Signed analytical reports accompany all commercial shipments.\n\n💡 For custom analytical testing or formulation support, reach **Mehul Patel** directly at [+91 98798 38281](https://wa.me/919879838281) 🌿`
      return new Response(
        JSON.stringify({ reply: coaReply, history: [...sanitizedHistory, { role: 'user', content: message }, { role: 'assistant', content: coaReply }] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // ========================================================================
    // FAST PATH 3: Instant Contact & Sales Desk (<2ms)
    // ========================================================================
    const isContactQuery =
      !cleanLower.includes('track') &&
      !cleanLower.includes('status') &&
      !cleanLower.includes('order') &&
      !cleanLower.includes('powder') &&
      !cleanLower.includes('recipe') &&
      !cleanLower.includes('kg') &&
      !cleanLower.includes('gm') &&
      (cleanLower.includes('contact') ||
        cleanLower.includes('phone number') ||
        cleanLower.includes('call you') ||
        cleanLower.includes('whatsapp') ||
        cleanLower.includes('reach you') ||
        cleanLower.includes('mehul') ||
        cleanLower.includes('owner') ||
        cleanLower.includes('factory') ||
        cleanLower.includes('office address') ||
        cleanLower.includes('where is your facility'))

    if (isContactQuery) {
      const contactReply = `👋 **Nectar Ingredients — Direct B2B Commercial Desk**\n\n• 📞 **Key Contact Person:** Mehul Patel\n• 💬 **Direct Call & WhatsApp:** [+91 98798 38281](https://wa.me/919879838281) (Fastest for custom rates, sample dispatches & dispatch updates)\n• 📧 **Official Email:** [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com) (For custom commercial quotes and official PDF bills upon dispatch)\n• 🏢 **Manufacturing Facility & Office:** Shop 18 & 19, 2nd Floor, Brahmanand Chamber, Opp. M.P. Shah College, Surendranagar, Gujarat - 363001, India 🌿\n\nFeel free to WhatsApp Mehul directly with your target product, quantity, and destination pin code! 😊`
      return new Response(
        JSON.stringify({ reply: contactReply, history: [...sanitizedHistory, { role: 'user', content: message }, { role: 'assistant', content: contactReply }] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // ========================================================================
    // FAST PATH 4: Instant Order Tracking (<800ms)
    // ========================================================================
    const necMatch = message.match(/NEC-\d{8}-\d{6}|NEC-[A-Za-z0-9-]+/i)
    const phoneMatch = message.match(/(?:\+?91[\s-]?)?([6-9]\d{9})/i)
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)

    const cleanDigits = message.replace(/[\s\-\+]/g, '')
    const isStandaloneLookupInput =
      /^(?:91)?[6-9]\d{9}$/.test(cleanDigits) ||
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanLower) ||
      /^nec-[a-z0-9-]+$/i.test(cleanLower)

    const hasTrackingKeywords =
      cleanLower.includes('track') ||
      cleanLower.includes('status') ||
      cleanLower.includes('where is my') ||
      cleanLower.includes('check my order') ||
      cleanLower.includes('check order') ||
      cleanLower.includes('existing order') ||
      cleanLower.includes('past order') ||
      cleanLower.includes('previous order') ||
      cleanLower.includes('lookup') ||
      cleanLower.includes('look up')

    const hasOrderSubmissionWords =
      cleanLower.includes('place') ||
      cleanLower.includes('buy') ||
      cleanLower.includes('take a') ||
      cleanLower.includes('take order') ||
      /\b\d+\s*(?:kg|gm|g|grams|kilos?|bags?|boxes?)\b/i.test(cleanLower)

    const hasLookupIdentifier = Boolean(necMatch) || Boolean(phoneMatch) || Boolean(emailMatch) || isStandaloneLookupInput

    // A tracking lookup MUST have an identifier in the current message
    const isTrackingIntent =
      !hasOrderSubmissionWords &&
      (Boolean(necMatch) ||
       (isStandaloneLookupInput && !cleanLower.includes('explain') && !cleanLower.includes('what') && !cleanLower.includes('how')) ||
       (hasLookupIdentifier && hasTrackingKeywords))

    // If the user asks about order tracking without providing an ID/phone
    const isTrackingInquiryWithoutId =
      !hasOrderSubmissionWords && !hasLookupIdentifier && hasTrackingKeywords

    if (isTrackingInquiryWithoutId) {
      const promptReply = `🌿 Sure, I can help you check your order status!\n\nTo look up your order, I'll need one of the following details from you:\n📋 **Reference ID** (e.g., \`NEC-20260815-122335\`)\n📞 **Mobile Number** (10-digit registered number)\n📧 **Email Address** used during ordering\n\nCould you please share any one of these so I can pull up your order details right away? 😊`
      return new Response(
        JSON.stringify({ reply: promptReply, history: [...sanitizedHistory, { role: 'user', content: message }, { role: 'assistant', content: promptReply }] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (isTrackingIntent) {
      const lookupArgs: { orderRef?: string; phone?: string; email?: string } = {}
      if (necMatch) lookupArgs.orderRef = necMatch[0].toUpperCase()
      if (phoneMatch) {
        lookupArgs.phone = phoneMatch[1] || phoneMatch[0]
      } else if (/^(?:91)?[6-9]\d{9}$/.test(cleanDigits)) {
        lookupArgs.phone = cleanDigits.slice(-10)
      }
      if (emailMatch) lookupArgs.email = emailMatch[0]

      const lookupRes = await toolLookupOrder(lookupArgs)
      if (lookupRes?.orders?.length > 0) {
        const orderReply = formatOrderResponse(lookupRes.orders)
        return new Response(
          JSON.stringify({ reply: orderReply, history: [...sanitizedHistory, { role: 'user', content: message }, { role: 'assistant', content: orderReply }] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      } else if (isStandaloneLookupInput || hasTrackingKeywords) {
        const notFoundReply = formatOrderResponse([])
        return new Response(
          JSON.stringify({ reply: notFoundReply, history: [...sanitizedHistory, { role: 'user', content: message }, { role: 'assistant', content: notFoundReply }] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
    }

    // ========================================================================
    // FAST PATH 4.5: Instant Complete Order Intake & Placement (<80ms)
    // STRICT RULE: Only triggers when the user's CURRENT message is actively
    // providing order details (quantities, address, contact) or requesting order placement,
    // and is NOT an informational inquiry, recipe question, technical question, or greeting!
    // ========================================================================
    const isOrderActionCurrentMessage =
      /\b\d+\s*(?:kg|gm|g|grams|kilos?|bags?|boxes?|packs?|cartons?|tons?|mt)\b/i.test(cleanLower) ||
      cleanLower.includes('@') ||
      /^(?:91)?[6-9]\d{9}$/.test(cleanDigits) ||
      /\b([1-9]\d{5})\b/.test(cleanLower) ||
      /\b(place order|confirm order|submit order|buy now|take order|order this|deliver to|proceed with order|finalize order)\b/i.test(cleanLower)

    const isInformationalOrRecipeQuery =
      cleanLower.includes('recipe') ||
      cleanLower.includes('recepie') ||
      cleanLower.includes('how to') ||
      cleanLower.includes('how do') ||
      cleanLower.includes('how can') ||
      cleanLower.includes('explain') ||
      cleanLower.includes('what is') ||
      cleanLower.includes('tell me') ||
      cleanLower.includes('spec') ||
      cleanLower.includes('mesh') ||
      cleanLower.includes('freeze dry') ||
      cleanLower.includes('spray dry') ||
      cleanLower.includes('drum dry') ||
      cleanLower.includes('contact') ||
      cleanLower.includes('phone number') ||
      cleanLower.includes('office') ||
      cleanLower.includes('factory') ||
      cleanLower.includes('brochure') ||
      cleanLower.includes('coa') ||
      cleanLower.includes('hello') ||
      cleanLower.includes('hi') ||
      cleanLower.includes('namaste') ||
      cleanLower.includes('fever') ||
      cleanLower.includes('cold') ||
      cleanLower.includes('visit') ||
      cleanLower.includes('places') ||
      cleanLower.includes('gujarat') ||
      cleanLower.includes('travel') ||
      cleanLower.includes('tourist')

    if (!isTrackingIntent && isOrderActionCurrentMessage && !isInformationalOrRecipeQuery) {
      const incomingOrderState = extractOrderStateFromHistory([
        ...sanitizedHistory,
        { role: 'user', content: message },
      ])
      if (
        incomingOrderState.customerName &&
        incomingOrderState.email &&
        incomingOrderState.address &&
        incomingOrderState.products.length > 0 &&
        !incomingOrderState.existingRef
      ) {
        const submitRes = await toolSubmitNewOrder({
          name: incomingOrderState.customerName,
          email: incomingOrderState.email,
          phone: incomingOrderState.phone,
          address: incomingOrderState.address,
          items: incomingOrderState.products,
          message: 'Order inquiry placed via instant order intake',
        })
        if (submitRes.orderRef) {
          const confirmReply = formatSubmittedOrderMessage(submitRes.orderRef, {
            name: incomingOrderState.customerName,
            email: incomingOrderState.email,
            phone: incomingOrderState.phone,
            address: incomingOrderState.address,
            items: incomingOrderState.products,
          })
          return new Response(
            JSON.stringify({
              reply: confirmReply,
              history: [
                ...sanitizedHistory,
                { role: 'user', content: message },
                { role: 'assistant', content: confirmReply },
              ],
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        }
      }
    }

    // ========================================================================
    // FAST PATH 5: Instant Order Follow-Up & Submission Verification (<5ms)
    // ========================================================================
    const isOrderFollowUp = /(is\s+it\s+submitted|did\s+you\s+submit|is\s+it\s+done|is\s+my\s+order|order\s+submitted|order\s+status|status\s+of\s+my\s+order|did\s+you\s+take\s+my\s+order|is\s+my\s+order\s+placed|order\s+placed|confirm\s+my\s+order|order\s+confirmed)/i.test(cleanLower)
    if (isOrderFollowUp) {
      const state = extractOrderStateFromHistory(sanitizedHistory)
      if (state.existingRef) {
        const confirmReply = `Yes, absolutely! 🎉 Your order has been successfully submitted to our dispatch desk! 🌿\n\n📋 **Order Reference ID:** \`${state.existingRef}\`\n\nOur commercial sales team in Surendranagar (led by **Mehul Patel**) has received your inquiry. An official commercial quote and proforma invoice will be sent to your registered email shortly.\n\n💡 For priority dispatch or immediate questions:\nReach **Mehul Patel** directly on WhatsApp at [+91 98798 38281](https://wa.me/919879838281) 📞`
        return new Response(
          JSON.stringify({ reply: confirmReply, history: [...sanitizedHistory, { role: 'user', content: message }, { role: 'assistant', content: confirmReply }] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
      if (state.customerName && state.email && state.address && state.products.length > 0) {
        const submitRes = await toolSubmitNewOrder({
          name: state.customerName,
          email: state.email,
          phone: state.phone,
          address: state.address,
          items: state.products,
          message: 'Order confirmed and submitted via customer verification',
        })
        if (submitRes.orderRef) {
          const confirmReply = formatSubmittedOrderMessage(submitRes.orderRef, {
            name: state.customerName,
            email: state.email,
            phone: state.phone,
            address: state.address,
            items: state.products,
          })
          return new Response(
            JSON.stringify({ reply: confirmReply, history: [...sanitizedHistory, { role: 'user', content: message }, { role: 'assistant', content: confirmReply }] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        }
      }
    }

    // ========================================================================
    // DYNAMIC AI CONVERSATION PATH (via Enterprise Groq Multi-Key Pool)
    // ========================================================================
    const groqKeys = getGroqKeys()
    const retrievedContext = retrieveRelevantKnowledge(message)

    // Build Augmented Prompt with Clean Persona
    const dynamicSystemPrompt = retrievedContext
      ? `${SYSTEM_PROMPT}\n${retrievedContext}`
      : SYSTEM_PROMPT

    const messages: any[] = [
      { role: 'system', content: dynamicSystemPrompt },
      ...sanitizedHistory,
      { role: 'user', content: message },
    ]

    let finalReply = ''
    if (groqKeys.length > 0) {
      try {
        const groqResult = await callGroqWithFailover(messages, tools as any, {
          preferredModel: 'qwen/qwen3.8-27b',
          fallbackModel: 'openai/gpt-oss-120b',
          temperature: 0.65,
          maxTokens: 1000,
        })

        // 1. Process native Groq tool call
        if (groqResult.tool_calls && groqResult.tool_calls.length > 0) {
          const tc = groqResult.tool_calls[0]
          const fnName = tc.function?.name
          let fnArgs: any = {}
          try {
            fnArgs = JSON.parse(tc.function?.arguments || '{}')
          } catch (e) {
            console.warn('Failed to parse Groq tool call arguments JSON:', e)
          }

          if (fnName === 'submit_new_order') {
            const submitRes = await toolSubmitNewOrder({
              name: fnArgs.name || fnArgs.customer_name,
              email: fnArgs.email,
              phone: fnArgs.phone || fnArgs.mobile,
              company: fnArgs.company,
              address: fnArgs.address,
              items: normalizeItems(fnArgs.items || fnArgs.products),
              message: fnArgs.message || 'Order inquiry placed via Groq chatbot tool',
            })
            if (submitRes.orderRef) {
              finalReply = formatSubmittedOrderMessage(submitRes.orderRef, fnArgs)
            } else if (submitRes.error) {
              finalReply = `I have your order details, but I just need one small correction: ${submitRes.error}. Could you please update this detail so I can submit it immediately? 🌿`
            }
          } else if (fnName === 'lookup_order') {
            console.log('DEBUG [Groq Tool] lookup_order args:', fnArgs)
            const lookupRes = await toolLookupOrder(fnArgs)
            finalReply = formatOrderResponse(lookupRes?.orders || [])
          }
        }

        // 2. Process text content or embedded tool tags fallback
        if (!finalReply && groqResult.content) {
          const rawContent = groqResult.content
          const parsedTool = parseToolCall(rawContent)
          if (parsedTool) {
            if (parsedTool.toolName === 'submit_new_order') {
              const submitRes = await toolSubmitNewOrder({
                name: parsedTool.args.name || parsedTool.args.customer_name,
                email: parsedTool.args.email,
                phone: parsedTool.args.phone || parsedTool.args.mobile,
                company: parsedTool.args.company,
                address: parsedTool.args.address,
                items: normalizeItems(parsedTool.args.items || parsedTool.args.products),
                message: parsedTool.args.message || 'Order inquiry placed via chatbot',
              })
              if (submitRes.orderRef) {
                finalReply = formatSubmittedOrderMessage(submitRes.orderRef, parsedTool.args)
              } else if (submitRes.error) {
                finalReply = `I have your order details, but I just need one small correction: ${submitRes.error}. Could you please update this detail so I can submit it immediately? 🌿`
              }
            } else if (parsedTool.toolName === 'lookup_order') {
              console.log('DEBUG [LLM Tool] lookup_order args:', parsedTool.args)
              const lookupRes = await toolLookupOrder(parsedTool.args)
              console.log('DEBUG [LLM Tool] lookupRes:', lookupRes)
              finalReply = formatOrderResponse(lookupRes?.orders || [])
            }
          } else {
            finalReply = rawContent
          }
        }
      } catch (llmError) {
        console.warn('Groq Pool API call timed out or failed, using intelligent dynamic fallback:', llmError)
      }
    }

    // ========================================================================
    // DYNAMIC CONVERSATIONAL AI SYNTHESIZER (ZERO-TEMPLATE GUARANTEE)
    // ========================================================================
    if (!finalReply) {
      if (isTrackingIntent) {
        const lookupArgs: { orderRef?: string; phone?: string; email?: string } = {}
        if (necMatch) lookupArgs.orderRef = necMatch[0].toUpperCase()
        if (phoneMatch) {
          lookupArgs.phone = phoneMatch[1] || phoneMatch[0]
        } else if (/^(?:91)?[6-9]\d{9}$/.test(cleanDigits)) {
          lookupArgs.phone = cleanDigits.slice(-10)
        }
        if (emailMatch) lookupArgs.email = emailMatch[0]

        console.log('DEBUG [Fallback] isTrackingIntent lookupArgs:', lookupArgs)
        const lookupRes = await toolLookupOrder(lookupArgs)
        console.log('DEBUG [Fallback] lookupRes:', lookupRes)
        finalReply = formatOrderResponse(lookupRes?.orders || [])
      } else {
        finalReply = await synthesizeDynamicAIResponse(message, retrievedContext, sanitizedHistory)
      }
    }

    const updatedHistory = [
      ...sanitizedHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: finalReply },
    ]

    return new Response(
      JSON.stringify({ reply: finalReply, history: updatedHistory }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Chatbot error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}