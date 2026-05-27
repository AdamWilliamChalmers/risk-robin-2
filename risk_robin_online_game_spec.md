# Risk Robin: Sustainable Tourism — Online Game Design Specification

## Purpose of this document

This document sets out a revised design for an online version of **Risk Robin: Sustainable Tourism**. The original game is a self-run board/card game for gathering public information about preferences, priorities, and lived experiences around real-world tourism impacts. The online version keeps the core logic of the physical game but adapts it for a single human participant supported by AI players.

The intended implementation is a web-based game where:

- The **Human player is always the Analyst**.
- **Robin does not rotate**.
- **Robin acts as a fixed AI facilitator**.
- Three **AI players** generate discussion and alternative perspectives.
- The **Impact Assessment board** becomes the main visual game board and is updated throughout the game.
- The game collects structured information about the human player's preferences, priorities, examples, trade-offs, and final reflections.

---

# 1. Core concept

## 1.1 Original game logic

The original physical version uses:

- **Context Cards**: tourism-related situations, such as festivals, short-term lets, cruise ship arrivals, green-space pressure, walking tours, coach traffic, or major events.
- **Impact Cards**: possible consequences for residents, businesses, the visitor economy, the environment, jobs, public space, city services, and quality of life.
- **Chief Analyst Robin**: a role that rotates among players in the physical game. Robin chooses a context, listens to evidence, selects the strongest impact, and writes a case study.
- **Case Study Cards**: short written outputs that connect a context, an impact, and evidence.
- **Impact Assessment Card**: a scoring/progress board that tracks how chosen evidence relates to five wider city goals.

## 1.2 Revised online logic

In the online version, the rotating role should be removed.

The game should instead use this structure:

| Role | Description |
|---|---|
| Human player | Always the Analyst. Makes choices, gives evidence, ranks importance, responds to AI suggestions, and provides final reflections. |
| Robin | Fixed AI facilitator. Introduces rounds, explains cards, asks follow-up questions, writes short case-study entries, and updates the Impact Assessment board. |
| AI Player 1 | Simulated local/resident perspective. Focuses on quality of life, housing, access, neighbourhood character, public space, crowding, noise, and everyday life. |
| AI Player 2 | Simulated economy/business/jobs perspective. Focuses on tourism income, local business, employment, hospitality, investment, and visitor economy benefits. |
| AI Player 3 | Simulated environment/city-services perspective. Focuses on green space, transport, emissions, maintenance, waste, infrastructure, public services, and sustainability. |

The human participant should always feel that they are the person whose views matter. The AI players are there to stimulate thinking, not to outvote or replace the human.

---

# 2. Main design principle

## The game is not a quiz

The online version should not feel like a survey, test, or knowledge check.

It should feel like a guided discussion with a visual board.

The game should make clear that:

- There are no right or wrong answers.
- The AI players are not judging the human.
- The aim is to understand preferences, examples, priorities, and trade-offs.
- The human's choices are the main data of interest.
- Concrete examples are more useful than abstract opinions.

Recommended opening language:

> This is not a quiz. There are no right or wrong answers. The aim is to understand how you think about tourism, trade-offs, local impacts, and what Edinburgh City Council should pay attention to.

---

# 3. Key objects in the game

## 3.1 Context Cards

A **Context Card** introduces a tourism-related situation.

Examples include:

- Edinburgh Festivals in August
- Christmas & Hogmanay street events
- International Rugby Events at Murrayfield
- Major Music Concerts
- Cruise Ship Arrivals
- Sunny Day Crowds
- Rainy/Cold Weather during Peak Season
- Peak Summer Tourism
- Short-Term Lets
- Expansion of Cafés, Bars & Restaurants
- Walking Tours, Bus Tours, and Day Trips
- New Hotel or Attraction Developments
- Increased Coach & Tour Bus Traffic
- Post-Event Waste & Clean-Up
- Visitor Pressure on Green Spaces
- Rise of Instagram Tourism

Each Context Card should include:

```json
{
  "id": "C1",
  "title": "Edinburgh Festivals in August",
  "description": "Create a massive influx of visitors citywide, extended nightlife, performances on streets and public spaces for venues, pop-ups, and bars",
  "icons": ["visitor_economy", "fair_work_jobs", "city_investment", "net_zero"]
}
```

## 3.2 Impact Cards

An **Impact Card** describes a possible consequence of the selected context.

Example:

```json
{
  "id": "I1",
  "title": "Vibrant atmosphere & cultural pride",
  "description": "Residents enjoy vibrant atmosphere that comes with the event and feel cultural pride for the city",
  "icons": ["quality_of_life"]
}
```

Impact Cards can be positive, negative, mixed, or ambiguous.

Examples of positive impacts:

- Vibrant atmosphere & cultural pride
- Civic pride & visibility for Edinburgh
- Short-term boost for local businesses
- Boost for casual jobs
- Increased income for pubs, hotels, taxis
- Improved amenities
- More dining options & vibrant streets
- Community clean-up initiatives

