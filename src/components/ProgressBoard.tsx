import { useState } from "react";
import type { ImpactCategory } from "../data/categories";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_SHORT,
  CATEGORY_TOOLTIPS,
  CATEGORY_GLYPH,
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
 * Shows the running tally of markers per impact category, with a small
 * collapsible legend at the bottom so players can see what each icon /
 * colour stands for without having to hover individual badges.
 *
 * The board now stretches to fill its parent's vertical space (it sits next
 * to the Context card in the top row, and the two should match in height).
 */
export default function ProgressBoard({
  scores,
  highlighted,
  recentlyUpdated,
  totalSlots = 10,
}: Props) {
  const updatedSet = new Set(recentlyUpdated);
  const [legendOpen, setLegendOpen] = useState(true);

  return (
    <section
      className={`bg-white/85 backdrop-blur rounded-3xl p-5 card-shadow h-full flex flex-col ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="progress_board"
    >
      <header className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl text-stone-800">
              Impact Assessment Board
            </h2>
            <InfoChip label="What is this board?" ariaLabel="About the board">
              <p className="mb-2">
                Tourism affects five categories. Each round, your evidence adds
                a marker to one (or more) rows.
              </p>
              <p>
                The goal isn't a high score — it's the <strong>pattern</strong>{" "}
                you build across six rounds. A balanced spread vs. one tall
                column tells very different stories about what you noticed.
              </p>
              <p className="mt-2 text-xs text-stone-500">
                Tip: open the legend at the bottom to see what each icon means.
              </p>
            </InfoChip>
          </div>
          <p className="text-xs text-stone-500">
            Each round, your evidence adds a marker to one or more rows.
          </p>
        </div>
      </header>

      <ul className="space-y-2 flex-1">
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

      {/* Collapsible category legend */}
      <div className="mt-4 pt-3 border-t border-stone-200">
        <button
          type="button"
          onClick={() => setLegendOpen((v) => !v)}
          aria-expanded={legendOpen}
          className="w-full flex items-center justify-between text-left text-sm font-semibold text-stone-700 hover:text-stone-900"
        >
          <span className="flex items-center gap-2">
            <span aria-hidden>📖</span>
            <span>Card symbol legend</span>
          </span>
          <span
            className={`text-stone-500 transition-transform ${
              legendOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            ▾
          </span>
        </button>
        {legendOpen && (
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn">
            {CATEGORY_ORDER.map((cat) => {
              const colour = CATEGORY_COLORS[cat];
              return (
                <li
                  key={cat}
                  className="flex items-start gap-2 bg-white/70 rounded-xl p-2 border border-stone-100"
                >
                  <span
                    className="shrink-0 inline-flex items-center justify-center rounded-full font-bold text-white mt-0.5"
                    style={{
                      background: colour.bg,
                      width: 24,
                      height: 24,
                      fontSize: 13,
                    }}
                  >
                    {CATEGORY_GLYPH[cat]}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-stone-800 text-sm leading-tight">
                      {CATEGORY_LABELS[cat]}
                    </div>
                    <div className="text-xs text-stone-600 leading-snug mt-0.5">
                      {CATEGORY_TOOLTIPS[cat]}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
