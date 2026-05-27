import { generateAISuggestions } from "./aiAnalysts";
import { fetchAnalystSuggestions } from "./aiClient";
import type { AISuggestion } from "./types";
import type { ContextCard } from "../data/contextCards";
import type { ImpactCard } from "../data/impactCards";

/**
 * An async function that returns AI analyst suggestions for the current round.
 * This is the seam where a real LLM can be wired in without touching the rest
 * of the game.
 */
export type AIProvider = (ctx: ContextCard, hand: ImpactCard[]) => Promise<AISuggestion[]>;

/**
 * Deterministic, local-only. Wrapped in a small delay so the AI panel appears
 * to "think" before responding. Used as the fallback path and for offline play.
 */
export const deterministicProvider: AIProvider = async (ctx, hand) => {
  await new Promise((r) => setTimeout(r, 350));
  return generateAISuggestions(ctx, hand);
};

/**
 * LLM-backed provider. Hits the dev-only `/api/ai-analysts` proxy defined in
 * `server/aiPlugin.ts`, which forwards to OpenAI with the server-side key.
 *
 * If the proxy isn't running (e.g. `vite build` + `vite preview`), the key
 * isn't configured, or the request fails for any reason, this falls back to
 * the deterministic scorer so the game never blocks.
 */
export const llmProvider: AIProvider = async (ctx, hand) => {
  const remote = await fetchAnalystSuggestions(ctx, hand);
  if (remote) return remote;
  return generateAISuggestions(ctx, hand);
};

/**
 * Active provider used by the game. Set to `llmProvider` so the game uses
 * OpenAI in dev when configured, and the deterministic fallback otherwise.
 * Flip to `deterministicProvider` if you want to disable LLM analyst voices
 * entirely without removing your `.env` key.
 */
export const defaultProvider: AIProvider = llmProvider;
