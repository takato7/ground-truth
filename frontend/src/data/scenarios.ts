// Demo situations the dev bar can jump to. Each one is a complete State.

import type { Answer, State } from "./types"

const at = (date: string) => `${date}T09:30:00.000Z`

/** Answers from earlier rounds: an engaged expert whose input moved ACAPS twice. */
const PAST: Record<string, Answer> = {
  "w36-T0619": {
    cardId: "w36-T0619",
    at: at("2026-09-08"),
    stance: "not_as_far",
    note: "No movement around Amdjarass.",
  },
  "w41-risk": {
    cardId: "w41-risk",
    at: at("2026-10-06"),
    likelihood: 70,
    note: "",
  },
  "w41-open": {
    cardId: "w41-open",
    at: at("2026-10-06"),
    note: "Shelter kits are running short at the Adré transit site.",
  },
}

const THIS_WEEK: Record<string, Answer> = {
  "w45-T0618": {
    cardId: "w45-T0618",
    at: at("2026-11-04"),
    stance: "further",
    note: "",
  },
  "w45-risk": {
    cardId: "w45-risk",
    at: at("2026-11-04"),
    likelihood: 70,
    note: "",
  },
  "w45-T0619": {
    cardId: "w45-T0619",
    at: at("2026-11-05"),
    stance: "about_right",
    note: "",
  },
  "w45-T0620": {
    cardId: "w45-T0620",
    at: at("2026-11-05"),
    stance: "further",
    note: "",
  },
  "w45-open": {
    cardId: "w45-open",
    at: at("2026-11-06"),
    note: "Water trucking to Metché has stopped twice this month.",
  },
}

const pick = (ids: string[]) =>
  Object.fromEntries(ids.map((id) => [id, THIS_WEEK[id]]))

const base: State = {
  onboarding: "done",
  identity: "known",
  answers: {},
  lapsed: false,
  goodStanding: false,
  unseen: 0,
}

export const SCENARIOS = {
  invite: {
    label: "1 · New invite (onboarding)",
    state: { ...base, onboarding: "invite" },
  },
  first: {
    label: "2 · First week, nothing answered",
    state: base,
  },
  regular: {
    label: "3 · Regular expert, new week",
    state: { ...base, answers: PAST, goodStanding: true },
  },
  midway: {
    label: "4 · Halfway through the week",
    state: {
      ...base,
      answers: { ...PAST, ...pick(["w45-T0618", "w45-risk"]) },
      goodStanding: true,
    },
  },
  done: {
    label: "5 · All caught up",
    state: { ...base, answers: { ...PAST, ...THIS_WEEK }, goodStanding: true },
  },
  lapsed: {
    label: "6 · Lapsed (News locked)",
    state: {
      ...base,
      answers: { "w36-T0619": PAST["w36-T0619"] },
      lapsed: true,
    },
  },
  anonymous: {
    label: "7 · Anonymous expert",
    state: { ...base, identity: "anonymous", answers: PAST },
  },
} satisfies Record<string, { label: string; state: State }>

export type ScenarioId = keyof typeof SCENARIOS
export const DEFAULT_SCENARIO: ScenarioId = "invite"
