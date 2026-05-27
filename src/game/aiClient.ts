/**
 * Thin client wrappers for the dev-only AI proxy in `server/aiPlugin.ts`.
 *
 * Every function in this module follows the same contract:
 *   - Returns the LLM result on success.
 *   - Returns `null` on ANY failure (network, timeout, non-2xx, bad JSON,
 *     OPENAI_API_KEY missing — the server returns 503 in those cases).
 *   - Never throws.
 *
 * Callers MUST treat `null` as "no upgrade — keep the deterministic value".
 * That's how the game stays playable with or without the proxy running.
 */
import type { AISuggestion } from "./types";
import type { ContextCard } from "../data/contextCards";
import type { ImpactCard } from "../data/impactCards";
import type { ImpactCategory } from "../data/categories";
import { CATEGORY_LABELS } from "../data/categories";

const REQUEST_TIMEOUT_MS = 15_000;

async function postJson<T>(path: string, body: unknown): Promise<T | null> {
  const started = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    const ms = Math.round(performance.now() - started);
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(
        `[risk-robin-ai] ✗ ${path} → HTTP ${res.status} (${ms}ms) — using deterministic fallback`,
        errText
      );
      return null;
    }
    console.log(`[risk-robin-ai] ✓ ${path} (${ms}ms)`);
    return (await res.json()) as T;
  } catch (err) {
    const ms = Math.round(performance.now() - started);
    console.warn(
      `[risk-robin-ai] ✗ ${path} (${ms}ms) — network/timeout, using deterministic fallback`,
      err
    );
    return null;
  }
}

/** /api/ai-analysts */
export async function fetchAnalystSuggestions(
  context: ContextCard,
  hand: ImpactCard[]
): Promise<AISuggestion[] | null> {
  const result = await postJson<{ suggestions: AISuggestion[] }>(
    "/api/ai-analysts",
    {
      context: {
        id: context.id,
        title: context.title,
        description: context.description,
        icons: context.icons,
      },
      hand: hand.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        icons: c.icons,
        tone: c.tone,
      })),
    }
  );
  if (!result || !Array.isArray(result.suggestions)) return null;
  // Defence in depth: drop any IDs not in hand even though the server already filtered.
  const handIds = new Set(hand.map((c) => c.id));
  const safe = result.suggestions
    .map((s) => ({
      ...s,
      recommendedImpactIds: s.recommendedImpactIds.filter((id) => handIds.has(id)),
    }))
    .filter((s) => s.recommendedImpactIds.length > 0);
  return safe.length === 3 ? safe : null;
}

/** /api/robin-summary */
export async function fetchRobinSummary(opts: {
  contextTitle: string;
  impactTitle: string;
  impactDescription?: string;
  evidence: string;
  followUpAnswer?: string;
  categories: ImpactCategory[];
  isWild: boolean;
}): Promise<string | null> {
  // Send the *human-readable* category labels so the model can mention them
  // directly. The server doesn't need to know our internal keys.
  const result = await postJson<{ summary: string }>("/api/robin-summary", {
    contextTitle: opts.contextTitle,
    impactTitle: opts.impactTitle,
    impactDescription: opts.impactDescription ?? "",
    evidence: opts.evidence,
    followUpAnswer: opts.followUpAnswer ?? "",
    categories: opts.categories.map((c) => CATEGORY_LABELS[c]),
    isWild: opts.isWild,
  });
  return result?.summary ?? null;
}

/** /api/follow-up */
export async function fetchFollowUpQuestion(opts: {
  contextTitle: string;
  contextDescription: string;
  impactTitle: string;
  evidence: string;
}): Promise<string | null> {
  const result = await postJson<{ question: string }>("/api/follow-up", opts);
  return result?.question ?? null;
}

/**
 * Kinds of text the polish endpoint knows how to handle. Drives the
 * length / tone guidance in the prompt — see `server/aiPlugin.ts`.
 */
export type PolishKind =
  | "evidence"
  | "follow_up"
  | "reflection"
  | "wildcard_description";

/**
 * "Polish with AI" — server-side rewrite that turns rough notes / bullets
 * into clean prose. Strict no-hallucination prompt. Returns null on any
 * failure so the caller can leave the user's text untouched.
 */
export async function polishText(opts: {
  rawText: string;
  kind: PolishKind;
  /** Optional surrounding context to ground the rewrite (e.g. context card title). */
  context?: string;
}): Promise<string | null> {
  if (opts.rawText.trim().length === 0) return null;
  const result = await postJson<{ polished: string }>("/api/polish-text", opts);
  return result?.polished ?? null;
}
