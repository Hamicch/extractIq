/**
 * Next.js Instrumentation
 * Runs once when the Next.js server starts
 * Used to initialize background worker
 */

export async function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
      // Validate JWT_SECRET at startup (importing authConfig triggers validation)
      // This will throw if JWT_SECRET is missing or invalid, preventing startup
      const { authConfig } = await import('@extractiq/infrastructure');
      if (!authConfig.jwt.secret) {
          throw new Error('JWT_SECRET validation failed at startup');
      }

    const { startWorker, stopWorker } = await import('./src/lib/background/worker');

    await startWorker();

    const shutdown = async () => {
      console.log('📋 Graceful shutdown initiated...');
      await stopWorker();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }
}
