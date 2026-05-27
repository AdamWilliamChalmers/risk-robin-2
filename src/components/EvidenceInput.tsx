import { useEffect, useState } from "react";
import type { ImpactCard } from "../data/impactCards";
import InfoChip from "./InfoChip";
import PolishToolbar from "./PolishToolbar";

type Props = {
  selectedImpact: ImpactCard;
  wildcardDraft: { title: string; description: string };
  onUpdateWildcard: (patch: { title?: string; description?: string }) => void;
  onSubmit: (evidence: string) => void;
  onReconsider: () => void;
  highlighted: boolean;
};

export default function EvidenceInput({
  selectedImpact,
  wildcardDraft,
  onUpdateWildcard,
  onSubmit,
  onReconsider,
  highlighted,
}: Props) {
  const [evidence, setEvidence] = useState("");
  const isWild = selectedImpact.isWildcard;

  // Reset evidence when the selected impact changes.
  useEffect(() => {
    setEvidence("");
  }, [selectedImpact.id]);

  const wildTitleOk = !isWild || wildcardDraft.title.trim().length > 0;
  const canSubmit = wildTitleOk && evidence.trim().length > 0;

  return (
    <section
      className={`bg-white/80 backdrop-blur rounded-3xl p-5 card-shadow ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="evidence_input"
    >
      <header className="mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl text-stone-800">Give your evidence</h2>
          <InfoChip label="What counts as evidence?" ariaLabel="About evidence">
            <p className="mb-2">
              A short, <strong>concrete</strong> example from real life — a
              place, a moment, a routine, something someone said.
            </p>
            <p className="mb-2">
              You don't need facts or stats. A specific story is better than a
              general statement.
            </p>
            <p className="text-xs text-stone-500">
              Good: "On Cockburn Street last August the tour groups blocked the
              pavement most afternoons."<br />
              Less useful: "Tourism causes overcrowding."
            </p>
          </InfoChip>
        </div>
        <p className="text-sm text-stone-600">
          Concrete examples — a place, a moment, a person, a routine — matter more than
          abstract opinions.
        </p>
      </header>

      {isWild && (
        <div className="mb-4 grid gap-3 bg-pastel-lilac/50 rounded-2xl p-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
              Your impact title
            </label>
            <input
              value={wildcardDraft.title}
              onChange={(e) => onUpdateWildcard({ title: e.target.value })}
              placeholder="A short name for the impact you’re describing"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
              What is this impact about? (optional)
            </label>
            <textarea
              value={wildcardDraft.description}
              onChange={(e) => onUpdateWildcard({ description: e.target.value })}
              placeholder="Quick bullets are fine — you can polish below."
              rows={2}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 bg-white"
            />
            <PolishToolbar
              text={wildcardDraft.description}
              onChange={(v) => onUpdateWildcard({ description: v })}
              kind="wildcard_description"
              context={wildcardDraft.title ? `Impact title: ${wildcardDraft.title}` : undefined}
              minLength={12}
            />
          </div>
        </div>
      )}

      <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
        Your example / evidence
      </label>
      <textarea
        value={evidence}
        onChange={(e) => setEvidence(e.target.value)}
        rows={5}
        placeholder='Bullets are fine — e.g. "buses full in August", "tour groups on Cockburn St", "noise after 11pm". Polish with AI when you’re ready.'
        className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 bg-white resize-none"
      />
      <PolishToolbar
        text={evidence}
        onChange={setEvidence}
        kind="evidence"
        context={
          isWild
            ? `Impact (analyst-written): ${wildcardDraft.title || "(untitled)"}`
            : `Impact card: ${selectedImpact.title}`
        }
      />
      <div className="flex items-center justify-between mt-3 gap-2">
        <button
          type="button"
          onClick={handleReconsider}
          className="text-sm text-stone-600 hover:text-robinOrange underline-offset-2 hover:underline"
          title="Go back and pick a different impact card"
        >
          ← Pick a different card
        </button>
        <button
          disabled={!canSubmit}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onSubmit(evidence.trim())}
        >
          Submit evidence →
        </button>
      </div>
    </section>
  );

  function handleReconsider() {
    const dirty =
      evidence.trim().length > 0 ||
      (isWild &&
        (wildcardDraft.title.trim().length > 0 ||
          wildcardDraft.description.trim().length > 0));
    if (
      dirty &&
      !window.confirm(
        "Pick a different card? Your draft evidence for this card will be cleared."
      )
    ) {
      return;
    }
    onReconsider();
  }
}
