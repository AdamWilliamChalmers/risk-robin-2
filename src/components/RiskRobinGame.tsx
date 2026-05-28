import { useEffect, useMemo, useState } from "react";
import { useGame } from "../game/useGame";
import type { Stage } from "../game/types";
import {
  fetchFollowUpQuestion,
  fetchPersonaNames,
  fetchRobinSummary,
} from "../game/aiClient";
import { PersonaNamesProvider } from "../game/personaNamesContext";

import WelcomeModal from "./WelcomeModal";
import RobinGuide from "./RobinGuide";
import ProgressBoard from "./ProgressBoard";
import ContextCard from "./ContextCard";
import ImpactHand from "./ImpactHand";
import AIAnalystPanel from "./AIAnalystPanel";
import EvidenceInput from "./EvidenceInput";
import FollowUpInput from "./FollowUpInput";
import RatingQuestions from "./RatingQuestions";
import CategoryClassification from "./CategoryClassification";
import CaseStudySummary from "./CaseStudySummary";
import FinalReflection from "./FinalReflection";
import FinalReport from "./FinalReport";
import GameControls from "./GameControls";
import Tour from "./Tour";

/**
 * Top-level orchestrator. Holds no state — pulls everything from useGame and
 * renders the stage-appropriate UI with a single highlighted region at a time.
 */