Examples of negative impacts:

- Late-night noise
- Daytime noise
- Heavy pedestrian congestion
- Crowded public transport
- Loss of long-term rental housing
- Reduced privacy & tranquillity
- Environmental damage
- Increased litter
- Rising cost of living
- Difficult for locals to use green spaces

Examples of mixed impacts:

- Rental value increase
- Property value increase
- Longer opening hours
- New hotel or attraction developments
- Year-round visitor presence in public spaces and cafés

## 3.3 Wild Card Impacts

The human should be able to create their own impact when none of the existing cards fit.

This should be implemented as:

```json
{
  "id": "wildcard_user_generated",
  "title": "User-written impact title",
  "description": "User-written explanation",
  "icons": ["selected_by_user_or_robin"]
}
```

Suggested UI text:

> None of these quite fit? Write your own impact.

Robin should then help classify the user's custom impact into one or more Impact Assessment categories.

---

# 4. Impact Assessment board

## 4.1 Purpose

The **Impact Assessment board** should become the main playing board for the online version.

It should be visible throughout the game, not only at the end.

It should track how the human's selected evidence relates to five wider city goals:

1. **Thriving Visitor Economy**
2. **Fair Work, More & Better Jobs**
3. **Ongoing Investment in the City**
4. **Toward Net Zero**
5. **Better Quality of Life for Residents**

After each round, the board should update by adding one or more markers to the relevant category row.

## 4.2 Impact categories and icon mapping

| Icon colour | Category | Meaning |
|---|---|---|
| Pink | Thriving Visitor Economy | Tourism income, visitor spending, local businesses, cultural profile, visitor economy benefits. |
| Orange | Fair Work, More & Better Jobs | Jobs, fair work, seasonal work, hospitality work, casual labour, local employment opportunities. |
| Blue | Ongoing Investment in the City | Infrastructure, amenities, public services, transport, maintenance, development, city facilities. |
| Green | Toward Net Zero | Environmental impact, emissions, green spaces, sustainability, pollution, waste, climate-related effects. |
| Purple | Better Quality of Life for Residents | Everyday life, civic pride, wellbeing, community, crowding, noise, privacy, access, neighbourhood experience. |

## 4.3 How board scoring should work

Each completed round produces a **case-study entry**.

Each case-study entry should be tagged with at least one Impact Assessment category.

The default category should come from the selected Impact Card icons.

However, the human should be allowed to confirm or adjust the category.

Example flow:

1. Context: Edinburgh Festivals in August
2. Selected impact: Vibrant atmosphere & cultural pride
3. Impact icon: Purple / Better Quality of Life for Residents
4. Human evidence: “The festivals make the city feel alive and internationally visible, and some residents feel proud of that.”
5. Robin classification: Better Quality of Life for Residents
6. Board update: Add one marker to the purple row

Suggested Robin text:

> This evidence mainly contributes to **Better Quality of Life for Residents**, because your example focuses on civic pride, shared atmosphere, and the experience of living in the city during the festivals.

If a context or impact plausibly fits more than one category, Robin may ask:

> This could also relate to the **Thriving Visitor Economy**. Do you want to count it there as well, or is your example mainly about resident experience?

## 4.4 Data to store after each round

Each round should create a structured record.

Suggested JSON schema:

```json
{
  "round_number": 1,
  "context_card": {
    "id": "C1",
    "title": "Edinburgh Festivals in August",
    "description": "Create a massive influx of visitors citywide, extended nightlife, performances on streets and public spaces for venues, pop-ups, and bars",
    "icons": ["visitor_economy", "fair_work_jobs", "city_investment", "net_zero"]
  },
  "ai_suggestions": [
    {
      "ai_player": "Resident Voice",
      "impact_title": "Late-night noise",
      "reason": "Extended nightlife and public performances can make it harder for residents to sleep or relax."
    },
    {
      "ai_player": "Economy Voice",
      "impact_title": "Short-term boost for local businesses",
      "reason": "Festivals bring visitors who spend money in restaurants, cafés, hotels, and shops."
    },
    {
      "ai_player": "Environment and City Voice",
      "impact_title": "Increased litter and clean-up pressure",
      "reason": "Large crowds can create waste and additional pressure on council services."
    }
  ],
  "selected_impact": {
    "id": "I1",
    "title": "Vibrant atmosphere & cultural pride",
    "description": "Residents enjoy vibrant atmosphere that comes with the event and feel cultural pride for the city",
    "icons": ["quality_of_life"]
  },
  "user_evidence": "The festivals make the city feel alive and internationally visible. Even though they are busy, some residents feel proud that Edinburgh is known around the world.",
  "robin_case_study": {
    "title": "Festival atmosphere and civic pride",
    "short_description": "The Edinburgh Festivals can create a strong sense of atmosphere and civic pride for some residents, even when the city is busy.",
    "evidence_summary": "The analyst described how the festivals make the city feel lively and internationally visible, which can contribute to residents feeling proud of Edinburgh."
  },
  "impact_assessment_categories": ["quality_of_life"],
  "user_confirmed_categories": true
}
```

