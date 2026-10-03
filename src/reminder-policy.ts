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
 * Format a Date as the local calendar date, YYYY-MM-DD.
 *
 * Derived from local fields (getFullYear/getMonth/getDate) rather than a UTC
 * ISO string, so the result is correct across time zones and near midnight.
 */
function localDateString(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Decide whether to show the automatic midnight reminder.
 *
 * Late night is [00:00, 06:00) local: midnight is included, 06:00 excluded.
 * A reminder is shown at most once per local calendar date; `lastRemindedDate`
 * carries the date already shown in this session, or null.
 *
 * @param now Local date/time to evaluate.
 * @param lastRemindedDate Local calendar date (YYYY-MM-DD) already reminded in
 *   this session, or null when nothing has been shown.
 */
export function shouldRemind(
  now: Date,
  lastRemindedDate: string | null,
): ReminderDecision {
  const date = localDateString(now);
  const hour = now.getHours();
  const inLateNightWindow = hour >= 0 && hour < 6;
  const remind = inLateNightWindow && lastRemindedDate !== date;
  return { remind, date };
}
