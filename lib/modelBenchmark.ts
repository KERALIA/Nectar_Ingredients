// lib/modelBenchmark.ts
// Automated Free-Model Competition, Hourly Benchmarking & Daily Lowest-Latency Appointment Engine

import fs from 'fs'
import path from 'path'
import os from 'os'
import https from 'https'
import http from 'http'

export interface ModelBenchmarkResult {
  model: string
  latencyMs: number
  statusCode: number
  success: boolean
  error?: string
  timestamp: string
}

export interface ModelStats {
  model: string
  totalTests: number
  successCount: number
  successRate: number // 0 - 100%
  avgLatencyMs: number
  minLatencyMs: number
  maxLatencyMs: number
  lastTested: string
}

export interface ActiveModelConfig {
  appointedModel: string
  fallbackModels: string[]
  appointedAt: string
  nextAppointmentExpected: string
  leaderboard24h: ModelStats[]
  discoveredFreeModels: string[]
}

const DEFAULT_FREE_MODELS = [
  'ling-3.0-flash-fin-free',
  'mimo-v2.5-free',
  'nemotron-3.5-lightning-free',
  'nemotron-3-ultra-free',
  'deepseek-v4-flash-free',
  'muse-spark-1.3-contributor-free',
  'muse-spark-1.2-contributor-free',
]

const DATA_DIR = path.join(process.cwd(), 'data')
const BUNDLED_BENCHMARK_LOG_FILE = path.join(DATA_DIR, 'model_benchmarks.json')
const BUNDLED_ACTIVE_MODEL_FILE = path.join(DATA_DIR, 'active_model.json')

// Vercel serverless writable directory
const TMP_DATA_DIR = path.join(os.tmpdir(), 'nectar_benchmark_data')

let inMemoryActiveConfig: ActiveModelConfig | null = null
let inMemoryHistory: ModelBenchmarkResult[] | null = null

function getActiveModelFilePath(): string {
  const tmpFile = path.join(TMP_DATA_DIR, 'active_model.json')
  if (fs.existsSync(tmpFile)) return tmpFile
  return BUNDLED_ACTIVE_MODEL_FILE
}

function getBenchmarkLogFilePath(): string {
  const tmpFile = path.join(TMP_DATA_DIR, 'model_benchmarks.json')
  if (fs.existsSync(tmpFile)) return tmpFile
  return BUNDLED_BENCHMARK_LOG_FILE
}

function safeWriteJson(filename: 'active_model.json' | 'model_benchmarks.json', data: any) {
  const content = JSON.stringify(data, null, 2)
  // 1. Try local data dir (local dev or persistent container)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    const target = path.join(DATA_DIR, filename)
    fs.writeFileSync(target, content, 'utf-8')
    return
  } catch {
    // Read-only filesystem (Vercel Serverless / AWS Lambda)
  }

  // 2. Fallback to /tmp on serverless environments
  try {
    if (!fs.existsSync(TMP_DATA_DIR)) {
      fs.mkdirSync(TMP_DATA_DIR, { recursive: true })
    }
    const target = path.join(TMP_DATA_DIR, filename)
    fs.writeFileSync(target, content, 'utf-8')
  } catch (err) {
    console.warn(`[STORAGE WARNING] Could not persist ${filename} to disk:`, err)
  }
}

function loadBenchmarkLogs(): ModelBenchmarkResult[] {
  if (inMemoryHistory && inMemoryHistory.length > 0) {
    return inMemoryHistory
  }
  const file = getBenchmarkLogFilePath()
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
      if (Array.isArray(data)) {
        inMemoryHistory = data
        return data
      }
    }
  } catch (e) {
    console.warn('Could not read benchmark log file:', e)
  }
  return []
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
  timeoutMs = 15000
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
      safeReject(new Error(`IPv4 timeout after ${timeoutMs}ms`))
    })

    if (bodyData) {
      req.write(bodyData)
    }
    req.end()
  })
}

/**
 * Discovers all free models available on OpenCode Zen live.
 */
