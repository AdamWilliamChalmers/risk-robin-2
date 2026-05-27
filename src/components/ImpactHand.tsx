import type { ImpactCard as ImpactCardT } from "../data/impactCards";
import type { AISuggestion } from "../game/types";
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
                The little pills on a card show which local(s) recommended it
                — Iona, Callum or Priya. You can ignore them — they're hints,
                not rules.
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
            Choose the Impact Card that best matches the context — or play the Wild Card.
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
      <div className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {hand.map((card) => (
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
