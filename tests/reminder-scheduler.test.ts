import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createReminderScheduler,
  DEFAULT_INTERVAL_MS,
  REMINDER_MESSAGE,
} from "../src/reminder-scheduler.ts";

/**
 * W1-4 tests, written before the implementation.
 *
 * A fake clock advances time; a fake timer counts scheduled/cleared handles and
 * lets us fire ticks manually; a fake notify counts deliveries. No real clock,
 * no real interval, no Pi runtime.
 *
 * Expected to FAIL until createReminderScheduler() is implemented.
 */

/** Build a Date from explicit local components. */
function local(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function harness(start: Date, intervalMs: number = DEFAULT_INTERVAL_MS) {
  let current = start;
  const notifications: string[] = [];
  let scheduled: (() => void) | null = null;
  let scheduleCount = 0;
  let clearCount = 0;
  let intervalSeen = 0;

  const scheduler = createReminderScheduler<number>(
    {
      now: () => current,
      notify: (message) => notifications.push(message),
      setInterval: (fn, ms) => {
        scheduleCount += 1;
        scheduled = fn;
        intervalSeen = ms;
        return scheduleCount;
      },
      clearInterval: () => {
        clearCount += 1;
        scheduled = null;
      },
    },
    intervalMs,
  );

  return {
    scheduler,
    notifications,
    setTime: (date: Date): void => {
      current = date;
    },
    isScheduled: (): boolean => scheduled !== null,
    fireTimer: (): void => {
      scheduled?.();
    },
    scheduleCount: (): number => scheduleCount,
    clearCount: (): number => clearCount,
    intervalSeen: (): number => intervalSeen,
  };
}

test("startup inside the window reminds immediately and schedules a timer", () => {
  const h = harness(local(2026, 1, 14, 0, 0));
  h.scheduler.start();

  assert.equal(h.notifications.length, 1);
  assert.equal(h.notifications[0], REMINDER_MESSAGE);
  assert.equal(h.isScheduled(), true);
  assert.equal(h.intervalSeen(), DEFAULT_INTERVAL_MS);
});

test("startup outside the window schedules a timer but does not remind", () => {
  const h = harness(local(2026, 1, 14, 23, 59));
  h.scheduler.start();

  assert.equal(h.notifications.length, 0);
  assert.equal(h.isScheduled(), true);
});

test("crossing midnight while idle delivers on the next tick, exactly once", () => {
  const h = harness(local(2026, 1, 14, 23, 59));
  h.scheduler.start();
  assert.equal(h.notifications.length, 0);

  h.setTime(local(2026, 1, 15, 0, 0));
  h.fireTimer();
  assert.equal(h.notifications.length, 1);

  // Repeated ticks on the same date must not duplicate.
  h.fireTimer();
  h.setTime(local(2026, 1, 15, 0, 30));
  h.fireTimer();
  assert.equal(h.notifications.length, 1);
});

test("the next local date becomes eligible again", () => {
  const h = harness(local(2026, 1, 14, 0, 0));
  h.scheduler.start();
  assert.equal(h.notifications.length, 1);

  h.setTime(local(2026, 1, 15, 0, 0));
  h.fireTimer();
  assert.equal(h.notifications.length, 2);
});

test("a missed window is skipped when time resumes after 06:00", () => {
  const h = harness(local(2026, 1, 14, 23, 59));
  h.scheduler.start();

  h.setTime(local(2026, 1, 15, 12, 0));
  h.fireTimer();
  assert.equal(h.notifications.length, 0);
});

test("preview shows the message but does not change automatic state", () => {
  const h = harness(local(2026, 1, 14, 0, 0));

  h.scheduler.preview();
  assert.equal(h.notifications.length, 1);
  assert.equal(h.notifications[0], REMINDER_MESSAGE);
  assert.equal(h.scheduler.lastRemindedDate(), null);

  // Because preview changed nothing, the automatic check still fires.
  h.scheduler.check();
  assert.equal(h.notifications.length, 2);
});

test("stop clears the timer and is idempotent", () => {
  const h = harness(local(2026, 1, 14, 23, 59));
  h.scheduler.start();
  assert.equal(h.isScheduled(), true);

  h.scheduler.stop();
  assert.equal(h.isScheduled(), false);
  assert.equal(h.clearCount(), 1);
  assert.equal(h.scheduler.isRunning(), false);

  h.scheduler.stop();
  assert.equal(h.clearCount(), 1);
});

test("start is idempotent and does not accumulate timers", () => {
  const h = harness(local(2026, 1, 14, 23, 59));
  h.scheduler.start();
  h.scheduler.start();
  h.scheduler.start();

  assert.equal(h.scheduleCount(), 1);
});
