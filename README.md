# UMass AI Agents Lab — Pi Extensions

Starter repository for the two-week Pi extension assignment (see the instructor's
`student-assignment.md`). It provides environment checks, generic registration
boilerplate, a zero-dependency test runner, and empty modules. **It contains no
reminder or `ask_user` behavior.**

## What you build

| Week | Extension | Entry point | Tasks |
|---|---|---|---|
| 1 | Midnight reminder | `src/reminder.ts` | W1-0 … W1-5 |
| 2 | Ask the Human (`ask_user`) | `src/ask-user.ts` | W2-0 … W2-5 |

## Layout

```
src/
  reminder.ts          # W1 Pi entry point (command + lifecycle boilerplate only)
  reminder-policy.ts   # W1 empty policy module — you implement this
  ask-user.ts          # W2 Pi entry point (tool registration boilerplate only)
tests/
  example.test.ts      # shows the test pattern (Node's built-in test runner)
  reminder-policy.test.ts  # placeholder you replace with failing tests (W1-2)
docs/
  notes.md             # documentation notes (W1-1)
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

## Acceptance criteria (W1-1)

Tracked in issue #1. This section and the issue are kept in sync.

- [ ] **Time policy.** Use the local time zone of the machine running Pi.
      Late-night hours are 00:00 (inclusive) to 06:00 (exclusive).
- [ ] **Visible message.** Show something like “It is after midnight. Consider
      saving your work and getting some sleep.” The user may continue working.
- [ ] **Automatic delivery.** While interactive Pi stays open and the computer
      is awake, show the reminder within one minute after midnight, with no
      further user prompt.
- [ ] **Startup inside the window.** If Pi starts between 00:00 and 06:00, show
      the reminder on startup. If execution resumes after a pause during that
      window, show it on the next check.
- [ ] **No duplicates.** At most one automatic reminder per local calendar date
      within the current extension session. Repeated prompts and timer checks
      must not produce duplicates.
- [ ] **Fresh session may remind again.** A new session or extension reload may
      remind again. Persistence across restarts is optional. Separate Pi
      processes keep separate state.
- [ ] **Manual preview.** `/bedtime-test` previews the message without changing
      the automatic reminder state.
- [ ] **Clean lifecycle.** Stop the timer on session shutdown. Reloading must not
      accumulate active timers or reuse an old session context.
- [ ] **No side effects.** No extra model calls, no tool blocking, no terminating
      Pi. Skip both notification and timer creation in non-interactive operation.

## The one idea that matters

An idle model does not wake itself. Prompting alone cannot deliver a reminder at
midnight — the extension needs runtime code that reads the clock on a timer. The
reminder itself makes **no model call**.

## Environment check (W1-0)

Run `npm run verify`. It must typecheck and pass the example test. See
`docs/notes.md` for the documentation pointers gathered for W1-1.