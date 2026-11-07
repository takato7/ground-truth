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
  /** Risk cards: ACAPS's own rating, on the same five-step scale. */
  acapsLikelihood?: number
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

export interface State {
  onboarding: "invite" | "identity" | "done"
  identity: Identity
  answers: Record<string, Answer>
  /** Skipped the last round. News stays locked until they answer something this week. */
  lapsed: boolean
  /** Track record is good enough to say so. Never shown when it isn't. */
  goodStanding: boolean
  /** Answers given since the You page was last opened (tab badge). */
  unseen: number
}
