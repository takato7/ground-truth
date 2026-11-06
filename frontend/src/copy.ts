// Plain-language copy for the demo risk. ACAPS's own wording stays in the data
// (and behind "ACAPS's wording" in the UI); this is what experts read first.

import type { Stance } from './api/types'

export const RISK_COPY = {
  R1043: {
    short: 'Eastern Chad',
    headline: 'Sudan’s war spilling over into eastern Chad',
  },
} as Record<string, { short: string; headline: string }>

export const TRIGGER_COPY: Record<string, { short: string; question: (rate: string) => string; full: string }> = {
  T0618: {
    short: 'Cross-border attacks',
    question: (r) => `Drone strikes and raids near Adré and Tiné. ACAPS thinks this is about ${r} of the way to regular, sustained attacks.`,
    full: 'Attacks become sustained and recurrent, hit several border towns, and cause major casualties, displacement or loss of aid access.',
  },
  T0619: {
    short: 'Attacks on airports and bases',
    question: (r) => `Threats against places like Amdjarass airport, border posts and army sites. ACAPS thinks this is about ${r} of the way to real attacks.`,
    full: 'Airports, military sites, border posts or major roads are directly attacked, seriously disrupting civilian, aid or commercial activity.',
  },
  T0620: {
    short: 'Armed groups across the border',
    question: (r) => `Militias being armed or backed across the border, like past proxy wars. ACAPS thinks this is about ${r} of the way to open fighting.`,
    full: 'Cross-border armed groups join the fighting, leading to sustained violence, revenge attacks or insecurity across eastern Chad.',
  },
}

/** Friendly answer labels. Map 1:1 to the API's stances. */
export const ANSWER: Record<Stance, string> = {
  agree: 'Sounds about right',
  more_severe: 'It’s worse than that',
  less_severe: 'It’s not that far along',
  missing: 'Something else is going on',
}

/** Short past-tense label for results ("3 said worse"). */
export const ANSWER_SHORT: Record<Stance, string> = {
  agree: 'about right',
  more_severe: 'worse',
  less_severe: 'not as far',
  missing: 'something else',
}

/** Optional forecast, as three easy chips (stored as 0–100, steps of 5). */
export const LIKELIHOOD = [
  { label: 'Unlikely', value: 20 },
  { label: 'Could go either way', value: 50 },
  { label: 'Likely', value: 80 },
]
