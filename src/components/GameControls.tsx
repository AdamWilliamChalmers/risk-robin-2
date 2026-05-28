import type { Stage } from "../game/types";
import type { BackAction, PrimaryAction } from "./RiskRobinGame";

type Props = {
  stage: Stage;
  roundNumber: number;
  totalRounds: number;
  /** The single primary action the player can take to advance from this stage. */
  primary?: PrimaryAction;
  /** Optional one-stage back link, rendered as a subtle ghost button on the
   *  right of the dock alongside the primary CTA. Undefined on stages where
   *  back doesn't make sense (welcome / round_intro / committed rounds). */
  back?: BackAction;
};

export default function GameControls({ stage, roundNumber, totalRounds, primary, back }: Props) {
  const variant = primary?.variant ?? "primary";
  return (
    <div
      className="fixed inset-x-0 bottom-3 z-30 px-3 pointer-events-none no-print"
      data-area="footer"
    >
      <div className="mx-auto max-w-6xl pointer-events-auto bg-white/95 backdrop-blur rounded-2xl card-shadow px-4 py-3 flex items-center justify-between border border-stone-100">
        <div className="text-sm text-stone-600">
          <span className="font-semibold text-stone-800">
            {stage === "final_report" ? "Game complete" : `Round ${roundNumber} of ${totalRounds}`}
          </span>
          <span className="mx-2 text-stone-400">·</span>
          <span className="text-stone-500">{stageLabel(stage)}</span>
        </div>
        <div className="flex items-center gap-3">
          {back && (
            // Back link sits to the left of the primary CTA so the player
            // always has an obvious escape hatch. Styled as a text link, not
            // a button, so it never competes with the orange CTA for
            // attention but is always available.
            <button
              type="button"
              onClick={back.onClick}
              className="text-sm text-stone-600 hover:text-robinOrange underline-offset-2 hover:underline"
              title={back.title ?? "Step back one stage"}
            >
              {back.label}
            </button>
          )}
          {primary &&
            (variant === "pointer" ? (
              // Softer "the real button is up there" companion. Clicking
              // scrolls to and re-pulses the in-panel submit. Keyed on
              // stage so the entrance animation restarts on transitions.
              <button
                key={`pointer-${stage}`}
                type="button"
                className="btn-pointer"
                onClick={primary.onClick}
                disabled={primary.disabled}
                aria-label={`${primary.label} — jump to the button in the panel above`}
                title="The action is in the panel above — click to jump to it"
              >
                {primary.label}
              </button>
            ) : (
              // The "real" orange CTA. Keying on stage restarts the
              // entrance pulse every time it appears for a new stage.
              <button
                key={`primary-${stage}`}
                className="btn-primary"
                onClick={primary.onClick}
                disabled={primary.disabled}
              >
                {primary.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function stageLabel(stage: Stage): string {
  switch (stage) {
    case "welcome":           return "Welcome";
    case "round_intro":       return "Round intro";
    case "reveal_context":    return "Context revealed";
    case "ai_discussion":     return "Locals weighing in";
    case "choose_impact":     return "Choose your impact";
    case "collect_evidence":  return "Give your evidence";
    case "follow_up":         return "Robin's follow-up";
    case "rate_impact":       return "Quick questions";
    case "robin_summary":     return "Robin's case study";
    case "classify_impact":   return "Classify on the board";
    case "update_board":      return "Board updated";
    case "draw_replacement":  return "Draw replacement card";
    case "final_reflection":  return "Final reflections";
    case "final_report":      return "Final report";
  }
}
