import { useCallback, useMemo, useReducer } from "react";
import type {
  GameState,
  Stage,
  AISuggestion,
  CaseStudy,
  HighlightArea,
  Ratings,
  FinalReflections,
  PersonaNameOverrides,
} from "./types";
import type { ImpactCategory } from "../data/categories";
import { CATEGORY_ORDER, CATEGORY_LABELS } from "../data/categories";
import { CONTEXT_CARDS, type ContextCard } from "../data/contextCards";
import { IMPACT_CARDS, WILDCARD_TEMPLATE, type ImpactCard } from "../data/impactCards";
import { defaultProvider, type AIProvider } from "./llmProvider";
import { isEvidenceVague, followUpQuestionFor } from "./evidenceQuality";

const TOTAL_ROUNDS = 6;
const HAND_SIZE = 8;

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptyScores(): Record<ImpactCategory, number> {
  return CATEGORY_ORDER.reduce(
    (acc, k) => ({ ...acc, [k]: 0 }),
    {} as Record<ImpactCategory, number>
  );
}

const STAGE_HIGHLIGHT: Record<Stage, HighlightArea> = {
  welcome: null,
  round_intro: "robin",
  reveal_context: "context",
  ai_discussion: "ai_panel",
  choose_impact: "impact_hand",
  collect_evidence: "evidence_input",
  follow_up: "follow_up",
  rate_impact: "ratings",
  robin_summary: "summary",
  classify_impact: "classify",
  update_board: "progress_board",
  draw_replacement: "impact_hand",
  final_reflection: "final_reflection",
  final_report: "final_report",
};

function initialState(): GameState {
  return {
    gameStarted: false,
    stage: "welcome",
    roundNumber: 0,
    totalRounds: TOTAL_ROUNDS,
    contextDeck: [],
    impactDeck: [],
    playerHand: [],
    currentContext: null,
    selectedImpact: null,
    wildcardDraft: { title: "", description: "" },
    playerEvidence: "",
    followUpQuestion: null,
    followUpAnswer: "",
    ratingDraft: { importance: null, valence: null, councilPriority: null },
    proposedCategories: [],
    userCategories: [],
    aiAnalystResponses: [],
    caseStudies: [],
    progressScores: emptyScores(),
    highlightedArea: null,
    lastUpdatedCategories: [],
    finalReflections: null,
    personaNames: null,
  };
}

