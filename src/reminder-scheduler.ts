/**
 * Scheduler for the midnight reminder (W1-4).
 *
 * Keeps Pi out of the decision logic so it can be tested with a supplied clock,
 * a controllable timer, and a fake notification function. The entry point in
 * `src/reminder.ts` wires the real `Date`, `setInterval`, and `ctx.ui.notify`.
 */

import { shouldRemind } from "./reminder-policy.ts";

/** The message shown to the user. */
export const REMINDER_MESSAGE =
  "It is after midnight. Consider saving your work and getting some sleep.";

/** How often the automatic check runs, in milliseconds. */
export const DEFAULT_INTERVAL_MS = 30_000;

/** Injected dependencies, so tests can supply fakes. */
export interface ReminderSchedulerDeps<TTimer = ReturnType<typeof setInterval>> {
  /** Read the current local time. Called on every check. */
  now: () => Date;
  /** Deliver a visible reminder. */
  notify: (message: string) => void;
  /** Schedule a repeating callback; returns a handle. */
  setInterval: (fn: () => void, ms: number) => TTimer;
  /** Cancel a handle created by `setInterval`. */
  clearInterval: (handle: TTimer) => void;
}

export interface ReminderScheduler {
  /** Immediate check, then start the periodic timer. Idempotent. */
  start(): void;
  /** Stop the periodic timer. Idempotent. */
  stop(): void;
  /** Run the policy once against the current time. */
  check(): void;
  /** Show the message without changing automatic reminder state. */
  preview(): void;
  /** Local date already reminded by this scheduler, or null. */
  lastRemindedDate(): string | null;
  /** Whether a timer is currently scheduled. */
  isRunning(): boolean;
}

/**
 * Create a session-scoped reminder scheduler.
 *
 * `check()` reads the current time, asks the policy, and — when the policy says
 * to remind — records the date and notifies **in the same synchronous step**,
 * so a repeated or delayed tick can never produce a duplicate. Nothing here
 * touches Pi: callers inject the clock, the timer, and the notification.
 */
export function createReminderScheduler<
  TTimer = ReturnType<typeof setInterval>,
>(
  deps: ReminderSchedulerDeps<TTimer>,
  intervalMs: number = DEFAULT_INTERVAL_MS,
): ReminderScheduler {
  let lastReminded: string | null = null;
  let timerHandle: TTimer | null = null;

  const check = (): void => {
    // Read the real time on every check: a delayed callback must not assume the
    // computer stayed awake, and the date must be recomputed each time.
    const decision = shouldRemind(deps.now(), lastReminded);
    if (!decision.remind) return;

    // Update state before notifying, synchronously, to prevent duplicates.
    lastReminded = decision.date;
    deps.notify(REMINDER_MESSAGE);
  };

  const start = (): void => {
    // One immediate check on startup (inside the window -> remind now).
    check();
    if (timerHandle !== null) return;
    timerHandle = deps.setInterval(check, intervalMs);
  };

  const stop = (): void => {
    if (timerHandle === null) return;
    deps.clearInterval(timerHandle);
    timerHandle = null;
  };

  const preview = (): void => {
    // Manual preview: show the message, but never change automatic state.
    deps.notify(REMINDER_MESSAGE);
  };

  return {
    start,
    stop,
    check,
    preview,
    lastRemindedDate: () => lastReminded,
    isRunning: () => timerHandle !== null,
  };
}
