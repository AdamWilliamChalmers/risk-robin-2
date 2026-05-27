import type { ImpactCategory } from "./categories";

export type ContextCard = {
  id: string;
  title: string;
  description: string;
  icons: ImpactCategory[];
  /** Optional preset card image. Use available PNGs where present; otherwise the
   *  component renders a styled HTML card with the same look. */
  image?: string;
};

// TODO: drop additional extracted context PNGs into /public and reference them
// here by setting `image: "context_2.png"` etc.
export const CONTEXT_CARDS: ContextCard[] = [
  {
    id: "C1",
    title: "Edinburgh Festivals in August",
    description:
      "Create a massive influx of visitors citywide, extended nightlife, performances on streets and public spaces for venues, pop-ups, and bars.",
    icons: [
      "thriving_visitor_economy",
      "fair_work_more_better_jobs",
      "ongoing_investment_city",
      "toward_net_zero",
    ],
    image: "context_1.png",
  },
  {
    id: "C2",
    title: "Christmas & Hogmanay Street Events",
    description:
      "Winter markets, street parties, and fireworks bring large crowds into the city centre across several weeks.",
    icons: ["thriving_visitor_economy", "fair_work_more_better_jobs", "better_quality_of_life_residents"],
  },
  {
    id: "C3",
    title: "International Rugby at Murrayfield",
    description:
      "Major match days bring thousands of fans, packed transport, busy hospitality, and concentrated street activity.",
    icons: ["thriving_visitor_economy", "ongoing_investment_city", "better_quality_of_life_residents"],
  },
  {
    id: "C4",
    title: "Major Music Concerts",
    description:
      "Large arena and outdoor concerts draw visitors who travel into the city for one or two evenings of activity.",
    icons: ["thriving_visitor_economy", "fair_work_more_better_jobs", "better_quality_of_life_residents"],
  },
  {
    id: "C5",
    title: "Cruise Ship Arrivals",
    description:
      "Day visitors disembark in large groups and concentrate around key historic sites for short, intense visits.",
    icons: ["thriving_visitor_economy", "toward_net_zero", "ongoing_investment_city"],
  },
  {
    id: "C6",
    title: "Sunny Day Crowds",
    description:
      "Unusually fine weather draws residents and visitors to parks, viewpoints, and outdoor cafés all at once.",
    icons: ["better_quality_of_life_residents", "toward_net_zero", "thriving_visitor_economy"],
  },
  {
    id: "C7",
    title: "Rainy Weather in Peak Season",
    description:
      "Cold or wet weather pushes peak-season crowds indoors, concentrating pressure on museums, cafés, and transport.",
    icons: ["thriving_visitor_economy", "ongoing_investment_city", "better_quality_of_life_residents"],
  },
  {
    id: "C8",
    title: "Peak Summer Tourism",
    description:
      "A sustained increase in visitors over weeks raises pressure on housing, transport, and everyday city services.",
    icons: [
      "thriving_visitor_economy",
      "fair_work_more_better_jobs",
      "ongoing_investment_city",
      "better_quality_of_life_residents",
    ],
  },
  {
    id: "C9",
    title: "Short-Term Lets",
    description:
      "Residential flats converted into holiday lets change who lives in a neighbourhood and what is available to rent.",
    icons: ["thriving_visitor_economy", "better_quality_of_life_residents", "ongoing_investment_city"],
  },
  {
    id: "C10",
    title: "Expansion of Cafés, Bars & Restaurants",
    description:
      "New venues open across the city, extending opening hours and changing the character of streets and squares.",
    icons: ["thriving_visitor_economy", "fair_work_more_better_jobs", "better_quality_of_life_residents"],
  },
  {
    id: "C11",
    title: "Walking Tours, Bus Tours & Day Trips",
    description:
      "Guided groups move through narrow streets, viewpoints, and residential lanes throughout the day.",
    icons: ["thriving_visitor_economy", "better_quality_of_life_residents", "toward_net_zero"],
  },
  {
    id: "C12",
    title: "New Hotel or Attraction Developments",
    description:
      "New visitor-facing developments change the skyline and footfall in surrounding streets.",
    icons: ["ongoing_investment_city", "thriving_visitor_economy", "fair_work_more_better_jobs"],
  },
  {
    id: "C13",
    title: "Increased Coach & Tour Bus Traffic",
    description:
      "More coaches park and idle near attractions, affecting air quality, pavements, and resident streets.",
    icons: ["toward_net_zero", "ongoing_investment_city", "better_quality_of_life_residents"],
  },
  {
    id: "C14",
    title: "Post-Event Waste & Clean-Up",
    description:
      "After major events, the city must absorb litter, recycling pressure, and damage to street furniture and green space.",
    icons: ["toward_net_zero", "ongoing_investment_city", "better_quality_of_life_residents"],
  },
  {
    id: "C15",
    title: "Visitor Pressure on Green Spaces",
    description:
      "Parks, gardens, and viewpoints become busier, with wear on paths, more litter, and reduced quiet for residents.",
    icons: ["toward_net_zero", "better_quality_of_life_residents", "ongoing_investment_city"],
  },
  {
    id: "C16",
    title: "Rise of Instagram Tourism",
    description:
      "Visitors cluster at a small number of photogenic locations, creating intense, narrow pressure on those spots.",
    icons: ["thriving_visitor_economy", "better_quality_of_life_residents", "ongoing_investment_city"],
  },
];