type Action =
  | { type: "START_GAME" }
  | { type: "REVEAL_CONTEXT" }
  | { type: "SET_AI_SUGGESTIONS"; payload: AISuggestion[] }
  | { type: "OPEN_HAND" }
  | { type: "SELECT_IMPACT"; payload: ImpactCard }
  | { type: "SELECT_WILDCARD" }
  | { type: "UPDATE_WILDCARD"; payload: { title?: string; description?: string } }
  // Bail out of the post-pick flow and go back to the hand. Clears the
  // selection plus any draft evidence/follow-up/ratings so the player has a
  // clean slate to reconsider.
  | { type: "RECONSIDER_IMPACT" }
  | { type: "SUBMIT_EVIDENCE"; payload: string }
  // Upgrade the templated follow-up question with an LLM-generated one. Only
  // applied while we're still on the follow_up stage for the same context.
  | { type: "UPGRADE_FOLLOWUP_QUESTION"; payload: { contextId: string; question: string } }
  | { type: "SUBMIT_FOLLOWUP"; payload: string }
  | { type: "SKIP_FOLLOWUP" }
  | { type: "UPDATE_RATINGS"; payload: Partial<Ratings> }
  | { type: "SUBMIT_RATINGS" }
  | { type: "OPEN_CLASSIFY" }
  | { type: "TOGGLE_USER_CATEGORY"; payload: ImpactCategory }
  | { type: "CONFIRM_CLASSIFICATION" }
  // Upgrade the templated `robinSummary` on the most recent case study. Keyed
  // by round so a slow LLM reply can't overwrite a later round's summary.
  | { type: "UPGRADE_LATEST_SUMMARY"; payload: { roundNumber: number; summary: string } }
  | { type: "DRAW_REPLACEMENT" }
  | { type: "NEXT_ROUND_OR_FINISH" }
  | { type: "UPDATE_FINAL_REFLECTIONS"; payload: Partial<FinalReflections> }
  | { type: "SUBMIT_FINAL_REFLECTIONS" }
  // LLM-generated per-game persona names land here when /api/persona-names
  // resolves. Stays null on failure so the static defaults remain in use.
  | { type: "SET_PERSONA_NAMES"; payload: PersonaNameOverrides }
  | { type: "RESTART" };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_GAME": {
      const contextDeck = shuffled(CONTEXT_CARDS);
      const impactDeck = shuffled(IMPACT_CARDS);
      const playerHand = impactDeck.slice(0, HAND_SIZE);
      const remainingImpact = impactDeck.slice(HAND_SIZE);
      return {
        ...initialState(),
        gameStarted: true,
        stage: "round_intro",
        roundNumber: 1,
        contextDeck,
        impactDeck: remainingImpact,
        playerHand,
        highlightedArea: STAGE_HIGHLIGHT.round_intro,
      };
    }

    case "REVEAL_CONTEXT": {
      const [next, ...rest] = state.contextDeck;
      if (!next) return state;
      return {
        ...state,
        currentContext: next,
        contextDeck: rest,
        stage: "reveal_context",
        highlightedArea: STAGE_HIGHLIGHT.reveal_context,
        selectedImpact: null,
        playerEvidence: "",
        followUpQuestion: null,
        followUpAnswer: "",
        ratingDraft: { importance: null, valence: null, councilPriority: null },
        proposedCategories: [],
        userCategories: [],
        wildcardDraft: { title: "", description: "" },
        aiAnalystResponses: [],
        lastUpdatedCategories: [],
      };
    }

    case "SET_AI_SUGGESTIONS": {
      return {
        ...state,
        aiAnalystResponses: action.payload,
        stage: "ai_discussion",
        highlightedArea: STAGE_HIGHLIGHT.ai_discussion,
      };
    }

    case "OPEN_HAND":
      return {
        ...state,
        stage: "choose_impact",
        highlightedArea: STAGE_HIGHLIGHT.choose_impact,
      };

    case "SELECT_IMPACT":
      return {
        ...state,
        selectedImpact: action.payload,
        stage: "collect_evidence",
        highlightedArea: STAGE_HIGHLIGHT.collect_evidence,
      };

    case "SELECT_WILDCARD":
      return {
        ...state,
        selectedImpact: { ...WILDCARD_TEMPLATE },
        stage: "collect_evidence",
        highlightedArea: STAGE_HIGHLIGHT.collect_evidence,
      };

    case "UPDATE_WILDCARD":
      return {
        ...state,
        wildcardDraft: {
          title: action.payload.title ?? state.wildcardDraft.title,
          description: action.payload.description ?? state.wildcardDraft.description,
        },
      };

    case "RECONSIDER_IMPACT": {
      // Only valid while we're in the post-pick flow (and not yet committed
      // to the board). Beyond rate_impact the round is essentially done.
      const reconsiderableStages: Stage[] = [
        "collect_evidence",
        "follow_up",
        "rate_impact",
      ];
      if (!reconsiderableStages.includes(state.stage)) return state;
      return {
        ...state,
        selectedImpact: null,
        wildcardDraft: { title: "", description: "" },
        playerEvidence: "",
        followUpQuestion: null,
        followUpAnswer: "",
        ratingDraft: { importance: null, valence: null, councilPriority: null },
        stage: "choose_impact",
        highlightedArea: STAGE_HIGHLIGHT.choose_impact,
      };
    }

    case "SUBMIT_EVIDENCE": {
      const text = action.payload;
      const vague = isEvidenceVague(text);
      if (vague) {
        return {
          ...state,
          playerEvidence: text,
          followUpQuestion: followUpQuestionFor(text),
          stage: "follow_up",
          highlightedArea: STAGE_HIGHLIGHT.follow_up,
        };
      }
      return {
        ...state,
        playerEvidence: text,
        stage: "rate_impact",
        highlightedArea: STAGE_HIGHLIGHT.rate_impact,
      };
    }

    case "UPGRADE_FOLLOWUP_QUESTION": {
      // Only apply if we're still on follow_up for the same context the
      // upgrade was requested for. Stops a slow reply from overwriting a
      // later round's question.
      if (
        state.stage !== "follow_up" ||
        !state.currentContext ||
        state.currentContext.id !== action.payload.contextId
      ) {
        return state;
      }
      return { ...state, followUpQuestion: action.payload.question };
    }

    case "SUBMIT_FOLLOWUP":
      return {
        ...state,
        followUpAnswer: action.payload,
        stage: "rate_impact",
        highlightedArea: STAGE_HIGHLIGHT.rate_impact,
      };

    case "SKIP_FOLLOWUP":
      return {
        ...state,
        followUpAnswer: "",
        stage: "rate_impact",
        highlightedArea: STAGE_HIGHLIGHT.rate_impact,
      };

    case "UPDATE_RATINGS":
      return {
        ...state,
        ratingDraft: { ...state.ratingDraft, ...action.payload },
      };

    case "SUBMIT_RATINGS": {
      // After ratings, compute Robin's proposed categories and move to robin_summary.
      if (!state.currentContext || !state.selectedImpact) return state;
      const isWild = !!state.selectedImpact.isWildcard;
      const proposed = isWild
        ? state.currentContext.icons.slice(0, 2)
        : state.selectedImpact.icons.length
        ? state.selectedImpact.icons
        : state.currentContext.icons.slice(0, 1);
      return {
        ...state,
        proposedCategories: proposed,
        userCategories: proposed,
        stage: "robin_summary",
        highlightedArea: STAGE_HIGHLIGHT.robin_summary,
      };
    }

    case "OPEN_CLASSIFY":
      return {
        ...state,
        stage: "classify_impact",
        highlightedArea: STAGE_HIGHLIGHT.classify_impact,
      };

    case "TOGGLE_USER_CATEGORY": {
      const set = new Set(state.userCategories);
      if (set.has(action.payload)) set.delete(action.payload);
      else set.add(action.payload);
      return {
        ...state,
        userCategories: CATEGORY_ORDER.filter((c) => set.has(c)),
      };
    }

    case "CONFIRM_CLASSIFICATION": {
      if (!state.currentContext || !state.selectedImpact) return state;

      let categories = state.userCategories;
      if (categories.length === 0) {
        // Fallback to the proposed set so the board always advances.
        categories = state.proposedCategories.length
          ? state.proposedCategories
          : state.currentContext.icons.slice(0, 1);
      }

      const newScores = { ...state.progressScores };
      for (const c of categories) {
        newScores[c] = Math.min(10, (newScores[c] ?? 0) + 1);
      }

      const isWild = !!state.selectedImpact.isWildcard;
      const robinTitle = isWild
        ? state.wildcardDraft.title || "Analyst's own impact"
        : robinTitleFor(state.selectedImpact.title, state.currentContext.title);

      const userConfirmed =
        sameCategories(categories, state.proposedCategories);

      const robinSummary = buildRobinSummary({
        contextTitle: state.currentContext.title,
        impactTitle: isWild
          ? state.wildcardDraft.title || "the impact you described"
          : state.selectedImpact.title,
        impactDescription: isWild
          ? state.wildcardDraft.description
          : state.selectedImpact.description,
        evidence: state.playerEvidence,
        followUpAnswer: state.followUpAnswer,
        categories,
        isWild,
      });

      const caseStudy: CaseStudy = {
        roundNumber: state.roundNumber,
        contextCard: state.currentContext,
        selectedImpact: state.selectedImpact,
        wildcardTitle: isWild ? state.wildcardDraft.title : undefined,
        wildcardDescription: isWild ? state.wildcardDraft.description : undefined,
        playerEvidence: state.playerEvidence,
        followUpQuestion: state.followUpQuestion ?? undefined,
        followUpAnswer: state.followUpAnswer || undefined,
        aiSuggestions: state.aiAnalystResponses,
        robinTitle,
        robinSummary,
        proposedCategories: state.proposedCategories,
        categoriesUpdated: categories,
        userConfirmedCategories: userConfirmed,
        importance: state.ratingDraft.importance ?? undefined,
        valence: state.ratingDraft.valence ?? undefined,
        councilPriority: state.ratingDraft.councilPriority ?? undefined,
      };

      return {
        ...state,
        progressScores: newScores,
        caseStudies: [...state.caseStudies, caseStudy],
        stage: "update_board",
        highlightedArea: STAGE_HIGHLIGHT.update_board,
        lastUpdatedCategories: categories,
      };
    }

    case "UPGRADE_LATEST_SUMMARY": {
      // Replace the templated `robinSummary` on the case study for the
      // requested round. If the round doesn't match (e.g. user advanced fast
      // or the reply arrived very late), keep the existing summary.
      const idx = state.caseStudies.findIndex(
        (c) => c.roundNumber === action.payload.roundNumber
      );
      if (idx === -1) return state;
      const updated = state.caseStudies.slice();
      updated[idx] = { ...updated[idx], robinSummary: action.payload.summary };
      return { ...state, caseStudies: updated };
    }

    case "DRAW_REPLACEMENT": {
      if (!state.selectedImpact || state.selectedImpact.isWildcard) {
        return {
          ...state,
          stage: "draw_replacement",
          highlightedArea: STAGE_HIGHLIGHT.draw_replacement,
        };
      }
      const discardedId = state.selectedImpact.id;
      const remainingHand = state.playerHand.filter((c) => c.id !== discardedId);
      const [next, ...restDeck] = state.impactDeck;
      const newHand = next ? [...remainingHand, next] : remainingHand;
      return {
        ...state,
        playerHand: newHand,
        impactDeck: restDeck,
        stage: "draw_replacement",
        highlightedArea: STAGE_HIGHLIGHT.draw_replacement,
      };
    }

    case "NEXT_ROUND_OR_FINISH": {
      if (state.roundNumber >= state.totalRounds) {
        return {
          ...state,
          stage: "final_reflection",
          highlightedArea: STAGE_HIGHLIGHT.final_reflection,
        };
      }
      return {
        ...state,
        roundNumber: state.roundNumber + 1,
        stage: "round_intro",
        highlightedArea: STAGE_HIGHLIGHT.round_intro,
        currentContext: null,
        selectedImpact: null,
        playerEvidence: "",
        followUpQuestion: null,
        followUpAnswer: "",
        ratingDraft: { importance: null, valence: null, councilPriority: null },
        proposedCategories: [],
        userCategories: [],
        wildcardDraft: { title: "", description: "" },
        aiAnalystResponses: [],
        lastUpdatedCategories: [],
      };
    }

    case "UPDATE_FINAL_REFLECTIONS": {
      const cur: FinalReflections = state.finalReflections ?? {
        mostImportantImpact: "",
        missingImpacts: "",
        benefitsVsCosts: "",
        councilPriority: "",
      };
      return {
        ...state,
        finalReflections: { ...cur, ...action.payload },
      };
    }

    case "SUBMIT_FINAL_REFLECTIONS":
      return {
        ...state,
        stage: "final_report",
        highlightedArea: STAGE_HIGHLIGHT.final_report,
      };

    case "SET_PERSONA_NAMES":
      // Only meaningful while a game is running. After RESTART the field is
      // back to null and the next START_GAME will trigger a fresh fetch.
      return { ...state, personaNames: action.payload };

    case "RESTART":
      return initialState();
  }
}

