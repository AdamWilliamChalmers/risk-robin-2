import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Dev-only Vite plugin that proxies three small OpenAI calls used by the game.
 *
 * Why here, not in the browser:
 *   The OpenAI API key is a long-lived secret. Calling OpenAI directly from
 *   the browser would ship the key in the bundle and expose it in every
 *   user's DevTools. This plugin keeps the key in the Node process and only
 *   the Node process talks to OpenAI.
 *
 * Why dev-only:
 *   This middleware is only registered by `configureServer`, which Vite runs
 *   in `vite dev`. The production build (`vite build` → `dist/`) does not
 *   include any of this code. If you ever deploy the app publicly, replace
 *   this with a real serverless function or backend route with the same
 *   three URLs and shapes (see HANDOFF.md §5.6).
 *
 * Endpoints (all POST, all JSON in/out):
 *
 *   POST /api/ai-analysts
 *     in:  { context, hand }
 *     out: { suggestions: AISuggestion[] }      // three voices
 *
 *   POST /api/robin-summary
 *     in:  { contextTitle, impactTitle, impactDescription?, evidence,
 *            followUpAnswer?, categories, isWild }
 *     out: { summary: string }                  // 2-3 sentence paragraph
 *
 *   POST /api/follow-up
 *     in:  { contextTitle, contextDescription, impactTitle, evidence }
 *     out: { question: string }                 // one specific question
 *
 *   POST /api/polish-text
 *     in:  { rawText, kind, context? }
 *     out: { polished: string }                 // tightened version
 *
 * If OPENAI_API_KEY is missing or OpenAI returns an error, each endpoint
 * responds with HTTP 503 and a JSON `{ error: "..." }`. The client falls
 * back to its deterministic behaviour in that case, so the game never
 * blocks on the network.
 */

type Env = {
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
};

const DEFAULT_MODEL = "gpt-4o-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
/** Per-request budget. gpt-4o-mini usually replies in well under 5s. */
const OPENAI_TIMEOUT_MS = 12_000;

type Handler = (env: Env, body: unknown) => Promise<unknown>;

export function aiPlugin(env: Env): Plugin {
  const handlers: Record<string, Handler> = {
    "/api/ai-analysts": handleAnalysts,
    "/api/robin-summary": handleRobinSummary,
    "/api/follow-up": handleFollowUp,
    "/api/polish-text": handlePolishText,
  };

  return {
    name: "risk-robin-ai",
    configureServer(server: ViteDevServer) {
      const keyState = env.OPENAI_API_KEY
        ? `present (…${env.OPENAI_API_KEY.slice(-4)})`
        : "MISSING";
      const model = env.OPENAI_MODEL || DEFAULT_MODEL;
      console.log(
        `[risk-robin-ai] plugin loaded. OPENAI_API_KEY=${keyState}, model=${model}`
      );

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        const handler = handlers[url.split("?")[0]];
        if (!handler) return next();
        if (req.method !== "POST") {
          json(res, 405, { error: "Method not allowed" });
          return;
        }
        const label = url.split("?")[0];
        const started = Date.now();
        console.log(`[risk-robin-ai] → ${label}`);
        try {
          const body = await readJson(req);
          const out = await handler(env, body);
          const ms = Date.now() - started;
          console.log(`[risk-robin-ai] ✓ ${label} (${ms}ms)`);
          json(res, 200, out);
        } catch (err) {
          const ms = Date.now() - started;
          const message = err instanceof Error ? err.message : "unknown error";
          console.warn(
            `[risk-robin-ai] ✗ ${label} (${ms}ms) — ${message}`
          );
          // 503 because the client treats this as "fall back to deterministic"
          // — not a 500, which would suggest a bug worth surfacing.
          json(res, 503, { error: message });
        }
      });
    },
  };
}

/* ---------- handlers ---------- */

async function handleAnalysts(env: Env, body: unknown): Promise<unknown> {
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

async function handleRobinSummary(env: Env, body: unknown): Promise<unknown> {
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

async function handleFollowUp(env: Env, body: unknown): Promise<unknown> {
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

async function handlePolishText(env: Env, body: unknown): Promise<unknown> {
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

/* ---------- OpenAI plumbing ---------- */

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

/* ---------- tiny utilities ---------- */

function parseJsonObject(s: string): Record<string, unknown> {
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

function expectShape(body: unknown, keys: string[]): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be a JSON object");
  }
  const obj = body as Record<string, unknown>;
  for (const k of keys) {
    if (!(k in obj)) throw new Error(`Missing field: ${k}`);
  }
  return obj;
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (raw.length === 0) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Request body is not valid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}