---

# 5. Recommended game flow

## 5.1 Start screen

The game should begin with a start screen or modal.

Recommended buttons:

- **Start Game**
- **How it works**
- **About the project**

The start screen should show:

- Robin character/avatar
- Short title
- One-line description
- Start button

Suggested title:

> Risk Robin: Sustainable Tourism

Suggested subtitle:

> Explore how tourism affects local communities in Edinburgh.

Suggested opening paragraph:

> You are the Analyst. Robin will guide you through a series of tourism situations. Three AI players will suggest different perspectives, but you decide which impacts matter most.

## 5.2 Opening instructions modal

Use the following as the main instruction text.

---

# Welcome to Risk Robin: Sustainable Tourism

Edinburgh is one of the UK’s most popular tourist destinations. Tourism brings visitors, income, jobs, culture, and investment. It can also create pressure on housing, transport, public spaces, green spaces, local services, and everyday life.

In this game, **you are the Analyst**.

You will explore different tourism situations and decide which impacts matter most. Three AI players will join the discussion by suggesting different perspectives, but **you make the final choices**.

Robin will guide the game, ask follow-up questions, write short case studies, and update the Impact Assessment board as you play.

---

# The main goal

Your task is to help build evidence about how tourism affects local communities.

In each round, you will be shown a **Context Card**.

A context is a tourism-related situation, such as:

- Edinburgh Festivals in August
- Short-Term Lets
- Cruise Ship Arrivals
- Major Music Concerts
- Visitor Pressure on Green Spaces

You will then choose an **Impact Card** that best describes what this situation means for local people, businesses, public spaces, or the city as a whole.

---

# How each round works

Each round has five steps.

## 1. A Context Card appears

Robin introduces a tourism situation.

## 2. The AI players suggest impacts

Each AI player suggests a possible impact and explains why it might matter.

## 3. You choose an impact

You can choose one of the AI suggestions, select another Impact Card, or write your own.

## 4. You give evidence

You explain why this impact matters and provide a real, personal, local, or realistic example.

## 5. Robin updates the board

Robin writes a short case-study entry and adds the impact to the Impact Assessment board.

---

# What the symbols mean

The symbols on the cards show which wider city goals the context or impact may relate to.

## Pink: Thriving Visitor Economy

Tourism income, visitor spending, local businesses, city profile, and the visitor economy.

## Orange: Fair Work, More & Better Jobs

Jobs, fair work, seasonal work, hospitality, and local employment opportunities.

## Blue: Ongoing Investment in the City

Infrastructure, amenities, public services, development, maintenance, and city facilities.

## Green: Toward Net Zero

Environmental impact, emissions, green spaces, sustainability, waste, and climate-related effects.

## Purple: Better Quality of Life for Residents

Everyday life, civic pride, community wellbeing, access, crowding, noise, privacy, and neighbourhood experience.

After each round, Robin will use these symbols to update the Impact Assessment board.

Sometimes an impact may fit more than one category. If so, Robin may ask you which connection feels most important.

---

# The Impact Assessment board

The Impact Assessment board is the main game board.

It tracks the evidence you build across five goals:

- **Thriving Visitor Economy**
- **Fair Work, More & Better Jobs**
- **Ongoing Investment in the City**
- **Toward Net Zero**
- **Better Quality of Life for Residents**

Each time you complete a round, a marker is added to the relevant row.

By the end of the game, you will be able to see the overall pattern of your choices. For example, your evidence may focus mostly on resident quality of life, or it may show a balance between economic benefits and local pressures.

---

# What counts as good evidence?

Good evidence is specific.

Instead of saying:

> The festivals are good for the city.

Try saying:

> The festivals make the city feel lively and internationally visible. Even though they are busy, some residents feel proud that Edinburgh is known around the world.

Instead of saying:

> Tourism causes problems.

Try saying:

> During August, the city centre becomes so crowded that ordinary errands take longer, and some residents feel pushed out of their usual spaces.

Robin may ask follow-up questions to help make your example clearer.

---

# At the end of the game

At the end, Robin will show your completed Impact Assessment board and summarise the case studies you created.

You will then be asked to reflect:

- **Which impacts mattered most to you?**
- **Were any important impacts missing?**
- **Were the benefits and costs of tourism fairly balanced?**
- **What should Edinburgh City Council pay most attention to?**

Your answers help reveal how people think about the real-world trade-offs of tourism.

When you are ready, click **Start Game**.

---

# 6. Round-by-round gameplay

## 6.1 Number of rounds

The original game uses 6 rounds. The online version can use either:

- **Short mode**: 4 rounds
- **Standard mode**: 6 rounds
- **Extended mode**: 8 rounds

Recommended default: **6 rounds**.

This preserves the original game structure while remaining manageable online.

## 6.2 Round structure

Each round should follow this sequence:

1. Display the Impact Assessment board.
2. Reveal a Context Card.
3. Robin briefly introduces the context.
4. Three AI players each suggest one possible impact.
5. Human selects an impact.
6. Human gives evidence.
7. Robin asks one optional follow-up question if the evidence is too vague.
8. Robin writes a short case-study entry.
9. Robin classifies the impact using the symbol system.
10. Human confirms or adjusts classification.
11. Impact Assessment board updates.
12. Continue to next round.

## 6.3 Detailed round example

### Context Card

**Edinburgh Festivals in August**

> Create a massive influx of visitors citywide, extended nightlife, performances on streets and public spaces for venues, pop-ups, and bars.

Icons:

- Thriving Visitor Economy
- Fair Work, More & Better Jobs
- Ongoing Investment in the City
- Toward Net Zero

### Robin introduction

> This round is about the Edinburgh Festivals in August. The festivals bring large numbers of visitors into the city and create performances, nightlife, pop-ups, venues, and busy public spaces. Let’s think about how this affects local communities.

### AI player suggestions

**AI Resident Voice**

> One possible impact is late-night noise. Extended nightlife and street activity can make it harder for residents to sleep, relax, or feel that their neighbourhood is still their own.

**AI Economy Voice**

> One possible impact is a short-term boost for local businesses. Visitors spend money in restaurants, hotels, shops, taxis, and cafés, which can be very important for the local economy.

**AI Environment and City Voice**

> One possible impact is increased waste and clean-up pressure. Large crowds can create litter, overflowing bins, and extra work for council services.

### Human prompt

> Which impact do you think matters most in this context?

Options:

- Choose Resident Voice suggestion
- Choose Economy Voice suggestion
- Choose Environment and City Voice suggestion
- Browse all Impact Cards
- Write my own impact

### Evidence prompt

> Why does this impact matter? Please give a real, personal, local, or realistic example.

### Optional follow-up prompt

If the user response is vague:

> Can you make that more concrete? For example, who is affected, where does it happen, and what changes for them?

### Robin case-study output

> **Case study: Festival atmosphere and civic pride**  
> The Edinburgh Festivals can create a strong sense of atmosphere and civic pride for some residents. The analyst explained that the festivals make the city feel lively and internationally visible, which can contribute to residents feeling proud of Edinburgh, even if the city is also busier than usual.

### Board update

> This evidence mainly contributes to **Better Quality of Life for Residents**, because it focuses on civic pride, atmosphere, and the experience of living in the city during the festivals.

Then add one marker to the purple row.

---

# 7. AI player design

## 7.1 AI players should not be random

Each AI player should have a stable role across the game.

This helps the human understand where each suggestion is coming from.

Recommended AI players:

## AI Player 1: Resident Voice

Focus:

- Quality of life
- Housing
- Neighbourhood character
- Noise
- Crowding
- Privacy
- Public spaces
- Local access
- Everyday routines

Tone:

- Grounded
- Local
- Practical
- Resident-centred

Example style:

> I’m thinking about how this affects people who live nearby. The issue might not be tourism in general, but the way it changes everyday routines — getting to work, sleeping, using parks, or feeling at home in your own neighbourhood.

## AI Player 2: Economy Voice

Focus:

- Local business
- Visitor spending
- Hospitality
- Jobs
- Seasonal work
- Investment
- Cultural profile
- City attractiveness

Tone:

- Pragmatic
- Opportunity-focused
- Aware of trade-offs

Example style:

> I’d look at the economic side. This context may create real pressure, but it can also support cafés, restaurants, hotels, venues, taxis, and temporary jobs. The question is who benefits and whether those benefits are widely shared.

## AI Player 3: Environment and City Voice

Focus:

- Green spaces
- Public transport
- Waste
- Pollution
- Maintenance
- Infrastructure
- Council services
- Net zero
- Long-term sustainability

Tone:

- Systems-focused
- Balanced
- Attentive to public services and environmental effects

Example style:

> I’m looking at the city-system impact. Large visitor numbers can affect transport, waste, emissions, maintenance, and green spaces. Even when tourism brings benefits, the city has to absorb the pressure.

## 7.2 AI suggestions should be concise

Each AI player should suggest one impact at a time.

Suggested maximum length:

- Impact title: 3–8 words
- Explanation: 1–2 sentences

Avoid long AI monologues. The human should not have to read too much before making a choice.

---

# 8. Robin design

## 8.1 Robin's role

Robin is the fixed facilitator.

Robin should:

- Introduce the game.
- Explain each context.
- Invite AI players to suggest impacts.
- Prompt the human to choose an impact.
- Ask follow-up questions.
- Summarise the human's evidence.
- Generate case-study entries.
- Classify impacts into the Impact Assessment categories.
- Update the board.
- Summarise the final pattern of evidence.

