import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { DEFAULT_MODEL, HANDLERS, type Env } from "./aiHandlers";

/**
 * Dev-only Vite plugin that mounts the AI proxy under `vite dev`.
 *
 * Why dev-only:
 *   This middleware is only registered by `configureServer`, which Vite runs
 *   in `vite dev`. The production build (`vite build` → `dist/`) does not
 *   include any of this code. In production, the same endpoints are served
 *   by the Vercel Functions in `api/*.ts`, which import the *exact same*
 *   handler functions from `./aiHandlers`. The contracts therefore can't
 *   drift between dev and prod.
 *
 * Endpoints (all POST, all JSON in/out — see `aiHandlers.ts` for details):
 *
 *   POST /api/ai-analysts      → { suggestions: AISuggestion[] }
 *   POST /api/robin-summary    → { summary: string }
 *   POST /api/follow-up        → { question: string }
 *   POST /api/polish-text      → { polished: string }
 *   POST /api/persona-names    → { personas: PersonaOverride[] }
 *
 * Failures (missing key, OpenAI error, malformed model output) respond with
 * HTTP 503 and `{ error }`. The browser client treats that as "fall back to
 * deterministic" so the game never blocks on the network.
 */
export function aiPlugin(env: Env): Plugin {
  return {
    name: "risk-robin-ai",
    configureServer(server: ViteDevServer) {
      const keyState = env.OPENAI_API_KEY
        ? `present (…${env.OPENAI_API_KEY.slice(-4)})`
        : "MISSING";
      const model = env.OPENAI_MODEL || DEFAULT_MODEL;
      console.log(
        `[risk-robin-ai] plugin loaded. OPENAI_API_KEY=${keyState}, model=${model}`
      );

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        const handler = HANDLERS[url.split("?")[0]];
        if (!handler) return next();
        if (req.method !== "POST") {
          json(res, 405, { error: "Method not allowed" });
          return;
        }
        const label = url.split("?")[0];
        const started = Date.now();
        console.log(`[risk-robin-ai] → ${label}`);
        try {
          const body = await readJson(req);
          const out = await handler(env, body);
          const ms = Date.now() - started;
          console.log(`[risk-robin-ai] ✓ ${label} (${ms}ms)`);
          json(res, 200, out);
        } catch (err) {
          const ms = Date.now() - started;
          const message = err instanceof Error ? err.message : "unknown error";
          console.warn(
            `[risk-robin-ai] ✗ ${label} (${ms}ms) — ${message}`
          );
          // 503 because the client treats this as "fall back to deterministic"
          // — not a 500, which would suggest a bug worth surfacing.
          json(res, 503, { error: message });
        }
      });
    },
  };
}

/* ---------- Vite-side request/response helpers ----------
   These only exist for the dev plugin because Vite hands you a raw
   `IncomingMessage`. The Vercel Functions get a parsed body for free. */

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (raw.length === 0) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Request body is not valid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}
