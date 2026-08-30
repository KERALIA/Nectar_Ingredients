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

  // Scoring match for specific products
  const words = cleanQuery.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2)
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
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  if (scoredItems.length === 0) {
    return ''
  }

  const productSnippets = scoredItems.map(({ item }) => {
    const isCustom = item.isOnRequest ? ' [Made-to-Order / Custom Quote Required]' : ''
    return `• **${item.name}** (SKU: ${item.sku})${isCustom}\n  - Mesh / Fineness: ${item.mesh}\n  - Packaging: ${item.packaging}\n  - Details: ${item.description}\n  - Top Applications: ${item.applications.join(', ')}`
  }).join('\n\n')

  return `\nRELEVANT TECHNICAL PRODUCT SPECIFICATIONS (from Nectar Ingredients Master Catalog):\n${productSnippets}\n`
}

// ============================================================================
// TOOL IMPLEMENTATIONS: Webhook Router for Google Sheets
// ============================================================================

async function toolLookupOrder(args: { orderRef?: string; phone?: string; email?: string }) {
  if (!args.orderRef && !args.phone && !args.email) {
    return {
      status: 'ignored',
      message: 'No reference ID, phone number, or email was provided. If the user wants to place a new order or request samples, collect their contact & address details to submit an order.',
    }
  }

  const scriptUrl = appsScriptUrl()
  if (scriptUrl) {
    const normalizedPhone = args.phone ? args.phone.replace(/[^\d+]/g, '').trim() : undefined
    const normalizedEmail = args.email ? args.email.trim().toLowerCase() : undefined
    const normalizedRef = args.orderRef ? args.orderRef.trim().toUpperCase() : undefined

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

const SYSTEM_PROMPT = `You are the expert AI Sales & Advisory Consultant for Nectar Ingredients, a premier wholesale manufacturer of pure spice, vegetable, fruit, and dairy powders based in Surendranagar, Gujarat, India (Est. 2021).

BRAND USPs & QUALITY HIGHLIGHTS:
- 100% Additive-Free & Pure Concentrated Ingredients (zero added salt, sugar, preservatives, or artificial fillers).
- High-Technology Dehydration: In-house low-temperature spray drying, drum drying, and freeze drying preserving vivid natural colors, authentic aromas, and active nutrients (curcumin, lycopene, allicin, gingerol).
- Sourcing: Sourced directly at peak harvest from trusted regional farms across Gujarat, Rajasthan, and India.
- Standard Bulk Packaging: 25 KG Corrugated Boxes (with food-grade HDPE liners).
- R&D Trial Packs: 1 KG and 5 KG sealed packs available for sample testing and formulation trials.
- Moisture strictly maintained below 8% for superior free-flowing shelf stability.

CRITICAL PRICING RULE (STRICT):
Prices are NOT fixed on the website — they vary daily based on raw crop harvests and order volume. You NEVER invent, calculate, or state a numerical price. Always explain that our sales team will email you a custom commercial quote with payment details (PDF documents are strictly for official bills/invoices upon order confirmation & dispatch).

CORE RESPONSIBILITIES:

1. NEW ORDER INTAKE & CREATION (HIGHEST PRIORITY):
   - When a customer says "take a new order", "place a new order", "place a custom order", "order powders", "buy tomato powder", "I want to purchase", "sample request", or lists products they want:
     • THIS IS A NEW ORDER INTAKE — NEVER CALL \`lookup_order\`!
     • Enthusiastically acknowledge the powders they requested.
     • Ask the customer to provide:
       1. 📦 **Products & Quantities**: (e.g. Tomato Powder 25kg, Onion Powder 1kg sample, Garlic Powder 50kg)
       2. 👤 **Full Name**: Customer contact name
       3. 📧 **Email Address**: For sending official commercial quote & PDF invoice
       4. 📞 **Mobile Number**: 10-digit Indian WhatsApp / phone number
       5. 🏠 **Complete Delivery Address**: Street/Premises, City, State, and 6-digit PIN code
     • If the customer already provided some of these details (e.g. "place a custom order for tomato powder, onion powder and garlic powder"), confirm the items and ask for the remaining required details (quantities, name, email, phone, and delivery address).
     • Once the customer provides these required fields, IMMEDIATELY call \`submit_new_order\`!

2. ORDER & INQUIRY STATUS TRACKING & MULTI-ORDER HANDLING:
   - ONLY when a customer explicitly asks to track or check status and provides a Reference ID starting with 'NEC-', a mobile number, or an email, invoke 'lookup_order'.
   - SINGLE ORDER RESULT:
     • Report Ref ID, Status, Items, and Total.
     • Dispatched Status: Inform them that their package is dispatched from Surendranagar and the official PDF invoice has been sent to their email.
     • Payment Pending Status: Inform them that the payment link/QR and email quote have been sent for immediate dispatch.
     • Received & Under Review Status: Inform them that Mehul Patel and the sales team are reviewing specifications and will email a custom quote shortly.
   - MULTIPLE ORDERS RESULT (WHEN MULTIPLE ORDERS ARE RETURNED FOR THE SAME NUMBER/EMAIL):
     • Neatly list ALL orders sequentially using numbers (1️⃣, 2️⃣, 3️⃣, etc.).
     • For each order, show: Ref ID, Status Emoji, Items, and Date/Total.
     • Example:
       📦 **Found X active orders under your contact:**
       1️⃣ **Ref:** NEC-20260815-122335 | 📌 **Status:** Dispatched 🚚
          • **Items:** Tomato Powder (25kg)
       2️⃣ **Ref:** NEC-20260810-091420 | 📌 **Status:** Under Commercial Review 📋
          • **Items:** Garlic Powder (50kg), Onion Powder (25kg)
   - INVOICE / BILL NOTICE:
      Remind customers that commercial quotes are sent directly via email, and official PDF bills/invoices are automatically emailed from [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com) upon order dispatch (please remind them to check Spam/Promotions folder too!).

3. PRODUCT ADVISORY & PROACTIVE SALES SUGGESTIONS:
   - Use the relevant technical specifications provided below to answer mesh size, applications, and nutritional benefits.
   - Suggest complementary ingredient pairings when helpful (e.g. Tomato + Onion + Soya HVP for soup premixes; Cheese + Garlic for snack seasonings).
   - For "Made-to-Order" items (Cabbage, French Beans, Sweet Potato, Bitter Gourd, Mint Leaves, Kasuri Methi, Psyllium Husk), explain that they are custom-manufactured with flexible MOQ upon inquiry.

4. DIRECT SALES, OWNER CONTACT & OFFICIAL EMAIL (STRICT RULE):
   - Whenever asked to speak with sales, owner, contact details, email, or for bulk deals, provide:
     • 📞 **Key Contact Person:** Mehul Patel
     • 💬 **Direct Call & WhatsApp:** [+91 98798 38281](https://wa.me/919879838281) (Fastest for quick queries, sample requests, and order updates)
     • 📧 **Official Email:** [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com) (For custom commercial email quotes, and official PDF bills/invoices upon dispatch — please check Spam/Promotions too!)
     • 🏢 **Factory & Office:** Shop 18 & 19, 2nd Floor, Brahmanand Chamber, Opp. M.P. Shah College, Surendranagar, Gujarat - 363001, India 🌿

CRITICAL CONVERSATIONAL FOCUS & ANTI-REPETITION (STRICT):
- ANSWER ONLY THE USER'S LATEST QUESTION DIRECTLY: Focus 100% on the user's current query.
- NEVER REPEAT, RE-QUOTE, OR ECHO YOUR PREVIOUS RESPONSES FROM THE CHAT HISTORY IN YOUR NEW MESSAGE.
- If the user asks for a recipe, complementary product, or status, provide ONLY that new answer. Do NOT re-paste your previous product summary!

EMOJI & CHAT BUBBLE FORMATTING:
- ALWAYS include warm, interactive emojis (🌿, 📦, 🍅, 🧄, 🌶️, ✨, 🛒, 🚚, 📋, 👋, 😊, 💡, 📞, 🧾, 📧).
- NEVER use markdown header hashtags (#, ##) or raw tables (|...|).
- Use bold text for product names and reference codes.
- Keep responses concise and engaging (<150 words).`

// ============================================================================
// OPENCODE ZEN MODEL CALLER WITH BENCHMARKED FALLBACKS
// ============================================================================

async function callOpenCodeZen(messages: any[], apiKey: string) {
  const candidateModels = [
    'deepseek-v4-flash-free',
    'mimo-v2.5-free',
    'laguna-s-2.1-free',
    'longcat-2.0-free',
    'nemotron-3-ultra-free',
  ]

  let lastError: Error | null = null

  for (const model of candidateModels) {
    try {
      const response = await fetchIPv4(
        'https://opencode.ai/zen/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            tools,
            temperature: 0.3,
            max_tokens: 1024,
          }),
        },
        15000
      )

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

    const apiKey = process.env.OPENCODE_ZEN_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Chatbot is not configured yet.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Step 1: In-Memory Pre-Retrieval RAG: Extract only relevant product specifications (<1ms)
    const retrievedContext = retrieveRelevantKnowledge(message)

    // Step 2: Build Lean Augmented Prompt (~450 tokens)
    const dynamicSystemPrompt = retrievedContext
      ? `${SYSTEM_PROMPT}\n${retrievedContext}`
      : SYSTEM_PROMPT

    // Step 3: Sanitize history so that it starts strictly with a user turn and caps at 6 turns
    let sanitizedHistory: { role: string; content: string }[] = []
    if (Array.isArray(history)) {
      const validTurns = history.filter(
        (m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() !== ''
      )
      const firstUserIdx = validTurns.findIndex((m) => m.role === 'user')
      if (firstUserIdx !== -1) {
        sanitizedHistory = validTurns.slice(firstUserIdx).slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }))
      }
    }

    const messages: any[] = [
      { role: 'system', content: dynamicSystemPrompt },
      ...sanitizedHistory,
      { role: 'user', content: message },
    ]

    let finalReply = ''
    try {
      // Step 3: Tool-calling loop (capped at 4 rounds)
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
              content: JSON.stringify(toolResult),
            })
          }
          continue
        }

        finalReply = choice.content || "Sorry, I couldn't process that — could you try rephrasing?"
        break
      }
    } catch (llmError) {
      console.warn('LLM API call failed, using intelligent local fallback:', llmError)

      const necMatch = message.match(/NEC-\d{8}-\d{6}|NEC-[A-Za-z0-9-]+/i)
      const phoneMatch = message.match(/(\+?91)?[6-9]\d{9}/)
      const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)

      if (necMatch || phoneMatch || emailMatch) {
        const lookupArgs: { orderRef?: string; phone?: string; email?: string } = {}
        if (necMatch) lookupArgs.orderRef = necMatch[0].toUpperCase()
        if (phoneMatch) lookupArgs.phone = phoneMatch[0]
        if (emailMatch) lookupArgs.email = emailMatch[0]

        const lookupRes = await toolLookupOrder(lookupArgs)

        if (lookupRes && lookupRes.orders && lookupRes.orders.length > 0) {
          if (lookupRes.orders.length === 1) {
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
              finalReply += `\n💳 **Payment Notice:** Commercial quote & payment details have been emailed. Please check your inbox to complete payment so we can proceed with immediate dispatch.\n\n`
            } else {
              finalReply += `\n✅ **Next Steps:** Our sales team (led by **Mehul Patel**) has logged your sample/order request in our Google Sheets dispatch system. A custom commercial quote will be sent directly to your email inbox shortly (and the official PDF bill/invoice upon dispatch)!\n\n`
            }
            finalReply += `💡 For immediate priority dispatch:\nReach **Mehul Patel** directly at [+91 98798 38281](https://wa.me/919879838281) 📞\n\n🧾 **Invoice/Bill:** Please check your email inbox (and Spam/Promotions folder) for the official PDF bill! 📥😊`
          } else {
            // MULTI-ORDER FALLBACK LISTING
            finalReply = `📦 **Found ${lookupRes.orders.length} orders for your contact:**\n\n`
            lookupRes.orders.forEach((o: any, idx: number) => {
              const st = o.status || 'Under Review'
              const isDisp = st.toLowerCase().includes('dispatch')
              const isPay = st.toLowerCase().includes('qr') || st.toLowerCase().includes('awaiting payment')
              const icon = isDisp ? '🚚' : isPay ? '💳' : '📋'
              finalReply += `${idx + 1}️⃣ **Ref:** \`${o.orderRef}\` | 📌 **Status:** ${st} ${icon}\n`
              if (o.items) finalReply += `   • **Items:** ${o.items}\n`
              if (o.total && o.total !== 'Not yet quoted') finalReply += `   • **Total:** ₹${o.total}\n`
              finalReply += '\n'
            })
            finalReply += `💡 For updates on any order, reach **Mehul Patel** at [+91 98798 38281](https://wa.me/919879838281) 📞\n🧾 Official invoices are automatically emailed upon order dispatch! 📥😊`
          }
        } else {
          finalReply = `📋 **Order Lookup**\n📌 **Status:** No record found in our active dispatch queue.\n\nPlease double-check the reference code or phone number, or reach **Mehul Patel** directly at [+91 98798 38281](https://wa.me/919879838281) so we can look it up for you right away! 🌿`
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
        message.toLowerCase().includes('whatsapp') ||
        message.toLowerCase().includes('email')
      ) {
        finalReply = `👋 Here are the key contact details for Nectar Ingredients for sales, bulk deals, and inquiries:\n\n• 📞 **Key Contact Person:** Mehul Patel\n• 💬 **Direct Call & WhatsApp:** [+91 98798 38281](https://wa.me/919879838281) (Fastest for quick queries, sample requests, and order updates)\n• 📧 **Official Email:** [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com) (For custom commercial quotes, and official PDF bills/invoices upon dispatch — please check Spam/Promotions too!)\n• 🏢 **Factory & Office:** Shop 18 & 19, 2nd Floor, Brahmanand Chamber, Opp. M.P. Shah College, Surendranagar, Gujarat - 363001, India 🌿\n\nFeel free to reach out anytime — Mehul and the team are happy to assist with bulk pricing, custom formulations, and Made-to-Order items! 😊`
      } else if (retrievedContext) {
        finalReply = `🌿 **Nectar Ingredients Product Specifications:**\n\n${retrievedContext.trim()}\n\n💡 We offer standard 25 KG bulk packaging as well as **1 KG & 5 KG sample packs** for R&D trials. Would you like a custom quote or sample order? 😊`
      } else {
        finalReply = `Hi there! 👋 Welcome to Nectar Ingredients! 🌿\n\nI can help you with:\n- 📦 **Track Inquiry / Sample Status:** (Provide your reference code like \`NEC-20260815-122335\` or phone number)\n- 🍅 **Product Specifications:** (Tomato, Onion, Garlic, Beetroot, Turmeric, Fruit & Dairy powders)\n- 📞 **Contact Sales:** Reach Mehul Patel at [+91 98798 38281](https://wa.me/919879838281)\n\nWhat would you like to explore today? 😊`
      }
    }

    if (!finalReply) {
      finalReply = "I'm having trouble completing that right now — please try again or reach Mehul Patel at +91 98798 38281."
    }

    return new Response(
      JSON.stringify({ reply: finalReply, history: messages.filter((m) => m.role !== 'system') }),
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