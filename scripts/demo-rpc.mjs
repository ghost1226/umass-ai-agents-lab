#!/usr/bin/env node
/**
 * W1-5 live demonstration over Pi's RPC mode.
 *
 * RPC forwards extension notifications and reports `ctx.hasUI === true`, so this
 * exercises the same `ctx.ui.notify` path a terminal session uses. With
 * BEDTIME_DEMO_TIME set, the clock starts just before midnight and advances, so
 * the automatic reminder fires within ~30s of real time.
 *
 * Usage:
 *   BEDTIME_DEMO_TIME=2026-01-14T23:59:58 node scripts/demo-rpc.mjs
 *
 * Env:
 *   BEDTIME_DEMO_TIME  simulated local start (default 2026-01-14T23:59:58)
 *   DEMO_WAIT_MS       how long to observe before exiting (default 70000)
 *   PI_BIN             pi executable (default "pi")
 */
import { spawn } from "node:child_process";

const DEMO_TIME = process.env.BEDTIME_DEMO_TIME ?? "2026-01-14T23:59:58";
const WAIT_MS = Number(process.env.DEMO_WAIT_MS ?? 70_000);
const PI = process.env.PI_BIN ?? "pi";

const child = spawn(
  PI,
  ["--mode", "rpc", "--no-session", "-e", "./src/reminder.ts"],
  {
    cwd: process.cwd(),
    env: { ...process.env, BEDTIME_DEMO_TIME: DEMO_TIME },
    stdio: ["pipe", "pipe", "inherit"],
  },
);

const notifications = [];
const commands = [];
const startedAt = Date.now();
let previewSent = false;
let buffer = "";

child.stdout.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  buffer += chunk;
  let idx;
  while ((idx = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, idx);
    buffer = buffer.slice(idx + 1);
    if (!line.trim()) continue;
    let rec;
    try {
      rec = JSON.parse(line);
    } catch {
      continue;
    }
    if (rec.type === "extension_ui_request" && rec.method === "notify") {
      notifications.push(rec.message);
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      console.log(`  [notify +${elapsed}s] ${rec.message}`);
    }
    if (
      rec.type === "response" &&
      rec.command === "get_commands" &&
      Array.isArray(rec.data?.commands)
    ) {
      commands.push(...rec.data.commands.map((c) => c.name));
    }
  }
});

const send = (record) => child.stdin.write(`${JSON.stringify(record)}\n`);

setTimeout(() => send({ id: "cmds", type: "get_commands" }), 1_500);
setTimeout(() => {
  console.log("  > /bedtime-test (manual preview)");
  previewSent = true;
  send({ id: "preview", type: "prompt", message: "/bedtime-test" });
}, 3_000);

setTimeout(() => {
  const manual = previewSent ? 1 : 0;
  const automatic = notifications.length - manual;
  console.log("\n=== demo summary ===");
  console.log(`simulated clock start: ${DEMO_TIME}`);
  console.log(`/bedtime-test registered: ${commands.includes("bedtime-test")}`);
  console.log(`notifications: ${notifications.length}`);
  notifications.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
  console.log(`manual previews: ${manual}`);
  console.log(`automatic reminders: ${automatic}`);
  child.kill("SIGTERM");
}, WAIT_MS);

child.on("exit", (code) => process.exit(code ?? 0));