import type { ImpactCategory } from "../data/categories";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_SHORT,
  CATEGORY_TOOLTIPS,
} from "../data/categories";
import InfoChip from "./InfoChip";

type Props = {
  scores: Record<ImpactCategory, number>;
  highlighted: boolean;
  recentlyUpdated: ImpactCategory[];
  totalSlots?: number;
};

/**
 * The Impact Assessment board.
 *
 * The original `progress board.png` is shown as a decorative visual anchor in
 * the corner; the *programmatic* board sits next to it so we can render
 * accessible state, animate updates, and remain accurate. This keeps the
 * board looking like the physical game while staying fully reactive.
 */
export default function ProgressBoard({
  scores,
  highlighted,
  recentlyUpdated,
  totalSlots = 10,
}: Props) {
  const updatedSet = new Set(recentlyUpdated);

  return (
    <section
      className={`bg-white/85 backdrop-blur rounded-3xl p-5 card-shadow ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="progress_board"
    >
      <header className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl text-stone-800">
              Impact Assessment Board
            </h2>
            <InfoChip label="What is this board?" ariaLabel="About the board">
              <p className="mb-2">
                Tourism affects six categories. Each round, your evidence adds a
                marker to one (or more) rows.
              </p>
              <p>
                The goal isn't a high score — it's the <strong>pattern</strong>{" "}
                you build across six rounds. A balanced spread vs. one tall
                column tells very different stories about what you noticed.
              </p>
              <p className="mt-2 text-xs text-stone-500">
                Tip: hover any row to see what it covers.
              </p>
            </InfoChip>
          </div>
          <p className="text-xs text-stone-500">
            Each round, your evidence adds a marker to one or more rows.
          </p>
        </div>
        <img
          src="/progress board.png"
          alt=""
          className="hidden sm:block w-28 rounded-xl shadow-sm opacity-90"
        />
      </header>

      <ul className="space-y-2">
        {CATEGORY_ORDER.map((cat) => {
          const count = scores[cat] ?? 0;
          const colour = CATEGORY_COLORS[cat];
          const isUpdated = updatedSet.has(cat);
          return (
            <li key={cat} title={CATEGORY_TOOLTIPS[cat]}>
              <div className="flex items-center gap-3">
                <span
                  className="shrink-0 rounded-full font-bold flex items-center justify-center text-white"
                  style={{ background: colour.bg, width: 26, height: 26, fontSize: 14 }}
                >
                  {count}
                </span>
                <span className="font-semibold text-stone-800 text-sm w-40 shrink-0">
                  <span className="hidden sm:inline">{CATEGORY_LABELS[cat]}</span>
                  <span className="sm:hidden">{CATEGORY_SHORT[cat]}</span>
                </span>
                <ol className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: totalSlots }).map((_, i) => {
                    const filled = i < count;
                    const justFilled = isUpdated && i === count - 1;
                    return (
                      <li
                        key={i}
                        className={`rounded-full border-2 ${
                          justFilled ? "animate-pop" : ""
                        }`}
                        style={{
                          width: 18,
                          height: 18,
                          borderColor: filled ? colour.bg : "#e7e5e4",
                          background: filled ? colour.bg : "transparent",
                          boxShadow: justFilled
                            ? `0 0 0 4px ${colour.bg}33, 0 0 14px ${colour.bg}66`
                            : "none",
                        }}
                      />
                    );
                  })}
                </ol>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
