/**
 * Tiny shared helper for the Vercel Function wrappers in this folder.
 *
 * Each `api/*.ts` file is intentionally three lines long — its only job is to
 * pick a handler from `server/aiHandlers.ts` and forward the request to it.
 * The shared `runHandler` here does the boring HTTP scaffolding: POST-only,
 * JSON-body parsing (defensive — Vercel auto-parses application/json but we
 * accept raw strings too), `Env` from `process.env`, and the same 503-on-
 * failure semantics the dev plugin uses so the browser client can fall back
 * to deterministic behaviour without surfacing an error.
 *
 * NOTE: `VercelRequest` / `VercelResponse` come from `@vercel/node`. They
 * extend Node's `IncomingMessage` / `ServerResponse` so the types line up
 * with the rest of the codebase.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { envFromProcess, type Handler } from "../server/aiHandlers.js";

/**
 * Run one of the shared handlers, translating its result/error into an HTTP
 * response. Exported so each `api/*.ts` file can just call this with its
 * handler reference.
 */
export async function runHandler(
  handler: Handler,
  req: VercelRequest,
  res: VercelResponse,
  label: string
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const started = Date.now();
  console.log(`[risk-robin-ai] → ${label}`);
  try {
    const body = parseBody(req);
    const out = await handler(envFromProcess(), body);
    console.log(`[risk-robin-ai] ✓ ${label} (${Date.now() - started}ms)`);
    res.status(200).json(out);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.warn(
      `[risk-robin-ai] ✗ ${label} (${Date.now() - started}ms) — ${message}`
    );
    res.status(503).json({ error: message });
  }
}

/**
 * Vercel parses JSON bodies automatically when the Content-Type header is
 * `application/json`, but if the client (or a probe) sends a raw string we
 * still want to handle it gracefully. Empty bodies become `{}` so the
 * `/api/persona-names` no-body request still works.
 */
function parseBody(req: VercelRequest): unknown {
  const b = req.body;
  if (b == null || b === "") return {};
  if (typeof b === "string") {
    try {
      return JSON.parse(b);
    } catch {
      throw new Error("Request body is not valid JSON");
    }
  }
  return b;
}
