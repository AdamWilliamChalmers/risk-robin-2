import type { ContextCard } from "../data/contextCards";
import type { ImpactCard } from "../data/impactCards";
import type { ImpactCategory } from "../data/categories";
import type { AISuggestion, AIVoice } from "./types";

/**
 * Deterministic AI analysts.
 *
 * Each voice scores every card in the player's *current hand* against:
 *   - the voice's domain focus (a small keyword bank)
 *   - the categories carried by the impact card
 *   - the categories present on the current context card
 *
 * The voice then recommends 1-2 plausible impacts and renders a templated
 * 1-2 sentence rationale. The function signature is intentionally synchronous
 * so a future LLM-backed implementation can replace it without changing callers.
 *
 * Extension point: swap this function out for an async LLM call that returns
 * the same `AISuggestion[]` shape. See spec §13.2.
 */

type VoiceProfile = {
  voice: AIVoice;
  /** category weights (0-1) */
  categoryAffinity: Partial<Record<ImpactCategory, number>>;
  /** keywords that, if present in title/description, increase score */
  keywords: string[];
  /** opening phrase for rationale */
  opener: string;
};

const PROFILES: VoiceProfile[] = [
  {
    voice: "Resident Voice",
    categoryAffinity: {
      better_quality_of_life_residents: 1.0,
      ongoing_investment_city: 0.25,
    },
    keywords: [
      "noise", "crowd", "crowded", "privacy", "tranquil", "rental", "housing",
      "neighbourhood", "neighborhood", "everyday", "access", "green space",
      "civic pride", "vibrant", "atmosphere", "antisocial", "displacement",
      "cost of living", "residents",
    ],
    opener: "I’m thinking about how this lands for people who live here.",
  },
  {
    voice: "Economy Voice",
    categoryAffinity: {
      thriving_visitor_economy: 1.0,
      fair_work_more_better_jobs: 0.85,
      ongoing_investment_city: 0.2,
    },
    keywords: [
      "business", "spending", "income", "boost", "hotel", "café", "cafe",
      "restaurant", "taxi", "pub", "jobs", "casual", "seasonal", "wages",
      "investment", "rental value", "property value", "visibility",
      "destination", "hospitality", "retail",
    ],
    opener: "I’d look at the economic side here.",
  },
  {
    voice: "Environment and City Voice",
    categoryAffinity: {
      toward_net_zero: 1.0,
      ongoing_investment_city: 0.7,
    },
    keywords: [
      "litter", "waste", "pollution", "emissions", "air quality", "transport",
      "infrastructure", "maintenance", "council", "services", "green", "park",
      "environmental", "clean-up", "cleansing", "transit", "sustainability",
      "wear",
    ],
    opener: "I’m looking at the city-system impact.",
  },
];

function scoreCardForVoice(
  card: ImpactCard,
  ctx: ContextCard,
  p: VoiceProfile
): number {
  let score = 0;
  // Category affinity (impact card)
  for (const cat of card.icons) {
    score += (p.categoryAffinity[cat] ?? 0) * 1.5;
  }
  // Context-card categories give a smaller, shared boost
  for (const cat of ctx.icons) {
    score += (p.categoryAffinity[cat] ?? 0) * 0.4;
  }
  // Keyword overlap with title + description
  const haystack = `${card.title} ${card.description}`.toLowerCase();
  for (const kw of p.keywords) {
    if (haystack.includes(kw)) score += 0.5;
  }
  // Slight tilt by tone (each voice has a mild lean)
  if (p.voice === "Resident Voice" && card.tone === "negative") score += 0.15;
  if (p.voice === "Economy Voice" && card.tone === "positive") score += 0.2;
  if (p.voice === "Environment and City Voice" && card.tone === "negative") score += 0.1;
  return score;
}

function buildReason(card: ImpactCard, ctx: ContextCard, p: VoiceProfile): string {
  const t = card.title.toLowerCase();
  // Templated 1-2 sentence rationale grounded in the card + context.
  const link =
    p.voice === "Resident Voice"
      ? `For "${ctx.title}", "${card.title.toLowerCase()}" speaks directly to how everyday life changes for residents.`
      : p.voice === "Economy Voice"
      ? `"${card.title}" is where "${ctx.title}" lands on local business, jobs, and visitor spending.`
      : `"${card.title}" captures how the city has to absorb "${ctx.title}" — services, environment, and infrastructure.`;
  return `${p.opener} ${link}`;
}

export function generateAISuggestions(
  context: ContextCard,
  hand: ImpactCard[]
): AISuggestion[] {
  if (hand.length === 0) return [];

  return PROFILES.map((p) => {
    const ranked = hand
      .map((card) => ({ card, score: scoreCardForVoice(card, context, p) }))
      .sort((a, b) => b.score - a.score);

    // Always recommend at least 1; recommend 2 when the 2nd is meaningfully close.
    const top = ranked[0];
    const second = ranked[1];
    const recs = [top];
    if (second && second.score >= top.score * 0.75 && second.score > 0) {
      recs.push(second);
    }

    const reason = buildReason(top.card, context, p);

    return {
      voice: p.voice,
      recommendedImpactIds: recs.map((r) => r.card.id),
      reason,
    } satisfies AISuggestion;
  });
}
