import assert from "node:assert/strict";
import { test } from "node:test";

/**
 * Example only — shows the shape of the tests you will write in W1-2:
 * a pure function, explicit inputs, no real clock. Replace or extend it.
 */

test("example: a pure function is easy to test", () => {
  const greet = (name: string): string => `hello, ${name}`;
  assert.equal(greet("world"), "hello, world");
});

test("example: a fake clock is just a Date we construct", () => {
  // Local date components (year, monthIndex, day, hour, minute).
  const now = new Date(2026, 0, 14, 0, 1, 0); // 2026-01-14 00:01 local
  assert.equal(now.getHours(), 0);
  assert.equal(now.getMinutes(), 1);
});