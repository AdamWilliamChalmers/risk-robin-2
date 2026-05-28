import { useState } from "react";
import PolishToolbar from "./PolishToolbar";

type Props = {
  question: string;
  highlighted: boolean;
  onSubmit: (answer: string) => void;
  onSkip: () => void;
  onReconsider: () => void;
};

export default function FollowUpInput({ question, highlighted, onSubmit, onSkip, onReconsider }: Props) {
  const [text, setText] = useState("");
  return (
    <section
      className={`bg-pastel-peachLight rounded-3xl p-5 card-shadow ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="follow_up"
    >
      <header className="mb-3">
        <h2 className="font-display text-xl text-stone-800">Robin's follow-up</h2>
        <p className="text-stone-700 mt-1">{question}</p>
      </header>
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Bullets are fine — a place, a time, a person. You can polish below."
        className="w-full rounded-2xl border border-stone-200 px-3 py-3 bg-white resize-none"
      />
      <PolishToolbar
        text={text}
        onChange={setText}
        kind="follow_up"
        context={`Robin asked: ${question}`}
      />
      <div className="flex items-center justify-between gap-2 mt-3">
        <button
          type="button"
          onClick={() => {
            if (
              text.trim().length > 0 &&
              !window.confirm(
                "Pick a different card? Your draft answer to Robin's follow-up will be cleared."
              )
            ) {
              return;
            }
            onReconsider();
          }}
          className="text-sm text-stone-600 hover:text-robinOrange underline-offset-2 hover:underline"
          title="Go back and pick a different impact card"
        >
          ← Pick a different card
        </button>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={onSkip}>
            Skip
          </button>
          <button
            data-cta="submit"
            className="btn-primary disabled:opacity-40"
            disabled={text.trim().length === 0}
            onClick={() => onSubmit(text.trim())}
          >
            Add this →
          </button>
        </div>
      </div>
    </section>
  );
}
