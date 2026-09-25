import { test } from "node:test";

/**
 * W1-2: replace each `test.todo` with a real test that FAILS first, then make
 * it pass in W1-3 by implementing `shouldRemind()` in src/reminder-policy.ts.
 *
 * Rules: local time zone; late night is [00:00, 06:00); at most one automatic
 * reminder per local calendar date per session.
 *
 * Use explicit local date components in fixtures, e.g.
 *   new Date(2026, 0, 14, 0, 0, 0)  // 2026-01-14 00:00 local
 */

test.todo("23:59, no prior reminder -> no reminder");
test.todo("00:00, no reminder for this date -> remind");
test.todo("00:01, already reminded today -> no duplicate");
test.todo("05:59, no reminder today -> remind");
test.todo("06:00 or noon -> no reminder");
test.todo("midnight on the next date -> remind again");