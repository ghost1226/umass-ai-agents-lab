/**
 * W1 entry point: Midnight reminder.
 *
 * This starter registers the command and lifecycle hooks only. It contains NO
 * reminder behavior. Implement the policy in `src/reminder-policy.ts` (W1-3)
 * and the scheduling/UI wiring here (W1-4).
 *
 * Load during development with:
 *   pi --extension ./src/reminder.ts
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function reminder(pi: ExtensionAPI) {
  // W1-4: preview the reminder without touching automatic state.
  pi.registerCommand("bedtime-test", {
    description: "Preview the midnight reminder message (no state change).",
    handler: async (_args, ctx) => {
      // TODO(W1-4): notify with the shared reminder message.
      ctx.ui.notify(
        "bedtime-test placeholder: the reminder is not implemented yet.",
        "info",
      );
    },
  });

  // W1-4: immediate check on startup + start the periodic timer.
  pi.on("session_start", async (_event, ctx) => {
    // Guard: do nothing when there is no interactive UI (non-interactive modes).
    if (!ctx.hasUI) return;
    // TODO(W1-4): run the policy now and every ~30s. Read the real clock on
    // each check. Record the reminded date in the same synchronous decision
    // path so duplicates are impossible.
  });

  // W1-4: stop the timer. Must be idempotent across quit/reload/session switch.
  pi.on("session_shutdown", async () => {
    // TODO(W1-4): clearInterval(...) here.
  });
}