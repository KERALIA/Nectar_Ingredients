// lib/groqPool.ts
// Enterprise Multi-Account Groq Pool with Atomic Round-Robin, 429 Cooldown & Instant Failover

import https from 'https'
import http from 'http'

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content?: string
  tool_calls?: any[]
  tool_call_id?: string
  name?: string
}

export interface GroqTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, any>
  }
}

export interface GroqCompletionResponse {
  content: string
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: {
      name: string
      arguments: string
    }
  }>
  modelUsed: string
  keyUsedIndex: number
}

// In-memory state for round-robin rotation and rate-limit cooldown
let roundRobinIndex = 0
const keyCooldowns = new Map<string, number>() // key -> cooldown until epoch ms

/**
 * Extracts and cleans all configured Groq API keys from environment variables.
 * Supports comma-separated GROQ_API_KEYS, or GROQ_API_KEY_1, GROQ_API_KEY_2, etc.,
 * or a single GROQ_API_KEY.
 */
export function getGroqKeys(): string[] {
  const keys: string[] = []

  // 1. Check comma-separated list
  const combined = process.env.GROQ_API_KEYS
  if (combined) {
    const split = combined.split(',').map((k) => k.trim()).filter((k) => k.startsWith('gsk_') || k.length > 10)
    keys.push(...split)
  }

  // 2. Check numbered keys: GROQ_API_KEY_1 ... GROQ_API_KEY_10
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`]?.trim()
    if (k && !keys.includes(k)) {
      keys.push(k)
    }
  }

  // 3. Check single GROQ_API_KEY
  const single = process.env.GROQ_API_KEY?.trim()
  if (single && !keys.includes(single)) {
    keys.push(single)
  }

  return keys
}

/**
 * Low-level HTTP requester with IPv4 preference and redirect handling.
 */
function fetchIPv4(
  urlStr: string,
  options: { method?: string; headers?: Record<string, string>; body?: string } = {},
  timeoutMs = 15000
): Promise<{ ok: boolean; status: number; text: () => Promise<string>; json: () => Promise<any> }> {
  return new Promise((resolve, reject) => {
    let isSettled = false
    const safeResolve = (val: any) => { if (!isSettled) { isSettled = true; resolve(val) } }
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
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume()
          const redirectUrl = new URL(res.headers.location, urlStr).toString()
          fetchIPv4(redirectUrl, options, timeoutMs).then(safeResolve).catch(safeReject)
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
            text: async () => rawData,
            json: async () => {
              try {
                return JSON.parse(rawData)
              } catch {
                throw new Error(`Failed to parse Groq JSON: ${rawData.slice(0, 150)}`)
              }
            },
          })
        })
        res.on('error', safeReject)
      }
    )

    req.on('error', safeReject)
    req.on('timeout', () => {
      req.destroy()
      safeReject(new Error(`Groq request timeout after ${timeoutMs}ms`))
    })

    if (bodyData) {
      req.write(bodyData)
    }
    req.end()
  })
}

/**
 * Dispatches a completion request across the multi-account Groq pool.
 * Implements round-robin rotation, 429 rate-limit backoff, and model fallback.
 */
export async function callGroqWithFailover(
  messages: GroqMessage[],
  tools: GroqTool[] = [],
  options: {
    preferredModel?: string
    fallbackModel?: string
    temperature?: number
    maxTokens?: number
  } = {}
): Promise<GroqCompletionResponse> {
  const keys = getGroqKeys()

  if (keys.length === 0) {
    throw new Error('No Groq API keys configured. Set GROQ_API_KEYS in .env.local.')
  }

  const primaryModel = options.preferredModel || 'qwen/qwen3.8-27b'
  const fallbackModel = options.fallbackModel || 'openai/gpt-oss-120b'
  const temperature = options.temperature ?? 0.3
  const maxTokens = options.maxTokens ?? 1000

  // Filter keys currently not in cooldown
  const now = Date.now()
  const availableIndices = keys
    .map((k, i) => ({ key: k, index: i }))
    .filter(({ key }) => {
      const cooldownUntil = keyCooldowns.get(key)
      return !cooldownUntil || cooldownUntil <= now
    })

  // If all keys are in cooldown, reset cooldowns to avoid deadlock
  const activePool = availableIndices.length > 0 ? availableIndices : keys.map((k, i) => ({ key: k, index: i }))

  // Pick starting index according to round-robin
  const startOffset = roundRobinIndex % activePool.length
  roundRobinIndex = (roundRobinIndex + 1) % 1000000

  const orderedTargets: Array<{ key: string; index: number; model: string }> = []

  // Add primary model attempts across all keys in round-robin order
  for (let step = 0; step < activePool.length; step++) {
    const target = activePool[(startOffset + step) % activePool.length]
    orderedTargets.push({ ...target, model: primaryModel })
  }

  // Add fallback model attempts if primary fails across all accounts
  if (primaryModel !== fallbackModel) {
    for (let step = 0; step < activePool.length; step++) {
      const target = activePool[(startOffset + step) % activePool.length]
      orderedTargets.push({ ...target, model: fallbackModel })
    }
  }

  let lastError: Error | null = null

  for (const { key, index, model } of orderedTargets) {
    try {
      const payload: Record<string, any> = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }

      if (tools && tools.length > 0) {
        payload.tools = tools
        payload.tool_choice = 'auto'
      }

      const response = await fetchIPv4(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        12000
      )

      if (response.ok) {
        const json = await response.json()
        const choice = json.choices?.[0]?.message
        if (choice) {
          // Clear any historical cooldown on success
          keyCooldowns.delete(key)

          return {
            content: choice.content || '',
            tool_calls: choice.tool_calls || undefined,
            modelUsed: model,
            keyUsedIndex: index,
          }
        }
      }

      const status = response.status
      const errorBody = await response.text()

      // Handle Rate Limit (HTTP 429) -> apply 60s cooldown to this key
      if (status === 429) {
        console.warn(`[GROQ POOL] Key #${index + 1} hit rate limit (429). Placing on 60s cooldown and failing over...`)
        keyCooldowns.set(key, Date.now() + 60_000)
      } else {
        console.warn(`[GROQ POOL] Key #${index + 1} (${model}) returned HTTP ${status}: ${errorBody.slice(0, 100)}`)
      }

      lastError = new Error(`Groq HTTP ${status} (${model}): ${errorBody.slice(0, 150)}`)
    } catch (err: any) {
      console.warn(`[GROQ POOL] Key #${index + 1} (${model}) failed with network error:`, err.message)
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError || new Error('All Groq keys and fallback models exhausted.')
}
