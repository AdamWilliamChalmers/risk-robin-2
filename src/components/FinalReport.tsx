import type { CaseStudy, FinalReflections } from "../game/types";
import type { ImpactCategory } from "../data/categories";
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_COLORS } from "../data/categories";
import ProgressBoard from "./ProgressBoard";
import CategoryBadge from "./CategoryBadge";
import { buildJSON, buildCSV, downloadBlob } from "../game/export";

type Props = {
  caseStudies: CaseStudy[];
  scores: Record<ImpactCategory, number>;
  reflections: FinalReflections | null;
  highlighted: boolean;
  onRestart: () => void;
};

export default function FinalReport({
  caseStudies,
  scores,
  reflections,
  highlighted,
  onRestart,
}: Props) {
  const sorted = [...CATEGORY_ORDER].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
  const top = sorted.filter((c) => (scores[c] ?? 0) > 0).slice(0, 3);
  const stamp = new Date().toISOString().slice(0, 10);

  const exportJson = () =>
    downloadBlob(
      `risk-robin-session-${stamp}.json`,
      "application/json",
      buildJSON({ caseStudies, scores, reflections })
    );

  const exportCsv = () =>
    downloadBlob(
      `risk-robin-session-${stamp}.csv`,
      "text/csv",
      buildCSV({ caseStudies, scores, reflections })
    );

  const exportPdf = () => {
    // Triggers the browser's print dialog; the print stylesheet hides
    // everything except .printable-report so the user gets a clean PDF.
    window.print();
  };

  return (
    <section
      className={`bg-white/85 backdrop-blur rounded-3xl p-6 card-shadow printable-report ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="final_report"
    >
      <header className="flex items-start gap-4 mb-4 print-stack">
        <img
          src="/Chief Analyst Robin.png"
          alt="Robin"
          className="w-20 h-20 object-contain"
        />
        <div className="flex-1">
          <h2 className="font-display text-3xl text-stone-800">Final Impact Assessment</h2>
          <p className="text-stone-700 mt-1">
            Across {caseStudies.length} rounds, your case studies focused most strongly on:
          </p>
          <ol className="mt-2 space-y-1">
            {top.map((c, i) => (
              <li key={c} className="flex items-center gap-2 text-stone-800">
                <span className="text-xs text-stone-500 w-6">{i + 1}.</span>
                <CategoryBadge category={c} size="sm" />
                <span className="font-semibold">{CATEGORY_LABELS[c]}</span>
                <span
                  className="ml-2 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: CATEGORY_COLORS[c].bg + "22",
                    color: CATEGORY_COLORS[c].bg,
                  }}
                >
                  {scores[c]} markers
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col gap-2 no-print">
          <button className="btn-ghost" onClick={exportJson} title="Download JSON">
            ⬇ JSON
          </button>
          <button className="btn-ghost" onClick={exportCsv} title="Download CSV">
            ⬇ CSV
          </button>
          <button className="btn-ghost" onClick={exportPdf} title="Print or save as PDF">
            🖶 Print / PDF
          </button>
          <button className="btn-primary" onClick={onRestart}>
            ⟲ Play again
          </button>
        </div>
      </header>

      <div className="mb-6">
        <ProgressBoard scores={scores} highlighted={false} recentlyUpdated={[]} />
      </div>

      {reflections && (
        <div className="mb-6">
          <h3 className="font-display text-2xl text-stone-800 mb-3">Your reflections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Reflection label="Most important impact" value={reflections.mostImportantImpact} />
            <Reflection label="Missing impacts" value={reflections.missingImpacts} />
            <Reflection label="Benefits vs costs" value={reflections.benefitsVsCosts} />
            <Reflection label="Council priority" value={reflections.councilPriority} />
          </div>
          {reflections.finalCaseStudy && (
            <div className="mt-4 bg-pastel-lilac/40 rounded-2xl p-4 border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">
                Final case study added by analyst
              </div>
              <div className="font-display text-lg text-robinOrange">
                {reflections.finalCaseStudy.title || "(untitled)"}
              </div>
              {reflections.finalCaseStudy.description && (
                <p className="text-stone-800 mt-1">
                  {reflections.finalCaseStudy.description}
                </p>
              )}
              {reflections.finalCaseStudy.evidence && (
                <p className="text-stone-700 italic mt-2">
                  "{reflections.finalCaseStudy.evidence}"
                </p>
              )}
              {reflections.finalCaseStudy.whyMissing && (
                <p className="text-sm text-stone-600 mt-2">
                  <strong>Why it was missing:</strong> {reflections.finalCaseStudy.whyMissing}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="font-display text-2xl text-stone-800 mb-3">Case studies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseStudies.map((cs) => {
            const isWild = !!cs.selectedImpact.isWildcard;
            return (
              <article
                key={cs.roundNumber}
                className="bg-pastel-cream rounded-2xl p-4 border border-stone-100"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs uppercase tracking-wider text-stone-500">
                    Round {cs.roundNumber}
                  </div>
                  <div className="flex gap-1">
                    {cs.categoriesUpdated.map((c) => (
                      <CategoryBadge key={c} category={c} size="sm" />
                    ))}
                  </div>
                </div>
                <h4 className="font-display text-lg text-robinOrange">{cs.robinTitle}</h4>
                <div className="text-xs text-stone-600 mb-2">
                  Context: <strong>{cs.contextCard.title}</strong> · Impact:{" "}
                  <strong>
                    {isWild ? cs.wildcardTitle || "Wild Card" : cs.selectedImpact.title}
                  </strong>
                </div>
                {cs.playerEvidence && (
                  <div className="text-sm italic text-stone-700">
                    "{cs.playerEvidence}"
                  </div>
                )}
                {(cs.importance || cs.valence || cs.councilPriority) && (
                  <div className="flex flex-wrap gap-1 mt-2 text-[11px] text-stone-600">
                    {cs.importance && <span>★ {cs.importance}/5</span>}
                    {cs.valence && <span>· {cs.valence}</span>}
                    {cs.councilPriority && <span>· council: {cs.councilPriority}</span>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Reflection({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-stone-100 text-sm">
      <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
        {label}
      </div>
      <div className="text-stone-800 whitespace-pre-line">
        {value?.trim() ? value : <span className="italic text-stone-400">(blank)</span>}
      </div>
    </div>
  );
}
