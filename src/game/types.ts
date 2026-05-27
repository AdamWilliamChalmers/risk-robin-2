import type { ImpactCategory } from "../data/categories";
import type { ContextCard } from "../data/contextCards";
import type { ImpactCard } from "../data/impactCards";

export type Stage =
  | "welcome"
  | "round_intro"
  | "reveal_context"
  | "ai_discussion"
  | "choose_impact"
  | "collect_evidence"
  | "follow_up"
  | "rate_impact"
  | "robin_summary"
  | "classify_impact"
  | "update_board"
  | "draw_replacement"
  | "final_reflection"
  | "final_report";

export type HighlightArea =
  | "robin"
  | "context"
  | "ai_panel"
  | "impact_hand"
  | "evidence_input"
  | "follow_up"
  | "ratings"
  | "classify"
  | "progress_board"
  | "summary"
  | "final_reflection"
  | "final_report"
  | null;

export type AIVoice = "Resident Voice" | "Economy Voice" | "Environment and City Voice";

export type AISuggestion = {
  voice: AIVoice;
  recommendedImpactIds: string[];
  reason: string;
};

export type Importance = 1 | 2 | 3 | 4 | 5;
export type Valence = "positive" | "negative" | "mixed" | "unsure";
export type CouncilPriority = "high" | "medium" | "low" | "unsure";

export type Ratings = {
  importance: Importance | null;
  valence: Valence | null;
  councilPriority: CouncilPriority | null;
};

export type CaseStudy = {
  roundNumber: number;
  contextCard: ContextCard;
  selectedImpact: ImpactCard;
  wildcardTitle?: string;
  wildcardDescription?: string;
  playerEvidence: string;
  followUpQuestion?: string;
  followUpAnswer?: string;
  aiSuggestions: AISuggestion[];
  robinTitle: string;
  robinSummary: string;
  proposedCategories: ImpactCategory[];
  categoriesUpdated: ImpactCategory[];
  userConfirmedCategories: boolean;
  importance?: Importance;
  valence?: Valence;
  councilPriority?: CouncilPriority;
};

export type ProgressScores = Record<ImpactCategory, number>;

export type FinalReflections = {
  mostImportantImpact: string;
  missingImpacts: string;
  benefitsVsCosts: string;
  councilPriority: string;
  finalCaseStudy?: {
    title: string;
    description: string;
    evidence: string;
    categories: ImpactCategory[];
    whyMissing: string;
  };
};

export type GameState = {
  gameStarted: boolean;
  stage: Stage;
  roundNumber: number;
  totalRounds: number;
  contextDeck: ContextCard[];
  impactDeck: ImpactCard[];
  playerHand: ImpactCard[];
  currentContext: ContextCard | null;
  selectedImpact: ImpactCard | null;
  wildcardDraft: { title: string; description: string };
  playerEvidence: string;
  followUpQuestion: string | null;
  followUpAnswer: string;
  ratingDraft: Ratings;
  proposedCategories: ImpactCategory[];
  userCategories: ImpactCategory[];
  aiAnalystResponses: AISuggestion[];
  caseStudies: CaseStudy[];
  progressScores: ProgressScores;
  highlightedArea: HighlightArea;
  lastUpdatedCategories: ImpactCategory[];
  finalReflections: FinalReflections | null;
};
