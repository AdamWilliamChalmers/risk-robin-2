import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_GLYPH,
  CATEGORY_TOOLTIPS,
  type ImpactCategory,
} from "../data/categories";

type Props = {
  category: ImpactCategory;
  size?: "sm" | "md" | "lg";
  withLabel?: boolean;
};

/**
 * Coloured circular badge representing an impact category.
 *
 * The badge carries a rich native tooltip with the category's full name and
 * description. We intentionally avoid a JS hover-popover here because the
 * badges live inside `overflow-hidden` cards where an absolutely-positioned
 * popover would get clipped. For a comprehensive on-screen reference, see
 * the collapsible legend in the Impact Assessment board.
 */
export default function CategoryBadge({
  category,
  size = "md",
  withLabel = false,
}: Props) {
  const c = CATEGORY_COLORS[category];
  const dim = size === "sm" ? 22 : size === "md" ? 32 : 40;
  const font = size === "sm" ? 12 : size === "md" ? 16 : 20;
  const tooltip = `${CATEGORY_LABELS[category]} — ${CATEGORY_TOOLTIPS[category]}`;

  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-label={CATEGORY_LABELS[category]}
        title={tooltip}
        tabIndex={0}
        className="inline-flex items-center justify-center rounded-full font-bold select-none cursor-help focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-stone-400"
        style={{
          background: c.bg,
          color: c.text,
          width: dim,
          height: dim,
          fontSize: font,
          boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.10)",
        }}
      >
        {CATEGORY_GLYPH[category]}
      </span>
      {withLabel && (
        <span className="text-sm text-stone-700">
          {CATEGORY_LABELS[category]}
        </span>
      )}
    </span>
  );
}
