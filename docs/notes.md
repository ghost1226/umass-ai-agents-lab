# Documentation notes (W1-1)

Installed version: **Pi 0.87.1**. Find the install path with
`ls ~/.pi/agent/install/releases/`.

Useful commands:

```bash
pi --version
rg -n "registerCommand|session_start|session_shutdown|ctx.ui.notify" \
  ~/.pi/agent/install/releases/*/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md
```

## Local docs (installed version)

- Pi extensions guide: `.../@earendil-works/pi-coding-agent/docs/extensions.md`
- Terminal UI / dialogs: `.../docs/tui.md`
- Type declarations: `.../dist/core/extensions/types.d.ts`
- Example extensions: `.../examples/extensions/` (`hello.ts`, `notify.ts`,
  `question.ts`, `file-trigger.ts`)

## What the docs say (relevant contract points)

- An extension exports a **default factory** receiving `ExtensionAPI`. Register
  capabilities inside the factory; do **not** start timers there, because some
  invocations load extensions without starting a session.
- Start long-lived resources from `session_start`; release them in an
  **idempotent** `session_shutdown` handler (quit, reload, and session
  replacement can all converge on it).
- `ctx.mode` is `"tui" | "rpc" | "json" | "print"`. `ctx.hasUI` is true in TUI
  and RPC. Guard terminal-only behavior and skip work in non-interactive modes.
- `pi.registerCommand`, `ctx.ui.notify`, and the `session_start` /
  `session_shutdown` events are the APIs this assignment needs.
- Reload replaces the extension runtime, so code must not reuse state from the
  old runtime (that is why each `session_start` must clear any previous timer).

## APIs used in this project

| Need | API |
|---|---|
| Slash command | `pi.registerCommand("bedtime-test", { description, handler })` |
| Visible message | `ctx.ui.notify(message, "info")` |
| Model-callable tool | `pi.registerTool({ name, label, description, parameters, execute })` |
| Start timer | `pi.on("session_start", (event, ctx) => ...)` |
| Stop timer | `pi.on("session_shutdown", () => ...)` |
| Human selection | `ctx.ui.select(title, options)` / `ctx.ui.input(title, placeholder)` |
| UI availability | `ctx.hasUI` (TUI/RPC) and `ctx.mode` |

## Tool-call observation

Pulled from this session's transcript (`$PI_SESSION_FILE`).

**What the model requested.** A `bash` tool call with arguments
`{ command: "ls -la /Users/roninblvck && ...", timeout: null }` and a unique
`toolCallId`.

**What executed.** The harness ran that shell command, not the model. The model
never has direct shell access; it only emitted a structured request.

**What came back.** A `toolResult` message with the matching `toolCallId`, the
`toolName` (`bash`), and `content: [{ type: "text", text: "<stdout>" }]`. The
result is appended to the conversation as context for the model's next turn.

Takeaway: a tool is a *request → execution → result* loop. The model decides,
the runtime executes, and the result becomes context.

## MCP vs. a CLI program

A CLI program (like `rg` or `gh`) is a process the agent runs through its shell
tool: the agent composes a command string and reads stdout. MCP is a protocol
that exposes named capabilities (tools, resources, prompts) to the client; the
client discovers them and invokes them as structured requests over a transport,
running locally or remotely. So the split is not local-vs-cloud — it is
"program invoked via shell" vs "capability exposed through a protocol". The
reminder needs neither: it is runtime code inside Pi.

## Instructor-provided skill

TODO: read and use the instructor's documentation/review skill once it is
provided; note here what it contributed. (Not present in this repo.)