export default function RiskRobinGame() {
  const g = useGame();
  const s = g.state;

  const [tourOpen, setTourOpen] = useState(false);

  const startGameWithTour = () => {
    g.startGame();
    setTourOpen(true);
  };

  const handleHomeClick = () => {
    const midGame =
      s.gameStarted && s.stage !== "welcome" && s.stage !== "final_report";
    if (
      midGame &&
      !window.confirm(
        "Restart the game? Your current round and any progress on the board will be lost."
      )
    ) {
      return;
    }
    setTourOpen(false);
    g.restart();
  };

  // While the tour is open, pause the round-intro → reveal-context auto-advance so
  // the player isn't dragged into the actual round mid-walkthrough.
  useEffect(() => {
    if (s.stage !== "round_intro" || tourOpen) return;
    const t = setTimeout(() => g.beginRound(), 700);
    return () => clearTimeout(t);
  }, [s.stage, s.roundNumber, tourOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Once per game, ask the LLM for a fresh trio of persona names so each
  // session has different characters (Iona/Callum/Priya remain the defaults
  // if the call fails or no API key is configured).
  useEffect(() => {
    if (!s.gameStarted || s.personaNames) return;
    let cancelled = false;
    (async () => {
      const names = await fetchPersonaNames();
      if (cancelled || !names) return;
      g.setPersonaNames(names);
    })();
    return () => {
      cancelled = true;
    };
  }, [s.gameStarted]); // eslint-disable-line react-hooks/exhaustive-deps

  // While the player is reading the freshly-flipped Context Card, we
  // pre-fetch the locals' suggestions in the background. The dispatch
  // populates `aiAnalystResponses` but no longer changes the stage — the
  // player advances manually via the dock "Next →" button (handled in
  // buildPrimaryAction below). That way they have time to read the context
  // before the locals' panel takes over the screen.
  useEffect(() => {
    if (s.stage !== "reveal_context" || !s.currentContext) return;
    // Already fetched for this context? Skip — runAI dispatches even when
    // results are identical, which would cause a noisy re-render loop.
    if (s.aiAnalystResponses.length > 0) return;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await g.runAI(s.currentContext!, s.playerHand);
    })();
    return () => {
      cancelled = true;
    };
  }, [s.stage, s.currentContext?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Upgrade the templated follow-up question with an LLM-generated one as
  // soon as we enter the follow_up stage. The template is already on screen
  // so the player isn't blocked — the upgrade replaces it silently when ready.
  useEffect(() => {
    if (
      s.stage !== "follow_up" ||
      !s.currentContext ||
      !s.selectedImpact
    ) {
      return;
    }
    const contextId = s.currentContext.id;
    let cancelled = false;
    (async () => {
      const q = await fetchFollowUpQuestion({
        contextTitle: s.currentContext!.title,
        contextDescription: s.currentContext!.description,
        impactTitle: s.selectedImpact!.isWildcard
          ? s.wildcardDraft.title || "Analyst's own impact"
          : s.selectedImpact!.title,
        evidence: s.playerEvidence,
      });
      if (cancelled || !q) return;
      g.upgradeFollowupQuestion(contextId, q);
    })();
    return () => {
      cancelled = true;
    };
  }, [s.stage, s.currentContext?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Centre the player's view on whatever Robin is talking about right now.
  // We re-tested with users who skipped straight to their hand and ignored the
  // locals' perspectives — and lost their place on subsequent stages too.
  // Pulling the relevant region to the centre of the viewport on stage entry
  // makes the multi-step flow physically obvious: the page always moves to
  // *where the next thing happens*, with Robin parked just below.
  useEffect(() => {
    const area = STAGE_TO_FOCUS_AREA[s.stage];
    if (!area) return;
    const el = document.querySelector<HTMLElement>(`[data-area="${area}"]`);
    if (!el) return;
    // Small delay so any layout/dim-class changes settle before we measure.
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [s.stage]);

  // Upgrade Robin's templated case-study summary once the round is committed.
  // We fire on update_board entry (right after CONFIRM_CLASSIFICATION) so the
  // summary is upgraded before the player even sees the final report.
  useEffect(() => {
    if (s.stage !== "update_board") return;
    const latest = s.caseStudies[s.caseStudies.length - 1];
    if (!latest) return;
    const targetRound = latest.roundNumber;
    let cancelled = false;
    (async () => {
      const summary = await fetchRobinSummary({
        contextTitle: latest.contextCard.title,
        impactTitle: latest.selectedImpact.isWildcard
          ? latest.wildcardTitle || "Analyst's own impact"
          : latest.selectedImpact.title,
        impactDescription: latest.selectedImpact.isWildcard
          ? latest.wildcardDescription
          : latest.selectedImpact.description,
        evidence: latest.playerEvidence,
        followUpAnswer: latest.followUpAnswer,
        categories: latest.categoriesUpdated,
        isWild: !!latest.selectedImpact.isWildcard,
      });
      if (cancelled || !summary) return;
      g.upgradeLatestSummary(targetRound, summary);
    })();
    return () => {
      cancelled = true;
    };
  }, [s.stage, s.caseStudies.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const primary = useMemo(() => buildPrimaryAction(s.stage, g), [s.stage, g]);
  const back = useMemo(() => buildBackAction(s.stage, g), [s.stage, g]);

  const latestCase = s.caseStudies[s.caseStudies.length - 1];

  // Reserve enough room at the bottom for both fixed docks (Robin FAB + the
  // primary-action bar) so in-flow content never sits behind them. The Robin
  // dock and the controls bar only render during gameplay; on welcome /
  // final_report we can use less bottom padding.
  const showDocks =
    s.gameStarted && s.stage !== "final_report" && s.stage !== "final_reflection";
  const rootPadding = showDocks ? "pb-60" : "pb-12";

  return (
    <PersonaNamesProvider overrides={s.personaNames}>
    <div className={`min-h-screen ${rootPadding}`}>
      {s.stage === "welcome" && (
        <WelcomeModal onStart={g.startGame} onStartWithTour={startGameWithTour} />
      )}

      <Tour open={tourOpen} onClose={() => setTourOpen(false)} />

      <header className="max-w-6xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between no-print">
        <button
          type="button"
          onClick={handleHomeClick}
          aria-label="Return to start and restart the game"
          title="Return to start"
          className="flex items-center gap-3 rounded-2xl px-2 py-1 -mx-2 -my-1 transition-all hover:bg-white/60 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-robinOrange/60 group"
        >
          <div className="text-left">
            <div className="font-display text-2xl text-stone-800 leading-tight group-hover:text-robinOrange transition-colors">
              Risk Robin
            </div>
            <div className="text-xs text-stone-500 -mt-0.5">
              Sustainable Tourism · Edinburgh
            </div>
          </div>
        </button>
        <div className="flex items-center gap-4">
          {s.gameStarted &&
            s.stage !== "final_report" &&
            s.stage !== "final_reflection" && (
              <>
                <button
                  type="button"
                  onClick={() => setTourOpen(true)}
                  className="text-sm text-stone-600 hover:text-robinOrange underline-offset-2 hover:underline"
                  title="Walk me through the screen again"
                >
                  ? Take tour
                </button>
                <div className="text-sm text-stone-500">
                  Round{" "}
                  <span className="font-semibold text-stone-800">{s.roundNumber}</span>{" "}
                  of {s.totalRounds}
                </div>
              </>
            )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 gap-6">
        {s.stage === "final_report" ? (
          <FinalReport
            caseStudies={s.caseStudies}
            scores={s.progressScores}
            reflections={s.finalReflections}
            highlighted={g.isHighlighted("final_report")}
            onRestart={g.restart}
          />
        ) : s.stage === "final_reflection" ? (
          <FinalReflection
            reflections={s.finalReflections}
            scores={s.progressScores}
            highlighted={g.isHighlighted("final_reflection")}
            onUpdate={g.updateFinalReflections}
            onSubmit={g.submitFinalReflections}
          />
        ) : (
          s.gameStarted && (
            <>
              {/* Top row: context card on the left (larger), progress board
                  on the right. `items-stretch` makes the two panels share
                  the row's height; the ContextCard expands to match the
                  Impact Assessment board next to it. */}
              <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                {(s.currentContext || s.stage === "round_intro") && (
                  <div
                    className={`flex justify-center w-full lg:w-auto lg:shrink-0 ${
                      isDimmed(s.stage, "context") ? "dimmed" : ""
                    }`}
                  >
                    {s.currentContext ? (
                      <ContextCard
                        card={s.currentContext}
                        highlighted={g.isHighlighted("context")}
                        size="lg"
                        fillHeight
                      />
                    ) : (
                      <ContextCard
                        back
                        card={{ id: "back", title: "", description: "", icons: [] }}
                        highlighted
                        size="lg"
                        fillHeight
                      />
                    )}
                  </div>
                )}
                <section
                  className={`flex-1 min-w-0 w-full ${
                    isDimmed(s.stage, "progress_board") ? "dimmed" : ""
                  }`}
                >
                  <ProgressBoard
                    scores={s.progressScores}
                    highlighted={g.isHighlighted("progress_board")}
                    recentlyUpdated={s.lastUpdatedCategories}
                  />
                </section>
              </div>

              {/* AI analysts. During `ai_discussion` we lift this panel above
                  a full-page dim overlay so the locals' perspectives are the
                  only thing readable on the page — players ignored them when
                  the hand was visible at the same time. The lift class adds a
                  brighter ring + pulse; the overlay is rendered below. */}
              {s.aiAnalystResponses.length > 0 &&
                aiPanelVisible(s.stage) && (
                  <div
                    className={`${
                      isDimmed(s.stage, "ai_panel") ? "dimmed" : ""
                    } ${
                      s.stage === "ai_discussion" ? "spotlight-lift" : ""
                    }`}
                  >
                    <AIAnalystPanel
                      suggestions={s.aiAnalystResponses}
                      hand={s.playerHand}
                      // Suppress the per-panel `highlighted` ring during
                      // `ai_discussion` — the outer .spotlight-lift wrapper
                      // already provides a more prominent ring, and stacking
                      // both produces a noisy double-pulse.
                      highlighted={
                        s.stage === "ai_discussion"
                          ? false
                          : g.isHighlighted("ai_panel")
                      }
                      pulse={s.stage === "ai_discussion"}
                    />
                  </div>
                )}

              {/* Impact hand */}
              {handVisible(s.stage) && (
                <div className={isDimmed(s.stage, "impact_hand") ? "dimmed" : ""}>
                  <ImpactHand
                    hand={s.playerHand}
                    selectedId={s.selectedImpact?.id ?? null}
                    aiSuggestions={s.aiAnalystResponses}
                    onSelect={g.selectImpact}
                    onWildcard={g.selectWildcard}
                    highlighted={g.isHighlighted("impact_hand")}
                    enabled={s.stage === "choose_impact"}
                  />
                </div>
              )}

              {/* Evidence input */}
              {s.stage === "collect_evidence" && s.selectedImpact && (
                <div className={isDimmed(s.stage, "evidence_input") ? "dimmed" : ""}>
                  <EvidenceInput
                    selectedImpact={s.selectedImpact}
                    wildcardDraft={s.wildcardDraft}
                    onUpdateWildcard={g.updateWildcard}
                    onSubmit={g.submitEvidence}
                    onReconsider={g.reconsiderImpact}
                    highlighted={g.isHighlighted("evidence_input")}
                  />
                </div>
              )}

              {/* Robin's follow-up for vague evidence */}
              {s.stage === "follow_up" && s.followUpQuestion && (
                <FollowUpInput
                  question={s.followUpQuestion}
                  highlighted={g.isHighlighted("follow_up")}
                  onSubmit={g.submitFollowup}
                  onSkip={g.skipFollowup}
                  onReconsider={g.reconsiderImpact}
                />
              )}

              {/* Importance / valence / council priority */}
              {s.stage === "rate_impact" && (
                <RatingQuestions
                  draft={s.ratingDraft}
                  highlighted={g.isHighlighted("ratings")}
                  onUpdate={g.updateRatings}
                  onSubmit={g.submitRatings}
                  onReconsider={g.reconsiderImpact}
                />
              )}

              {/* Case-study summary */}
              {summaryVisible(s.stage) && latestCase && (
                <div className={isDimmed(s.stage, "summary") ? "dimmed" : ""}>
                  <CaseStudySummary
                    caseStudy={latestCase}
                    highlighted={g.isHighlighted("summary")}
                  />
                </div>
              )}

              {/* Pre-board classification — Robin proposes, player confirms/adjusts */}
              {s.stage === "robin_summary" && (
                <PreBoardSummary
                  contextTitle={s.currentContext?.title ?? ""}
                  impactTitle={
                    s.selectedImpact?.isWildcard
                      ? s.wildcardDraft.title || "Your wild-card impact"
                      : s.selectedImpact?.title ?? ""
                  }
                  evidence={s.playerEvidence}
                  followUp={s.followUpAnswer}
                  proposedCategories={s.proposedCategories}
                  highlighted={g.isHighlighted("summary")}
                />
              )}

              {s.stage === "classify_impact" && (
                <CategoryClassification
                  proposed={s.proposedCategories}
                  userSelected={s.userCategories}
                  highlighted={g.isHighlighted("classify")}
                  onToggle={g.toggleUserCategory}
                  onConfirm={g.confirmClassification}
                />
              )}
            </>
          )
        )}
      </main>

      {/* Dim overlay for the "locals weigh in" stage. Sits above the page
          content (z-20) but below the lifted AI panel (z-25) and the Robin
          dock / CTA bar (z-30) so guidance + advancement remain bright and
          clickable. Click-blocking by design — the only way out is the
          orange "Choose from my hand →" button. */}
      {s.stage === "ai_discussion" && <div className="spotlight-overlay no-print" />}

      {showDocks && (
        <>
          <RobinGuide state={s} highlighted={g.isHighlighted("robin")} />
          <GameControls
            stage={s.stage}
            roundNumber={s.roundNumber}
            totalRounds={s.totalRounds}
            primary={primary}
            back={back}
          />
        </>
      )}
    </div>
    </PersonaNamesProvider>
  );
}

function aiPanelVisible(stage: Stage): boolean {
  return (
    stage === "ai_discussion" ||
    stage === "choose_impact" ||
    stage === "collect_evidence" ||
    stage === "follow_up" ||
    stage === "rate_impact"
  );
}

function handVisible(stage: Stage): boolean {
  return (
    stage === "ai_discussion" ||
    stage === "choose_impact" ||
    stage === "collect_evidence" ||
    stage === "follow_up" ||
    stage === "rate_impact" ||
    stage === "draw_replacement"
  );
}

function summaryVisible(stage: Stage): boolean {
  return (
    stage === "update_board" ||
    stage === "draw_replacement"
  );
}

function isDimmed(stage: Stage, area: string): boolean {
  const ALL_NON_BG = [
    "context",
    "ai_panel",
    "impact_hand",
    "evidence_input",
    "follow_up",
    "ratings",
    "classify",
    "summary",
    "progress_board",
  ];

  // For each stage: list everything to dim. Robin + progress board stay bright
  // except when the focus is elsewhere — but they shouldn't be unreadable,
  // so we use a lighter dim treatment in practice (the .dimmed class).
  const dimMap: Record<Stage, string[]> = {
    welcome: [],
    round_intro: ALL_NON_BG,
    reveal_context: ALL_NON_BG.filter((a) => a !== "context"),
    ai_discussion: ["impact_hand", "evidence_input", "follow_up", "ratings", "classify", "summary"],
    choose_impact: ["evidence_input", "follow_up", "ratings", "classify", "summary"],
    collect_evidence: ["ai_panel", "impact_hand", "follow_up", "ratings", "classify", "summary"],
    follow_up: ["ai_panel", "impact_hand", "evidence_input", "ratings", "classify", "summary"],
    rate_impact: ["ai_panel", "impact_hand", "evidence_input", "follow_up", "classify", "summary"],
    robin_summary: ["ai_panel", "impact_hand", "evidence_input", "follow_up", "ratings", "classify"],
    classify_impact: ["ai_panel", "impact_hand", "evidence_input", "follow_up", "ratings", "summary"],
    update_board: ["ai_panel", "impact_hand", "evidence_input", "follow_up", "ratings", "classify"],
    draw_replacement: ["ai_panel", "evidence_input", "follow_up", "ratings", "classify"],
    final_reflection: [],
    final_report: [],
  };
  return dimMap[stage].includes(area);
}

/**
 * Map of stage → `data-area` to centre in the viewport on stage entry. Kept
 * separate from the dim-map / highlight-map because "where Robin is looking"
 * (focus) is conceptually different from "what's the bright thing on the
 * page" (highlight) and "what's faded out" (dim).
 */
const STAGE_TO_FOCUS_AREA: Partial<Record<Stage, string>> = {
  ai_discussion: "ai_panel",
  choose_impact: "impact_hand",
  collect_evidence: "evidence_input",
  follow_up: "follow_up",
  rate_impact: "ratings",
  robin_summary: "summary",
  classify_impact: "classify",
  update_board: "progress_board",
};

export type PrimaryAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** "primary" (default) — solid orange CTA in the dock that *is* the next
   *  action. "pointer" — softer dock CTA whose click scrolls to and re-pulses
   *  the real submit button living inside the active panel above. */
  variant?: "primary" | "pointer";
};

/** Optional back-one-stage link rendered alongside the primary CTA. Labels
 *  are stage-specific ("Re-read locals", "Edit your example") so the player
 *  knows what they'll be looking at again. */
export type BackAction = {
  label: string;
  onClick: () => void;
  title?: string;
};

/**
 * Scroll the dock "pointer" CTA target into view. Most stages have a real
 * submit button inside the active panel (marked with `data-cta="submit"`) —
 * we scroll to it AND restart its entrance pulse so the eye is pulled to it.
 *
 * The `choose_impact` stage has no single button (the user clicks a card
 * directly), so we just scroll to the area itself. The CSS pulse is harmless
 * if the target isn't a `.btn-primary` button.
 */
function jumpToInPanelSubmit(area: string) {
  const btn = document.querySelector<HTMLButtonElement>(
    `[data-area="${area}"] [data-cta="submit"]`
  );
  const target =
    btn ??
    document.querySelector<HTMLElement>(`[data-area="${area}"]`);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  if (btn) {
    btn.classList.remove("btn-primary-jolt");
    // Force reflow so the keyframes restart from 0.
    void btn.offsetWidth;
    btn.classList.add("btn-primary-jolt");
    window.setTimeout(() => btn.classList.remove("btn-primary-jolt"), 600);
    if (!btn.disabled) btn.focus({ preventScroll: true });
  }
}

function buildPrimaryAction(
  stage: Stage,
  g: ReturnType<typeof useGame>
): PrimaryAction | undefined {
  switch (stage) {
    case "round_intro":
      return { label: "Draw context →", onClick: g.beginRound };
    case "reveal_context": {
      // Locals are being fetched in the background (see the pre-fetch
      // effect above). We always show a "Next →" CTA so the player feels in
      // control, but disable it while suggestions haven't arrived — that's
      // a few hundred ms of LLM latency at most.
      const ready = g.state.aiAnalystResponses.length > 0;
      return ready
        ? {
            label: "Next: see the locals →",
            onClick: g.openDiscussion,
          }
        : {
            label: "Locals are thinking…",
            onClick: () => {},
            disabled: true,
          };
    }
    case "ai_discussion":
      return { label: "Choose from my hand →", onClick: g.openHand };
    case "choose_impact":
      // No single "next" — the player clicks one of the cards above. The
      // dock pointer is a soft companion telling them where to look.
      return {
        label: "Tap a card above",
        onClick: () => jumpToInPanelSubmit("impact_hand"),
        variant: "pointer",
      };
    case "collect_evidence":
      return {
        label: "Submit example above",
        onClick: () => jumpToInPanelSubmit("evidence_input"),
        variant: "pointer",
      };
    case "follow_up":
      return {
        label: "Add detail above",
        onClick: () => jumpToInPanelSubmit("follow_up"),
        variant: "pointer",
      };
    case "rate_impact":
      return {
        label: "Answer the three questions above",
        onClick: () => jumpToInPanelSubmit("ratings"),
        variant: "pointer",
      };
    case "robin_summary":
      return { label: "Classify on the board →", onClick: g.openClassify };
    case "classify_impact":
      return {
        label: "Confirm categories above",
        onClick: () => jumpToInPanelSubmit("classify"),
        variant: "pointer",
      };
    case "update_board":
      return { label: "Draw a replacement card →", onClick: g.drawReplacement };
    case "draw_replacement":
      return {
        label:
          g.state.roundNumber >= g.state.totalRounds
            ? "Add final reflections →"
            : "Next round →",
        onClick: g.next,
      };
    default:
      return undefined;
  }
}

/**
 * Per-stage back link, rendered next to the primary CTA. We label these
 * descriptively so the player knows what re-appears when they click — e.g.
 * "Re-read locals" tells them they're going back to the AI panel they may
 * have skimmed too fast. Stages where back is one-way (committed rounds,
 * welcome, the auto-advance reveal) return undefined.
 */
function buildBackAction(
  stage: Stage,
  g: ReturnType<typeof useGame>
): BackAction | undefined {
  switch (stage) {
    case "choose_impact":
      return {
        label: "← Re-read locals",
        onClick: g.goBack,
        title: "Go back to the locals' perspectives",
      };
    case "collect_evidence":
      return {
        label: "← Pick a different card",
        onClick: g.goBack,
        title: "Go back to your hand and choose another impact",
      };
    case "follow_up":
      return {
        label: "← Edit your example",
        onClick: g.goBack,
        title: "Go back and revise your original evidence",
      };
    case "rate_impact":
      return {
        label: "← Back",
        onClick: g.goBack,
        title: "Go back to your evidence / follow-up",
      };
    case "robin_summary":
      return {
        label: "← Change my ratings",
        onClick: g.goBack,
        title: "Go back and adjust the three quick questions",
      };
    case "classify_impact":
      return {
        label: "← Back to Robin's draft",
        onClick: g.goBack,
        title: "Go back and re-read Robin's draft case study",
      };
    default:
      return undefined;
  }
}

/**
 * Lightweight pre-board panel shown during `robin_summary` (before the board
 * actually updates). It previews Robin's writeup + the categories Robin is
 * about to suggest, so the player has full context before clicking through to
 * the classification screen.
 */
function PreBoardSummary({
  contextTitle,
  impactTitle,
  evidence,
  followUp,
  proposedCategories,
  highlighted,
}: {
  contextTitle: string;
  impactTitle: string;
  evidence: string;
  followUp: string;
  proposedCategories: string[];
  highlighted: boolean;
}) {
  return (
    <section
      className={`bg-pastel-cream rounded-3xl p-5 card-shadow animate-fadeIn ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="summary"
    >
      <h2 className="font-display text-xl text-stone-800 mb-2">
        Robin's draft case study
      </h2>
      <p className="text-stone-700 mb-3">
        For <strong>{contextTitle}</strong>, you chose <strong>{impactTitle}</strong>.
      </p>
      {(evidence || followUp) && (
        <p className="text-stone-800 italic mb-3">
          "{[evidence, followUp].filter(Boolean).join(" ")}"
        </p>
      )}
      <p className="text-sm text-stone-600">
        Robin suggests {proposedCategories.length === 1 ? "one category" : "these categories"}{" "}
        for this round. You'll get to confirm or adjust on the next step.
      </p>
    </section>
  );
}
