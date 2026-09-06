// instrumentation.ts
// Next.js server initialization lifecycle

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initModelBenchmarkCronDaemon } = await import('@/lib/cronDaemon')
    initModelBenchmarkCronDaemon()
  }
}
