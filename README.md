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

## Acceptance criteria (fill in — W1-1)

<!--
TODO(W1-1): paste the reminder acceptance criteria from the instructor handout
and mirror them in a GitHub issue. Keep one source of truth and link the issue
number here.
-->

- [ ] TODO: local time policy 00:00 (inclusive) to 06:00 (exclusive)
- [ ] TODO: visible notification; user may continue
- [ ] TODO: automatic delivery within one minute of midnight while idle
- [ ] TODO: on startup inside the window, remind
- [ ] TODO: at most one automatic reminder per local calendar date per session
- [ ] TODO: `/bedtime-test` previews without changing automatic state
- [ ] TODO: timer cleared on shutdown/reload; no duplicate timers
- [ ] TODO: no model calls, no tool blocking, no shutdown; skip in non-interactive modes

## The one idea that matters

An idle model does not wake itself. Prompting alone cannot deliver a reminder at
midnight — the extension needs runtime code that reads the clock on a timer. The
reminder itself makes **no model call**.

## Environment check (W1-0)

Run `npm run verify`. It must typecheck and pass the example test. See
`docs/notes.md` for the documentation pointers gathered for W1-1.