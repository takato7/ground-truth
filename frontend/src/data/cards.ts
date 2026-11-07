// Every question in the prototype, written to stand on its own: an expert who can only
// speak to one trigger, or only to what's missing, can answer that card alone.
// Numbers come from ACAPS's R1043 record (src/mocks/r1043.json); peers are fictional.

import r1043 from "../mocks/r1043.json"
import type { Card, CardKind, Stance } from "./types"

export const CURRENT_ROUND = "2026-11-02"
export const PANEL = "Eastern Chad"
export const RISK = r1043

const rateOf = (id: string) =>
  r1043.triggers.find((t) => t.id === id)?.completionRate ?? 0
const trigger = (id: string) => r1043.triggers.find((t) => t.id === id)!

/** Five steps, one per step of ACAPS's probability scale, stored as the category midpoint. */
export const LIKELIHOOD: { label: string; value: number | null }[] = [
  { label: "Very unlikely", value: 10 },
  { label: "Unlikely", value: 30 },
  { label: "Could go either way", value: 50 },
  { label: "Likely", value: 70 },
  { label: "Very likely", value: 90 },
  { label: "Not sure", value: null },
]

export const likelihoodLabel = (v: number | null | undefined) =>
  LIKELIHOOD.find((l) => l.value === v)?.label ?? "Not sure"

export const STANCE: Record<Stance, string> = {
  about_right: "That’s about right",
  further: "It’s further along",
  not_as_far: "It’s not as far along",
  something_else: "Something else is going on",
}

export const STANCE_SHORT: Record<Stance, string> = {
  about_right: "About right",
  further: "Further along",
  not_as_far: "Not as far",
  something_else: "Something else",
}

export const KIND_LABEL: Record<CardKind, string> = {
  risk: "Risk check",
  trigger: "Trigger check",
  open: "Open question",
}

const P = {
  tomas: "Tomas Hevel",
  halima: "Halima Yusuf",
  awa: "Awa Diallo",
}

