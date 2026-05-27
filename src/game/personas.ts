import type { AIVoice } from "./types";

/**
 * Each AI voice is presented in the UI as a *named person* with an Edinburgh
 * job and neighbourhood, rather than an abstract "analyst voice". The internal
 * `AIVoice` key still drives prompting, scoring, and persistence — the persona
 * is a thin presentation layer on top so the human player (who is "the
 * Analyst") feels like they're hearing from three distinct locals.
 *
 * If you add a new AIVoice, add a persona here at the same time. The UI uses
 * `PERSONAS[voice]` everywhere and falls back to the voice string only if a
 * persona is missing.
 */

export type Persona = {
  voice: AIVoice;
  /** Full display name, e.g. "Iona MacLeod". */
  name: string;
  /** Short first-name label, used on tiny pills next to recommended cards. */
  shortName: string;
  /** Job / role, e.g. "Primary school teacher". */
  role: string;
  /** Neighbourhood or workplace, e.g. "Leith". */
  location: string;
  /** A one-line tagline summarising what they care about (used as a chip). */
  perspective: string;
  /** A short bio shown in the info-chip / tooltips. */
  bio: string;
  /** Emoji used as a stand-in avatar in the panel and tooltips. */
  emoji: string;
  /** Brand colour for the persona card border / header text. */
  color: string;
};

export const PERSONAS: Record<AIVoice, Persona> = {
  "Resident Voice": {
    voice: "Resident Voice",
    name: "Iona MacLeod",
    shortName: "Iona",
    role: "Primary school teacher",
    location: "Leith",
    perspective: "Resident perspective",
    bio: "Walks her kids to school, meets friends at the Botanics, and thinks a lot about how the city feels day-to-day for the people who live in it.",
    emoji: "🏘️",
    color: "#7C3E97",
  },
  "Economy Voice": {
    voice: "Economy Voice",
    name: "Callum Bryce",
    shortName: "Callum",
    role: "Café owner",
    location: "Royal Mile",
    perspective: "Business perspective",
    bio: "Runs a small café on the Royal Mile, employs two part-time staff, and watches the visitor economy from behind the counter every day.",
    emoji: "💼",
    color: "#E94B7B",
  },
  "Environment and City Voice": {
    voice: "Environment and City Voice",
    name: "Priya Shankar",
    shortName: "Priya",
    role: "Sustainability officer",
    location: "Edinburgh City Council",
    perspective: "Environment & city services perspective",
    bio: "Works on the council's net-zero programme — transport, waste, green space, the long-term systems the city has to keep running underneath the tourism.",
    emoji: "🌿",
    color: "#7FB93C",
  },
};

/** Convenience accessor with a defensive fallback so the UI never breaks. */
export function personaFor(voice: AIVoice | string): Persona | undefined {
  return PERSONAS[voice as AIVoice];
}