export async function discoverFreeModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetchIPv4(
      'https://opencode.ai/zen/v1/models',
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      },
      10000
    )

    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.data)) {
        const freeModels = data.data
          .map((m: any) => m.id as string)
          .filter((id: string) => typeof id === 'string' && id.toLowerCase().includes('free'))

        if (freeModels.length > 0) {
          return Array.from(new Set([...freeModels, ...DEFAULT_FREE_MODELS]))
        }
      }
    }
  } catch (err) {
    console.warn('Failed to dynamically discover models from OpenCode Zen, using defaults:', err)
  }

  return DEFAULT_FREE_MODELS
}

/**
 * Runs a standardized benchmark test against a single model.
 */
export async function benchmarkModel(model: string, apiKey: string): Promise<ModelBenchmarkResult> {
  const timestamp = new Date().toISOString()
  const t0 = Date.now()

  try {
    const response = await fetchIPv4(
      'https://opencode.ai/zen/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'x-session-id': `nectar-bench-${Date.now()}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Say hello in 5 words' }],
          max_tokens: 150,
          temperature: 0.3,
        }),
      },
      25000
    )

    const latencyMs = Date.now() - t0

    if (response.ok) {
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      // A successful completion must contain text or valid assistant response
      const hasContent = typeof content === 'string' && content.trim().length > 0
      return {
        model,
        latencyMs,
        statusCode: response.status,
        success: hasContent,
        error: hasContent ? undefined : 'Empty content returned',
        timestamp,
      }
    }

    const errText = await response.text()
    return {
      model,
      latencyMs,
      statusCode: response.status,
      success: false,
      error: `HTTP ${response.status}: ${errText.slice(0, 120)}`,
      timestamp,
    }
  } catch (err: any) {
    const latencyMs = Date.now() - t0
    return {
      model,
      latencyMs,
      statusCode: 0,
      success: false,
      error: err.message || 'Request failed or timed out',
      timestamp,
    }
  }
}

/**
 * Runs the hourly benchmark cycle: tests all discovered models and logs results.
 */
export async function runHourlyBenchmark(apiKey: string): Promise<{
  timestamp: string
  testedModels: number
  results: ModelBenchmarkResult[]
}> {
  const models = await discoverFreeModels(apiKey)
  const results: ModelBenchmarkResult[] = []

  for (const model of models) {
    const res = await benchmarkModel(model, apiKey)
    results.push(res)
    // Small pause between model requests to respect rate limits
    await new Promise((r) => setTimeout(r, 400))
  }

  // Load existing log
  let history = loadBenchmarkLogs()

  // Append new results
  history.push(...results)

  // Retain only records from the last 48 hours to keep log performant
  const cutoffTime = Date.now() - 48 * 60 * 60 * 1000
  history = history.filter((item) => new Date(item.timestamp).getTime() >= cutoffTime)

  inMemoryHistory = history
  safeWriteJson('model_benchmarks.json', history)

  return {
    timestamp: new Date().toISOString(),
    testedModels: models.length,
    results,
  }
}

/**
 * Calculates 24-hour statistics from the benchmark logs for each model.
 */
export function calculate24hStats(): ModelStats[] {
  const history = loadBenchmarkLogs()
  if (history.length === 0) return []

  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const recentHistory = history.filter((item) => new Date(item.timestamp).getTime() >= cutoff)

  const grouped = new Map<string, ModelBenchmarkResult[]>()
  for (const item of recentHistory) {
    const list = grouped.get(item.model) || []
    list.push(item)
    grouped.set(item.model, list)
  }

  const statsList: ModelStats[] = []

  for (const [model, tests] of grouped.entries()) {
    const totalTests = tests.length
    const successfulTests = tests.filter((t) => t.success)
    const successCount = successfulTests.length
    const successRate = totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0

    let avgLatencyMs = 99999
    let minLatencyMs = 99999
    let maxLatencyMs = 99999

    if (successfulTests.length > 0) {
      const latencies = successfulTests.map((t) => t.latencyMs)
      avgLatencyMs = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      minLatencyMs = Math.min(...latencies)
      maxLatencyMs = Math.max(...latencies)
    }

    const lastTested = tests[tests.length - 1]?.timestamp || new Date().toISOString()

    statsList.push({
      model,
      totalTests,
      successCount,
      successRate,
      avgLatencyMs,
      minLatencyMs,
      maxLatencyMs,
      lastTested,
    })
  }

  // Sort by reliability (>=60% success rate) then lowest average latency
  statsList.sort((a, b) => {
    const aReliable = a.successRate >= 60
    const bReliable = b.successRate >= 60
    if (aReliable && !bReliable) return -1
    if (!aReliable && bReliable) return 1
    if (aReliable && bReliable) return a.avgLatencyMs - b.avgLatencyMs
    return b.successRate - a.successRate
  })

  return statsList
}

