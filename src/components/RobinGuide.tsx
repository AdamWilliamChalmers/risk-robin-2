import { useMemo } from "react";
import type { GameState } from "../game/types";
import InfoChip from "./InfoChip";
import AnimatedRobin from "./AnimatedRobin";

type Props = {
  state: GameState;
  highlighted: boolean;
};

/**
 * Robin's per-stage guidance, rendered as a fixed dock at the bottom of the
 * viewport. Sits just above the sticky primary-action bar so the "what should
 * I do?" message and the "click here to do it" CTA are always visible together,
 * no matter how far the player scrolls.
 *
 * Why a FAB instead of an in-flow card:
 *   - Robin's line is *guidance for the current stage*. If the player scrolls
 *     down to read a card or fill in evidence, the in-flow Robin scrolls off
 *     screen and the guidance disappears at exactly the moment they need it.
 *   - The orange action button is already sticky. Pairing the two creates a
 *     stable "what to do" bar at the bottom of the screen.
 *
 * Visual treatment:
 *   - The source PNG has an opaque white background, so we frame the avatar
 *     in a matching white circle with an orange ring. The whole FAB also gets
 *     a soft orange ring to set it apart from the cream page, picking up the
 *     brand colour and making the coach feel like a permanent companion.
 *
 * The wrapper uses pointer-events:none + pointer-events:auto on the inner
 * card so clicks pass through the empty horizontal space — important on wide
 * viewports where the dock is narrower than the FAB wrapper.
 */
export default function RobinGuide({ state, highlighted }: Props) {
  const line = useMemo(() => robinLine(state), [state]);

  return (
    <div
      className="fixed inset-x-0 bottom-[6.5rem] z-30 px-3 pointer-events-none no-print animate-fadeIn"
      aria-live="polite"
    >
      <div
        className={`mx-auto max-w-6xl pointer-events-auto ${
          highlighted ? "highlighted" : ""
        }`}
        data-area="robin"
      >
        <div className="bg-white rounded-3xl ring-2 ring-robinOrange/40 shadow-[0_22px_48px_-12px_rgba(60,30,10,0.45)] px-5 py-2.5 flex items-center gap-3.5">
          <div className="shrink-0 rounded-2xl bg-white ring-2 ring-robinOrange/60 p-1 overflow-hidden">
            <AnimatedRobin className="block w-14 h-14" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-robinOrange">
                Chief Analyst Robin
              </div>
              <InfoChip label="Who is Robin?" ariaLabel="About Robin" placement="top">
                <p>
                  I'm your guide. I'll always be at the bottom of the screen telling
                  you exactly what to click next. If a step is ever unclear, read
                  what I'm saying here first — and check the orange button just
                  below.
                </p>
              </InfoChip>
            </div>
            <p
              key={state.stage}
              className="text-stone-800 leading-snug text-[15px] font-medium whitespace-pre-line animate-fadeIn"
            >
              {line}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function robinLine(s: GameState): string {
  switch (s.stage) {
    case "welcome":
      return "Welcome! I'm Robin. Click Start when you're ready — I recommend taking the quick tour first.";
    case "round_intro":
      return `Round ${s.roundNumber} of ${s.totalRounds}. Click the orange "Draw context" button to deal this round's Context Card.`;
    case "reveal_context":
      return s.currentContext
        ? `Here's the context: "${s.currentContext.title}". Take a moment to read it. In a second I'll bring in three Edinburgh locals — Iona, Callum and Priya — to suggest cards from your hand.`
        : "Let's see what comes up next.";
    case "ai_discussion":
      return "Iona, Callum and Priya have each picked cards from your hand for this context. Skim what they say — they often disagree, and that's the point. You have the final say.";
    case "choose_impact":
      return "Pick the Impact Card from your hand below that best matches this context. Don't see one that fits? Click the ✶ Wild Card on the right to write your own.";
    case "collect_evidence":
      return "Now the important part: give a concrete real example for why this impact matters. A specific place, a moment, a person — the more grounded, the more weight it carries. There's no wrong answer.";
    case "follow_up":
      return "Your example was a little general. One concrete detail — a street name, a time of year, what someone actually said — anchors it. You can skip if you really mean it general.";
    case "rate_impact":
      return "Three quick questions — about ten seconds. How important is this, is it positive or negative, and should the Council prioritise it?";
    case "robin_summary":
      return "I've drafted your reasoning as a short case-study entry. Next we'll mark it on the Impact Assessment Board — you'll pick which categories it affects.";
    case "classify_impact":
      return "I've ticked the row(s) I think your evidence fits. Confirm them — or click to add and remove rows. Your call decides which markers go on the board.";
    case "update_board":
      return "Marker added. Notice the pattern your evidence is building across categories — that pattern is the real output of this game, not a high score.";
    case "draw_replacement":
      return "I'll deal you a fresh Impact Card so your hand stays at eight, then we move to the next round.";
    case "final_reflection":
      return "Six rounds done! Before I show you the final report, four quick reflection prompts to tie your thinking together.";
    case "final_report":
      return "Great work. Here's the full pattern you built across six rounds — case studies, ratings, board scores, and your reflections. You can print this as a PDF.";
  }
}
