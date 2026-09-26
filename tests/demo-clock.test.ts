import assert from "node:assert/strict";
import { test } from "node:test";

import { createNowProvider } from "../src/demo-clock.ts";

test("with no demo env, returns the real clock", () => {
  const fixed = 1_700_000_000_000;
  const now = createNowProvider({}, () => fixed);
  assert.equal(now().getTime(), fixed);
});

test("with a demo anchor, starts at the anchor and advances with real time", () => {
  let real = 1_000_000;
  const start = new Date("2026-01-14T23:59:50").getTime();
  const now = createNowProvider(
    { BEDTIME_DEMO_TIME: "2026-01-14T23:59:50" },
    () => real,
  );

  assert.equal(now().getTime(), start);

  real += 10_000; // 10 real seconds later -> simulated midnight
  assert.equal(now().getTime(), new Date("2026-01-15T00:00:00").getTime());
});

test("with an invalid demo anchor, falls back to the real clock", () => {
  const fixed = 1_700_000_000_000;
  const now = createNowProvider(
    { BEDTIME_DEMO_TIME: "not-a-date" },
    () => fixed,
  );
  assert.equal(now().getTime(), fixed);
});