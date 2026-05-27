import type { ImpactCategory } from "./categories";

export type ImpactTone = "positive" | "negative" | "mixed" | "neutral";

export type ImpactCard = {
  id: string;
  title: string;
  description: string;
  icons: ImpactCategory[];
  tone: ImpactTone;
  isWildcard?: boolean;
  image?: string;
};

// TODO: drop additional extracted impact PNGs into /public and reference them
// here. Only I1 has art at the moment; the rest render as styled HTML cards.
export const IMPACT_CARDS: ImpactCard[] = [
  // ---------- POSITIVE ----------
  {
    id: "I1",
    title: "Vibrant atmosphere & cultural pride",
    description:
      "Residents enjoy a vibrant atmosphere that comes with the event and feel cultural pride for the city.",
    icons: ["better_quality_of_life_residents"],
    tone: "positive",
    image: "impact_1.png",
  },
  {
    id: "I2",
    title: "Civic pride & global visibility",
    description:
      "Edinburgh's profile rises internationally, which residents and businesses can feel proud of.",
    icons: ["better_quality_of_life_residents", "thriving_visitor_economy"],
    tone: "positive",
  },
  {
    id: "I3",
    title: "Short-term boost for local businesses",
    description:
      "Cafés, restaurants, shops, taxis, and hotels see a concentrated rise in spending.",
    icons: ["thriving_visitor_economy", "fair_work_more_better_jobs"],
    tone: "positive",
  },
  {
    id: "I4",
    title: "Boost for casual and seasonal jobs",
    description:
      "Hospitality, stewarding, and event roles open up during peak periods.",
    icons: ["fair_work_more_better_jobs"],
    tone: "positive",
  },
  {
    id: "I5",
    title: "Increased income for pubs, hotels & taxis",
    description:
      "Late-night, transport, and hospitality sectors see clear short-term revenue.",
    icons: ["thriving_visitor_economy", "fair_work_more_better_jobs"],
    tone: "positive",
  },
  {
    id: "I6",
    title: "Improved amenities",
    description:
      "Investment driven by visitor demand can leave behind better public-facing facilities.",
    icons: ["ongoing_investment_city", "better_quality_of_life_residents"],
    tone: "positive",
  },
  {
    id: "I7",
    title: "More dining options & vibrant streets",
    description:
      "Year-round venues add variety to neighbourhoods that residents can also use.",
    icons: ["thriving_visitor_economy", "better_quality_of_life_residents"],
    tone: "positive",
  },
  {
    id: "I8",
    title: "Community clean-up initiatives",
    description:
      "Local groups, councils, and businesses coordinate to keep streets and green spaces in good shape.",
    icons: ["toward_net_zero", "better_quality_of_life_residents"],
    tone: "positive",
  },
  {
    id: "I9",
    title: "Investment in transport links",
    description:
      "Pressure from visitor traffic accelerates upgrades to stations, routes, and pedestrian areas.",
    icons: ["ongoing_investment_city", "toward_net_zero"],
    tone: "positive",
  },

  // ---------- NEGATIVE ----------
  {
    id: "I10",
    title: "Late-night noise",
    description:
      "Extended nightlife and street activity disturb sleep and the feel of a neighbourhood.",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I11",
    title: "Daytime noise",
    description:
      "Buskers, tour groups, and crowds raise constant background sound in busy areas.",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I12",
    title: "Heavy pedestrian congestion",
    description:
      "Pavements and squares become difficult to navigate for residents going about everyday life.",
    icons: ["better_quality_of_life_residents", "ongoing_investment_city"],
    tone: "negative",
  },
  {
    id: "I13",
    title: "Crowded public transport",
    description:
      "Buses, trams, and trains fill up, making local journeys slower and less reliable.",
    icons: ["ongoing_investment_city", "better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I14",
    title: "Loss of long-term rental housing",
    description:
      "Flats shift to short-term lets, reducing what is available for residents to rent.",
    icons: ["better_quality_of_life_residents", "ongoing_investment_city"],
    tone: "negative",
  },
  {
    id: "I15",
    title: "Reduced privacy & tranquillity",
    description:
      "Tour groups, photographs, and crowds reach into residential streets and quiet corners.",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I16",
    title: "Environmental damage",
    description:
      "Wear on green spaces, pollution, and disturbance reduce environmental quality.",
    icons: ["toward_net_zero", "better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I17",
    title: "Increased litter",
    description:
      "More waste in streets, parks, and viewpoints, with extra pressure on bins and cleaning crews.",
    icons: ["toward_net_zero", "ongoing_investment_city"],
    tone: "negative",
  },
  {
    id: "I18",
    title: "Rising cost of living",
    description:
      "Pressure from visitor spending feeds into prices residents pay day-to-day.",
    icons: ["better_quality_of_life_residents", "thriving_visitor_economy"],
    tone: "negative",
  },
  {
    id: "I19",
    title: "Difficult for locals to use green spaces",
    description:
      "Parks become so busy that residents lose their everyday access to them.",
    icons: ["better_quality_of_life_residents", "toward_net_zero"],
    tone: "negative",
  },
  {
    id: "I20",
    title: "Air quality and emissions pressure",
    description:
      "Coach idling, taxis, and concentrated traffic raise local air-quality concerns.",
    icons: ["toward_net_zero", "ongoing_investment_city"],
    tone: "negative",
  },
  {
    id: "I21",
    title: "Strain on council services",
    description:
      "Waste, cleansing, stewarding, and maintenance must stretch to cover peak demand.",
    icons: ["ongoing_investment_city", "toward_net_zero"],
    tone: "negative",
  },
  {
    id: "I22",
    title: "Antisocial behaviour at night",
    description:
      "Late drinking and street activity raise complaints and pressure on policing.",
    icons: ["better_quality_of_life_residents", "ongoing_investment_city"],
    tone: "negative",
  },

  // ---------- MIXED ----------
  {
    id: "I23",
    title: "Rental value increase",
    description:
      "Owners benefit from higher rents, but renters face displacement and reduced supply.",
    icons: ["thriving_visitor_economy", "better_quality_of_life_residents"],
    tone: "mixed",
  },
  {
    id: "I24",
    title: "Property value increase",
    description:
      "Property prices rise, helping owners but pricing out new residents.",
    icons: ["ongoing_investment_city", "better_quality_of_life_residents"],
    tone: "mixed",
  },
  {
    id: "I25",
    title: "Longer opening hours",
    description:
      "Late venues bring economic activity and choice, but extend noise and clean-up.",
    icons: ["thriving_visitor_economy", "better_quality_of_life_residents"],
    tone: "mixed",
  },
  {
    id: "I26",
    title: "New hotel or attraction developments",
    description:
      "Developments add jobs and amenities but can crowd out other neighbourhood uses.",
    icons: ["ongoing_investment_city", "thriving_visitor_economy", "better_quality_of_life_residents"],
    tone: "mixed",
  },
  {
    id: "I27",
    title: "Year-round visitor presence",
    description:
      "Streets and cafés stay lively all year, but residents share space with visitors constantly.",
    icons: ["thriving_visitor_economy", "better_quality_of_life_residents"],
    tone: "mixed",
  },
  {
    id: "I28",
    title: "Increased seasonal but precarious work",
    description:
      "Peak periods create jobs that don't always offer stable hours or fair pay.",
    icons: ["fair_work_more_better_jobs", "thriving_visitor_economy"],
    tone: "mixed",
  },
  {
    id: "I29",
    title: "Public realm wear & re-investment cycle",
    description:
      "Paving, lighting, and street furniture wear out faster but get renewed sooner.",
    icons: ["ongoing_investment_city", "toward_net_zero"],
    tone: "mixed",
  },
  {
    id: "I30",
    title: "Cultural exchange and friction",
    description:
      "Visitors bring new connections to the city, but also clashes around expectations.",
    icons: ["better_quality_of_life_residents", "thriving_visitor_economy"],
    tone: "mixed",
  },

  // ---------- NEUTRAL / OBSERVATIONAL ----------
  {
    id: "I31",
    title: "Higher visibility of Edinburgh as a destination",
    description:
      "The city features more often in international media and travel content.",
    icons: ["thriving_visitor_economy"],
    tone: "neutral",
  },
  {
    id: "I32",
    title: "Pressure on iconic viewpoints",
    description:
      "A small number of locations carry a large share of the visitor footfall.",
    icons: ["better_quality_of_life_residents", "toward_net_zero"],
    tone: "neutral",
  },
  {
    id: "I33",
    title: "Concentration of activity in the Old Town",
    description:
      "Footfall is unevenly distributed, focused on a small geographic area.",
    icons: ["ongoing_investment_city", "better_quality_of_life_residents"],
    tone: "neutral",
  },
  {
    id: "I34",
    title: "Shift in retail mix",
    description:
      "Shops oriented to visitors gradually replace those serving residents.",
    icons: ["thriving_visitor_economy", "better_quality_of_life_residents"],
    tone: "neutral",
  },
];

/** Used by the Wild Card flow - never appears in the random deck. */
export const WILDCARD_TEMPLATE: ImpactCard = {
  id: "wildcard_user_generated",
  title: "Wild Card",
  description: "None of these quite fit? Write your own impact.",
  icons: [],
  tone: "neutral",
  isWildcard: true,
};