Robin should not:

- Replace the human's judgement.
- Decide the final interpretation without user confirmation.
- Make the game feel like a test.
- Over-explain.
- Use policy jargon unnecessarily.

## 8.2 Robin's voice

Robin should sound:

- Friendly
- Clear
- Encouraging
- Neutral
- Curious
- Non-judgemental

Suggested recurring phrases:

- “There is no right or wrong answer here.”
- “What matters is how you interpret the impact.”
- “Can you give a concrete example?”
- “Would you classify this mainly as quality of life, economic benefit, environmental pressure, or something else?”
- “I’ll add that to the Impact Assessment board.”

## 8.3 Robin should collect preferences, not just answers

Robin should ask occasional preference questions, such as:

- “How important is this impact to you?”
- “Is this mostly positive, mostly negative, or mixed?”
- “Who do you think is most affected?”
- “Would you prioritise this over the other impacts suggested?”
- “Should the council pay more attention to this?”

These can generate structured data while still feeling conversational.

---

# 9. UI layout recommendation

## 9.1 Main screen layout

Recommended desktop layout:

```text
+---------------------------------------------------------------+
| Header: Risk Robin | Round 1 of 6 | Progress                  |
+-------------------------+-------------------------------------+
| Context Card            | Impact Assessment Board             |
|                         |                                     |
| Current tourism context | 5 category rows with markers        |
|                         |                                     |
+-------------------------+-------------------------------------+
| AI Player Suggestions                                         |
| Resident Voice | Economy Voice | Environment & City Voice       |
+---------------------------------------------------------------+
| Human choice area                                             |
| Select impact / browse cards / write own                      |
+---------------------------------------------------------------+
| Evidence input                                                |
| Text box + submit                                             |
+---------------------------------------------------------------+
```

## 9.2 Mobile layout

Recommended mobile order:

1. Round number
2. Context Card
3. AI suggestions carousel
4. Human choice
5. Evidence input
6. Impact Assessment board
7. Robin summary

The Impact Assessment board should be collapsible on mobile but always easy to reopen.

## 9.3 Impact Assessment board UI

The board should show the five rows:

- Thriving Visitor Economy
- Fair Work, More & Better Jobs
- Ongoing Investment in the City
- Toward Net Zero
- Better Quality of Life for Residents

Each row should contain empty circular slots.

After a round, the relevant slot fills with a marker.

If one case study is tagged to multiple categories, multiple rows may receive a marker.

Hover/click on a filled marker should show:

- Round number
- Context title
- Selected impact
- Short evidence summary
- Category assigned

Example tooltip:

> **Round 1**  
> Context: Edinburgh Festivals in August  
> Impact: Vibrant atmosphere & cultural pride  
> Evidence: The analyst described the festivals as creating civic pride and a lively city atmosphere.

## 9.4 Icon tooltips

Whenever the user hovers over or taps an icon, show a short tooltip.

Examples:

**Thriving Visitor Economy**

> Tourism income, visitor spending, local businesses, and city profile.

**Fair Work, More & Better Jobs**

> Jobs, fair work, seasonal work, hospitality, and local employment.

**Ongoing Investment in the City**

> Infrastructure, amenities, public services, development, and maintenance.

**Toward Net Zero**

> Environmental impact, emissions, green spaces, waste, and sustainability.

**Better Quality of Life for Residents**

> Everyday life, civic pride, wellbeing, access, crowding, noise, privacy, and neighbourhood experience.

---

# 10. Data collection design

The game is designed to gather public information about preferences for real-world problems.

It should collect both:

1. **Structured data**
2. **Qualitative evidence**

## 10.1 Structured data to collect

For each round:

- Selected context card
- AI suggestions shown
- Impact selected by human
- Whether human selected AI suggestion, browsed another card, or wrote their own
- Human evidence text
- Follow-up question, if asked
- Human response to follow-up
- Impact Assessment category/categories
- User confirmation or adjustment of category
- Importance rating
- Valence rating: positive, negative, mixed
- Affected group
- Whether the council should prioritise it

Suggested structure:

```json
{
  "round_number": 1,
  "context_id": "C1",
  "selected_impact_id": "I1",
  "selection_source": "ai_suggestion | impact_card_browser | wildcard",
  "user_evidence": "string",
  "follow_up_question": "string | null",
  "follow_up_answer": "string | null",
  "assigned_categories": ["quality_of_life"],
  "user_confirmed_categories": true,
  "importance_rating": 4,
  "valence": "positive | negative | mixed | unsure",
  "affected_groups": ["residents", "local_businesses"],
  "council_priority": "high | medium | low | unsure"
}
```

## 10.2 Qualitative data to collect

For each round:

