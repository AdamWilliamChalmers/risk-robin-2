import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";

type Step = {
  /** `data-area` value of the element to spotlight. Omit for a centered modal step. */
  target?: string;
  title: string;
  body: ReactNode;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

const STEPS: Step[] = [
  {
    title: "Quick 30-second tour",
    body: (
      <p>
        I'll point out the four parts of the screen and what happens each round, then
        we'll begin <strong>Round 1</strong>. You can skip any time.
      </p>
    ),
  },
  {
    target: "robin",
    title: "Me — your guide",
    body: (
      <p>
        This is me, your Chief Analyst. I'll always be in this corner telling you what
        to click next. If a step is ever unclear, <strong>look here first</strong>.
      </p>
    ),
  },
  {
    target: "progress_board",
    title: "Your Impact Assessment Board",
    body: (
      <p>
        Tourism affects six categories — visitor economy, jobs, investment, net zero,
        and quality of life. Each round, your evidence adds a marker to one or more
        rows. The aim isn't a high score — it's the <strong>pattern you build</strong>{" "}
        across six rounds.
      </p>
    ),
  },
  {
    target: "context",
    title: "The Context Card",
    body: (
      <p>
        Each round starts here. I deal a Context Card — a real-ish Edinburgh tourism
        situation — and we think about it together. It stays face-down until we
        begin.
      </p>
    ),
  },
  {
    target: "footer",
    title: "When in doubt, look down here",
    body: (
      <p>
        The footer always shows the <strong>current stage</strong> (e.g. "Choose your
        impact") and the <strong>orange button</strong> for the next step. If you
        ever lose your bearings, glance here.
      </p>
    ),
  },
  {
    title: "What happens each round",
    body: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Read the Context Card I deal.</li>
        <li>Three Edinburgh locals (Iona, Callum, Priya) each pick a card from your hand.</li>
        <li>Choose one — or play the <strong>✶ Wild Card</strong> to write your own.</li>
        <li>Give a <strong>concrete real example</strong> as evidence.</li>
        <li>Answer three 10-second questions on how you feel about it.</li>
        <li>I write a case study and add a marker to the board.</li>
      </ol>
    ),
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export default function Tour({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const current = STEPS[step];
  const total = STEPS.length;

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }
    const target = current?.target;
    if (!target) {
      setRect(null);
      return;
    }

    const compute = () => {
      const el = document.querySelector<HTMLElement>(`[data-area="${target}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      // Scroll it into view nicely before measuring.
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      });
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [open, step, current?.target]);

  const tooltipStyle = useMemo<React.CSSProperties>(() => {
    if (!rect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "min(28rem, calc(100vw - 2rem))",
      };
    }
    const TOOLTIP_W = 380;
    const margin = 14;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    left = Math.max(12, Math.min(left, viewportW - TOOLTIP_W - 12));

    const spaceBelow = viewportH - (rect.top + rect.height);
    const spaceAbove = rect.top;
    const placeBelow = spaceBelow > 220 || spaceBelow >= spaceAbove;

    const top = placeBelow
      ? rect.top + rect.height + margin
      : Math.max(12, rect.top - margin - 200);

    return {
      position: "fixed",
      top,
      left,
      width: TOOLTIP_W,
      maxWidth: "calc(100vw - 1.5rem)",
    };
  }, [rect]);

  if (!open) return null;

  const next = () => {
    if (step >= total - 1) onClose();
    else setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const isLast = step === total - 1;

  return (
    <div className="fixed inset-0 z-50 no-print" aria-modal role="dialog" aria-label="Game tour">
      {/* Dimming backdrop. Uses a 'hole' (box-shadow) when we have a target, or a
          solid translucent panel for centered modal steps. */}
      {rect ? (
        <>
          {/* The spotlight: a transparent box at the target's rect with a huge
              box-shadow that paints the rest of the screen dark. */}
          <div
            style={{
              position: "fixed",
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
              borderRadius: 20,
              boxShadow:
                "0 0 0 9999px rgba(20, 12, 6, 0.62), 0 0 0 3px rgba(210, 75, 37, 0.85), 0 0 28px rgba(210, 75, 37, 0.6)",
              pointerEvents: "none",
              transition: "all 220ms ease",
            }}
          />
          {/* Click-trap so clicks outside the target don't reach the page. */}
          <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fadeIn" />
      )}

      <div
        style={tooltipStyle}
        className="bg-white rounded-2xl shadow-2xl border border-stone-100 p-5 animate-fadeIn"
      >
        <div className="flex items-start gap-3 mb-2">
          <img
            src="/Chief Analyst Robin.png"
            alt=""
            aria-hidden
            className="w-10 h-10 object-contain shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-robinOrange">
              Tour · {step + 1} of {total}
            </div>
            <h3 className="font-display text-lg text-stone-800 leading-tight">
              {current.title}
            </h3>
          </div>
        </div>
        <div className="text-sm text-stone-700 leading-relaxed">{current.body}</div>

        <div className="flex items-center justify-between mt-4 gap-2">
          <button
            onClick={onClose}
            className="text-sm text-stone-500 hover:text-stone-800 underline-offset-2 hover:underline"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={back}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 text-sm hover:bg-stone-50"
              >
                ← Back
              </button>
            )}
            <button
              onClick={next}
              className="btn-primary py-2 px-4 text-sm"
            >
              {isLast ? "Start Round 1 →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
