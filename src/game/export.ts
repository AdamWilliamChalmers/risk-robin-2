import type { CaseStudy, FinalReflections, ProgressScores } from "./types";
import { CATEGORY_LABELS } from "../data/categories";

type ExportPayload = {
  caseStudies: CaseStudy[];
  scores: ProgressScores;
  reflections: FinalReflections | null;
};

export function buildJSON({ caseStudies, scores, reflections }: ExportPayload): string {
  const payload = {
    generated_at: new Date().toISOString(),
    total_rounds: caseStudies.length,
    progress_scores: scores,
    case_studies: caseStudies,
    final_reflections: reflections,
  };
  return JSON.stringify(payload, null, 2);
}

export function buildCSV({ caseStudies }: ExportPayload): string {
  const headers = [
    "round_number",
    "context_id",
    "context_title",
    "selected_impact_id",
    "selected_impact_title",
    "is_wildcard",
    "wildcard_title",
    "wildcard_description",
    "player_evidence",
    "follow_up_question",
    "follow_up_answer",
    "importance",
    "valence",
    "council_priority",
    "categories_updated",
    "user_confirmed_categories",
    "robin_title",
    "robin_summary",
  ];

  const rows = caseStudies.map((cs) => [
    cs.roundNumber,
    cs.contextCard.id,
    cs.contextCard.title,
    cs.selectedImpact.id,
    cs.selectedImpact.title,
    cs.selectedImpact.isWildcard ? "true" : "false",
    cs.wildcardTitle ?? "",
    cs.wildcardDescription ?? "",
    cs.playerEvidence ?? "",
    cs.followUpQuestion ?? "",
    cs.followUpAnswer ?? "",
    cs.importance ?? "",
    cs.valence ?? "",
    cs.councilPriority ?? "",
    cs.categoriesUpdated.map((c) => CATEGORY_LABELS[c]).join("; "),
    cs.userConfirmedCategories ? "true" : "false",
    cs.robinTitle,
    cs.robinSummary,
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadBlob(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
