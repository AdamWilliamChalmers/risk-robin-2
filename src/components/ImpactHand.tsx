import { useEffect, useRef, useState } from "react";
import type { ImpactCard as ImpactCardT } from "../data/impactCards";
import type { AISuggestion, AIVoice } from "../game/types";
import ImpactCard from "./ImpactCard";
import InfoChip from "./InfoChip";

type Props = {
  hand: ImpactCardT[];
  selectedId?: string | null;
  aiSuggestions: AISuggestion[];
  onSelect: (card: ImpactCardT) => void;
  onWildcard: () => void;
  highlighted: boolean;
  enabled: boolean;
};

/** Stable order in which we surface the three locals' picks. */
const VOICE_ORDER: AIVoice[] = [
  "Resident Voice",
  "Economy Voice",
  "Environment and City Voice",
];

export default function ImpactHand({
  hand,
  selectedId,
  aiSuggestions,
  onSelect,
  onWildcard,
  highlighted,
  enabled,
}: Props) {
  const voicesByImpact = buildVoiceMap(aiSuggestions);
  const orderedHand = orderHand(hand, aiSuggestions);
  const recommendedCount = orderedHand.filter(
    (c) => voicesByImpact[c.id]?.length
  ).length;

  // Track scroll position so we can show edge fades + a discoverability hint
  // when the player hasn't yet seen the rest of the hand.
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      setAtStart(el.scrollLeft <= 4);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
      setOverflowing(el.scrollWidth > el.clientWidth + 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [hand.length]);

  function nudge(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section
      className={`bg-white/70 backdrop-blur rounded-3xl p-5 card-shadow ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="impact_hand"
    >
      <header className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl text-stone-800">Your hand</h2>
            <InfoChip label="Your hand of 8 cards" ariaLabel="About your hand">
              <p className="mb-2">
                Eight Impact Cards. Each describes a possible effect tourism can
                have. Pick the one that best fits this Context Card.
              </p>
              <p className="mb-2">
                Cards recommended by Iona, Callum and Priya are shown first
                (with a coloured tag); the rest follow in card-number order.
              </p>
              <p>
                <strong>Wild Card (✶):</strong> if nothing in your hand quite
                captures what you have in mind, click Wild Card to write your own
                impact title and description.
              </p>
              <p className="mt-2 text-xs text-stone-500">
                After each round, the card you played is replaced with a fresh
                one so your hand stays at eight.
              </p>
            </InfoChip>
          </div>
          <p className="text-sm text-stone-600">
            {recommendedCount > 0
              ? `${recommendedCount} highlighted by the locals first, then the rest in number order. Scroll for more →`
              : "Choose the Impact Card that best matches the context — or play the Wild Card."}
          </p>
        </div>
        <button
          onClick={onWildcard}
          disabled={!enabled}
          className="btn-ghost disabled:opacity-40"
          title="Write your own impact"
        >
          ✶ Wild Card
        </button>
      </header>

      <div className="relative">
        {/* The horizontally scrolling row of cards */}
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto pb-3 scroll-smooth [scrollbar-width:thin]"
        >
          {orderedHand.map((card) => (
            <ImpactCard
              key={card.id}
              card={card}
              compact
              selected={selectedId === card.id}
              recommendedBy={voicesByImpact[card.id]}
              onClick={enabled ? () => onSelect(card) : undefined}
            />
          ))}
        </div>

        {/* Left fade + nudge button */}
        {overflowing && !atStart && (
          <>
            <div
              className="pointer-events-none absolute top-0 left-0 h-full w-10 rounded-l-2xl"
              style={{
                background:
                  "linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0))",
              }}
            />
            <button
              type="button"
              onClick={() => nudge(-1)}
              aria-label="Scroll hand left"
              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-stone-700 hover:bg-stone-50"
            >
              ‹
            </button>
          </>
        )}

        {/* Right fade + nudge button — the discoverability cue for "more cards". */}
        {overflowing && !atEnd && (
          <>
            <div
              className="pointer-events-none absolute top-0 right-0 h-full w-12 rounded-r-2xl"
              style={{
                background:
                  "linear-gradient(to left, rgba(255,255,255,0.95), rgba(255,255,255,0))",
              }}
            />
            <button
              type="button"
              onClick={() => nudge(1)}
              aria-label="Scroll hand right"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-stone-700 hover:bg-stone-50 animate-pulse"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Below-row hint that quantifies how many cards exist */}
      {overflowing && (
        <p className="mt-1 text-[11px] text-stone-500 text-right">
          Showing {orderedHand.length} cards — scroll for more
        </p>
      )}
    </section>
  );
}

function buildVoiceMap(suggestions: AISuggestion[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const s of suggestions) {
    for (const id of s.recommendedImpactIds) {
      if (!out[id]) out[id] = [];
      out[id].push(s.voice);
    }
  }
  return out;
}

/**
 * Re-order the hand so the cards each local picked appear first (in the
 * canonical Resident → Economy → Environment order), followed by the
 * remaining cards sorted by their printed card number.
 *
 * - We use each persona's TOP pick (the first entry in `recommendedImpactIds`)
 *   so there are at most three "highlighted" cards at the front of the row.
 * - If two personas happen to pick the same card, it only appears once.
 * - Anything in the hand that nobody recommended falls into the numeric tail.
 */
function orderHand(
  hand: ImpactCardT[],
  suggestions: AISuggestion[]
): ImpactCardT[] {
  const byId = new Map(hand.map((c) => [c.id, c]));
  const seen = new Set<string>();
  const out: ImpactCardT[] = [];

  // Build a lookup from voice -> its top recommended id (if any).
  const topByVoice = new Map<AIVoice, string | undefined>();
  for (const s of suggestions) {
    topByVoice.set(s.voice as AIVoice, s.recommendedImpactIds[0]);
  }

  // 1. Each persona's top pick, in our canonical order.
  for (const voice of VOICE_ORDER) {
    const id = topByVoice.get(voice);
    if (!id || seen.has(id)) continue;
    const card = byId.get(id);
    if (!card) continue;
    out.push(card);
    seen.add(id);
  }

  // 2. Remaining cards in numeric order. Wildcards (no numeric id) go last.
  const remaining = hand.filter((c) => !seen.has(c.id));
  remaining.sort((a, b) => cardNumber(a) - cardNumber(b));
  out.push(...remaining);

  return out;
}

function cardNumber(card: ImpactCardT): number {
  const m = /^I(\d+)$/.exec(card.id);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}
