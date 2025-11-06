/**
 * Next.js Instrumentation
 * Runs once when the Next.js server starts
 * Used to initialize background worker
 */

export async function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startWorker, stopWorker } = await import('./src/lib/background/worker');

    // Start the background worker
    await startWorker();

    // Graceful shutdown handlers
    const shutdown = async () => {
      console.log('📋 Graceful shutdown initiated...');
      await stopWorker();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }
}
