// lib/cronDaemon.ts
// In-Process Scheduler: Automates Hourly Free Model Testing & Daily Lowest-Latency Appointment

import { runHourlyBenchmark, runDailyAppointment } from './modelBenchmark'

declare global {
  // eslint-disable-next-line no-var
  var __nectarModelCronStarted: boolean | undefined
}

const ONE_HOUR_MS = 60 * 60 * 1000
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

export function initModelBenchmarkCronDaemon() {
  if (global.__nectarModelCronStarted) {
    return
  }

  const apiKey = process.env.OPENCODE_ZEN_API_KEY
  if (!apiKey) {
    console.warn('[CRON DAEMON] OPENCODE_ZEN_API_KEY not found. Skipping auto-cron scheduler.')
    return
  }

  global.__nectarModelCronStarted = true
  console.log('🤖 [CRON DAEMON] Model benchmark daemon initialized (Hourly benchmarks + Daily Lowest-Latency appointments).')

  // Run initial test & appointment in background after server startup (delay 10 seconds so boot finishes)
  setTimeout(async () => {
    try {
      console.log('⚡ [CRON DAEMON] Running startup free-model benchmark...')
      await runHourlyBenchmark(apiKey)
      await runDailyAppointment(apiKey)
    } catch (err) {
      console.warn('[CRON DAEMON] Initial startup run error:', err)
    }
  }, 10000)

  // Hourly Benchmark Interval (runs every 60 minutes)
  setInterval(async () => {
    try {
      console.log('⏱️ [CRON DAEMON] Running scheduled hourly free-model benchmark...')
      await runHourlyBenchmark(apiKey)
    } catch (err) {
      console.error('[CRON DAEMON] Hourly benchmark run error:', err)
    }
  }, ONE_HOUR_MS)

  // Daily Appointment Interval (runs every 24 hours)
  setInterval(async () => {
    try {
      console.log('🏆 [CRON DAEMON] Running scheduled daily appointment of lowest-latency free model...')
      await runDailyAppointment(apiKey)
    } catch (err) {
      console.error('[CRON DAEMON] Daily appointment run error:', err)
    }
  }, TWENTY_FOUR_HOURS_MS)
}
