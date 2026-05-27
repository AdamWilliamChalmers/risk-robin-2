import type { ImpactCard as ImpactCardT } from "../data/impactCards";
import { personaFor } from "../game/personas";
import CategoryBadge from "./CategoryBadge";

type Props = {
  card: ImpactCardT;
  selected?: boolean;
  recommendedBy?: string[]; // voice names
  onClick?: () => void;
  /** Compact mode shrinks the card for the hand view */
  compact?: boolean;
};

/**
 * Renders an Impact Card. I1 has artwork; everything else renders as a styled
 * HTML card mimicking the same layout: white title strip, blue band with
 * ID/description, then a single coloured icon at the bottom (for the dominant
 * category).
 *
 * TODO: drop additional extracted impact PNGs into /public and set `image` on
 * each card to use them.
 */
export default function ImpactCard({ card, selected, recommendedBy, onClick, compact }: Props) {
  const isClickable = !!onClick;
  const widthClass = compact ? "w-40" : "w-56";
  const hasRibbon = !!recommendedBy && recommendedBy.length > 0;
  return (
    <div
      role={isClickable ? "button" : undefined}
      onClick={onClick}
      className={[
        "relative rounded-2xl card-shadow overflow-hidden bg-white",
        widthClass,
        isClickable ? "cursor-pointer hover:-translate-y-1 transition-transform" : "",
        selected ? "ring-4 ring-robinOrange" : "",
      ].join(" ")}
    >
      {/* Recommended-by ribbon. Rendered above the title strip so the pill
          never overlaps the card title — the title strip starts below it.
          Each pill shows the recommender's first name (Iona / Callum / Priya)
          so the card immediately tells the player *which person* backs it. */}
      {hasRibbon && (
        <div className="flex flex-wrap justify-end gap-1 px-2 pt-2">
          {recommendedBy!.map((v) => {
            const p = personaFor(v);
            const label = p?.shortName ?? voiceShort(v);
            const title = p
              ? `${p.name} (${p.role}) recommends this`
              : `${v} recommends this`;
            return (
              <span
                key={v}
                className="text-[10px] font-semibold bg-robinOrange text-white px-2 py-0.5 rounded-full shadow"
                title={title}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}

      {card.image ? (
        <img src={`/${card.image}`} alt={card.title} className="w-full block" />
      ) : (
        <>
          <div className={`px-3 ${compact ? "pt-3 pb-2" : "pt-4 pb-3"} text-center`}>
            <h4
              className={`font-display ${
                compact ? "text-base leading-snug" : "text-lg leading-tight"
              } text-stone-800`}
            >
              {card.title}
            </h4>
          </div>
          <div className="bg-pastel-sky px-3 py-3 relative">
            <div className="-mt-7 mb-2 mx-auto w-9 h-9 rounded-full bg-pastel-sky border-4 border-white flex items-center justify-center text-xs font-bold text-stone-700">
              {card.id.replace(/^I/, "")}
            </div>
            {!compact && (
              <p className="text-stone-700 text-xs leading-relaxed text-center">
                {card.description}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-1 py-3 bg-white">
            {card.icons.slice(0, 3).map((c) => (
              <CategoryBadge key={c} category={c} size={compact ? "sm" : "md"} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function voiceShort(v: string) {
  if (v.startsWith("Resident")) return "Resident";
  if (v.startsWith("Economy")) return "Economy";
  return "Environment";
}
