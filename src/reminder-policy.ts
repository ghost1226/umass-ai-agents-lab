/**
 * Time policy for the midnight reminder (W1-2 / W1-3).
 *
 * Keep this module pure: it receives a supplied local date/time and the date
 * already reminded, then decides whether to notify. No Pi imports, no timers,
 * no I/O — that separation is what makes it testable with simulated time.
 *
 * Rules (see the assignment handout):
 *   - Use the machine's local time zone.
 *   - Late night is [00:00, 06:00): midnight inclusive, 06:00 exclusive.
 *   - At most one automatic reminder per local calendar date per session.
 */

/** Result of a policy decision. */
export interface ReminderDecision {
  /** True when the reminder should be shown now. */
  remind: boolean;
  /** Local calendar date to record when `remind` is true, as YYYY-MM-DD. */
  date: string;
}

/**
 * TODO(W1-3): implement the smallest passing policy.
 *
 * @param now Local date/time to evaluate (derive fields locally, not from a UTC
 *   ISO string).
 * @param lastRemindedDate Local calendar date (YYYY-MM-DD) already reminded in
 *   this session, or null when nothing has been shown.
 */
export function shouldRemind(
  _now: Date,
  _lastRemindedDate: string | null,
): ReminderDecision {
  throw new Error("TODO(W1-3): implement shouldRemind");
}