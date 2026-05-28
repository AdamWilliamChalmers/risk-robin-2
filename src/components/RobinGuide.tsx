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
        {/* `key={state.stage}` is the trick that makes the nudge pulse re-fire
            on every stage change — React unmounts the inner card and mounts a
            fresh one, restarting the CSS keyframes. The wrapper above keeps
            its identity so the `highlighted` ring (tour spotlight) isn't
            disturbed. */}
        {/* Dock sizing rationale: user tests showed Robin's line being missed
            entirely while players focused on their cards. We bumped the
            avatar, body font and padding so the dock has more visual mass —
            and lifted the orange ring opacity so it reads as the "live"
            element on the page. If you change the avatar size or vertical
            padding here, update:
              - `bottom: 14rem` on .spotlight-overlay in index.css
              - `pb-60` rootPadding in RiskRobinGame.tsx
            so in-flow content and the locals spotlight still clear the dock. */}
        <div
          key={state.stage}
          className="robin-nudge bg-white rounded-3xl ring-2 ring-robinOrange/60 shadow-lg px-6 py-4 flex items-center gap-4"
        >
          <div className="shrink-0 rounded-2xl bg-white ring-2 ring-robinOrange/70 p-1 overflow-hidden robin-avatar-bounce">
            <AnimatedRobin className="block w-20 h-20" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="text-[13px] font-bold uppercase tracking-wider text-robinOrange">
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
              className="text-stone-800 leading-relaxed text-[18px] font-medium whitespace-pre-line animate-fadeIn"
            >
              {line}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Robin's per-stage line. Every line ends with the *next concrete action* the
 * player should take, so the orange CTA in the footer always echoes what
 * Robin just said. Lines that auto-advance (e.g. `reveal_context`,
 * `update_board`) still describe what's about to happen so the player isn't
 * surprised.
 *
 * Note: the three locals' names are deliberately NOT mentioned by name here
 * — they're LLM-generated per session, so referring to them generically
 * ("your three locals") keeps Robin's line in sync regardless of who shows up.
 */
function robinLine(s: GameState): string {
  switch (s.stage) {
    case "welcome":
      return "Welcome! I'm Robin. Click Start when you're ready — I recommend taking the quick tour first.";
    case "round_intro":
      return `Round ${s.roundNumber} of ${s.totalRounds}. Click the orange "Draw context" button below to deal this round's Context Card.`;
    case "reveal_context":
      return s.currentContext
        ? `The context is "${s.currentContext.title}". Click "Next" to see what the locals have to say…`
        : "Let's see what comes up next.";
    case "ai_discussion":
      return "Take a moment with your three locals — read each one carefully. They often disagree, and that's the point: notice whose life weighs differently here. When you're ready to give *your* perspective, click \u201cChoose from my hand \u2192\u201d below.";
    case "choose_impact":
      return "Your turn — pick one Impact Card. You can choose one your locals supported, or one nobody picked. Look at the category icons on each card: they show which sustainability dimensions are at stake, and the trade-offs you're making. Be ready to justify your choice. Don't see one that fits? Use the \u2735 Wild Card on the right to write your own.";
    case "collect_evidence":
      return "Now the important part: type a concrete real example into the box for why this impact matters — a specific place, a moment, a person. Hit \u201cSubmit evidence \u2192\u201d when you're done. The more grounded, the more weight it carries.";
    case "follow_up":
      return "Your example was a little general. Add one concrete detail in the box — a street name, a time of year, what someone actually said — then submit. Or click \u201cSkip\u201d if you really meant it general.";
    case "rate_impact":
      return "Three quick questions — about ten seconds. Pick an answer for each: how important is this, is it positive or negative, and should the Council prioritise it? Then click \u201cConfirm ratings \u2192\u201d.";
    case "robin_summary":
      return "I've drafted your reasoning as a short case-study entry. Read it through, then click \u201cClassify on the board \u2192\u201d to record this round on the Impact Assessment Board.";
    case "classify_impact":
      return "I've ticked the row(s) I think your evidence fits. Click rows to add or remove, then hit \u201cConfirm categories \u2192\u201d below. Your call decides which markers go on the board.";
    case "update_board":
      return "Marker added! Notice the pattern your evidence is building across categories. When you're ready, click \u201cDraw a replacement card \u2192\u201d below to refill your hand.";
    case "draw_replacement":
      return s.roundNumber >= s.totalRounds
        ? "Last round done. Click \u201cAdd final reflections \u2192\u201d below to share what you took away."
        : "Fresh Impact Card on the way so your hand stays at eight. Click \u201cNext round \u2192\u201d below to continue.";
    case "final_reflection":
      return "Six rounds done! Before I show you the final report, answer the four reflection prompts below — then click \u201cSee my report \u2192\u201d.";
    case "final_report":
      return "Great work. Here's the full pattern you built across six rounds — case studies, ratings, board scores, and your reflections. Click \u201cPrint / save as PDF\u201d to keep a copy.";
  }
}
