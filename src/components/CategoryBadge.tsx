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

export default function CategoryBadge({ category, size = "md", withLabel = false }: Props) {
  const c = CATEGORY_COLORS[category];
  const dim = size === "sm" ? 22 : size === "md" ? 32 : 40;
  const font = size === "sm" ? 12 : size === "md" ? 16 : 20;

  return (
    <span className="inline-flex items-center gap-2" title={CATEGORY_TOOLTIPS[category]}>
      <span
        aria-label={CATEGORY_LABELS[category]}
        className="inline-flex items-center justify-center rounded-full font-bold select-none"
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
      {withLabel && <span className="text-sm text-stone-700">{CATEGORY_LABELS[category]}</span>}
    </span>
  );
}
