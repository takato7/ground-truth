// UI copy for the demo risk.
// The question is a fixed template filled with ACAPS's own number (completionRate),
// so nothing ACAPS asserts is reworded by hand except the short name + the goal phrase.
// ACAPS's verbatim trigger title and 100% condition sit behind "ACAPS's wording".

import type { Stance } from "./api/types"

export const RISK_COPY = {
  R1043: {
    short: "eastern Chad",
    headline: "Sudan’s war spilling over into eastern Chad",
  },
} as Record<string, { short: string; headline: string }>

export const TRIGGER_COPY: Record<
  string,
  { short: string; goal: string; reach: string }
> = {
  T0618: {
    short: "Cross-border attacks",
    goal: "becoming sustained",
    reach: "Will the attacks become sustained in the next 6 months?",
  },
  T0619: {
    short: "Attacks on airports and bases",
    goal: "direct attacks on these sites",
    reach: "Will these sites be directly attacked in the next 6 months?",
  },
  T0620: {
    short: "Armed groups across the border",
    goal: "open cross-border fighting",
    reach: "Will this turn into open fighting in the next 6 months?",
  },
}

/** The one-line question. Template only; the number always comes from ACAPS data. */
export function askLine(short: string, rate: number | null, goal: string) {
  if (rate === null)
    return `ACAPS hasn’t rated ${short.toLowerCase()} yet. How far along is it?`
  return `ACAPS rates ${short.toLowerCase()} as ${rate}% of the way to ${goal}. Does that match what you’re seeing?`
}

/** Answer labels. Map 1:1 to the API's stances. */
export const ANSWER: Record<Stance, string> = {
  agree: "That’s about right",
  more_severe: "It’s further along",
  less_severe: "It’s not as far along",
  missing: "Something else is going on",
}

/** Short label for results ("3 further along"). */
export const ANSWER_SHORT: Record<Stance, string> = {
  agree: "about right",
  more_severe: "further along",
  less_severe: "not as far",
  missing: "something else",
}

/** Optional forecast, stored as the category midpoint (10/30/50/70/90). null = not sure. */
// Five categories, one per step of ACAPS's own probability scale (Very low … Very high),
// so expert forecasts and ACAPS ratings can be scored on the same categories.
export const LIKELIHOOD: { label: string; value: number | null }[] = [
  { label: "Very unlikely", value: 10 },
  { label: "Unlikely", value: 30 },
  { label: "Could go either way", value: 50 },
  { label: "Likely", value: 70 },
  { label: "Very likely", value: 90 },
  { label: "Not sure", value: null },
]