- The user's explanation
- Concrete example
- Trade-off reasoning
- Any disagreement with AI suggestions
- Any user-generated impacts
- Final reflections

## 10.3 Suggested rating questions

After the user gives evidence, ask 1–2 short structured questions.

Do not overload the player.

Recommended questions:

### Importance

> How important is this impact?

Options:

- Not very important
- Somewhat important
- Important
- Very important
- Extremely important

### Valence

> Is this impact mostly positive, mostly negative, or mixed?

Options:

- Mostly positive
- Mostly negative
- Mixed
- Unsure

### Council priority

> Should Edinburgh City Council pay more attention to this?

Options:

- Yes, high priority
- Yes, but medium priority
- Low priority
- Not sure

---

# 11. End-of-game flow

## 11.1 Final board review

At the end of the game, show the completed Impact Assessment board.

Robin should summarise the pattern.

Example:

> Your case studies focused most strongly on **Better Quality of Life for Residents** and **Toward Net Zero**. You also recognised some benefits for the **Thriving Visitor Economy**, but your examples placed more emphasis on pressure, crowding, public space, and resident experience.

## 11.2 Final reflection questions

Ask the user:

1. Which impact mattered most to you overall?
2. Were any important impacts missing from the game?
3. Did the benefits of tourism outweigh the costs in the examples you discussed?
4. What should Edinburgh City Council pay most attention to?
5. If you could add one final case study, what would it be?

## 11.3 Final case study

Give the user the option to add one final case study to address gaps.

Suggested prompt:

> Looking at the board, is there anything important missing? You can add one final case study if you think the evidence does not yet capture something important.

Suggested final case study schema:

```json
{
  "final_case_study": {
    "title": "string",
    "description": "string",
    "evidence": "string",
    "categories": ["quality_of_life", "net_zero"],
    "why_missing": "string"
  }
}
```

---

# 12. Suggested implementation architecture

## 12.1 Frontend components

Suggested React components:

```text
App
├── StartScreen
├── InstructionsModal
├── GameLayout
│   ├── RoundHeader
│   ├── ContextCard
│   ├── ImpactAssessmentBoard
│   ├── AIPlayerPanel
│   │   ├── AIPlayerSuggestionCard
│   │   ├── AIPlayerSuggestionCard
│   │   └── AIPlayerSuggestionCard
│   ├── ImpactSelectionPanel
│   ├── EvidenceInput
│   ├── RobinMessage
│   └── RoundSummary
├── FinalReview
│   ├── CompletedImpactAssessmentBoard
│   ├── CaseStudyList
│   └── FinalReflectionForm
└── EndScreen
```

## 12.2 Core state

Suggested frontend state:

```ts
type ImpactCategory =
  | "visitor_economy"
  | "fair_work_jobs"
  | "city_investment"
  | "net_zero"
  | "quality_of_life";

type ContextCard = {
  id: string;
  title: string;
  description: string;
  icons: ImpactCategory[];
};

type ImpactCard = {
  id: string;
  title: string;
  description: string;
  icons: ImpactCategory[];
  isWildcard?: boolean;
};

type AISuggestion = {
  aiPlayer: "Resident Voice" | "Economy Voice" | "Environment and City Voice";
  impactTitle: string;
  impactDescription: string;
  reason: string;
  suggestedCategories: ImpactCategory[];
};

type CaseStudy = {
  roundNumber: number;
  contextCard: ContextCard;
  selectedImpact: ImpactCard;
  userEvidence: string;
  robinTitle: string;
  robinSummary: string;
  categories: ImpactCategory[];
  importanceRating?: number;
  valence?: "positive" | "negative" | "mixed" | "unsure";
  councilPriority?: "high" | "medium" | "low" | "unsure";
};

type GameState = {
  currentRound: number;
  totalRounds: number;
  contextDeck: ContextCard[];
  impactCards: ImpactCard[];
  currentContext: ContextCard | null;
  aiSuggestions: AISuggestion[];
  caseStudies: CaseStudy[];
  impactAssessment: Record<ImpactCategory, CaseStudy[]>;
  finalReflections?: FinalReflections;
};
```

## 12.3 Impact Assessment state update

When a case study is completed:

```ts
function updateImpactAssessment(
  currentBoard: Record<ImpactCategory, CaseStudy[]>,
  caseStudy: CaseStudy
): Record<ImpactCategory, CaseStudy[]> {
  const updatedBoard = { ...currentBoard };

  for (const category of caseStudy.categories) {
    updatedBoard[category] = [...updatedBoard[category], caseStudy];
  }

  return updatedBoard;
}
```

---

# 13. LLM prompt design

## 13.1 System instruction for Robin

Use this as a starting point for the Robin AI facilitator:

