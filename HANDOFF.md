# Risk Robin Online — Developer Hand-off

A guide for picking this project up in Cursor (or any editor) and continuing
development. The game design source of truth is
`risk_robin_online_game_spec.md` (read that once for product intent; use this
file for how the code is wired).

---

## 0. Run it now (first time)

From the project folder (`Risk Robin 2`):

```bash
cd "/Users/achalme2/Desktop/Risk Robin 2"   # adjust path if you moved the folder
npm install
npm run dev
```

Open **http://localhost:5173** in a desktop browser (layout is desktop-first).

**What you should see**

1. Welcome modal — click through to start a 6-round game.
2. Play area: Robin guide (left), context + impact hand + AI panel (centre),
   Impact Assessment board (right).
3. Sticky bottom bar with one primary action per stage (guided flow).
4. After 6 rounds: final reflection, then a report with JSON/CSV export and
   browser print for PDF.

**Other commands**

```bash
npm run build      # typecheck + production bundle → dist/
npm run preview    # serve dist/ locally (after build)
npm run typecheck  # tsc only, no emit
```

**Requirements:** Node 18+. No database.

**AI behaviour (default):** The game ships with an optional dev-only OpenAI
proxy (see §5.6). It runs as Vite middleware inside `npm run dev`. If you
copy `.env.example` to `.env` and add your `OPENAI_API_KEY`, three things
become LLM-driven instead of templated:
  - the three AI Analyst voices,
  - Robin's case-study writeup,
  - the follow-up question for vague evidence.

If no key is set (or for `vite build` / `vite preview`), the game silently
falls back to the original deterministic logic in `src/game/aiAnalysts.ts`
and templated copy in `useGame.ts` / `evidenceQuality.ts`. Nothing breaks.

**If dev fails:** delete `node_modules` and `package-lock.json`, run
`npm install` again. If port 5173 is busy, Vite will offer the next port in the
terminal — use that URL instead.

**Reference assets (not required to run the app):**

- `risk_robin_online_game_spec.md` — full online game spec.
- `risk-robin-sustainable-tourism-game copy.pdf` — original printed game rules.

---