export const CARDS: Card[] = [
  // --- This week -----------------------------------------------------------
  {
    id: "w45-risk",
    kind: "risk",
    round: CURRENT_ROUND,
    topic: PANEL,
    question:
      "Will Sudan’s war make the crisis in eastern Chad clearly worse in the next six months?",
    context:
      "More refugees crossing, more strain on camps and services, more insecurity on the border. ACAPS currently rates this as likely.",
    acapsLikelihood: 70,
    peers: [
      {
        name: P.tomas,
        likelihood: 70,
        note: "Arrivals at Adré have not slowed since September.",
      },
      {
        name: P.halima,
        likelihood: 90,
        note: "Funding gaps mean even steady arrivals make it worse.",
      },
      { name: P.awa, likelihood: 70 },
      { name: null, likelihood: 50 },
      { name: null, likelihood: 70 },
    ],
  },
  {
    id: "w45-T0618",
    kind: "trigger",
    round: CURRENT_ROUND,
    topic: "Cross-border attacks",
    question:
      "Are attacks along the Chad–Sudan border becoming a regular thing?",
    context:
      "Drone strikes, shelling and armed raids near Adré, Tiné and other border towns.",
    rate: rateOf("T0618"),
    ask: `ACAPS rates cross-border attacks as ${rateOf("T0618")}% of the way to becoming sustained. Does that match what you’re seeing?`,
    acapsTitle: trigger("T0618").title,
    acapsGoal: trigger("T0618").quantitativeObjective,
    peers: [
      {
        name: P.tomas,
        stance: "further",
        note: "Two incidents near Tiné in October alone.",
      },
      { name: P.halima, stance: "about_right" },
      {
        name: P.awa,
        stance: "further",
        note: "Traders on the Adré road are moving at night again.",
      },
      { name: null, stance: "about_right" },
      { name: null, stance: "further" },
    ],
  },
  {
    id: "w45-T0619",
    kind: "trigger",
    round: CURRENT_ROUND,
    topic: "Airports and bases",
    question:
      "Could Sudan’s war reach airports and military bases inside Chad?",
    context:
      "Sudanese armed actors have threatened sites like Amdjarass airport, border posts and army positions.",
    rate: rateOf("T0619"),
    ask: `ACAPS rates attacks on airports and bases as ${rateOf("T0619")}% of the way to direct attacks on these sites. Does that match what you’re seeing?`,
    acapsTitle: trigger("T0619").title,
    acapsGoal: trigger("T0619").quantitativeObjective,
    peers: [
      { name: P.tomas, stance: "about_right" },
      {
        name: P.halima,
        stance: "about_right",
        note: "Threats are loud, but nothing has moved toward Amdjarass.",
      },
      { name: P.awa, stance: "not_as_far" },
      { name: null, stance: "about_right" },
      { name: null, stance: "about_right" },
    ],
  },
  {
    id: "w45-T0620",
    kind: "trigger",
    round: CURRENT_ROUND,
    topic: "Armed groups across the border",
    question:
      "Are armed groups on either side of the border being drawn into the fight?",
    context:
      "Rebel groups and militias could be armed or backed by either side, as in past Chad–Sudan proxy wars.",
    rate: rateOf("T0620"),
    ask: `ACAPS rates armed groups across the border as ${rateOf("T0620")}% of the way to open cross-border fighting. Does that match what you’re seeing?`,
    acapsTitle: trigger("T0620").title,
    acapsGoal: trigger("T0620").quantitativeObjective,
    peers: [
      {
        name: P.tomas,
        stance: "further",
        note: "Recruitment in Ouaddaï camps is talked about openly.",
      },
      { name: P.halima, stance: "about_right" },
      {
        name: P.awa,
        stance: "something_else",
        note: "The bigger shift is local militias, not Chadian rebels.",
      },
      { name: null, stance: "about_right" },
    ],
  },
  {
    id: "w45-open",
    kind: "open",
    round: CURRENT_ROUND,
    topic: PANEL,
    question:
      "Is anything happening in eastern Chad that ACAPS isn’t watching?",
    context:
      "A new group, a price spike, a road closing: anything you’re seeing that isn’t on the list.",
    peers: [
      {
        name: P.halima,
        note: "Fuel in Abéché has nearly doubled since August. Trucks are rerouting.",
      },
      {
        name: P.tomas,
        note: "Measles cases reported in Farchana camp last week.",
      },
      { name: null },
      { name: null },
    ],
  },

  // --- Past rounds (only shown on the You page if answered) ----------------
  {
    id: "w41-risk",
    kind: "risk",
    round: "2026-10-05",
    topic: PANEL,
    question:
      "Will Sudan’s war make the crisis in eastern Chad clearly worse in the next six months?",
    context:
      "More refugees crossing, more strain on camps and services, more insecurity on the border. ACAPS rated this as likely.",
    acapsLikelihood: 70,
    peers: [
      { name: P.tomas, likelihood: 70 },
      { name: P.halima, likelihood: 70 },
      { name: P.awa, likelihood: 90 },
      { name: null, likelihood: 70 },
      { name: null, likelihood: 50 },
    ],
  },
  {
    id: "w41-open",
    kind: "open",
    round: "2026-10-05",
    topic: PANEL,
    question:
      "Is anything happening in eastern Chad that ACAPS isn’t watching?",
    context:
      "A new group, a price spike, a road closing: anything you’re seeing that isn’t on the list.",
    peers: [
      { name: P.awa, note: "Shelter kits ran out in Adré transit site." },
      { name: null },
    ],
    impact:
      "Picked up in ACAPS’s 30 Sep update: funding gaps for shelter and food.",
  },
  {
    id: "w36-T0619",
    kind: "trigger",
    round: "2026-09-07",
    topic: "Airports and bases",
    question:
      "Could Sudan’s war reach airports and military bases inside Chad?",
    context:
      "Sudanese armed actors have threatened sites like Amdjarass airport, border posts and army positions.",
    rate: 20,
    ask: "ACAPS rates attacks on airports and bases as 20% of the way to direct attacks on these sites. Does that match what you’re seeing?",
    acapsTitle: trigger("T0619").title,
    acapsGoal: trigger("T0619").quantitativeObjective,
    peers: [
      { name: P.tomas, stance: "not_as_far" },
      { name: P.halima, stance: "not_as_far" },
      { name: P.awa, stance: "about_right" },
      { name: null, stance: "not_as_far" },
    ],
    impact: "ACAPS lowered this from 20% to 10% after the panel’s answers.",
  },
]

export const cardById = (id: string) => CARDS.find((c) => c.id === id)!
export const thisWeek = () => CARDS.filter((c) => c.round === CURRENT_ROUND)

/** Below this many answers, results stay hidden so nobody can be picked out. */
export const MIN_SHOWN = 3
