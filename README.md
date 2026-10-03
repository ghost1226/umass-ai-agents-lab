# UMass AI Agents Lab — Pi Extensions

Starter repository for the two-week Pi extension assignment (see the instructor's
`student-assignment.md`). It provides environment checks, generic registration
boilerplate, and a zero-dependency test runner. **Week 1 (the midnight reminder)
is implemented; week 2 (`ask_user`) is still boilerplate.**

## What you build

| Week | Extension | Entry point | Tasks |
|---|---|---|---|
| 1 | Midnight reminder | `src/reminder.ts` | W1-0 … W1-5 |
| 2 | Ask the Human (`ask_user`) | `src/ask-user.ts` | W2-0 … W2-5 |

## Layout

```
src/
  reminder.ts             # W1 Pi entry point (command + lifecycle wiring)
  reminder-policy.ts      # W1 pure time policy (shouldRemind)
  reminder-scheduler.ts   # W1 testable scheduler (clock/timer/notify injection)
  demo-clock.ts           # W1 simulated-time helper for the demo
  ask-user.ts             # W2 Pi entry point (tool registration boilerplate only)
tests/
  example.test.ts             # shows the test pattern (Node's built-in runner)
  reminder-policy.test.ts     # time-policy tests
  reminder-scheduler.test.ts  # automatic delivery + lifecycle tests
  demo-clock.test.ts          # simulated-time helper tests
scripts/
  demo-rpc.mjs            # headless live demo over Pi's RPC mode
docs/
  notes.md                # documentation notes (W1-1)
  demonstration.md        # W1-5 demonstration record and reflection
  evidence/               # captured failing/passing/demo output
```

Tests live in `tests/`, outside Pi's extension discovery.

## Setup

Requires Node 22+ (this project uses Node's native TypeScript support; tested on
Node 26), Pi `0.87.x`, `git`, `gh`, and `rg`.

```bash
npm install
npm run verify        # typecheck + tests
```

## Run the extension

```bash
# Load only the entry point (recommended during development)
pi --extension ./src/reminder.ts

# Week 2
pi --extension ./src/ask-user.ts
```

## Test and demonstrate

```bash
npm run verify   # tsc --noEmit + node --test (20 tests)

# Headless live demo over RPC (simulated time, no system-clock change):
BEDTIME_DEMO_TIME=2026-01-14T23:59:58 node scripts/demo-rpc.mjs

# Hands-on TUI:
BEDTIME_DEMO_TIME=2026-01-14T23:59:58 pi --extension ./src/reminder.ts
# then type: /bedtime-test
# exit with Ctrl+D
```

Full observed output and the reflection are in
[`docs/demonstration.md`](docs/demonstration.md).

## Acceptance criteria (W1-1)

Tracked in issue #1. This section and the issue are kept in sync. All criteria
are implemented and demonstrated (see `docs/demonstration.md`).

- [x] **Time policy.** Use the local time zone of the machine running Pi.
      Late-night hours are 00:00 (inclusive) to 06:00 (exclusive).
- [x] **Visible message.** Show something like “It is after midnight. Consider
      saving your work and getting some sleep.” The user may continue working.
- [x] **Automatic delivery.** While interactive Pi stays open and the computer
      is awake, show the reminder within one minute after midnight, with no
      further user prompt.
- [x] **Startup inside the window.** If Pi starts between 00:00 and 06:00, show
      the reminder on startup. If execution resumes after a pause during that
      window, show it on the next check.
- [x] **No duplicates.** At most one automatic reminder per local calendar date
      within the current extension session. Repeated prompts and timer checks
      must not produce duplicates.
- [x] **Fresh session may remind again.** A new session or extension reload may
      remind again. Persistence across restarts is optional. Separate Pi
      processes keep separate state.
- [x] **Manual preview.** `/bedtime-test` previews the message without changing
      the automatic reminder state.
- [x] **Clean lifecycle.** Stop the timer on session shutdown. Reloading must not
      accumulate active timers or reuse an old session context.
- [x] **No side effects.** No extra model calls, no tool blocking, no terminating
      Pi. Skip both notification and timer creation in non-interactive operation.

## The one idea that matters

An idle model does not wake itself. Prompting alone cannot deliver a reminder at
midnight — the extension needs runtime code that reads the clock on a timer. The
reminder itself makes **no model call**.

## Environment check (W1-0)

Run `npm run verify`. It typechecks and runs the full suite. See `docs/notes.md`
for the documentation pointers gathered for W1-1.