import { useState } from "react";
import type { FinalReflections } from "../game/types";
import type { ImpactCategory } from "../data/categories";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_COLORS,
} from "../data/categories";
import ProgressBoard from "./ProgressBoard";
import PolishToolbar from "./PolishToolbar";
import type { PolishKind } from "../game/aiClient";

type Props = {
  reflections: FinalReflections | null;
  scores: Record<ImpactCategory, number>;
  highlighted: boolean;
  onUpdate: (patch: Partial<FinalReflections>) => void;
  onSubmit: () => void;
};

export default function FinalReflection({
  reflections,
  scores,
  highlighted,
  onUpdate,
  onSubmit,
}: Props) {
  const [addCase, setAddCase] = useState(false);

  const r: FinalReflections = reflections ?? {
    mostImportantImpact: "",
    missingImpacts: "",
    benefitsVsCosts: "",
    councilPriority: "",
  };

  const top = [...CATEGORY_ORDER]
    .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0))
    .filter((c) => (scores[c] ?? 0) > 0)
    .slice(0, 3);

  return (
    <section
      className={`bg-white/85 backdrop-blur rounded-3xl p-6 card-shadow ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="final_reflection"
    >
      <header className="flex items-start gap-4 mb-4">
        <img
          src="/Chief Analyst Robin.png"
          alt="Robin"
          className="w-20 h-20 object-contain"
        />
        <div>
          <h2 className="font-display text-3xl text-stone-800">A few final reflections</h2>
          <p className="text-stone-700 mt-1">
            Looking back at all six rounds, take a moment to step out of the cards.
          </p>
          {top.length > 0 && (
            <div className="text-sm text-stone-600 mt-2">
              Your evidence emphasised:{" "}
              {top.map((c, i) => (
                <span key={c}>
                  <span
                    className="font-semibold"
                    style={{ color: CATEGORY_COLORS[c].bg }}
                  >
                    {CATEGORY_LABELS[c]}
                  </span>
                  {i < top.length - 1 ? ", " : ""}
                </span>
              ))}
              .
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Field
          label="Which impact mattered most to you overall?"
          value={r.mostImportantImpact}
          onChange={(v) => onUpdate({ mostImportantImpact: v })}
          polishKind="reflection"
          polishContext="Question: Which impact mattered most to the analyst overall?"
        />
        <Field
          label="Were any important impacts missing from the game?"
          value={r.missingImpacts}
          onChange={(v) => onUpdate({ missingImpacts: v })}
          polishKind="reflection"
          polishContext="Question: Were any important impacts missing from the game?"
        />
        <Field
          label="Did the benefits of tourism outweigh the costs in the examples you discussed?"
          value={r.benefitsVsCosts}
          onChange={(v) => onUpdate({ benefitsVsCosts: v })}
          polishKind="reflection"
          polishContext="Question: Did the benefits of tourism outweigh the costs?"
        />
        <Field
          label="What should Edinburgh City Council pay most attention to?"
          value={r.councilPriority}
          onChange={(v) => onUpdate({ councilPriority: v })}
          polishKind="reflection"
          polishContext="Question: What should Edinburgh City Council pay most attention to?"
        />
      </div>

      <div className="mb-4">
        <ProgressBoard scores={scores} highlighted={false} recentlyUpdated={[]} />
      </div>

      <div className="bg-pastel-cream rounded-2xl p-4 border border-stone-100 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-display text-lg text-stone-800">
              Want to add one final case study?
            </div>
            <p className="text-sm text-stone-600">
              Is there anything important that the six rounds didn't capture?
            </p>
          </div>
          <button
            className={addCase ? "btn-ghost" : "btn-primary"}
            onClick={() => setAddCase((v) => !v)}
          >
            {addCase ? "Skip" : "Add one"}
          </button>
        </div>

        {addCase && (
          <div className="grid gap-3 mt-4">
            <Field
              label="Title for your final case study"
              value={r.finalCaseStudy?.title ?? ""}
              onChange={(v) =>
                onUpdate({
                  finalCaseStudy: {
                    title: v,
                    description: r.finalCaseStudy?.description ?? "",
                    evidence: r.finalCaseStudy?.evidence ?? "",
                    categories: r.finalCaseStudy?.categories ?? [],
                    whyMissing: r.finalCaseStudy?.whyMissing ?? "",
                  },
                })
              }
            />
            <Field
              label="What is it about?"
              value={r.finalCaseStudy?.description ?? ""}
              onChange={(v) =>
                onUpdate({
                  finalCaseStudy: {
                    title: r.finalCaseStudy?.title ?? "",
                    description: v,
                    evidence: r.finalCaseStudy?.evidence ?? "",
                    categories: r.finalCaseStudy?.categories ?? [],
                    whyMissing: r.finalCaseStudy?.whyMissing ?? "",
                  },
                })
              }
              polishKind="wildcard_description"
              polishContext={`Final case study titled: ${r.finalCaseStudy?.title ?? "(untitled)"}`}
            />
            <Field
              label="Concrete evidence or example"
              value={r.finalCaseStudy?.evidence ?? ""}
              onChange={(v) =>
                onUpdate({
                  finalCaseStudy: {
                    title: r.finalCaseStudy?.title ?? "",
                    description: r.finalCaseStudy?.description ?? "",
                    evidence: v,
                    categories: r.finalCaseStudy?.categories ?? [],
                    whyMissing: r.finalCaseStudy?.whyMissing ?? "",
                  },
                })
              }
              polishKind="evidence"
              polishContext={`Final case study titled: ${r.finalCaseStudy?.title ?? "(untitled)"}`}
            />
            <Field
              label="Why was this missing from the rounds?"
              value={r.finalCaseStudy?.whyMissing ?? ""}
              onChange={(v) =>
                onUpdate({
                  finalCaseStudy: {
                    title: r.finalCaseStudy?.title ?? "",
                    description: r.finalCaseStudy?.description ?? "",
                    evidence: r.finalCaseStudy?.evidence ?? "",
                    categories: r.finalCaseStudy?.categories ?? [],
                    whyMissing: v,
                  },
                })
              }
              polishKind="reflection"
              polishContext="Question: Why was this missing from the game's rounds?"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={onSubmit}>
          See final report →
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  polishKind,
  polishContext,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Omit to render a plain field with no Polish-with-AI affordance (e.g. titles). */
  polishKind?: PolishKind;
  polishContext?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
        {label}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={polishKind ? "Quick bullets are fine — polish with AI below." : undefined}
        className="w-full rounded-2xl border border-stone-200 px-3 py-2 bg-white resize-none"
      />
      {polishKind && (
        <PolishToolbar
          text={value}
          onChange={onChange}
          kind={polishKind}
          context={polishContext}
        />
      )}
    </label>
  );
}
