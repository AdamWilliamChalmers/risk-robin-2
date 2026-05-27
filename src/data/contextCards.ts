import type { ImpactCategory } from "./categories";

export type ContextCard = {
  id: string;
  title: string;
  description: string;
  icons: ImpactCategory[];
  /** Optional preset card image (only C1 currently has artwork; others render
   *  as a styled HTML card that mimics the printed peach layout). */
  image?: string;
};

/**
 * Source of truth for the 16 Context cards. Titles, descriptions and icon
 * rows are transcribed from the printed Risk Robin board game PDF so the
 * digital cards match what players see in the physical version.
 */
export const CONTEXT_CARDS: ContextCard[] = [
  {
    id: "C1",
    title: "Edinburgh Festivals in August",
    description:
      "Create a massive influx of visitors citywide, extended nightlife, performances on streets and public spaces for venues, pop-ups, and bars",
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
    title: "Christmas & Hogmanay street events",
    description:
      "Attract more visitors and are organised on Princes Street Gardens and central public space, culminating in fireworks",
    icons: [
      "thriving_visitor_economy",
      "fair_work_more_better_jobs",
      "ongoing_investment_city",
      "toward_net_zero",
    ],
  },
  {
    id: "C3",
    title: "International Rugby Events at Murrayfield",
    description:
      "The match attracts thousands of visitors arriving for short periods of time",
    icons: ["thriving_visitor_economy", "fair_work_more_better_jobs"],
  },
  {
    id: "C4",
    title: "Major Music Concerts",
    description:
      "Major evening events at Murrayfield & Princes Street Gardens with large crowds and amplified sound",
    icons: [
      "thriving_visitor_economy",
      "fair_work_more_better_jobs",
      "toward_net_zero",
    ],
  },
  {
    id: "C5",
    title: "Cruise Ship Arrivals",
    description:
      "Cruise ships arriving to Leith & South Queensferry create an influx of day visitors exploring central Edinburgh",
    icons: [
      "thriving_visitor_economy",
      "ongoing_investment_city",
      "toward_net_zero",
    ],
  },
  {
    id: "C6",
    title: "Sunny Day Crowds",
    description:
      "Sudden influx of day-trippers (locals and visitors) in Portobello, Meadows, Arthur's Seat, Cramond, or the Pentlands",
    icons: ["thriving_visitor_economy", "toward_net_zero"],
  },
  {
    id: "C7",
    title: "Rainy/Cold Weather during Peak Season",
    description:
      "If the weather is bad during peak season, visitors move indoors to cafes, museums, shops",
    icons: ["thriving_visitor_economy", "fair_work_more_better_jobs"],
  },
  {
    id: "C8",
    title: "Peak Summer Tourism",
    description:
      "Tourists come to Edinburgh during June–July (non-festival period)",
    icons: [
      "thriving_visitor_economy",
      "fair_work_more_better_jobs",
      "ongoing_investment_city",
      "toward_net_zero",
      "better_quality_of_life_residents",
    ],
  },
  {
    id: "C9",
    title: "Short-Term Lets",
    description:
      "There is an increase of short-term rental accommodation (Airbnb growth)",
    icons: [
      "fair_work_more_better_jobs",
      "ongoing_investment_city",
      "better_quality_of_life_residents",
    ],
  },
  {
    id: "C10",
    title: "Expansion of Cafés, Bars & Restaurants",
    description: "Growing demand from visitors leads to more venues",
    icons: ["thriving_visitor_economy", "fair_work_more_better_jobs"],
  },
  {
    id: "C11",
    title: "Walking Tours, Bus Tours, and Day Trips",
    description: "Frequent guided groups in Old Town and popular areas",
    icons: ["thriving_visitor_economy"],
  },
  {
    id: "C12",
    title: "New Hotel or Attraction Developments",
    description: "New development planned to cater for growing tourism",
    icons: ["fair_work_more_better_jobs", "ongoing_investment_city"],
  },
  {
    id: "C13",
    title: "Increased Coach & Tour Bus Traffic",
    description: "Coaches parking near landmarks and residential streets",
    icons: ["thriving_visitor_economy", "toward_net_zero"],
  },
  {
    id: "C14",
    title: "Post-Event Waste & Clean-Up",
    description:
      "Activities organised to clean up after a major event or festival",
    icons: ["ongoing_investment_city", "better_quality_of_life_residents"],
  },
  {
    id: "C15",
    title: "Visitor Pressure on Green Spaces",
    description:
      "More visitors are attracted to green spaces, e.g., Meadows & Calton Hill",
    icons: ["toward_net_zero", "better_quality_of_life_residents"],
  },
  {
    id: "C16",
    title: "Rise of Instagram Tourism",
    description:
      "Visitors seeking photogenic spots and influencer hotspots, e.g., Victoria Street, Circus Lane, Dean Village",
    icons: ["thriving_visitor_economy"],
  },
];
