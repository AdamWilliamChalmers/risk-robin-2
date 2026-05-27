/**
 * Shared AI handlers for the Risk Robin LLM endpoints.
 *
 * Single source of truth for all five LLM-powered routes. Two thin wrappers
 * import from this file:
 *
 *  - `server/aiPlugin.ts` — the Vite dev plugin (so `npm run dev` Just Works
 *    locally with `.env` / `.env.local`).
 *  - `api/*.ts` — Vercel Functions that handle the same paths in production
 *    (the dev plugin doesn't ship with `vite build`).
 *
 * Each handler has the same signature:
 *
 *     (env, body) => Promise<jsonResponseObject>
 *
 * `env` carries the two env vars the routes care about. `body` is the
 * already-parsed JSON request body. Handlers throw `Error` for any failure
 * (missing key, OpenAI 4xx/5xx, malformed model output, etc.) — both wrappers
 * translate that to an HTTP 503 with `{ error }` JSON, which the browser
 * client treats as "fall back to deterministic" instead of surfacing.
 */

export type Env = {
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
};

export type Handler = (env: Env, body: unknown) => Promise<unknown>;

export const DEFAULT_MODEL = "gpt-4o-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
/** Per-request budget. gpt-4o-mini usually replies in well under 5s. */
const OPENAI_TIMEOUT_MS = 12_000;

/* ============================================================
 * Handlers
 * ============================================================ */

