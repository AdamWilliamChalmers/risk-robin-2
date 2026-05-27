import type { AISuggestion } from "../game/types";
import type { ImpactCard } from "../data/impactCards";
import { PERSONAS, personaFor } from "../game/personas";
import InfoChip from "./InfoChip";

type Props = {
  suggestions: AISuggestion[];
  hand: ImpactCard[];
  highlighted: boolean;
};

export default function AIAnalystPanel({ suggestions, hand, highlighted }: Props) {
  const byId = new Map(hand.map((c) => [c.id, c]));

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
              {Object.values(PERSONAS).map((p) => (
                <li key={p.voice}>
                  <strong style={{ color: p.color }}>
                    {p.emoji} {p.name}
                  </strong>{" "}
                  — {p.role}, {p.location}. {p.bio}
                </li>
              ))}
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
          const p = personaFor(s.voice);
          const cards = s.recommendedImpactIds
            .map((id) => byId.get(id))
            .filter((c): c is ImpactCard => !!c);

          const headlineName = p?.name ?? s.voice;
          const subtitle = p
            ? `${p.role} · ${p.location}`
            : s.voice;
          const accent = p?.color ?? "#7C3E97";
          const emoji = p?.emoji ?? "💬";
          const perspective = p?.perspective ?? s.voice;

          return (
            <article
              key={s.voice}
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
                  <p className="text-xs text-stone-600 leading-snug">
                    {subtitle}
                  </p>
                </div>
              </div>
              <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-3">
                {perspective}
              </p>
              <p className="text-sm text-stone-700 mb-3 leading-relaxed">{s.reason}</p>
              <ul className="space-y-1.5">
                {cards.map((c) => (
                  <li
                    key={c.id}
                    className="text-sm bg-white rounded-xl px-3 py-2 shadow-sm border border-stone-100"
                  >
                    <span className="font-semibold">{c.title}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
