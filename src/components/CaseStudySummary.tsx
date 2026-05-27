import type { CaseStudy } from "../game/types";
import CategoryBadge from "./CategoryBadge";

type Props = {
  caseStudy: CaseStudy;
  highlighted: boolean;
};

export default function CaseStudySummary({ caseStudy, highlighted }: Props) {
  const isWild = !!caseStudy.selectedImpact.isWildcard;
  return (
    <section
      className={`bg-pastel-cream rounded-3xl p-5 card-shadow animate-fadeIn ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="summary"
    >
      <header className="flex items-center justify-between mb-2">
        <h2 className="font-display text-xl text-stone-800">
          Robin's Case Study — Round {caseStudy.roundNumber}
        </h2>
        <div className="flex gap-1">
          {caseStudy.categoriesUpdated.map((c) => (
            <CategoryBadge key={c} category={c} size="md" />
          ))}
        </div>
      </header>

      <h3 className="font-display text-lg text-robinOrange mb-2">{caseStudy.robinTitle}</h3>

      <p className="text-stone-800 leading-relaxed mb-3">
        {renderRobinBold(caseStudy.robinSummary)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-sm">
        <Tile label="Context" value={caseStudy.contextCard.title} />
        <Tile
          label="Impact"
          value={isWild ? caseStudy.wildcardTitle || "Analyst's own impact" : caseStudy.selectedImpact.title}
        />
      </div>

      {caseStudy.playerEvidence && (
        <Quote label="Your evidence" text={caseStudy.playerEvidence} />
      )}
      {caseStudy.followUpAnswer && (
        <Quote label="Follow-up answer" text={caseStudy.followUpAnswer} />
      )}

      {(caseStudy.importance || caseStudy.valence || caseStudy.councilPriority) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {caseStudy.importance && (
            <Pill label={`Importance: ${caseStudy.importance}/5`} />
          )}
          {caseStudy.valence && <Pill label={`Mostly ${caseStudy.valence}`} />}
          {caseStudy.councilPriority && (
            <Pill label={`Council: ${caseStudy.councilPriority}`} />
          )}
          {caseStudy.userConfirmedCategories ? (
            <Pill label="Robin's categories confirmed" />
          ) : (
            <Pill label="Categories adjusted by analyst" />
          )}
        </div>
      )}
    </section>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-stone-100">
      <div className="text-[11px] uppercase tracking-wide text-stone-500 mb-1">
        {label}
      </div>
      <div className="font-semibold text-stone-800">{value}</div>
    </div>
  );
}

function Quote({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-stone-100 mt-3 text-sm">
      <div className="text-[11px] uppercase tracking-wide text-stone-500 mb-1">
        {label}
      </div>
      <div className="text-stone-800 italic">"{text}"</div>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="text-xs bg-white border border-stone-200 rounded-full px-2.5 py-1 text-stone-700">
      {label}
    </span>
  );
}

function renderRobinBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="text-stone-900">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}
