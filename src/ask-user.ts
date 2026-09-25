/**
 * W2 entry point: Ask the Human.
 *
 * Registers a model-callable `ask_user` tool. This starter contains only the
 * registration/shape boilerplate — no dialog logic. Implement it in W2-2.
 *
 * Load during development with:
 *   pi --extension ./src/ask-user.ts
 */

import { Type } from "typebox";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/** The three explicit result states for a consultation. */
export const ASK_USER_RESULT_STATUSES = [
  "answered",
  "cancelled",
  "unavailable",
] as const;
export type AskUserStatus = (typeof ASK_USER_RESULT_STATUSES)[number];

export default function askUser(pi: ExtensionAPI) {
  pi.registerTool({
    name: "ask_user",
    label: "Ask the Human",
    description:
      "Ask the human an important unresolved question that materially changes " +
      "user-visible behavior, scope, or the amount of rework. Do not use it for " +
      "explicit requirements or routine reversible details.",
    parameters: Type.Object({
      question: Type.String({ description: "One clear question." }),
      reason: Type.String({ description: "Why this decision matters." }),
      options: Type.Array(
        Type.Object({
          label: Type.String({ description: "Short option label." }),
          tradeoff: Type.String({ description: "Tradeoff of this option." }),
        }),
        { minItems: 2, maxItems: 3, description: "Two or three options." },
      ),
      recommendation: Type.Optional(
        Type.String({ description: "Optional recommended option label." }),
      ),
    }),
    executionMode: "sequential",

    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      // TODO(W2-2): check `ctx.hasUI`, present the question via ctx.ui.select /
      // ctx.ui.input, await the answer, and map it to status + answer.
      return {
        content: [
          { type: "text", text: "ask_user is not implemented yet (TODO W2-2)." },
        ],
        details: { status: "unavailable" as AskUserStatus, answer: null },
      };
    },
  });
}