## 1. Quickstart (reference)

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build  →  dist/
npm run typecheck  # type check only, no emit
npm run preview    # serve the built bundle
```

Node 18+ is fine. There is no backend. All card/game data is local.

---

## 2. Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Build | Vite 5 | Fast HMR, ESM-native |
| UI    | React 18 + TypeScript (strict) | Spec asks for TS + components |
| Style | Tailwind CSS 3 + a few custom classes in `index.css` | Spec asks for Tailwind if available |
| State | `useReducer` inside a single `useGame` hook | One source of truth, easy to reason about |
| Data  | Static TS files in `src/data/` | Spec asks to keep data local for now |
| Fonts | Google Fonts (Fredoka + Nunito) loaded in `index.html` | Match the playful printed cards |

No router, no global state library, no test framework wired up yet.

---

## 3. Project structure

```
.
├── public/                      # Static assets, served at / by Vite
│   ├── Chief Analyst Robin.png  # Header + favicon + Robin avatar
│   ├── progress board.png       # Decorative anchor behind the 5×10 board
│   ├── context_1.png            # Only baked front art for Context C1
│   ├── impact_1.png             # Only baked front art for Impact I1
│   ├── context_back.png         # Card back before context is revealed
│   ├── impact_back.png          # Reserved (not wired in UI yet)
│   ├── Main Rules.png           # Reference art (not used in app UI)
│   ├── Robin's Powers.png       # Reference art (not used in app UI)
│   └── Set up.png               # Reference art (not used in app UI)
│
├── src/
│   ├── main.tsx                 # Entry; mounts <App />
│   ├── App.tsx                  # Thin wrapper around <RiskRobinGame />
│   ├── index.css                # Tailwind layers + custom classes + print stylesheet
│   │
│   ├── data/
│   │   ├── categories.ts        # 5 ImpactCategory keys + labels/colours/glyphs
│   │   ├── contextCards.ts      # 16 Context Cards (C1–C16)
│   │   └── impactCards.ts       # 34 Impact Cards + WILDCARD_TEMPLATE
│   │
│   ├── game/
│   │   ├── types.ts             # All shared types (GameState, Stage, CaseStudy…)
│   │   ├── useGame.ts           # Reducer + hook — the entire state machine
│   │   ├── aiAnalysts.ts        # Deterministic 3-voice scoring (LLM fallback)
│   │   ├── llmProvider.ts       # AIProvider — LLM-first, falls back to deterministic
│   │   ├── aiClient.ts          # Thin fetch wrappers for the /api/* proxy
│   │   ├── evidenceQuality.ts   # Vague-evidence heuristic + follow-up phrasing
│   │   └── export.ts            # JSON / CSV builders + download helper
│   │
│   └── components/
│       ├── RiskRobinGame.tsx        # Top-level orchestrator (stage → UI router)
│       ├── WelcomeModal.tsx         # Start screen
│       ├── RobinGuide.tsx           # Robin avatar + per-stage speech bubble
│       ├── ProgressBoard.tsx        # 5-row × 10-slot board + progress board.png anchor
│       ├── ContextCard.tsx          # Renders C1 from PNG; HTML fallback for others
│       ├── ImpactCard.tsx           # Renders I1 from PNG; HTML fallback for others
│       ├── ImpactHand.tsx           # 8-card hand strip + Wild Card button
│       ├── AIAnalystPanel.tsx       # Three voices with recommendations + rationale
│       ├── EvidenceInput.tsx        # Evidence textarea + wildcard fields
│       ├── FollowUpInput.tsx        # Optional follow-up (only on vague evidence)
│       ├── RatingQuestions.tsx     # Importance / valence / council priority
│       ├── CategoryClassification.tsx # Robin's suggestion + player toggles
│       ├── CaseStudySummary.tsx     # Robin's case-study writeup with ratings
│       ├── FinalReflection.tsx      # Open-text reflection + optional final case study
│       ├── FinalReport.tsx          # Completed board + case studies + exports
│       ├── GameControls.tsx         # Sticky bottom bar with primary CTA
│       └── CategoryBadge.tsx        # Reusable coloured category icon
│
├── server/
│   └── aiPlugin.ts              # Dev-only Vite plugin: /api/* OpenAI proxy
│
├── .env.example                 # Copy to `.env` and add OPENAI_API_KEY (gitignored)
├── index.html
├── tailwind.config.js, postcss.config.js, vite.config.ts
├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
├── risk_robin_online_game_spec.md   # Source of truth for game design
└── HANDOFF.md                       # ← you are here
```

---

## 4. Architecture

### 4.1 One state machine, one hook

Everything lives in `src/game/useGame.ts`. The hook returns:

- `state: GameState` — the entire game (deck, hand, current round, stage, etc.)
- Action functions (`startGame`, `selectImpact`, `submitEvidence`, …) — each
  dispatches one reducer action and returns nothing.
- `isHighlighted(area)` — selector used by components for the guided UI.

There's only one consumer of the hook: `<RiskRobinGame />`. Children receive
state slices and callbacks via props — no React context, no Zustand, no Redux.

### 4.2 Stages drive everything

`Stage` (in `src/game/types.ts`) is the central enum. The current stage decides:

1. Which component is rendered (`RiskRobinGame.tsx` routes on `stage`).
2. Which area is highlighted (`STAGE_HIGHLIGHT` in `useGame.ts`).
3. Which areas are dimmed (`isDimmed()` in `RiskRobinGame.tsx`).
4. What the primary CTA in `<GameControls />` does (`buildPrimaryAction()`).
5. What Robin says (`robinLine()` in `RobinGuide.tsx`).
6. What the stage label is in the controls bar (`stageLabel()` in `GameControls.tsx`).

**When you add a new stage, update all six places.** They're intentionally
co-located so the compiler will yell if you miss one in a `switch`.

The full stage sequence:

```
welcome
  → round_intro
    → reveal_context
      → ai_discussion
        → choose_impact
          → collect_evidence
            → (if vague) follow_up
            → rate_impact
              → robin_summary
                → classify_impact
                  → update_board       ← Case study created here
                    → draw_replacement
                      → (loop to round_intro for rounds 1..N-1)
                      → (after round N) final_reflection
                        → final_report
