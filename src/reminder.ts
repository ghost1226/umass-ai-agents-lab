/**
 * W1 entry point: Midnight reminder.
 *
 * Wires the pure policy (`reminder-policy.ts`) and the testable scheduler
 * (`reminder-scheduler.ts`) into Pi. This file owns only the plumbing: the
 * `/bedtime-test` command and the session lifecycle. Skip everything when there
 * is no interactive UI.
 *
 * Load during development with:
 *   pi --extension ./src/reminder.ts
 */

import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";

import {
  createReminderScheduler,
  type ReminderScheduler,
} from "./reminder-scheduler.ts";

import { createNowProvider } from "./demo-clock.ts";

export default function reminder(pi: ExtensionAPI) {
  // Session-scoped. Recreated on every session_start so a reload never reuses an
  // old context; cleared on session_shutdown.
  let scheduler: ReminderScheduler | null = null;

  function buildScheduler(ctx: ExtensionContext): ReminderScheduler {
    return createReminderScheduler({
      // Real clock normally; advances from BEDTIME_DEMO_TIME when set (W1-5).
      now: createNowProvider(),
      // Deliver inside Pi's UI; never a model call.
      notify: (message) => ctx.ui.notify(message, "info"),
      setInterval,
      clearInterval,
    });
  }

  // W1-4: preview without touching automatic state.
  pi.registerCommand("bedtime-test", {
    description: "Preview the midnight reminder message (no state change).",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      (scheduler ?? buildScheduler(ctx)).preview();
    },
  });

  // W1-4: immediate check + start the periodic timer on interactive startup.
  pi.on("session_start", async (_event, ctx) => {
    if (!ctx.hasUI) return;
    scheduler?.stop();
    scheduler = buildScheduler(ctx);
    scheduler.start();
  });

  // W1-4: stop the timer on shutdown; idempotent across quit/reload/replace.
  pi.on("session_shutdown", async () => {
    scheduler?.stop();
    scheduler = null;
  });
}