/**
 * Runs the daily appointment cycle:
 * Analyzes the past 24 hours of hourly reports, appoints the model with the lowest
 * average latency (with >= 60% reliability), and writes active_model.json.
 */
export async function runDailyAppointment(apiKey: string): Promise<ActiveModelConfig> {
  const discoveredModels = await discoverFreeModels(apiKey)
  const leaderboard = calculate24hStats()

  // Find the champion: lowest average latency among models with >=60% success
  const reliableCandidates = leaderboard.filter((s) => s.successRate >= 60 && s.avgLatencyMs < 99999)

  let appointedModel = 'ling-3.0-flash-fin-free'
  let fallbackModels: string[] = ['mimo-v2.5-free', 'nemotron-3.5-lightning-free']

  if (reliableCandidates.length > 0) {
    appointedModel = reliableCandidates[0].model
    fallbackModels = reliableCandidates.slice(1).map((s) => s.model)

    // Add any remaining discovered models to fallbacks
    for (const m of discoveredModels) {
      if (m !== appointedModel && !fallbackModels.includes(m)) {
        fallbackModels.push(m)
      }
    }
  }

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const activeConfig: ActiveModelConfig = {
    appointedModel,
    fallbackModels,
    appointedAt: now.toISOString(),
    nextAppointmentExpected: tomorrow.toISOString(),
    leaderboard24h: leaderboard,
    discoveredFreeModels: discoveredModels,
  }

  inMemoryActiveConfig = activeConfig
  safeWriteJson('active_model.json', activeConfig)
  console.log(`[MODEL APPOINTMENT] Appointed champion for today: ${appointedModel} (Fallbacks: ${fallbackModels.slice(0, 3).join(', ')})`)

  return activeConfig
}

/**
 * Returns the active model queue for the chatbot to use.
 * Primary attempt: Appointed champion.
 * Fallbacks: Runner-up models in ranked order.
 */
export function getActiveModelQueue(): string[] {
  if (inMemoryActiveConfig?.appointedModel) {
    return [inMemoryActiveConfig.appointedModel, ...(inMemoryActiveConfig.fallbackModels || [])]
  }

  try {
    const file = getActiveModelFilePath()
    if (fs.existsSync(file)) {
      const config: ActiveModelConfig = JSON.parse(fs.readFileSync(file, 'utf-8'))
      if (config.appointedModel) {
        inMemoryActiveConfig = config
        return [config.appointedModel, ...(config.fallbackModels || [])]
      }
    }
  } catch (e) {
    // Graceful fallback
  }

  return ['ling-3.0-flash-fin-free', 'mimo-v2.5-free', 'nemotron-3.5-lightning-free']
}

/**
 * Returns current status of models, benchmark history, and active appointment.
 */
export function getBenchmarkStatus() {
  let activeConfig: ActiveModelConfig | null = inMemoryActiveConfig
  if (!activeConfig) {
    try {
      const file = getActiveModelFilePath()
      if (fs.existsSync(file)) {
        activeConfig = JSON.parse(fs.readFileSync(file, 'utf-8'))
        inMemoryActiveConfig = activeConfig
      }
    } catch {}
  }

  const stats = calculate24hStats()
  const history = loadBenchmarkLogs()
  return {
    activeModel: activeConfig?.appointedModel || 'ling-3.0-flash-fin-free',
    fallbackModels: activeConfig?.fallbackModels || ['mimo-v2.5-free', 'nemotron-3.5-lightning-free'],
    appointedAt: activeConfig?.appointedAt || 'Default setting',
    nextAppointmentExpected: activeConfig?.nextAppointmentExpected || 'Pending 24h cycle',
    leaderboard24h: stats,
    totalLoggedBenchmarks: history.length,
  }
}