export async function handleAnalysts(env: Env, body: unknown): Promise<unknown> {
  const { context, hand } = expectShape(body, ["context", "hand"]);
  const ctx = context as { id: string; title: string; description: string; icons: string[] };
  const cards = hand as Array<{
    id: string;
    title: string;
    description: string;
    icons: string[];
    tone?: string;
  }>;

  const handList = cards
    .map(
      (c, i) =>
        `${i + 1}. id=${c.id} | "${c.title}" — ${c.description} (categories: ${c.icons.join(", ")}; tone: ${c.tone ?? "n/a"})`
    )
    .join("\n");

  const handIds = new Set(cards.map((c) => c.id));

  const system = `You are simulating three risk-analyst voices for "Risk Robin", an educational game about sustainable tourism in Edinburgh.

Each voice has a distinct lens:
- "Resident Voice": everyday life in Edinburgh — neighbourhoods, noise, crowding, housing, civic pride, quality of life.
- "Economy Voice": local business, jobs, fair work, visitor spending, hospitality, retail.
- "Environment and City Voice": green space, transport, waste, emissions, public services, infrastructure, net zero.

For a given Context Card and a player's hand of Impact Cards, each voice recommends 1-2 impacts from the hand and gives a SHORT 1-2 sentence rationale that names the context and the impact concretely. Voices often disagree — that's the point. Avoid generic phrases like "this is important". Reference specific things the context and impact say.

Output JSON ONLY in this exact shape:
{
  "suggestions": [
    { "voice": "Resident Voice", "recommendedImpactIds": ["..."], "reason": "..." },
    { "voice": "Economy Voice", "recommendedImpactIds": ["..."], "reason": "..." },
    { "voice": "Environment and City Voice", "recommendedImpactIds": ["..."], "reason": "..." }
  ]
}

Rules:
- Every recommendedImpactIds value MUST be an id from the player's hand listed below. Do not invent ids.
- Each voice should pick 1 or 2 ids. Prefer 1 unless two are similarly strong.
- "reason" must be 1-2 sentences, conversational, grounded in the specific cards.`;

  const user = `CONTEXT CARD
id: ${ctx.id}
title: ${ctx.title}
description: ${ctx.description}
categories on context: ${ctx.icons.join(", ")}

PLAYER'S HAND
${handList}

Return your JSON now.`;

  const data = await callOpenAI(env, system, user, { temperature: 0.7 });
  const parsed = parseJsonObject(data);
  const suggestions = (parsed as { suggestions?: unknown }).suggestions;
  if (!Array.isArray(suggestions)) {
    throw new Error("Model did not return a suggestions array");
  }

  const VOICES = ["Resident Voice", "Economy Voice", "Environment and City Voice"] as const;

  const cleaned = suggestions
    .map((s) => {
      const o = s as { voice?: string; recommendedImpactIds?: unknown; reason?: string };
      if (typeof o.voice !== "string" || typeof o.reason !== "string") return null;
      if (!(VOICES as readonly string[]).includes(o.voice)) return null;
      const ids = Array.isArray(o.recommendedImpactIds)
        ? (o.recommendedImpactIds as unknown[]).filter(
            (id): id is string => typeof id === "string" && handIds.has(id)
          )
        : [];
      if (ids.length === 0) return null;
      return {
        voice: o.voice,
        recommendedImpactIds: ids.slice(0, 2),
        reason: o.reason.trim(),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (cleaned.length !== 3) {
    throw new Error(
      `Expected 3 valid voices after filtering, got ${cleaned.length}`
    );
  }
  return { suggestions: cleaned };
}

export async function handleRobinSummary(env: Env, body: unknown): Promise<unknown> {
  const b = expectShape(body, [
    "contextTitle",
    "impactTitle",
    "evidence",
    "categories",
    "isWild",
  ]) as {
    contextTitle: string;
    impactTitle: string;
    impactDescription?: string;
    evidence: string;
    followUpAnswer?: string;
    categories: string[];
    isWild: boolean;
  };

  const catList = b.categories.join(", ");
  const evidence = [b.evidence?.trim(), b.followUpAnswer?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();

  const system = `You are Robin, a warm, plain-spoken risk-analyst guide in the educational game "Risk Robin" (Edinburgh sustainable tourism).

Write Robin's case-study paragraph for one round. It should:
- Be 2-3 sentences, ~50-90 words.
- Open by naming the context and the impact the analyst chose, like a real notebook entry would.
- Weave in the analyst's evidence so it feels like Robin read it — don't quote it verbatim, paraphrase if it's short.
- End by noting what this contributes to on the Impact Assessment board, mentioning the relevant category names with bold markdown like **Better Quality of Life for Residents**.
- Sound like a friendly senior colleague summarising a junior analyst's work. Not breathless, not lecturing.
- Do NOT use the second person ("you") — refer to "the analyst" or just describe the choice and reasoning.

Output JSON ONLY: { "summary": "..." }`;

  const user = `Context: ${b.contextTitle}
Impact chosen: ${b.impactTitle}${b.impactDescription ? ` — ${b.impactDescription}` : ""}
Analyst-written? ${b.isWild ? "yes (wild card)" : "no"}
Analyst's evidence: ${evidence || "(none provided)"}
Categories being marked on the board: ${catList}

Return your JSON now.`;

  const data = await callOpenAI(env, system, user, { temperature: 0.6 });
  const parsed = parseJsonObject(data);
  const summary = (parsed as { summary?: unknown }).summary;
  if (typeof summary !== "string" || summary.trim().length === 0) {
    throw new Error("Model did not return a summary string");
  }
  return { summary: summary.trim() };
}

export async function handleFollowUp(env: Env, body: unknown): Promise<unknown> {
  const b = expectShape(body, [
    "contextTitle",
    "contextDescription",
    "impactTitle",
    "evidence",
  ]) as {
    contextTitle: string;
    contextDescription: string;
    impactTitle: string;
    evidence: string;
  };

  const system = `You are Robin, a friendly risk-analyst guide. The analyst just gave a thin or vague piece of evidence and you need ONE sharp follow-up question.

Rules:
- One single question, 1-2 sentences max.
- Concrete and specific. Reference the context or what they actually wrote.
- Push toward a place, a time, a person, a behaviour, or a number.
- Warm tone — coaching, not interrogating. No moralising.
- Do not pile on multiple questions. One question only.

Output JSON ONLY: { "question": "..." }`;

  const user = `Context card title: ${b.contextTitle}
Context card description: ${b.contextDescription}
Impact the analyst chose: ${b.impactTitle}
Analyst's evidence so far: ${b.evidence || "(empty)"}

Return your JSON now.`;

  const data = await callOpenAI(env, system, user, { temperature: 0.7 });
  const parsed = parseJsonObject(data);
  const question = (parsed as { question?: unknown }).question;
  if (typeof question !== "string" || question.trim().length === 0) {
    throw new Error("Model did not return a question string");
  }
  return { question: question.trim() };
}

/**
 * "Polish with AI" — turn rough bullets / messy notes into clean prose
 * WITHOUT inventing details. This is the strictest prompt in the file
 * because users will (rightly) feel cheated if the LLM puts words in
 * their mouth.
 */
const POLISH_KINDS = ["evidence", "follow_up", "reflection", "wildcard_description"] as const;
type PolishKind = (typeof POLISH_KINDS)[number];

const KIND_GUIDANCE: Record<PolishKind, string> = {
  evidence:
    "Target: 1-3 sentences, 30-90 words. This is a concrete example or observation from real life — keep it grounded and specific.",
  follow_up:
    "Target: 1-2 sentences, 20-60 words. The user is answering a follow-up question with a concrete example.",
  reflection:
    "Target: 1-2 short paragraphs, up to ~120 words total. The user is reflecting on the whole game.",
  wildcard_description:
    "Target: 1-2 sentences describing an impact the user thought up themselves.",
};

export async function handlePolishText(env: Env, body: unknown): Promise<unknown> {
  const b = expectShape(body, ["rawText", "kind"]) as {
    rawText: string;
    kind: string;
    context?: string;
  };
  if (typeof b.rawText !== "string" || b.rawText.trim().length === 0) {
    throw new Error("rawText is empty");
  }
  if (!POLISH_KINDS.includes(b.kind as PolishKind)) {
    throw new Error(`Unknown polish kind: ${b.kind}`);
  }
  const kind = b.kind as PolishKind;

  const system = `You are a careful editor helping a player polish a short written answer in an educational game about sustainable tourism in Edinburgh.

THE USER WROTE ROUGH NOTES. They may be bullets, fragments, ungrammatical, or just messy. Your job is to rewrite their notes as clean, plain-English prose that they could read aloud and be happy with.

HARD RULES — read these carefully:
1. DO NOT invent facts, places, people, statistics, dates, or details the user did not mention. If they said "Cockburn Street", do not name a different street. If they did not name a street, do not invent one.
2. DO NOT add new arguments, claims, or opinions. Only express what is already there.
3. DO preserve the user's point of view. If they wrote in first person ("I saw…"), keep it in first person. If they wrote impersonally, keep it impersonal.
4. DO keep their voice — plain, conversational, not academic. Don't add jargon.
5. DO turn bullet points and fragments into flowing sentences.
6. DO fix grammar, spelling, and clarity.
7. If the input is already polished prose, return it almost unchanged (just minor grammar fixes if any).
8. If you have NOTHING to add (e.g. input is just "yes" or 3 words), return the input unchanged.

LENGTH GUIDANCE FOR THIS KIND OF ANSWER: ${KIND_GUIDANCE[kind]}

Output JSON ONLY: { "polished": "..." }`;

  const contextLine = b.context ? `Context for this answer: ${b.context}\n\n` : "";
  const user = `${contextLine}The user wrote:\n"""\n${b.rawText}\n"""\n\nReturn your JSON now.`;

  const data = await callOpenAI(env, system, user, { temperature: 0.3 });
  const parsed = parseJsonObject(data);
  const polished = (parsed as { polished?: unknown }).polished;
  if (typeof polished !== "string" || polished.trim().length === 0) {
    throw new Error("Model did not return a polished string");
  }
  return { polished: polished.trim() };
}

/**
 * Generate a fresh trio of personas for the three AI voices. Each persona
 * keeps its voice / lens fixed (Resident / Economy / Environment) but the
 * concrete identity — name, role, neighbourhood, and one-line bio — is freshly
 * imagined per session so the player meets a varied cross-section of Edinburgh
 * over multiple playthroughs (student, musician, unemployed parent, retired
 * worker, taxi driver, NHS nurse, etc.).
 */
export async function handlePersonaNames(env: Env, _body: unknown): Promise<unknown> {
  const system = `You invent three distinct Edinburgh residents for an educational game about sustainable tourism. The three personas keep their canonical "voice" (a lens on the city), but you choose everything else: name, role / life-situation, neighbourhood, and one-line bio.

The three voices (LENSES — do not change these):
1. voice="Resident Voice" — looks at tourism through everyday life in Edinburgh: housing, noise, neighbours, schools, getting around, what the city feels like to live in.
2. voice="Economy Voice" — looks at tourism through livelihoods and money: jobs, wages, small businesses, prices, visitor spending, hospitality, fair work.
3. voice="Environment and City Voice" — looks at tourism through public services and the environment: transport, waste, emissions, green space, net-zero, the systems that keep the city running.

For each voice, invent a CONCRETE PERSON with these fields:
- "name": full first + last name. Mix backgrounds across the trio — Scottish names AND modern Edinburgh resident heritages (e.g. South Asian, Polish, Nigerian, Chinese, Eastern European, Caribbean, etc.). Avoid alliterative, silly, or fantasy names.
- "shortName": just the first name.
- "role": their job OR life situation. VARY THIS WIDELY across plays — examples (use as inspiration only, mix and match, don't always pick from this list):
   • student (University of Edinburgh, Napier, Heriot-Watt), apprentice
   • unemployed, between jobs, looking for work, full-time carer, stay-at-home parent
   • retired (teacher, postie, nurse, joiner, civil servant…)
   • musician, busker, gigging actor, festival technician, bartender, chef
   • taxi / Uber driver, bus driver, delivery rider, lorry driver
   • NHS nurse, GP receptionist, junior doctor, social worker, paramedic
   • shopkeeper, hairdresser, tattoo artist, market trader, Airbnb cleaner
   • housing officer, librarian, archivist, primary teacher, lecturer
   • startup founder, software engineer working remotely, freelance designer
   • council planner, sustainability officer, transport analyst, park warden
   • construction worker, electrician, plumber, joiner
   • tour guide, hotel receptionist, restaurant manager, café owner
   It is FINE for the Resident Voice to be a barista, or for the Economy Voice to be unemployed, etc. The lens is HOW they think, not their job title. Choose roles that make the voice's perspective vivid.
- "location": an Edinburgh-anchored place that suits the role. Neighbourhoods (Leith, Gorgie, Newington, Marchmont, Stockbridge, Portobello, Sighthill, Wester Hailes, Granton, Morningside, Pilrig, Tollcross, Bruntsfield, Murrayfield, Trinity, Corstorphine, Liberton, Niddrie, Easter Road, Dalry, Restalrig, Craigmillar, Lochend), workplaces ("Royal Mile", "Princes Street", "The Meadows", "Edinburgh University", "Edinburgh City Council", "Western General", "Waverley Station") or "across the city" all work.
- "bio": ONE sentence (max ~22 words) that grounds the persona in something specific — a routine, a worry, a small concrete detail of their life in Edinburgh. Should sound human, not corporate.

Output JSON ONLY in exactly this shape:
{
  "personas": [
    { "voice": "Resident Voice", "name": "...", "shortName": "...", "role": "...", "location": "...", "bio": "..." },
    { "voice": "Economy Voice", "name": "...", "shortName": "...", "role": "...", "location": "...", "bio": "..." },
    { "voice": "Environment and City Voice", "name": "...", "shortName": "...", "role": "...", "location": "...", "bio": "..." }
  ]
}

Hard rules:
- The three roles MUST be different from each other (do not return three students, or three café owners).
- AVOID the default names "Iona MacLeod", "Callum Bryce", "Priya Shankar".
- AVOID always defaulting Resident → teacher, Economy → café owner, Environment → council officer. Surprise the player.
- Bios must not be generic ("cares about the city"). Anchor them in a specific habit, route, worry, or small detail.`;

  const user = "Invent the three personas now. Make them feel like real, varied Edinburgh residents — not three versions of the same kind of person.";

  const data = await callOpenAI(env, system, user, { temperature: 1.0 });
  const parsed = parseJsonObject(data);
  const personas = (parsed as { personas?: unknown }).personas;
  if (!Array.isArray(personas)) {
    throw new Error("Model did not return a personas array");
  }
  const VOICES = [
    "Resident Voice",
    "Economy Voice",
    "Environment and City Voice",
  ] as const;
  const cleaned = personas
    .map((p) => {
      const o = p as {
        voice?: string;
        name?: string;
        shortName?: string;
        role?: string;
        location?: string;
        bio?: string;
      };
      if (typeof o.voice !== "string") return null;
      if (!(VOICES as readonly string[]).includes(o.voice)) return null;
      const fields = ["name", "shortName", "role", "location", "bio"] as const;
      for (const f of fields) {
        const v = o[f];
        if (typeof v !== "string" || v.trim().length === 0) return null;
      }
      return {
        voice: o.voice,
        name: o.name!.trim().slice(0, 60),
        shortName: o.shortName!.trim().slice(0, 24),
        role: o.role!.trim().slice(0, 80),
        location: o.location!.trim().slice(0, 80),
        bio: o.bio!.trim().slice(0, 240),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  if (cleaned.length !== 3) {
    throw new Error(
      `Expected 3 valid personas after filtering, got ${cleaned.length}`
    );
  }
  const seenVoices = new Set(cleaned.map((p) => p.voice));
  if (seenVoices.size !== 3) {
    throw new Error("Duplicate voices returned by model");
  }
  const seenRoles = new Set(cleaned.map((p) => p.role.toLowerCase()));
  if (seenRoles.size !== 3) {
    throw new Error("Duplicate roles returned by model");
  }
  return { personas: cleaned };
}

/**
 * Map from the HTTP path used by the browser client to the handler that
 * fulfils it. Both the Vite dev plugin and the Vercel Functions read from
 * this same table so the contracts can never drift.
 */
export const HANDLERS: Record<string, Handler> = {
  "/api/ai-analysts": handleAnalysts,
  "/api/robin-summary": handleRobinSummary,
  "/api/follow-up": handleFollowUp,
  "/api/polish-text": handlePolishText,
  "/api/persona-names": handlePersonaNames,
};

/* ============================================================
 * OpenAI plumbing
 * ============================================================ */

async function callOpenAI(
  env: Env,
  system: string,
  user: string,
  opts: { temperature?: number } = {}
): Promise<string> {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set (see .env.example)");
  }
  const model = env.OPENAI_MODEL || DEFAULT_MODEL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: opts.temperature ?? 0.6,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`OpenAI ${res.status}: ${text.slice(0, 240)}`);
    }
    const j = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = j.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length === 0) {
      throw new Error("OpenAI returned no message content");
    }
    return content;
  } finally {
    clearTimeout(timer);
  }
}

/* ============================================================
 * Tiny utilities — exported so the Vercel wrappers can reuse them
 * ============================================================ */

export function parseJsonObject(s: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    throw new Error("Model returned non-JSON output");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Model returned non-object JSON");
  }
  return parsed as Record<string, unknown>;
}

export function expectShape(body: unknown, keys: string[]): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be a JSON object");
  }
  const obj = body as Record<string, unknown>;
  for (const k of keys) {
    if (!(k in obj)) throw new Error(`Missing field: ${k}`);
  }
  return obj;
}

/**
 * Read env vars from `process.env` and shape them as an `Env`. Used by the
 * Vercel function wrappers; the Vite plugin passes its own value through
 * `loadEnv` instead so `.env.local` etc. continue to work in dev.
 */
export function envFromProcess(): Env {
  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
  };
}
