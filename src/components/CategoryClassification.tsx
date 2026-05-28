import type { ImpactCategory } from "../data/categories";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_TOOLTIPS,
} from "../data/categories";
import CategoryBadge from "./CategoryBadge";
import InfoChip from "./InfoChip";

type Props = {
  proposed: ImpactCategory[];
  userSelected: ImpactCategory[];
  highlighted: boolean;
  onToggle: (c: ImpactCategory) => void;
  onConfirm: () => void;
};

export default function CategoryClassification({
  proposed,
  userSelected,
  highlighted,
  onToggle,
  onConfirm,
}: Props) {
  const proposedSet = new Set(proposed);
  const userSet = new Set(userSelected);
  const ready = userSet.size > 0;

  return (
    <section
      className={`bg-white/85 backdrop-blur rounded-3xl p-5 card-shadow ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="classify"
    >
      <header className="mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl text-stone-800">Where on the board?</h2>
          <InfoChip label="Classifying on the board" ariaLabel="About classification">
            <p className="mb-2">
              Each impact can affect one <em>or more</em> of the six categories.
              The ones you tick here will each get a new marker on the
              Impact Assessment Board.
            </p>
            <p className="mb-2">
              I've ticked my best guess. <strong>You can disagree</strong> —
              click any row to add or remove it.
            </p>
            <p className="text-xs text-stone-500">
              Hover any row to see what it covers.
            </p>
          </InfoChip>
        </div>
        <p className="text-sm text-stone-600">
          Robin suggested {proposed.length === 1 ? "one category" : "these categories"}.
          Confirm or adjust — your choice decides which row gets the marker.
        </p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CATEGORY_ORDER.map((c) => {
          const isProposed = proposedSet.has(c);
          const isChecked = userSet.has(c);
          const colour = CATEGORY_COLORS[c];
          return (
            <li key={c}>
              <button
                onClick={() => onToggle(c)}
                className={[
                  "w-full flex items-center gap-3 rounded-2xl px-3 py-2 border-2 text-left transition-all",
                  isChecked
                    ? "bg-white shadow-sm"
                    : "bg-pastel-cream hover:bg-white",
                ].join(" ")}
                style={{
                  borderColor: isChecked ? colour.bg : "transparent",
                }}
                title={CATEGORY_TOOLTIPS[c]}
              >
                <CategoryBadge category={c} size="md" />
                <div className="flex-1">
                  <div className="font-semibold text-stone-800 text-sm">
                    {CATEGORY_LABELS[c]}
                  </div>
                  {isProposed && (
                    <div className="text-[11px] uppercase tracking-wider text-robinOrange">
                      Robin's suggestion
                    </div>
                  )}
                </div>
                <span
                  aria-hidden
                  className={[
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center text-white text-xs font-bold",
                    isChecked ? "" : "bg-white",
                  ].join(" ")}
                  style={{
                    borderColor: colour.bg,
                    background: isChecked ? colour.bg : "white",
                  }}
                >
                  {isChecked ? "✓" : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-end mt-4">
        <button
          data-cta="submit"
          className="btn-primary disabled:opacity-40"
          disabled={!ready}
          onClick={onConfirm}
        >
          Confirm and add to board →
        </button>
      </div>
    </section>
  );
}
