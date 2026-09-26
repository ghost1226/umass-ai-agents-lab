import assert from "node:assert/strict";
import { test } from "node:test";

import { shouldRemind } from "../src/reminder-policy.ts";

/**
 * W1-2: policy tests written before the implementation.
 *
 * These are pure tests: no Pi runtime, no timers, no real clock. Fixtures use
 * explicit local date components so they do not depend on the machine's time
 * zone. `lastRemindedDate` is the local calendar date already reminded in this
 * session, as YYYY-MM-DD, or null.
 *
 * Expected to FAIL until shouldRemind() is implemented in W1-3.
 */

/** Build a Date from explicit local components (month is 0-based). */
function local(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

test("23:59, no prior reminder -> no reminder", () => {
  const decision = shouldRemind(local(2026, 1, 14, 23, 59), null);
  assert.equal(decision.remind, false);
});

test("00:00, no reminder for this date -> remind", () => {
  const decision = shouldRemind(local(2026, 1, 14, 0, 0), null);
  assert.equal(decision.remind, true);
  assert.equal(decision.date, "2026-01-14");
});

test("00:01, already reminded today -> no duplicate", () => {
  const decision = shouldRemind(local(2026, 1, 14, 0, 1), "2026-01-14");
  assert.equal(decision.remind, false);
});

test("05:59, no reminder today -> remind", () => {
  const decision = shouldRemind(local(2026, 1, 14, 5, 59), null);
  assert.equal(decision.remind, true);
  assert.equal(decision.date, "2026-01-14");
});

test("06:00 -> no reminder", () => {
  const decision = shouldRemind(local(2026, 1, 14, 6, 0), null);
  assert.equal(decision.remind, false);
});

test("noon -> no reminder", () => {
  const decision = shouldRemind(local(2026, 1, 14, 12, 0), null);
  assert.equal(decision.remind, false);
});

test("midnight on the next date -> remind again", () => {
  const decision = shouldRemind(local(2026, 1, 15, 0, 0), "2026-01-14");
  assert.equal(decision.remind, true);
  assert.equal(decision.date, "2026-01-15");
});
