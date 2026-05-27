import type { ImpactCard as ImpactCardT } from "../data/impactCards";
import { useResolvedPersona } from "../game/personaNamesContext";
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
 * Every card uses the same fixed slot heights so a row of cards is perfectly
 * uniform regardless of how short or long any individual title or description
 * is. The PNG-baked card (I1) is sized to match the same outer dimensions.
 */

const BAND_BLUE = "#7A97CD";
const BODY_BLUE = "#DDEAF4";

// Per-mode dimensions tuned to keep every card identical in a row.
const DIMS = {
  compact: {
    width: 176, // w-44
    height: 256,
    titleHeight: 86,
    bandHeight: 22,
    footerHeight: 48,
    numCircle: 28,
    numFont: 12,
    titleFont: "text-[13px] leading-tight",
    bodyFont: "text-[11px] leading-snug",
    iconSize: "sm" as const,
  },
  full: {
    width: 240, // w-60
    height: 340,
    titleHeight: 110,
    bandHeight: 28,
    footerHeight: 64,
    numCircle: 34,
    numFont: 14,
    titleFont: "text-base sm:text-lg leading-tight",
    bodyFont: "text-xs sm:text-sm leading-relaxed",
    iconSize: "md" as const,
  },
};

export default function ImpactCard({
  card,
  selected,
  recommendedBy,
  onClick,
  compact,
}: Props) {
  const isClickable = !!onClick;
  const dims = compact ? DIMS.compact : DIMS.full;
  const hasRibbon = !!recommendedBy && recommendedBy.length > 0;

  // Number shown on the card. Strip the leading "I" used for IDs, and show a
  // star for wildcards (they have no printed number).
  const displayNum = card.isWildcard ? "✦" : card.id.replace(/^I/, "");

  return (
    <div
      role={isClickable ? "button" : undefined}
      onClick={onClick}
      className={[
        "relative rounded-2xl card-shadow overflow-hidden bg-white flex flex-col shrink-0",
        isClickable
          ? "cursor-pointer hover:-translate-y-1 transition-transform"
          : "",
        selected ? "ring-4 ring-robinOrange" : "",
      ].join(" ")}
      style={{ width: dims.width, height: dims.height }}
    >
      {/* Recommended-by ribbon. Each tag is tinted with the persona's brand
          colour so a quick glance at the card tells you *which* local picked
          it. Absolutely positioned so the pills never affect the card's
          internal layout / heights. */}
      {hasRibbon && (
        <div className="absolute top-1 right-1 z-10 flex flex-wrap justify-end gap-1 pointer-events-none max-w-[80%]">
          {recommendedBy!.map((v) => (
            <RecommenderPill key={v} voice={v} />
          ))}
        </div>
      )}

      {card.image ? (
        <img
          src={`/${card.image}`}
          alt={card.title}
          className="block w-full h-full object-cover"
        />
      ) : (
        <>
          {/* Title strip - fixed height, title vertically centred */}
          <div
            className="px-3 text-center bg-white flex items-center justify-center"
            style={{ height: dims.titleHeight }}
          >
            <h4
              className={`font-display font-bold text-stone-800 ${dims.titleFont}`}
            >
              {card.title}
            </h4>
          </div>

          {/* Solid blue band with floating white number disc */}
          <div
            className="relative flex items-center justify-center shrink-0"
            style={{ background: BAND_BLUE, height: dims.bandHeight }}
          >
            <div
              className="absolute flex items-center justify-center rounded-full bg-white text-stone-700 font-semibold shadow-sm"
              style={{
                width: dims.numCircle,
                height: dims.numCircle,
                fontSize: dims.numFont,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              {displayNum}
            </div>
          </div>

          {/* Light blue description body - takes all remaining space */}
          <div
            className="flex-1 px-3 py-3 flex items-start justify-center overflow-hidden"
            style={{ background: BODY_BLUE }}
          >
            <p
              className={`text-stone-700 text-center ${dims.bodyFont}`}
            >
              {card.description}
            </p>
          </div>

          {/* White footer strip with icons - fixed height */}
          <div
            className="flex items-center justify-center gap-2 bg-white shrink-0"
            style={{ height: dims.footerHeight }}
          >
            {card.icons.length > 0 ? (
              card.icons
                .slice(0, 4)
                .map((c) => (
                  <CategoryBadge
                    key={c}
                    category={c}
                    size={dims.iconSize}
                  />
                ))
            ) : null}
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

/**
 * Small coloured pill identifying which persona recommended this card.
 * Extracted so we can call the `useResolvedPersona` hook (and pick up the
 * per-game LLM-generated name) for each pill in the list.
 */
function RecommenderPill({ voice }: { voice: string }) {
  const p = useResolvedPersona(voice);
  const label = p?.shortName ?? voiceShort(voice);
  const title = p
    ? `${p.name} (${p.role}) recommends this`
    : `${voice} recommends this`;
  const accent = p?.color ?? "#7C3E97";
  return (
    <span
      className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full shadow"
      style={{ background: accent }}
      title={title}
    >
      {label}
    </span>
  );
}
