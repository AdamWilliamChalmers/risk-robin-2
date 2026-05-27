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
 * Renders an Impact Card to match the printed PDF design:
 *  - white title strip with bold display title
 *  - solid periwinkle-blue band with a white number disc
 *  - light-blue body holding the description
 *  - white footer strip with the category icon(s)
 *
 * Card I1 has a pre-baked PNG; everything else is rendered with HTML so the
 * numbers (1–73) and the icons can come straight from the data file.
 */

// Exact colours sampled from the printed PDF card (impact_1.png).
const BAND_BLUE = "#7A97CD";
const BODY_BLUE = "#DDEAF4";

export default function ImpactCard({ card, selected, recommendedBy, onClick, compact }: Props) {
  const isClickable = !!onClick;
  const widthClass = compact ? "w-44" : "w-60";
  const hasRibbon = !!recommendedBy && recommendedBy.length > 0;

  // Number shown on the card. Strip the leading "I" used for IDs, and show a
  // dash for wildcards (they have no printed number).
  const displayNum = card.isWildcard ? "✦" : card.id.replace(/^I/, "");

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
      {/* Recommended-by ribbon. Sits above the title strip so it never
          overlaps the card content. */}
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
          {/* White title strip */}
          <div
            className={`px-3 ${compact ? "pt-4 pb-3" : "pt-5 pb-4"} text-center bg-white`}
          >
            <h4
              className={`font-display ${
                compact ? "text-sm leading-snug" : "text-base sm:text-lg leading-tight"
              } font-bold text-stone-800`}
            >
              {card.title}
            </h4>
          </div>

          {/* Solid blue band with floating white number disc */}
          <div
            className="relative flex items-center justify-center"
            style={{
              background: BAND_BLUE,
              height: compact ? 22 : 28,
            }}
          >
            <div
              className="absolute flex items-center justify-center rounded-full bg-white text-stone-700 font-semibold shadow-sm"
              style={{
                width: compact ? 28 : 34,
                height: compact ? 28 : 34,
                fontSize: compact ? 12 : 14,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              {displayNum}
            </div>
          </div>

          {/* Light blue description body */}
          <div
            className={`px-4 ${compact ? "py-3" : "py-4"}`}
            style={{ background: BODY_BLUE }}
          >
            {!compact && (
              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed text-center">
                {card.description}
              </p>
            )}
            {compact && (
              <p className="text-stone-700 text-[11px] leading-snug text-center line-clamp-3">
                {card.description}
              </p>
            )}
          </div>

          {/* White footer strip with icons */}
          <div className="flex justify-center gap-2 py-3 bg-white">
            {card.icons.length > 0 ? (
              card.icons.slice(0, 4).map((c) => (
                <CategoryBadge key={c} category={c} size={compact ? "sm" : "md"} />
              ))
            ) : (
              // Wildcards have no icons; keep the footer height consistent.
              <div style={{ height: compact ? 22 : 32 }} />
            )}
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