```

### 4.3 Highlighted area + dimming

The guided-UX requirement boils down to two CSS classes:

- `.highlighted` (on the focal area) — glowing ring + pulse animation.
- `.dimmed` (on every other area) — reduced opacity + saturation, plus
  `pointer-events: none` so dimmed UI can't be clicked through.

Both are defined in `src/index.css`. Components opt in by checking
`g.isHighlighted("ai_panel")` etc. The dim map lives in
`RiskRobinGame.isDimmed()`.

### 4.4 Decks, hand, and replacement

- Both decks are shuffled at `START_GAME` using a Fisher–Yates shuffle in
  `useGame.ts` (`shuffled()`).
- Context deck draws without replacement (one card per round, popped off the front).
- Impact deck deals 8 cards into `playerHand`; the rest stays in the deck.
- On `DRAW_REPLACEMENT` after a non-wildcard round, the played card is removed
  from the hand and the top of the deck is appended. Hand size stays at 8 unless
  the deck is empty.
- Wild Card rounds don't consume a hand card.

### 4.5 Scoring

Each Impact Card has 1–3 `icons: ImpactCategory[]`. After
`CONFIRM_CLASSIFICATION`, each category in `userCategories` gets one marker on
the board (capped at 10 — see `Math.min(10, …)` in the reducer). Wild Card
rounds use the context's first two icons by default; the player can still
adjust on the classification screen.

`progressScores: Record<ImpactCategory, number>` is the source of truth.
`<ProgressBoard />` renders this — the `progress board.png` image is decorative.

### 4.6 Case study storage

A `CaseStudy` is created at `CONFIRM_CLASSIFICATION` and pushed onto
`state.caseStudies`. It contains everything generated during the round, so the
final report and exports can be built directly off this array — no
re-derivation needed.

---

## 5. Common modification recipes

### 5.1 Add or edit a Context Card

`src/data/contextCards.ts` — append to the `CONTEXT_CARDS` array. Required
fields: `id`, `title`, `description`, `icons` (1–4 ImpactCategory keys).
Optional `image: "your_file.png"` if you place a PNG in `public/`.

### 5.2 Add or edit an Impact Card

`src/data/impactCards.ts` — append to `IMPACT_CARDS`. Required: `id`, `title`,
`description`, `icons`, `tone` (`"positive" | "negative" | "mixed" | "neutral"`).
Optional `image` and `isWildcard`.

The deterministic AI scorer in `aiAnalysts.ts` reads `title + description` for
keyword matching, so writing descriptive copy improves analyst recommendations.

### 5.3 Add card artwork

Drop the PNG into `public/`, then set `image: "filename.png"` on the relevant
card. `ContextCard.tsx` / `ImpactCard.tsx` render the PNG when present and fall
back to the styled HTML template otherwise. No code change needed beyond the data file.

### 5.4 Change the number of rounds

`src/game/useGame.ts` — top of the file: `const TOTAL_ROUNDS = 6;`. The spec
allows 4 (short), 6 (default), 8 (extended). If you want a UI selector on the
welcome screen, store it in component state in `WelcomeModal` and pass it into
`startGame()`.

### 5.5 Change the hand size

Same file: `const HAND_SIZE = 8;`. Used at `START_GAME` and is implicit in the
draw-replacement logic (which always tops up by 1).

### 5.6 LLM integration (dev-only OpenAI proxy)

The game ships wired to OpenAI for three pieces of copy that used to be
templated. Everything is opt-in — without an API key it's deterministic.

**Turning it on:**

```bash
cp .env.example .env
# Edit .env and paste your OPENAI_API_KEY=sk-...
npm run dev
```

That's it. `vite.config.ts` reads the key with `loadEnv` and passes it into
the `aiPlugin` from `server/aiPlugin.ts`, which registers three POST
endpoints as Vite middleware. The browser never sees the key.

**What the LLM replaces:**

| Feature | Was | Is (with key) |
|---|---|---|
| 3 AI analyst voices | Keyword scoring in `aiAnalysts.ts` | OpenAI generates context-aware suggestions; deterministic on failure |
| Robin's case-study summary | Template in `useGame.ts` → `buildRobinSummary()` | OpenAI rewrites it as a 2-3 sentence analyst note after `update_board` |
| Follow-up question for vague evidence | One of three templates in `evidenceQuality.ts` | OpenAI generates a sharp, specific follow-up; template stays as fallback |

**Architecture:**

```
Browser  ──POST /api/ai-analysts────▶  Vite dev server middleware
         ──POST /api/robin-summary──▶  (server/aiPlugin.ts)
         ──POST /api/follow-up──────▶          │
                                               ▼
                                         OpenAI API
                                       (Authorization
                                         header added
                                       server-side from
                                       process.env)
