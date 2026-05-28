import { useEffect, useMemo, useState } from "react";
import type { AISuggestion, AIVoice } from "../game/types";
import type { ImpactCard } from "../data/impactCards";
import { PERSONAS } from "../game/personas";
import {
  useResolvedPersona,
  usePersonaOverrides,
} from "../game/personaNamesContext";
import InfoChip from "./InfoChip";

/** Per-token interval for the streaming "is typing" effect on each persona's
 *  reason. A reason of ~50 words has ~100 word+whitespace tokens, so 22ms gives
 *  a snappy ~2s reveal — long enough to read like a live generation, short
 *  enough that it doesn't hold the player up. */
const TYPING_INTERVAL_MS = 22;

/** Stagger between personas so the three feel like three independent agents
 *  thinking aloud, not a simultaneous chorus. ~350ms between starts means
 *  persona 2 is still typing when persona 1 finishes a short reason. */
const PERSONA_STAGGER_MS = 350;

type Props = {
  suggestions: AISuggestion[];
  hand: ImpactCard[];
  highlighted: boolean;
  /** When true, each persona card gets a one-shot pulse on mount. Used while
   *  we're in the "locals weigh in" spotlight to draw the eye to each
   *  perspective in turn. */
  pulse?: boolean;
};

export default function AIAnalystPanel({
  suggestions,
  hand,
  highlighted,
  pulse = false,
}: Props) {
  const byId = new Map(hand.map((c) => [c.id, c]));
  const overrides = usePersonaOverrides();

  return (
    <section
      className={`bg-white/70 backdrop-blur rounded-3xl p-5 card-shadow ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="ai_panel"
    >
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl text-stone-800">
            Three locals weigh in
          </h2>
          <InfoChip label="Who are these locals?" ariaLabel="About the three locals">
            <p className="mb-2">
              Three Edinburgh perspectives on the same context. They{" "}
              <em>often disagree</em> — that's the point: tourism trade-offs
              look different depending on whose life you weigh.
            </p>
            <ul className="space-y-1.5 text-xs">
              {Object.values(PERSONAS).map((base) => {
                const o = overrides?.[base.voice];
                const name = o?.name ?? base.name;
                const role = o?.role ?? base.role;
                const location = o?.location ?? base.location;
                const bio = o?.bio ?? base.bio;
                return (
                  <li key={base.voice}>
                    <strong style={{ color: base.color }}>
                      {base.emoji} {name}
                    </strong>{" "}
                    — {role}, {location}. {bio}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-stone-500">
              They suggest — you decide. Each highlights cards already in{" "}
              <em>your</em> hand.
            </p>
          </InfoChip>
        </div>
        <p className="text-sm text-stone-600">
          Three Edinburgh voices — each picks from your hand. They suggest, you
          decide.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((s, idx) => {
          const cards = s.recommendedImpactIds
            .map((id) => byId.get(id))
            .filter((c): c is ImpactCard => !!c);
          return (
            <PersonaSuggestionCard
              key={s.voice}
              voice={s.voice as AIVoice}
              reason={s.reason}
              cards={cards}
              pulse={pulse}
              streamDelayMs={idx * PERSONA_STAGGER_MS}
            />
          );
        })}
      </div>
    </section>
  );
}

/**
 * One column of the analyst panel: a single persona's avatar, role, reason
 * and the impact cards they're recommending. Extracted so we can use the
 * `useResolvedPersona` hook to pick up the per-game LLM-generated name.
 */
function PersonaSuggestionCard({
  voice,
  reason,
  cards,
  pulse,
  streamDelayMs = 0,
}: {
  voice: AIVoice;
  reason: string;
  cards: ImpactCard[];
  pulse?: boolean;
  /** Delay before this persona's reason starts streaming. Used to stagger the
   *  three locals so each feels like an independent live agent rather than a
   *  synchronised chorus. */
  streamDelayMs?: number;
}) {
  const p = useResolvedPersona(voice);
  const headlineName = p?.name ?? voice;
  const subtitle = p ? `${p.role} · ${p.location}` : voice;
  const accent = p?.color ?? "#7C3E97";
  const emoji = p?.emoji ?? "💬";
  const perspective = p?.perspective ?? voice;
  const shortName = p?.shortName ?? voice;

  const { shown, done } = useTypewriter(
    reason,
    streamDelayMs,
    TYPING_INTERVAL_MS
  );

  return (
    <article
      className={`rounded-2xl bg-pastel-cream p-4 shadow-sm animate-fadeIn ${
        pulse ? "persona-pulse" : ""
      }`}
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <div className="flex items-start gap-3 mb-2">
        <span
          className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-white text-2xl shadow-sm"
          style={{ outline: `2px solid ${accent}33` }}
          aria-hidden
        >
          {emoji}
        </span>
        <div className="min-w-0">
          <h3
            className="font-display text-base leading-tight"
            style={{ color: accent }}
          >
            {headlineName}
          </h3>
          <p className="text-xs text-stone-600 leading-snug">{subtitle}</p>
        </div>
      </div>
      <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-3">
        {perspective}
      </p>
      {/* Reason text streams in word-by-word so each persona reads like it's
          being generated live. The thin caret in the persona's accent colour
          disappears once the full reason has rendered. We also expose the
          finished text to screen readers via the off-screen <span> so the
          animation doesn't make assistive tech wait for the stream. */}
      <p className="text-sm text-stone-700 mb-3 leading-relaxed">
        <span aria-hidden>{shown}</span>
        {!done && (
          <span
            className="typing-caret"
            style={{ background: accent }}
            aria-hidden
          />
        )}
        <span className="sr-only">{reason}</span>
      </p>
      {/* Reserve the impact-card space from the start so the article doesn't
          jolt vertically when the cards fade in. They become interactive only
          once the reason has finished — same moment the LLM "concludes". */}
      <ul
        className="space-y-1.5"
        style={{
          opacity: done ? 1 : 0,
          transition: "opacity 320ms ease",
        }}
      >
        {cards.map((c) => (
          <li
            key={c.id}
            className="text-sm bg-white rounded-xl px-3 py-2 shadow-sm flex items-start gap-2"
            style={{ borderLeft: `4px solid ${accent}` }}
          >
            <span
              className="shrink-0 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full mt-0.5"
              style={{ background: accent }}
            >
              {shortName}
            </span>
            <span className="font-semibold">{c.title}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * Word-by-word streaming hook. Splits `text` on whitespace (keeping the
 * separators so spacing is preserved on re-join) and reveals one token per
 * `intervalMs` tick after `startDelayMs`. Respects `prefers-reduced-motion`
 * by skipping straight to the full text.
 *
 * Stable across the component lifecycle:
 *   - Memoises tokens on the source string, so identity is stable across
 *     re-renders that don't change `reason`.
 *   - Cleans up the timer on unmount or when text changes mid-stream.
 *   - Uses functional `setShownCount` so closures over a stale count can't
 *     overwrite a newer tick.
 */
function useTypewriter(
  text: string,
  startDelayMs: number,
  intervalMs: number
): { shown: string; done: boolean } {
  const reduceMotion = usePrefersReducedMotion();
  const tokens = useMemo(
    () => text.split(/(\s+)/).filter((t) => t.length > 0),
    [text]
  );
  const [shownCount, setShownCount] = useState(
    reduceMotion ? tokens.length : 0
  );

  useEffect(() => {
    if (reduceMotion) {
      setShownCount(tokens.length);
      return;
    }
    setShownCount(0);
    let cancelled = false;
    let interval: number | undefined;

    const startHandle = window.setTimeout(() => {
      if (cancelled) return;
      interval = window.setInterval(() => {
        setShownCount((prev) => {
          if (prev >= tokens.length) {
            if (interval !== undefined) window.clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }, startDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(startHandle);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [tokens, startDelayMs, intervalMs, reduceMotion]);

  const done = shownCount >= tokens.length;
  return { shown: tokens.slice(0, shownCount).join(""), done };
}

/** True when the user has requested reduced motion (system setting). We hook
 *  into the same media query React uses for matchMedia changes so a runtime
 *  toggle takes effect without a reload. */
function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduce;
}