```text
You are Chief Analyst Robin, the friendly AI facilitator in an online public engagement game about sustainable tourism in Edinburgh.

The human player is always the Analyst. Your job is to guide the game, not to make decisions for them.

You introduce tourism context cards, invite three AI player perspectives, ask the human to choose an impact, help them provide concrete evidence, summarise their evidence into a short case study, and classify the evidence into one or more Impact Assessment categories.

The five Impact Assessment categories are:
1. Thriving Visitor Economy
2. Fair Work, More & Better Jobs
3. Ongoing Investment in the City
4. Toward Net Zero
5. Better Quality of Life for Residents

Be friendly, concise, neutral, and non-judgemental. Do not tell the human that an answer is right or wrong. Ask for concrete examples when answers are vague. Preserve the user's meaning. Do not invent personal experiences for the user.
```

## 13.2 AI player generation prompt

```text
Given the current Context Card, generate one concise impact suggestion from each of three AI players:

1. Resident Voice: focuses on residents, neighbourhoods, access, housing, noise, crowding, civic pride, and quality of life.
2. Economy Voice: focuses on local business, visitor spending, jobs, fair work, hospitality, and investment.
3. Environment and City Voice: focuses on green space, transport, waste, pollution, council services, maintenance, infrastructure, and sustainability.

For each AI player, return:
- impactTitle
- impactDescription
- reason
- suggestedCategories

Keep each suggestion short and concrete. Do not decide for the human. Offer plausible options that the human can accept, reject, or modify.
```

Expected output:

```json
{
  "suggestions": [
    {
      "aiPlayer": "Resident Voice",
      "impactTitle": "Late-night noise",
      "impactDescription": "Extended nightlife and street activity can disturb residents.",
      "reason": "Festivals can make the city feel lively, but nearby residents may experience disruption late at night.",
      "suggestedCategories": ["quality_of_life"]
    },
    {
      "aiPlayer": "Economy Voice",
      "impactTitle": "Boost for local businesses",
      "impactDescription": "Visitors spend money in shops, restaurants, hotels, and taxis.",
      "reason": "Large visitor numbers can support local businesses during a concentrated period.",
      "suggestedCategories": ["visitor_economy", "fair_work_jobs"]
    },
    {
      "aiPlayer": "Environment and City Voice",
      "impactTitle": "Clean-up pressure",
      "impactDescription": "Large crowds can create more litter and pressure on public services.",
      "reason": "The city has to manage waste, maintenance, and clean-up after busy events.",
      "suggestedCategories": ["city_investment", "net_zero"]
    }
  ]
}
```

## 13.3 Case study generation prompt

```text
Turn the human analyst's selected context, selected impact, and evidence into a short case-study entry.

Rules:
- Preserve the user's meaning.
- Do not exaggerate.
- Do not invent evidence.
- Use clear, plain language.
- Keep it under 100 words.
- Include a short title.
- Identify the most relevant Impact Assessment category or categories.
- Explain briefly why the category assignment fits.

Return JSON only.
```

Expected output:

```json
{
  "title": "Festival atmosphere and civic pride",
  "summary": "The Edinburgh Festivals can create a strong sense of atmosphere and civic pride for some residents. The analyst explained that the festivals make the city feel lively and internationally visible, which can contribute to residents feeling proud of Edinburgh, even if the city is also busier than usual.",
  "categories": ["quality_of_life"],
  "categoryExplanation": "This mainly relates to Better Quality of Life for Residents because the evidence focuses on civic pride, shared atmosphere, and the experience of living in the city during the festivals."
}
```

## 13.4 Evidence quality follow-up prompt

Robin should ask a follow-up if the user gives a vague answer.

Vague answer examples:

- “It is bad.”
- “It helps the city.”
- “People do not like it.”
- “It is annoying.”
- “It is good for business.”

Follow-up examples:

> Can you make that more concrete? Who is affected, where does it happen, and what changes for them?

> Could you give a specific example of what residents, businesses, or visitors might experience?

> What would this look like in everyday life?

---

# 14. Card data structure

## 14.1 Context card schema

```ts
type ContextCard = {
  id: string;
  title: string;
  description: string;
  icons: ImpactCategory[];
};
```

Example:

```json
{
  "id": "C1",
  "title": "Edinburgh Festivals in August",
  "description": "Create a massive influx of visitors citywide, extended nightlife, performances on streets and public spaces for venues, pop-ups, and bars",
  "icons": ["visitor_economy", "fair_work_jobs", "city_investment", "net_zero"]
}
```

## 14.2 Impact card schema

```ts
type ImpactCard = {
  id: string;
  title: string;
  description: string;
  icons: ImpactCategory[];
  tone?: "positive" | "negative" | "mixed";
};
```

Example:

```json
{
  "id": "I1",
  "title": "Vibrant atmosphere & cultural pride",
  "description": "Residents enjoy vibrant atmosphere that comes with the event and feel cultural pride for the city",
  "icons": ["quality_of_life"],
  "tone": "positive"
}
```

---

# 15. Suggested card browser design

The human should not be forced to pick only from the AI suggestions.

