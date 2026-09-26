/**
 * Demonstration clock (W1-5).
 *
 * Normal operation uses the real clock. For the required simulated-time demo,
 * set `BEDTIME_DEMO_TIME` to a local date-time string, e.g.
 * `BEDTIME_DEMO_TIME=2026-01-14T23:59:50`. The clock then starts at that
 * instant and advances with real time, so midnight arrives within seconds
 * instead of at the real 00:00. No system clock is changed.
 *
 * This is demo tooling, not reminder policy: with no (or an invalid) env var it
 * returns the real time unchanged.
 */

export function createNowProvider(
  env: NodeJS.ProcessEnv = process.env,
  realNow: () => number = Date.now,
): () => Date {
  const raw = env.BEDTIME_DEMO_TIME;
  if (!raw) return () => new Date(realNow());

  const anchor = new Date(raw);
  if (Number.isNaN(anchor.getTime())) return () => new Date(realNow());

  const startedAt = realNow();
  return () => new Date(anchor.getTime() + (realNow() - startedAt));
}