# Documentation notes (W1-1)

Add notes here as you inspect the installed Pi version. Find the install path
with `npm root -g` or look under `~/.pi/agent/install/`.

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
- Example extensions: `.../examples/extensions/`

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

## Tool-call observation (W1-1)

TODO: describe what the model requested, what actually executed, and what came
back. Then compare a read-only MCP example with invoking a CLI program (`rg`,
`gh`): MCP exposes a capability through a protocol, while a CLI is a program the
agent runs through its shell tool.