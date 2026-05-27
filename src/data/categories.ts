// Internal keys as required by the task spec.
export type ImpactCategory =
  | "thriving_visitor_economy"
  | "fair_work_more_better_jobs"
  | "ongoing_investment_city"
  | "toward_net_zero"
  | "better_quality_of_life_residents";

export const CATEGORY_ORDER: ImpactCategory[] = [
  "thriving_visitor_economy",
  "fair_work_more_better_jobs",
  "ongoing_investment_city",
  "toward_net_zero",
  "better_quality_of_life_residents",
];

export const CATEGORY_LABELS: Record<ImpactCategory, string> = {
  thriving_visitor_economy: "Thriving Visitor Economy",
  fair_work_more_better_jobs: "Fair Work, More & Better Jobs",
  ongoing_investment_city: "Ongoing Investment in the City",
  toward_net_zero: "Toward Net Zero",
  better_quality_of_life_residents: "Better Quality of Life for Residents",
};

export const CATEGORY_SHORT: Record<ImpactCategory, string> = {
  thriving_visitor_economy: "Visitor Economy",
  fair_work_more_better_jobs: "Fair Work & Jobs",
  ongoing_investment_city: "City Investment",
  toward_net_zero: "Net Zero",
  better_quality_of_life_residents: "Quality of Life",
};

export const CATEGORY_COLORS: Record<ImpactCategory, { bg: string; text: string; ring: string }> = {
  thriving_visitor_economy:        { bg: "#E94B7B", text: "#fff", ring: "#E94B7B" },
  fair_work_more_better_jobs:      { bg: "#F39A2C", text: "#fff", ring: "#F39A2C" },
  ongoing_investment_city:         { bg: "#4FB7E0", text: "#fff", ring: "#4FB7E0" },
  toward_net_zero:                 { bg: "#7FB93C", text: "#fff", ring: "#7FB93C" },
  better_quality_of_life_residents:{ bg: "#7C3E97", text: "#fff", ring: "#7C3E97" },
};

export const CATEGORY_TOOLTIPS: Record<ImpactCategory, string> = {
  thriving_visitor_economy:
    "Tourism income, visitor spending, local businesses, and city profile.",
  fair_work_more_better_jobs:
    "Jobs, fair work, seasonal work, hospitality, and local employment.",
  ongoing_investment_city:
    "Infrastructure, amenities, public services, development, and maintenance.",
  toward_net_zero:
    "Environmental impact, emissions, green spaces, waste, and sustainability.",
  better_quality_of_life_residents:
    "Everyday life, civic pride, wellbeing, access, crowding, noise, privacy.",
};

// Simple SVG-icon component-friendly identifier (we draw the marker with colour + glyph)
export const CATEGORY_GLYPH: Record<ImpactCategory, string> = {
  thriving_visitor_economy: "£",
  fair_work_more_better_jobs: "★",
  ongoing_investment_city: "◆",
  toward_net_zero: "❀",
  better_quality_of_life_residents: "♥",
};
