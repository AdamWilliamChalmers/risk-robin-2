/**
 * Heuristic check for "is this evidence vague?". Used to decide whether to
 * surface Robin's optional follow-up prompt (spec §13.4). The spec calls out
 * vague answers like:
 *   - "It is bad."
 *   - "It helps the city."
 *   - "People do not like it."
 *
 * We treat evidence as vague when it is *both* short AND missing any concrete
 * anchor (a specific place, time, person, or routine). Either alone is fine.
 */
const CONCRETE_SIGNALS = [
  "when ", "where ", "who ", "i ", "my ", "we ", "they ", "during ", "after ",
  "before ", "at the ", "near ", "around ", "every ", "morning", "evening",
  "weekend", "summer", "winter", "festival", "edinburgh", "neighbour",
  "neighbor", "street", "park", "bus", "tram", "walked", "saw", "noticed",
  "live", "work", "kid", "school", "park", "shop", "bin", "noise", "rent",
  "old town", "new town", "leith", "stockbridge", "morningside",
  "high street", "royal mile", "george street", "princes street",
];

export function isEvidenceVague(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (t.length === 0) return true;
  if (t.length < 30) return true;
  const concrete = CONCRETE_SIGNALS.some((s) => t.includes(s));
  if (!concrete && t.length < 80) return true;
  return false;
}

/** Robin's follow-up prompt phrased to encourage a concrete example. */
export function followUpQuestionFor(evidence: string): string {
  const generic = [
    "Can you make that more concrete? Who is affected, where does it happen, and what changes for them?",
    "Could you give a specific example — a moment, a place, or a person you’re thinking of?",
    "What would this look like in everyday life in Edinburgh?",
  ];
  // Pick deterministically based on input so a player retrying gets a stable
  // prompt; no need for cryptographic strength here.
  let h = 0;
  for (let i = 0; i < evidence.length; i++) h = (h * 31 + evidence.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % generic.length;
  return generic[idx];
}
