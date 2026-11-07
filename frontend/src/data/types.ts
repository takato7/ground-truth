// Prototype data model: one expert, one panel (eastern Chad), cards grouped by weekly round.

export type CardKind = "risk" | "trigger" | "open"

/** How the expert appears to peers. ACAPS always knows who is on the panel. */
export type Identity = "known" | "anonymous"

/** Answers to a trigger card, about ACAPS's completion %. */
export type Stance = "about_right" | "further" | "not_as_far" | "something_else"

/** A peer's answer, already resolved for display. Anonymous peers never carry a name or note. */
export interface PeerAnswer {
  name: string | null
  likelihood?: number | null
  stance?: Stance
  note?: string
}

export interface Card {
  id: string
  kind: CardKind
  /** ISO date of the weekly round this card was sent in. */
  round: string
  topic: string
  /** ACAPS's ID for the risk or trigger the question is built from ("R1043 · T0618"). */
  sourceId: string
  /** ACAPS's original title for that risk or trigger, verbatim, shown on top of the card. */
  sourceTitle: string
  /** The self-contained, plain-language question shown on the card. */
  question: string
  /** One or two sentences so the card makes sense on its own. */
  context: string
  /** Trigger cards: ACAPS's completion % at the time of asking. */
  rate?: number
  /** Trigger cards: the step-one question built around `rate`. */
  ask?: string
  /** Trigger cards: ACAPS's verbatim wording, behind a toggle. */
  acapsTitle?: string
  acapsGoal?: string
  /** Risk cards: ACAPS's probability rating, verbatim ("High"). Not mapped onto our scale:
   * ACAPS rates over its own time frame, our question asks about six months. */
  acapsProbability?: string
  peers: PeerAnswer[]
  /** What changed at ACAPS after this round. Shown green on the You page. */
  impact?: string
}

export interface Answer {
  cardId: string
  at: string
  likelihood?: number | null
  stance?: Stance
  note: string
}

/** Welcome (why answering pays off), invite code, then how you appear. */
export type OnboardingStep = "welcome" | "invite" | "identity" | "done"

export interface State {
  onboarding: OnboardingStep
  identity: Identity
  answers: Record<string, Answer>
  /** Skipped the last round. News stays locked until they answer something this week. */
  lapsed: boolean
  /** Track record is good enough to say so. Never shown when it isn't. */
  goodStanding: boolean
  /** Answers given since the You page was last opened (tab badge). */
  unseen: number
}

/** A trigger as exported by ACAPS (scripts/build_reports.py). Not every trigger has a completion rate. */
export interface ReportTrigger {
  id: string
  title: string
  description: string
  completionRate: number | null
  completionHistory: { date: string; rate: number }[]
  /** What 100% completion means. */
  objective: string | null
  entered: string | null
  lastUpdate: string | null
}

export interface ReportUpdate {
  date: string
  text: string
  sources: string[]
}

/** One active risk from the ACAPS Risk Radar export, field for field (src/mocks/risk-radar-active.json). */
export interface Report {
  id: string
  country: string
  iso: string
  title: string
  riskType: string | null
  status: string
  riskLevel: string | null
  probability: string | null
  /** 1–5, ACAPS's impact scale. */
  impact: number | null
  trend: string | null
  exposure: string | null
  /** ISO date: the latest update, else the latest trigger change. */
  updated: string | null
  rationale: string
  rationaleSources: string[]
  expectedImpact: string | null
  expectedImpactSources: string[]
  priorityNeeds: string[]
  /** Newest first. */
  updates: ReportUpdate[]
  triggers: ReportTrigger[]
}

/** One ACAPS post in the News feed: a dated update to a risk, or the risk being added. */
export interface Article {
  /** `${riskId}@${date}`. */
  id: string
  riskId: string
  kind: "update" | "added"
  date: string
  /** Big text: an update's opening sentence (ACAPS's own summary), or the risk's title. */
  headline: string
  /** The rest of ACAPS's text. */
  body: string
  sources: string[]
}
