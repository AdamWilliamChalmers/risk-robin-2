import type { AISuggestion, AIVoice } from "../game/types";
import type { ImpactCard } from "../data/impactCards";
import { PERSONAS } from "../game/personas";
import {
  useResolvedPersona,
  usePersonaOverrides,
} from "../game/personaNamesContext";
import InfoChip from "./InfoChip";

type Props = {
  suggestions: AISuggestion[];
  hand: ImpactCard[];
  highlighted: boolean;
};

export default function AIAnalystPanel({
  suggestions,
  hand,
  highlighted,
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
        {suggestions.map((s) => {
          const cards = s.recommendedImpactIds
            .map((id) => byId.get(id))
            .filter((c): c is ImpactCard => !!c);
          return (
            <PersonaSuggestionCard
              key={s.voice}
              voice={s.voice as AIVoice}
              reason={s.reason}
              cards={cards}
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
}: {
  voice: AIVoice;
  reason: string;
  cards: ImpactCard[];
}) {
  const p = useResolvedPersona(voice);
  const headlineName = p?.name ?? voice;
  const subtitle = p ? `${p.role} · ${p.location}` : voice;
  const accent = p?.color ?? "#7C3E97";
  const emoji = p?.emoji ?? "💬";
  const perspective = p?.perspective ?? voice;
  const shortName = p?.shortName ?? voice;

  return (
    <article
      className="rounded-2xl bg-pastel-cream p-4 shadow-sm animate-fadeIn"
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
      <p className="text-sm text-stone-700 mb-3 leading-relaxed">{reason}</p>
      <ul className="space-y-1.5">
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
