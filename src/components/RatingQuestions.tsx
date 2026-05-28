import type {
  CouncilPriority,
  Importance,
  Ratings,
  Valence,
} from "../game/types";
import InfoChip from "./InfoChip";

type Props = {
  draft: Ratings;
  highlighted: boolean;
  onUpdate: (patch: Partial<Ratings>) => void;
  onSubmit: () => void;
  onReconsider: () => void;
};

const IMPORTANCE_OPTIONS: { value: Importance; label: string }[] = [
  { value: 1, label: "Not very important" },
  { value: 2, label: "Somewhat important" },
  { value: 3, label: "Important" },
  { value: 4, label: "Very important" },
  { value: 5, label: "Extremely important" },
];

const VALENCE_OPTIONS: { value: Valence; label: string }[] = [
  { value: "positive", label: "Mostly positive" },
  { value: "negative", label: "Mostly negative" },
  { value: "mixed",    label: "Mixed" },
  { value: "unsure",   label: "Unsure" },
];

const COUNCIL_OPTIONS: { value: CouncilPriority; label: string }[] = [
  { value: "high",   label: "Yes — high priority" },
  { value: "medium", label: "Yes — medium priority" },
  { value: "low",    label: "Low priority" },
  { value: "unsure", label: "Not sure" },
];

export default function RatingQuestions({
  draft,
  highlighted,
  onUpdate,
  onSubmit,
  onReconsider,
}: Props) {
  const ready =
    draft.importance !== null &&
    draft.valence !== null &&
    draft.councilPriority !== null;

  const handleReconsider = () => {
    const dirty =
      draft.importance !== null ||
      draft.valence !== null ||
      draft.councilPriority !== null;
    if (
      dirty &&
      !window.confirm(
        "Pick a different card? Your evidence and ratings for this card will be cleared."
      )
    ) {
      return;
    }
    onReconsider();
  };

  return (
    <section
      className={`bg-white/85 backdrop-blur rounded-3xl p-5 card-shadow ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="ratings"
    >
      <header className="mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl text-stone-800">A few quick questions</h2>
          <InfoChip label="Why these three questions?" ariaLabel="About the ratings">
            <p className="mb-2">
              They capture <em>how you feel</em> about this impact, separate
              from what category it sits in.
            </p>
            <ul className="space-y-1 text-xs">
              <li>
                <strong>Importance</strong> — how much weight does this carry
                for you?
              </li>
              <li>
                <strong>Positive / negative</strong> — is this impact mostly
                good, mostly bad, mixed, or genuinely hard to say?
              </li>
              <li>
                <strong>Council priority</strong> — should Edinburgh City
                Council put resources behind addressing this?
              </li>
            </ul>
            <p className="mt-2 text-xs text-stone-500">
              No right answers. Pick what feels honest — takes about 10 seconds.
            </p>
          </InfoChip>
        </div>
        <p className="text-sm text-stone-600">
          These help us understand your preferences — there are no right answers.
        </p>
      </header>

      <div className="grid gap-5">
        <Group
          label="How important is this impact?"
          options={IMPORTANCE_OPTIONS}
          value={draft.importance}
          onChoose={(v) => onUpdate({ importance: v })}
        />
        <Group
          label="Is this impact mostly positive, mostly negative, or mixed?"
          options={VALENCE_OPTIONS}
          value={draft.valence}
          onChoose={(v) => onUpdate({ valence: v })}
        />
        <Group
          label="Should Edinburgh City Council pay more attention to this?"
          options={COUNCIL_OPTIONS}
          value={draft.councilPriority}
          onChoose={(v) => onUpdate({ councilPriority: v })}
        />
      </div>

      <div className="flex items-center justify-between mt-5 gap-2">
        <button
          type="button"
          onClick={handleReconsider}
          className="text-sm text-stone-600 hover:text-robinOrange underline-offset-2 hover:underline"
          title="Go back and pick a different impact card"
        >
          ← Pick a different card
        </button>
        <button
          data-cta="submit"
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={!ready}
          onClick={onSubmit}
        >
          Continue →
        </button>
      </div>
    </section>
  );
}

function Group<T extends string | number>({
  label,
  options,
  value,
  onChoose,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChoose: (v: T) => void;
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-stone-800 mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onChoose(opt.value)}
              className={[
                "px-3 py-1.5 rounded-full text-sm border transition-all",
                selected
                  ? "bg-robinOrange text-white border-robinOrange shadow"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-400",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
