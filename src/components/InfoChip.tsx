import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  /** Short heading shown at the top of the popover. */
  label: string;
  /** Popover body — string or rich React content. */
  children: ReactNode;
  /** Accessible label for the trigger button. Defaults to `What's this?`. */
  ariaLabel?: string;
  /** Which side of the trigger to open on. Defaults to "bottom"; pass "top"
   *  when the trigger sits at the bottom of the viewport (e.g. in the Robin
   *  FAB) so the popover doesn't get clipped off-screen. */
  placement?: "top" | "bottom";
};

/**
 * A tiny "?" button that toggles a small popover beside it.
 *
 * Drop next to any panel header to give first-time players a one-paragraph
 * "what is this part of the screen?" explanation without taking up real
 * estate when collapsed.
 */
export default function InfoChip({
  label,
  children,
  ariaLabel = "What's this?",
  placement = "bottom",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={[
          "w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold transition-all",
          "border border-stone-300 text-stone-600 bg-white/80 hover:bg-white hover:text-robinOrange hover:border-robinOrange",
          open ? "bg-robinOrange text-white border-robinOrange" : "",
        ].join(" ")}
        title={ariaLabel}
      >
        ?
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className={[
            "absolute z-30 left-0 w-72 max-w-[min(20rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-xl border border-stone-100 p-4 text-sm text-stone-700 animate-fadeIn",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2",
          ].join(" ")}
          style={{ boxShadow: "0 18px 40px -12px rgba(60, 30, 10, 0.35)" }}
        >
          <div className="font-display text-base text-stone-800 mb-1">{label}</div>
          <div className="leading-relaxed">{children}</div>
        </div>
      )}
    </span>
  );
}