After AI suggestions appear, offer:

- Pick AI suggestion 1
- Pick AI suggestion 2
- Pick AI suggestion 3
- Browse all Impact Cards
- Write my own impact

The Impact Card browser should allow filtering by category:

- Visitor Economy
- Jobs
- Investment
- Net Zero
- Quality of Life
- Positive impacts
- Negative impacts
- Mixed impacts

This makes the game more exploratory and gives the human more agency.

---

# 16. End screen summary

At the end, generate a summary like this:

```text
Thank you for playing Risk Robin.

Across 6 rounds, your case studies focused most strongly on:

1. Better Quality of Life for Residents
2. Toward Net Zero
3. Thriving Visitor Economy

Your evidence suggested that tourism is not simply good or bad. You recognised economic and cultural benefits, but you placed strong emphasis on crowding, access to public space, environmental pressure, and the everyday experience of residents.

Your strongest recommendation for Edinburgh City Council was:
[insert user's final recommendation]
```

Then show:

- Completed Impact Assessment board
- List of case studies
- Final recommendation
- Optional export/download button

Possible export formats:

- JSON
- CSV
- PDF summary

---

# 17. Important UX principles

## 17.1 Keep the game moving

Avoid long explanations once the game starts.

Use progressive disclosure:

- Explain basics at the start.
- Use tooltips for icons.
- Use short Robin prompts during rounds.
- Keep AI suggestions brief.

## 17.2 Make the human feel in control

The human should always be able to:

- Reject AI suggestions.
- Pick another impact.
- Write their own impact.
- Correct Robin's classification.
- Add a final missing case study.

## 17.3 Make the board feel alive

After each round:

- Animate the selected category marker.
- Show a short Robin explanation.
- Let the user click previous markers to review case studies.

## 17.4 Avoid making the AI sound too authoritative

AI players should suggest, not decide.

Use language like:

- “One possible impact is...”
- “You might consider...”
- “This could matter because...”
- “Another way to look at this is...”

Avoid:

- “The correct impact is...”
- “This proves...”
- “The best answer is...”

---

# 18. Minimal viable product

## MVP features

The first playable version should include:

1. Start screen
2. Instructions modal
3. Six fixed Context Cards
4. A library of Impact Cards
5. Three AI-generated suggestions per round
6. Human impact selection
7. Human evidence text box
8. Robin-generated case-study summary
9. Impact Assessment board that updates after each round
10. Final summary screen
11. Export JSON

## Later enhancements

Possible future features:

- Voice input
- More AI personas
- Multiple cities
- Admin dashboard
- Public engagement analytics
- Heatmaps of impact priorities
- Comparison across demographic groups
- Multiplayer online mode
- Shareable final case-study report
- Council-facing dashboard

---

# 19. Cursor / Claude Code build prompt

Use the following prompt to start building the game.

```text
You are helping me build a web-based version of a public engagement card game called Risk Robin: Sustainable Tourism.

The game is about gathering public preferences and concrete examples about the impacts of tourism in Edinburgh.

Build a clean, modern, playful web app based on the following design:

- The human player is always the Analyst.
- Robin is a fixed AI facilitator, not a rotating player.
- There are three AI players: Resident Voice, Economy Voice, and Environment and City Voice.
- Each round begins with a Context Card.
- The AI players suggest possible Impact Cards.
- The human chooses an impact, gives evidence, and can also write their own impact.
- Robin turns the evidence into a short case study.
- The Impact Assessment board is the main game board and updates after each round.

The five Impact Assessment categories are:

1. Thriving Visitor Economy — pink
2. Fair Work, More & Better Jobs — orange
3. Ongoing Investment in the City — blue
4. Toward Net Zero — green
5. Better Quality of Life for Residents — purple

Please first create a clear implementation plan before writing code.

Then build the first MVP with:

- React components
- Game state management
- Sample Context Cards
- Sample Impact Cards
- A visible Impact Assessment board
- A six-round flow
- Mock AI suggestions for now
- Human evidence input
- Robin case-study summary placeholder
- Final review screen
- JSON export of the completed game session

Use a friendly visual style inspired by the original cards: soft backgrounds, large readable cards, circular icon markers, and a playful but professional feel.

Do not overcomplicate the first build. Prioritise a working game loop.
```

---

# 20. Summary of the revised online game

The online version should preserve the spirit of the original board game while simplifying the structure.

The most important changes are:

- The human is always the Analyst.
- Robin is always the facilitator.
- AI players simulate discussion but do not control the outcome.
- The Impact Assessment card becomes the main game board.
- The symbols on the cards become the scoring/classification system.
- The game gathers both structured preference data and rich qualitative evidence.
- The final output is a set of case studies and a completed Impact Assessment board showing the pattern of the human player's priorities.

This gives the game a clear online logic while keeping the core participatory purpose: helping people express what matters to them when thinking about real-world tourism trade-offs.
