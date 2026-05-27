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

/**
 * The full deck of 73 Impact cards from the printed Risk Robin Sustainable
 * Tourism game. Titles, descriptions and icons are transcribed straight from
 * the PDF so the digital cards match the physical version one-for-one.
 *
 * IDs are kept stable as "I1"…"I73" – the on-card number shown to players is
 * the trailing digits (the leading "I" is stripped at render time).
 */
export const IMPACT_CARDS: ImpactCard[] = [
  {
    id: "I1",
    title: "Vibrant atmosphere & cultural pride",
    description:
      "Residents enjoy vibrant atmosphere that comes with the event and feel cultural pride for the city",
    icons: ["better_quality_of_life_residents"],
    tone: "positive",
    image: "impact_1.png",
  },
  {
    id: "I2",
    title: "Civic pride & visibility for Edinburgh",
    description:
      "Residents feel like proud citizens of Edinburgh and enjoy its visibility internationally",
    icons: ["better_quality_of_life_residents"],
    tone: "positive",
  },
  {
    id: "I3",
    title: "Enjoyable festive atmosphere & activities",
    description:
      "Residents feel nice festive atmosphere and enjoy the activities that come with it",
    icons: ["better_quality_of_life_residents"],
    tone: "positive",
  },
  {
    id: "I4",
    title: "Positive shared experiences & civic buzz",
    description:
      "Residents have a feeling of shared experience and enjoy civic buzz",
    icons: ["better_quality_of_life_residents"],
    tone: "positive",
  },
  {
    id: "I5",
    title: "Reduced sense of civic pride",
    description: "Residents lose sense of civic pride",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I6",
    title: "Short-term boost for local businesses",
    description:
      "Short-term boost for local businesses and small traders",
    icons: ["thriving_visitor_economy", "fair_work_more_better_jobs"],
    tone: "positive",
  },
  {
    id: "I7",
    title: "Boost for casual jobs",
    description: "Boost for casual jobs and temporary workers",
    icons: ["thriving_visitor_economy", "fair_work_more_better_jobs"],
    tone: "positive",
  },
  {
    id: "I8",
    title: "Short-term boost in hospitality income",
    description:
      "Hospitality industry experiences a short-term boost of income due to an event",
    icons: ["thriving_visitor_economy"],
    tone: "positive",
  },
  {
    id: "I9",
    title: "Seasonal retail & food opportunities",
    description:
      "Retail and food industries see more opportunities in tourism peak season",
    icons: ["thriving_visitor_economy"],
    tone: "positive",
  },
  {
    id: "I10",
    title: "Increased income for pubs, hotels, taxis",
    description:
      "Pubs, hotels and taxis see higher income with more visitors coming",
    icons: ["thriving_visitor_economy"],
    tone: "positive",
  },
  {
    id: "I11",
    title: "Higher spending in local shops & attractions",
    description:
      "Visitors spend more in local shops, cafes and attractions",
    icons: ["thriving_visitor_economy"],
    tone: "positive",
  },
  {
    id: "I12",
    title: "Transport jobs & business for local guides",
    description:
      "New tourist tours and activities create more transport jobs and business for local guides",
    icons: ["thriving_visitor_economy", "fair_work_more_better_jobs"],
    tone: "positive",
  },
  {
    id: "I13",
    title: "Increased local business exposure",
    description:
      "Visitors increase local business exposure (e.g., through Instagram)",
    icons: ["thriving_visitor_economy"],
    tone: "positive",
  },
  {
    id: "I14",
    title: "Steadier income for tourism businesses",
    description:
      "Off-peak tourism creates steadier income for tourism businesses and more consistent employment opportunities",
    icons: ["thriving_visitor_economy"],
    tone: "positive",
  },
  {
    id: "I15",
    title: "Job creation",
    description:
      "New jobs are being created with the growth in tourism sector",
    icons: ["fair_work_more_better_jobs"],
    tone: "positive",
  },
  {
    id: "I16",
    title: "Boost for indoor businesses",
    description:
      "A temporary influx of visitors indoors boosts indoor businesses",
    icons: ["thriving_visitor_economy"],
    tone: "positive",
  },
  {
    id: "I17",
    title: "Economic vitality for tourism sector",
    description:
      "Growing popularity of Edinburgh as a tourist destination improves economic vitality for tourism sector",
    icons: ["thriving_visitor_economy"],
    tone: "positive",
  },
  {
    id: "I18",
    title: "Outdoor events & attractions see reduced activity",
    description:
      "A temporary drop in visitor numbers leads to reduced participation in outdoor events and attractions",
    icons: ["thriving_visitor_economy"],
    tone: "negative",
  },
  {
    id: "I19",
    title: "Increased litter",
    description:
      "Increased litter and overflowing bins in specific areas",
    icons: ["better_quality_of_life_residents", "toward_net_zero"],
    tone: "negative",
  },
  {
    id: "I20",
    title: "Clean-up issues",
    description:
      "Issues with arranging and completing clean-up after a major event or festival on time",
    icons: ["better_quality_of_life_residents", "toward_net_zero"],
    tone: "negative",
  },
  {
    id: "I21",
    title: "Air pollution spikes",
    description:
      "Influx of visitors, e.g., tourist coaches, creates a temporary spike in air pollution",
    icons: ["better_quality_of_life_residents", "toward_net_zero"],
    tone: "negative",
  },
  {
    id: "I22",
    title: "Community clean-up initiatives",
    description:
      "There is an opportunity for community-organised clean-up initiative after the event",
    icons: ["better_quality_of_life_residents"],
    tone: "positive",
  },
  {
    id: "I23",
    title: "Temporary odour problems",
    description: "Increased litter creates temporary odour problems",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I24",
    title: "Rent & Airbnb prices spike temporarily",
    description:
      "Rent and Airbnb prices are higher than average due to a major event or festival",
    icons: ["thriving_visitor_economy"],
    tone: "negative",
  },
  {
    id: "I25",
    title: "Crowded public transport",
    description:
      "It is harder to get around for residents due to crowded public transport, creating local transport delays",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I26",
    title: "Residential flats converted for visitors",
    description:
      "There is an increase in residential flats converted into visitor accommodation",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I27",
    title: "Loss of long-term rental housing",
    description:
      "Long-term rental housing stock is reduced due to the growth of short-term lets (visitor accommodation)",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I28",
    title: "Property value increase",
    description:
      "There is an increase in property values in areas that attract more visitors",
    icons: ["better_quality_of_life_residents"],
    tone: "mixed",
  },
  {
    id: "I29",
    title: "Rental value increase",
    description:
      "There is an increase in long-term rental values in areas that attract more tourists",
    icons: ["better_quality_of_life_residents"],
    tone: "mixed",
  },
  {
    id: "I30",
    title: "Rising cost of living",
    description:
      "When lots of visitors come, prices in shops, cafés, and housing can rise — increasing the cost of living for people who live here year-round",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I31",
    title: "Reduced mobility for residents in central areas",
    description:
      "It is harder to get to central area for residents due to road closures and diversions in the central areas",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I32",
    title: "Heavy pedestrian congestion",
    description:
      "Pedestrian streets are increasingly busy, especially in the city centre and narrow streets, creating crowd management pressures",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I33",
    title: "Road closures & transport diversions",
    description:
      "Road closures and public transport diversions create inconvenience for the residents",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I34",
    title: "Public transport demand spikes",
    description:
      "Short-term influx of visitors creates spikes in demand for public transport",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I35",
    title: "Temporary traffic issues",
    description:
      "It is harder to get around due to busy and slow traffic during the festive period",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I36",
    title: "Temporary parking issues",
    description:
      "It is harder to park, especially in the central areas, during the festive period",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I37",
    title: "Increased coach & taxi traffic",
    description:
      "There is an increase in coach and taxi traffic transporting visitors who arrive by cruise ships or tour buses",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I38",
    title: "Overcrowding of residential lanes",
    description:
      "Instagram-ready streets and walking tours draw in crowds to residential lanes",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I39",
    title: "Increased alcohol use",
    description:
      "High alcohol use during the festival or before/after the event",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I40",
    title: "Antisocial behaviour around the event",
    description:
      "Major events are accompanied by antisocial behaviour before/after the event",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I41",
    title: "Late-night noise",
    description:
      "It is increasingly noisy late at night from extended nightlife & fireworks",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I42",
    title: "Daytime noise",
    description: "Central areas are increasingly noisy during the day",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I43",
    title: "Noise for nearby residents",
    description:
      "Noise disturbance and reduced tranquillity for nearby residents",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I44",
    title: "Construction noise & disruption",
    description:
      "New development creates noise and local disruption in the area",
    icons: ["ongoing_investment_city", "better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I45",
    title: "Difficult for locals to use green spaces",
    description:
      "Increased numbers of visitors going to green spaces make it difficult and less enjoyable for locals to use public parks",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I46",
    title: "Increased wear on public areas",
    description:
      "Increase numbers of visitors wear out public areas",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I47",
    title: "Barbecues in parks",
    description:
      "Increased numbers of barbecues in parks create disturbance for locals and can be a fire hazard",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I48",
    title: "Environmental damage",
    description:
      "Increased numbers of visitors going to green spaces create risks of environmental damage",
    icons: ["toward_net_zero", "better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I49",
    title: "Erosion & path damage",
    description:
      "Increased numbers of visitors going to green spaces erode and damage footpaths",
    icons: ["toward_net_zero", "better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I50",
    title: "Relief for residents in outdoor areas",
    description:
      "An influx of visitors to indoor areas brings relief for residents outdoors",
    icons: ["better_quality_of_life_residents"],
    tone: "positive",
  },
  {
    id: "I51",
    title: "Loss of local character or green space",
    description:
      "Increased numbers of visitors lead to a loss of local character of an area of green space",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I52",
    title: "More awareness of environmental protection needs",
    description:
      "Environmental damage in green spaces caused by increased visitor numbers raised awareness of the environmental protection needed",
    icons: ["better_quality_of_life_residents"],
    tone: "positive",
  },
  {
    id: "I53",
    title: "Queues in cafes",
    description: "Increased numbers of visitors create queues in cafes",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I54",
    title: "Overcrowding indoors",
    description:
      "An influx of visitors to indoor areas leads to overcrowding and long queues indoors",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I55",
    title: "Reduced attendance of outdoor events",
    description: "Outdoor events and attractions see reduced activity",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I56",
    title: "Reduced access to amenities for locals",
    description:
      "Increased numbers of visitors make amenities less accessible for locals",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I57",
    title: "Improved amenities",
    description:
      "Growing tourism industry prompts improvements in amenities",
    icons: ["ongoing_investment_city", "better_quality_of_life_residents"],
    tone: "positive",
  },
  {
    id: "I58",
    title: "Longer opening hours, especially in city centre",
    description:
      "With an increase in the numbers of visitors, places stay open for longer hours, especially in the city centre",
    icons: ["better_quality_of_life_residents"],
    tone: "mixed",
  },
  {
    id: "I59",
    title: "More dining options & vibrant streets",
    description:
      "With the expansion of food sector, local residents have more dining options and enjoy more vibrant streets",
    icons: ["ongoing_investment_city", "better_quality_of_life_residents"],
    tone: "positive",
  },
  {
    id: "I60",
    title: "Rising prices in local venues",
    description:
      "Increase numbers of visitors lead to increased prices in local venues",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I61",
    title: "Crowded main attractions",
    description:
      "Crowded Old Town and main attractions due to higher number of visitors",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I62",
    title: "More transient neighbours",
    description:
      "More transient and less cohesive neighbours and less stable communities due to increased numbers of visitors",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I63",
    title: "Reduced privacy & tranquillity",
    description:
      "Locals experience less privacy and reduced tranquillity due to an influx of tourism visitors",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I64",
    title: "New buildings replacing older community spaces",
    description:
      "With new developments, new buildings replace old community spaces",
    icons: ["ongoing_investment_city", "better_quality_of_life_residents"],
    tone: "mixed",
  },
  {
    id: "I65",
    title: "Complaints about obstruction",
    description:
      "Residents complain about the obstruction from increased numbers of coaches",
    icons: ["ongoing_investment_city", "better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I66",
    title: "Temporary eyesore",
    description:
      "The aftermaths of festivals (e.g., waste) creates temporary eyesore for locals",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I67",
    title: "Erosion of \u201cauthentic\u201d neighbourhood life",
    description:
      "Increase numbers of visitors to a specific area lead to an erosion of \u201cauthentic\u201d neighbourhood life",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I68",
    title: "Frustration from constant photography",
    description:
      "An influx of visitors into Instagram-ready areas create frustration from constant photography & footfall",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I69",
    title: "Reduced respite for locals between busy periods",
    description:
      "Extending the tourism season reduces periods of peace and quiet for locals",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I70",
    title: "Gradual \u201cnormalisation\u201d of crowds year-round",
    description:
      "High numbers of visitors gradually become \u201cnormalised\u201d",
    icons: ["better_quality_of_life_residents"],
    tone: "neutral",
  },
  {
    id: "I71",
    title: "Year-round visitor presence in public spaces & cafes",
    description:
      "Visitors are seen in public spaces and cafes all year around",
    icons: ["better_quality_of_life_residents"],
    tone: "neutral",
  },
  {
    id: "I72",
    title: "Council maintenance costs rise",
    description:
      "The cost of maintaining public and green spaces increases for the city council",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
  {
    id: "I73",
    title: "Strain on council services & maintenance",
    description:
      "The need to clean up the aftermaths of major events and festivals puts a strain on council services",
    icons: ["better_quality_of_life_residents"],
    tone: "negative",
  },
];

/** Used by the Wild Card flow – never appears in the random deck. */
export const WILDCARD_TEMPLATE: ImpactCard = {
  id: "wildcard_user_generated",
  title: "Wild card",
  description: "Other positive or negative impact you have observed or are aware of. Describe the impact below:",
  icons: [],
  tone: "neutral",
  isWildcard: true,
};
