import type { Stage } from "../game/types";

type Props = {
  stage: Stage;
  roundNumber: number;
  totalRounds: number;
  /** The single primary action the player can take to advance from this stage. */
  primary?: { label: string; onClick: () => void; disabled?: boolean };
};

export default function GameControls({ stage, roundNumber, totalRounds, primary }: Props) {
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
        {primary && (
          <button
            className="btn-primary"
            onClick={primary.onClick}
            disabled={primary.disabled}
          >
            {primary.label}
          </button>
        )}
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