```

- The proxy is only registered by Vite's `configureServer`, so it runs in
  `vite dev` only. `vite build` strips it; no server code ships to clients.
- Default model: `gpt-4o-mini`. Override via `OPENAI_MODEL=...` in `.env`.
- 12-second timeout per request, then the client falls back to deterministic.
- The server validates that every `recommendedImpactIds` value the LLM
  returns is actually in the hand it was given — defends against
  hallucinated card IDs.
- Both effects (`fetchRobinSummary`, `fetchFollowUpQuestion`) in
  `RiskRobinGame.tsx` use the *upgrade* pattern: the template is on screen
  immediately, the LLM result replaces it when ready. Players are never
  blocked by the network.

**Cost reference:** With `gpt-4o-mini`, a full 6-round game is ~$0.005 —
well under a cent. A free-tier OpenAI account covers hundreds of plays.

**Deploying the game publicly:**

The Vite plugin is **dev-only by design**. If you want to ship this with
LLM behaviour intact, build the same three endpoints as a real backend —
e.g. a Vercel serverless function, a Cloudflare Worker, or a tiny Node
service — keeping the contracts in `server/aiPlugin.ts` identical. The
client (`src/game/aiClient.ts`) needs no changes. Then deploy
`dist/` (from `vite build`) behind it.

**Turning the LLM off without removing the key:**

In `src/game/llmProvider.ts`, swap:

```ts
export const defaultProvider: AIProvider = llmProvider;
// to:
export const defaultProvider: AIProvider = deterministicProvider;
```

(Only disables the analyst voices. To also pin the templated summary and
follow-up, comment out the two `fetchRobinSummary` / `fetchFollowUpQuestion`
`useEffect`s in `src/components/RiskRobinGame.tsx`.)

### 5.7 Change the vague-evidence threshold

`src/game/evidenceQuality.ts` — `isEvidenceVague()`. Currently:
- Always vague if length < 30 chars.
- Vague if length < 80 AND no concrete-signal keyword found.

The keyword list `CONCRETE_SIGNALS` is biased toward Edinburgh-specific places
and everyday-life signals. Extend it freely; lowercase entries only.

### 5.8 Change Robin's tone or copy

`src/components/RobinGuide.tsx` — `robinLine(state)` is one big switch on
`state.stage`. The case-study writeup template is in `useGame.ts` →
`buildRobinSummary()`.

### 5.9 Add a question to the per-round rating panel

`src/components/RatingQuestions.tsx` — add a new option array + a `<Group>` to
the JSX. Then add the new field to `Ratings` in `types.ts`, surface it via
`updateRatings`, and include it in `CaseStudy` and CSV export
(`src/game/export.ts`).

### 5.10 Add a new export format

`src/game/export.ts` — add a `buildXXX()` function returning a string. Then add
a button in `FinalReport.tsx` that calls `downloadBlob(filename, mime, output)`.

### 5.11 Replace the "Print / PDF" approach with a real PDF library

Currently `window.print()` + a print stylesheet in `src/index.css`. Cheap and
dependency-free. For a richer PDF (custom layout, charts):

- Add `jspdf` or `pdfmake` (200–300 KB gzipped — non-trivial).
- Build the PDF in a new helper in `src/game/export.ts`.
- Don't keep `window.print()` — having two competing PDF paths is confusing.

### 5.12 Add a fourth AI analyst voice

1. Add a member to `AIVoice` in `types.ts`.
2. Append a `VoiceProfile` to `PROFILES` in `aiAnalysts.ts`. Each profile needs
   `categoryAffinity`, `keywords`, and an `opener`.
3. Add a colour/emoji/tagline entry in `VOICE_META` in `AIAnalystPanel.tsx`.
4. Update the spec / system prompt if you wire an LLM.

The deterministic scoring loops over every profile, so the new voice will
recommend automatically.

---

## 6. Visual design conventions

- **Palette** is defined in `tailwind.config.js` under `theme.extend.colors`.
  `pastel.*` keys for backgrounds; `category.*` keys for the five city goals;
  `robinOrange` for primary CTAs and accents.
- **Fonts**: `font-display` (Fredoka) for headings, `font-body` / default
  (Nunito) for body. Loaded in `index.html`.
- **Cards** use a consistent visual template:
  - White title strip with `font-display`.
  - Coloured band (peach for contexts, sky-blue for impacts) with the ID badge
    cut into it.
  - Centered description.
  - Row of `<CategoryBadge>` icons at the bottom.
- **Buttons**: only two styles — `.btn-primary` and `.btn-ghost`. Defined in
  `src/index.css`. If you need a third style, consider whether it's truly
  needed or whether one of the existing two with different copy will do.
- **Animations**: `pulseGlow`, `pop`, `fadeIn` in `tailwind.config.js`. The
  highlight ring uses a separate `pulseRing` keyframe in `index.css`.

Everything is desktop-first (per current scope).

---

## 7. Testing and quality

There is **no automated test suite**. If you add one, my suggestion:

- **Vitest** for unit tests of `useGame.ts` reducer transitions, plus the
  pure helpers in `aiAnalysts.ts`, `evidenceQuality.ts`, and `export.ts`.
- **React Testing Library** for a small set of integration tests on the
  orchestrator (Welcome → Round 1 → Final report). Don't test deep component
  internals.
- **Playwright** for one end-to-end happy path through all 6 rounds.

The reducer is pure (no side effects, no `Math.random()` outside `shuffled()`).
You can seed `shuffled()` for deterministic tests by injecting an `rng`
function — small refactor, worth doing before writing reducer tests.

`npm run typecheck` runs `tsc -b --noEmit`. Run it before committing.

---

## 8. Known limitations / open TODOs

| # | Item | Where to start |
|---|------|----------------|
| 1 | Most Context / Impact cards are HTML-rendered placeholders | Drop PNGs into `public/`, set `image:` on the data entry |
| 2 | No persistence between sessions | Add a `localStorage` mirror around `state` in `useGame.ts`; reload restores mid-game |
| 3 | No backend, no analytics | Add a small server (Node/Cloudflare Worker) and POST the JSON from `FinalReport.exportJson` to it |
| 4 | No tests | Start with Vitest on `useGame` and the AI scorer (both pure) |
| 5 | Vague-evidence keywords are Edinburgh-skewed | Either generalise or accept this as scope-correct |
| 6 | Card browser / filter (spec §15) not built | Add a modal that pops over `ImpactHand` with filter pills by category and tone |
| 7 | Mobile layout | Wide screens only for now; flex/grid will need work for ≤640 px |
| 8 | Animated marker drops on the board | `lastUpdatedCategories` is already tracked; extend the `animate-pop` use in `ProgressBoard.tsx` |
| 9 | Hover tooltips on filled board markers (spec §9.3) | Markers in `ProgressBoard.tsx` need a click handler showing the case study |
| 10 | Internationalisation | All copy is in inline strings; a single `messages.ts` would be the migration path |

---

## 9. File-by-file responsibilities (quick reference)

| File | Responsibility | Touched when… |
|------|----------------|---------------|
| `data/categories.ts` | The five city goals, their colours, labels, glyphs, tooltips | Renaming a category, changing a colour |
| `data/contextCards.ts` | All Context Cards | Adding/editing contexts |
| `data/impactCards.ts` | All Impact Cards + Wild Card template | Adding/editing impacts |
| `game/types.ts` | All shared TypeScript types | Adding fields to `CaseStudy`, new stages, new highlight areas |
| `game/useGame.ts` | The reducer + hook | Adding actions, changing stage transitions |
| `game/aiAnalysts.ts` | Deterministic scoring | Tuning analyst behaviour without an LLM |
| `game/llmProvider.ts` | Async AIProvider seam | Wiring an LLM |
| `game/evidenceQuality.ts` | Vague-evidence detection | Tweaking when follow-up appears |
| `game/export.ts` | JSON, CSV, download | New export formats |
| `components/RiskRobinGame.tsx` | Stage routing + highlight/dim map | Adding a new stage or component, changing what's visible when |
| `components/RobinGuide.tsx` | Robin's per-stage copy | Tone changes, new stages |
| `components/ProgressBoard.tsx` | The 5×10 board | Animations, hover tooltips |
| `components/ContextCard.tsx`, `ImpactCard.tsx` | Card renderers | New card artwork, layout tweaks |
| `components/AIAnalystPanel.tsx` | Voice display | Visual changes, new voices |
| `components/EvidenceInput.tsx`, `FollowUpInput.tsx` | Text capture | Validation, hint text |
| `components/RatingQuestions.tsx` | Per-round rating questions | New questions, new option sets |
| `components/CategoryClassification.tsx` | Robin's proposal + player override | Classification UX |
| `components/CaseStudySummary.tsx` | Robin's writeup display | Showing more / less per round |
| `components/FinalReflection.tsx` | Open-text reflections + optional final case study | New reflection questions |
| `components/FinalReport.tsx` | End screen + exports | New export formats, layout changes |
| `components/GameControls.tsx` | Sticky bottom bar | New stage labels, layout of CTAs |
| `index.css` | Tailwind layers, custom classes, print stylesheet | Global visual changes |
| `tailwind.config.js` | Palette, fonts, animations | Theme changes |

---

## 10. Conventions

- **TypeScript strict mode** is on. No `any`. If you really need it,
  `unknown` + a narrowing check is the polite version.
- **Imports** use relative paths (no path aliases configured). Keep it that
  way unless you add a build step that supports them everywhere (Vite, TS, and
  any future test runner).
- **No comments stating what code does.** Comments explain *why* — invariants,
  non-obvious decisions, references to spec sections. See `aiAnalysts.ts` for
  the style.
- **No defensive code at internal boundaries.** Validate at user/API input
  edges only. Trust your own types.
- **Single-source-of-truth state.** Don't add `useState` inside components for
  anything that's already in `GameState` — pull it from the hook.
- **One CTA per stage.** The guided-UX requirement is "only one action should
  be visually dominant." Resist the urge to add secondary buttons; if you need
  one, ask whether the stage should be split instead.

---

## 11. Working in Cursor

Some suggestions for productive Cursor sessions:

- **Anchor your prompts in the state machine.** "Add a new stage `X` between
  `Y` and `Z`" is the canonical change description. The model will know it
  needs to touch `types.ts`, `useGame.ts`, `RiskRobinGame.tsx`,
  `GameControls.tsx`, `RobinGuide.tsx`, and a new component.
- **Use `risk_robin_online_game_spec.md` as the source of truth**, not this
  hand-off. Cite section numbers when asking for changes ("Implement spec
  §9.4 icon tooltips on the board").
- **Watch the AI when it adds dependencies.** This project intentionally has
  zero runtime dependencies beyond React. If Cursor suggests `framer-motion`,
  `react-query`, `zustand`, etc., consider whether you actually need it
  before accepting.
- **Run `npm run build` after non-trivial changes.** `tsc` will catch the
  most common errors (forgotten `Stage` cases, mis-typed action payloads,
  missing `useGame` fields).

---

## 12. Glossary

- **Analyst** — the human player. Always the same role.
- **Robin** — the fixed AI facilitator. Not a rotating role.
- **AI Voice / Analyst Voice** — one of three: Resident, Economy, Environment
  and City. Each suggests an impact each round; the player isn't bound by them.
- **Impact Assessment Board** — the 5-row scoreboard on the right of the play
  area. Same as `progressScores` in code.
- **Case Study** — the structured record of one round (context, impact,
  evidence, ratings, board update).
- **Wild Card** — player writes their own impact with a custom title and
  description. The default categorisation comes from the context.

---

Happy building. Open `risk_robin_online_game_spec.md` and §6.2 ("Round
structure") if you ever lose the thread of the game flow — every stage in the
code corresponds to one of those steps.
