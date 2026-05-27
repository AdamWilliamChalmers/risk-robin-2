import { useEffect, useState } from "react";
import { polishText, type PolishKind } from "../game/aiClient";

type Props = {
  /** Current text value (the textarea's controlled value). */
  text: string;
  /** Called with the polished text — or with the original on Revert. */
  onChange: (next: string) => void;
  /** Drives the length/tone prompt on the server. */
  kind: PolishKind;
  /** Optional surrounding context for grounding (e.g. "Context: Cruise day"). */
  context?: string;
  /** Don't enable the button until the user has written at least this much. */
  minLength?: number;
  /** Optional label override. Defaults to "Polish with AI". */
  label?: string;
};

/**
 * A small toolbar that sits below a textarea. The user writes bullets /
 * rough notes, clicks "Polish with AI", and we rewrite their text in
 * place. The toolbar also offers a one-click Revert until they edit
 * the polished text again (at which point Revert disappears, because
 * "original" would no longer correspond to anything they'd recognise).
 *
 * Failures are silent: if the proxy is down or the model returns
 * nonsense, the user's text is untouched and a small "couldn't polish"
 * note appears for a few seconds. The fallback is "your draft is still
 * there", which is always acceptable.
 */
export default function PolishToolbar({
  text,
  onChange,
  kind,
  context,
  minLength = 10,
  label = "Polish with AI",
}: Props) {
  const [busy, setBusy] = useState(false);
  const [original, setOriginal] = useState<string | null>(null);
  const [polishedTarget, setPolishedTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If the user edits the text after a polish, drop the revert affordance —
  // it would otherwise restore a draft that doesn't match what's on screen.
  useEffect(() => {
    if (polishedTarget !== null && text !== polishedTarget) {
      setOriginal(null);
      setPolishedTarget(null);
    }
  }, [text, polishedTarget]);

  // Clear transient error after a beat so the row doesn't stay red.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4500);
    return () => clearTimeout(t);
  }, [error]);

  const canPolish = !busy && text.trim().length >= minLength;

  const handlePolish = async () => {
    if (!canPolish) return;
    setBusy(true);
    setError(null);
    const before = text;
    const result = await polishText({ rawText: before, kind, context });
    setBusy(false);
    if (!result) {
      setError("Couldn't polish — your text is unchanged.");
      return;
    }
    if (result.trim() === before.trim()) {
      // Model returned the input unchanged. Don't offer revert (nothing to revert).
      return;
    }
    setOriginal(before);
    setPolishedTarget(result);
    onChange(result);
  };

  const handleRevert = () => {
    if (original === null) return;
    onChange(original);
    setOriginal(null);
    setPolishedTarget(null);
  };

  // Ready = the user has written enough that polish is actually useful, and
  // we haven't already polished this draft. We use this to make the pill
  // visually invite a click (gradient + subtle pulse) only when it'll do
  // something useful.
  const ready = canPolish && original === null;

  return (
    <div className="flex items-center justify-between gap-3 mt-2 text-sm flex-wrap">
      <div className="text-stone-500 italic min-w-0" aria-live="polite">
        {busy && (
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block w-3 h-3 rounded-full border-2 border-fuchsia-400 border-t-transparent animate-spin"
            />
            <span>Polishing your notes…</span>
          </span>
        )}
        {!busy && error && <span className="text-rose-600 not-italic">{error}</span>}
        {!busy && !error && original !== null && (
          <button
            type="button"
            onClick={handleRevert}
            className="text-stone-500 hover:text-stone-800 underline underline-offset-2 not-italic"
          >
            ↶ Revert to your original
          </button>
        )}
        {!busy && !error && original === null && (
          <span className="text-stone-400">
            Quick bullets are fine — polish when you're ready.
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handlePolish}
        disabled={!canPolish}
        title={
          text.trim().length < minLength
            ? `Write a little more first (at least ${minLength} characters).`
            : "Rewrite your notes as clean prose. You can edit after."
        }
        className={[
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
          "border-2",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
          ready
            ? // Eye-catching: lilac→rose pastel gradient, magenta border, soft
              // glow, hover lift. Static — no pulsing, that gets distracting.
              "text-fuchsia-700 border-fuchsia-300 bg-gradient-to-r from-pastel-lilac to-pastel-rose shadow-[0_4px_14px_-2px_rgba(217,70,239,0.35)] hover:shadow-[0_6px_18px_-2px_rgba(217,70,239,0.5)] hover:-translate-y-0.5 hover:border-fuchsia-500"
            : // Inactive / already-polished: still recognisable but quiet.
              "text-stone-600 border-stone-200 bg-white hover:bg-white",
        ].join(" ")}
      >
        <span aria-hidden className="text-lg leading-none">✨</span>
        <span>{busy ? "Polishing…" : label}</span>
      </button>
    </div>
  );
}
