// app/api/cron/benchmark/route.ts
// Automated Cron API for Free Model Discovery, Hourly Benchmarking & Daily Lowest-Latency Appointment

import { NextRequest, NextResponse } from 'next/server'
import {
  discoverFreeModels,
  benchmarkModel,
  runHourlyBenchmark,
  runDailyAppointment,
  getBenchmarkStatus,
} from '@/lib/modelBenchmark'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return handleCronAction(req)
}

export async function POST(req: NextRequest) {
  return handleCronAction(req)
}

async function handleCronAction(req: NextRequest) {
  const url = new URL(req.url)
  const action = url.searchParams.get('action') || 'status'
  const apiKey = process.env.OPENCODE_ZEN_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENCODE_ZEN_API_KEY is not configured in environment.' },
      { status: 500 }
    )
  }

  try {
    // Action 1: Status & Leaderboard
    if (action === 'status') {
      const status = getBenchmarkStatus()
      return NextResponse.json({
        status: 'success',
        ...status,
      })
    }

    // Action 2: Run Live Immediate Test Across All Discovered Free Models
    if (action === 'test') {
      const discovered = await discoverFreeModels(apiKey)
      const results = []
      for (const m of discovered) {
        const res = await benchmarkModel(m, apiKey)
        results.push(res)
        await new Promise((r) => setTimeout(r, 400))
      }

      // Sort by successful response latency
      results.sort((a, b) => {
        if (a.success && !b.success) return -1
        if (!a.success && b.success) return 1
        if (a.success && b.success) return a.latencyMs - b.latencyMs
        return 0
      })

      return NextResponse.json({
        status: 'success',
        action: 'live_test',
        testedAt: new Date().toISOString(),
        totalModels: discovered.length,
        results,
      })
    }

    // Action 3: Hourly Benchmark Run (Called by hourly cron)
    if (action === 'hourly') {
      const hourlyReport = await runHourlyBenchmark(apiKey)
      return NextResponse.json({
        status: 'success',
        action: 'hourly_benchmark',
        ...hourlyReport,
      })
    }

    // Action 4: Daily Appointment Run (Called once every 24h)
    if (action === 'daily') {
      const dailyConfig = await runDailyAppointment(apiKey)
      return NextResponse.json({
        status: 'success',
        action: 'daily_appointment',
        appointedModel: dailyConfig.appointedModel,
        fallbackModels: dailyConfig.fallbackModels,
        appointedAt: dailyConfig.appointedAt,
        nextAppointmentExpected: dailyConfig.nextAppointmentExpected,
        leaderboard24h: dailyConfig.leaderboard24h,
      })
    }

    return NextResponse.json(
      { error: `Unknown action "${action}". Supported actions: status, test, hourly, daily.` },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('[CRON BENCHMARK ERROR]:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to execute cron benchmark action.' },
      { status: 500 }
    )
  }
}
