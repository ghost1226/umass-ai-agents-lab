# W1-5 — Demonstration record

Evidence for the midnight reminder. Raw captures live in
[`evidence/`](evidence/).

## Automated proof

```bash
npm run verify      # tsc --noEmit + node --test
```

Result: **20 tests pass, 0 fail.** The policy and scheduler tests use a supplied
clock, a controllable timer, and a fake notification function, so they simulate
midnight without changing the system clock.

- `evidence/w1-2-failing.txt` — policy tests before implementation (7 fail)
- `evidence/w1-3-passing.txt` — policy tests after implementation
- `evidence/w1-4-failing.txt` — scheduler tests before implementation (8 fail)
- `evidence/w1-4-passing.txt` — full suite after implementation

## Live demonstration (simulated time)

The extension is loaded with `--extension`, and `BEDTIME_DEMO_TIME` advances a
simulated clock from just before midnight. No system clock is changed.

### Preview command and automatic delivery

```bash
BEDTIME_DEMO_TIME=2026-01-14T23:59:58 node scripts/demo-rpc.mjs
```

Observed (`evidence/w1-5-demo-rpc.txt`):

```
  > /bedtime-test (manual preview)
  [notify +3.0s] It is after midnight. Consider saving your work and getting some sleep.
  [notify +30.2s] It is after midnight. Consider saving your work and getting some sleep.
...
manual previews: 1
automatic reminders: 1
```

- `+3.0s` — the manual `/bedtime-test` preview.
- `+30.2s` — the automatic reminder on the first timer tick after the simulated
  clock crossed midnight (started 23:59:58, so midnight was at `+2s`). That is
  well inside the 60-second requirement.
- The next tick (about `+60s`) produced **no** further notification: the
  automatic reminder is delivered at most once per local date.

The demo runs through Pi's **RPC mode**, which forwards `ctx.ui.notify` and
reports `ctx.hasUI === true`, so it exercises the same notification path as the
terminal UI. For a hands-on TUI run:

```bash
BEDTIME_DEMO_TIME=2026-01-14T23:59:58 pi --extension ./src/reminder.ts
# then type: /bedtime-test
```

### Startup inside the window

```bash
BEDTIME_DEMO_TIME=2026-01-14T00:30:00 DEMO_WAIT_MS=6000 node scripts/demo-rpc.mjs
```

Observed (`evidence/w1-5-startup-after-midnight.txt`): an automatic reminder at
`+0.2s`, from the immediate check in `session_start`.

### Non-interactive startup creates no timer

```bash
pi --extension ./src/reminder.ts -p "Reply with exactly: ok" --no-tools --mode text
```

Observed (`evidence/w1-5-noninteractive.txt`): prints `ok` and exits cleanly. In
print mode `ctx.hasUI` is false, so `session_start` returns before any
notification or timer is created.

## Where time is checked, and why a prompt cannot do this

Time is read in exactly one place: `ReminderScheduler.check()`, via the injected
`now()`. `check()` runs on the immediate startup check and on every 30-second
timer tick. Each call recomputes the local date, so a delayed callback never
assumes the computer stayed awake.

A prompt alone cannot deliver this reminder. An idle model is not executing
between turns — nothing wakes it at midnight. The reminder needs **runtime code**
that reads the clock on a timer and calls the UI directly; the extension makes no
model call at all. Prompting can shape behavior during a turn, but it cannot
schedule a future turn.

## Reflection

**An agent assumption corrected.** The demo clock was first written so its
fallback branches returned `new Date()`. That ignored the injected `realNow`
clock, so the two fallback tests failed. The failing tests made the bad
assumption visible: a "default to the real clock" path still has to honor the
supplied clock. Fixing it to `new Date(realNow())` made all three demo-clock
tests pass. Tests first caught the defect before it reached the extension.

**A second corrected assumption.** I expected `ctx.hasUI` to be false outside the
terminal TUI. The RPC documentation showed `ctx.hasUI === true` in RPC mode
because notifications and dialogs are forwarded. That is why the demonstration
above can observe real `ctx.ui.notify` calls headlessly, while print mode
correctly stays inert.