function sameCategories(a: ImpactCategory[], b: ImpactCategory[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((c) => set.has(c));
}

function robinTitleFor(impactTitle: string, contextTitle: string): string {
  return `${impactTitle} — ${contextTitle}`;
}

function buildRobinSummary(opts: {
  contextTitle: string;
  impactTitle: string;
  impactDescription?: string;
  evidence: string;
  followUpAnswer?: string;
  categories: ImpactCategory[];
  isWild: boolean;
}): string {
  const {
    contextTitle, impactTitle, impactDescription, evidence,
    followUpAnswer, categories, isWild,
  } = opts;
  const catText = categories.map((c) => `**${CATEGORY_LABELS[c]}**`).join(" and ");

  const opener = isWild
    ? `You wrote your own impact for **${contextTitle}**: *${impactTitle}*.`
    : `For **${contextTitle}**, you chose *${impactTitle}*${
        impactDescription ? ` — ${impactDescription.replace(/\.$/, "")}` : ""
      }.`;

  const combinedEvidence = [evidence?.trim(), followUpAnswer?.trim()]
    .filter(Boolean)
    .join(" ");
  const evidenceLine = combinedEvidence
    ? `Your evidence: "${combinedEvidence}"`
    : `You didn't add a detailed example, but the choice itself is recorded.`;

  const boardLine = `This contributes to ${catText} on the Impact Assessment board.`;

  return [opener, evidenceLine, boardLine].join(" ");
}

export function useGame(provider: AIProvider = defaultProvider) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const startGame   = useCallback(() => dispatch({ type: "START_GAME" }), []);
  const beginRound  = useCallback(() => dispatch({ type: "REVEAL_CONTEXT" }), []);

  /** Async: kicks the provider, awaits, then dispatches the suggestions. */
  const runAI = useCallback(async (ctx: ContextCard, hand: ImpactCard[]) => {
    const suggestions = await provider(ctx, hand);
    dispatch({ type: "SET_AI_SUGGESTIONS", payload: suggestions });
  }, [provider]);

  const openHand    = useCallback(() => dispatch({ type: "OPEN_HAND" }), []);
  const selectImpact   = useCallback((c: ImpactCard) => dispatch({ type: "SELECT_IMPACT", payload: c }), []);
  const selectWildcard = useCallback(() => dispatch({ type: "SELECT_WILDCARD" }), []);
  const updateWildcard = useCallback(
    (patch: { title?: string; description?: string }) =>
      dispatch({ type: "UPDATE_WILDCARD", payload: patch }),
    []
  );
  const reconsiderImpact = useCallback(
    () => dispatch({ type: "RECONSIDER_IMPACT" }),
    []
  );
  const submitEvidence = useCallback(
    (text: string) => dispatch({ type: "SUBMIT_EVIDENCE", payload: text }),
    []
  );
  const submitFollowup = useCallback(
    (text: string) => dispatch({ type: "SUBMIT_FOLLOWUP", payload: text }),
    []
  );
  const upgradeFollowupQuestion = useCallback(
    (contextId: string, question: string) =>
      dispatch({ type: "UPGRADE_FOLLOWUP_QUESTION", payload: { contextId, question } }),
    []
  );
  const upgradeLatestSummary = useCallback(
    (roundNumber: number, summary: string) =>
      dispatch({ type: "UPGRADE_LATEST_SUMMARY", payload: { roundNumber, summary } }),
    []
  );
  const skipFollowup = useCallback(() => dispatch({ type: "SKIP_FOLLOWUP" }), []);
  const updateRatings = useCallback(
    (patch: Partial<Ratings>) => dispatch({ type: "UPDATE_RATINGS", payload: patch }),
    []
  );
  const submitRatings = useCallback(() => dispatch({ type: "SUBMIT_RATINGS" }), []);
  const openClassify  = useCallback(() => dispatch({ type: "OPEN_CLASSIFY" }), []);
  const toggleUserCategory = useCallback(
    (c: ImpactCategory) => dispatch({ type: "TOGGLE_USER_CATEGORY", payload: c }),
    []
  );
  const confirmClassification = useCallback(
    () => dispatch({ type: "CONFIRM_CLASSIFICATION" }),
    []
  );
  const drawReplacement  = useCallback(() => dispatch({ type: "DRAW_REPLACEMENT" }), []);
  const next             = useCallback(() => dispatch({ type: "NEXT_ROUND_OR_FINISH" }), []);
  const updateFinalReflections = useCallback(
    (patch: Partial<FinalReflections>) =>
      dispatch({ type: "UPDATE_FINAL_REFLECTIONS", payload: patch }),
    []
  );
  const submitFinalReflections = useCallback(
    () => dispatch({ type: "SUBMIT_FINAL_REFLECTIONS" }),
    []
  );
  const setPersonaNames = useCallback(
    (names: PersonaNameOverrides) =>
      dispatch({ type: "SET_PERSONA_NAMES", payload: names }),
    []
  );
  const restart = useCallback(() => dispatch({ type: "RESTART" }), []);

  const isHighlighted = useCallback(
    (area: HighlightArea) => state.highlightedArea === area,
    [state.highlightedArea]
  );

  return useMemo(
    () => ({
      state,
      startGame,
      beginRound,
      runAI,
      openHand,
      selectImpact,
      selectWildcard,
      updateWildcard,
      reconsiderImpact,
      submitEvidence,
      submitFollowup,
      upgradeFollowupQuestion,
      upgradeLatestSummary,
      skipFollowup,
      updateRatings,
      submitRatings,
      openClassify,
      toggleUserCategory,
      confirmClassification,
      drawReplacement,
      next,
      updateFinalReflections,
      submitFinalReflections,
      setPersonaNames,
      restart,
      isHighlighted,
    }),
    [
      state, startGame, beginRound, runAI, openHand, selectImpact, selectWildcard,
      updateWildcard, reconsiderImpact, submitEvidence, submitFollowup, upgradeFollowupQuestion,
      upgradeLatestSummary, skipFollowup, updateRatings,
      submitRatings, openClassify, toggleUserCategory, confirmClassification,
      drawReplacement, next, updateFinalReflections, submitFinalReflections,
      setPersonaNames, restart, isHighlighted,
    ]
  );
}

export type GameAPI = ReturnType<typeof useGame>;
export type { GameState, Stage, CaseStudy, AISuggestion, ContextCard, ImpactCard };
