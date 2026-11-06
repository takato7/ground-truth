// Shapes the frontend expects from the API.
// Mirrors Takato's brief; swap for the generated OpenAPI types when the backend lands.

export type Stance = 'agree' | 'more_severe' | 'less_severe' | 'missing'

export type AnonymityLevel = 'known_to_acaps' | 'pseudonymous' | 'per_post'

export type Role = 'acaps' | 'expert'

export interface User {
  id: string
  role: Role
  /** Display name as computed by the server for the current viewer. */
  displayName: string
  anonymity?: AnonymityLevel
}

export interface CompletionPoint {
  date: string
  rate: number
}

export interface Trigger {
  id: string
  title: string
  description: string
  /** ACAPS progress toward the 100% condition. NOT a probability. null = not rated. */
  completionRate: number | null
  completionHistory: CompletionPoint[]
  quantitativeObjective: string
}

export interface RiskPost {
  id: string
  title: string
  country: string
  riskType: string
  probability: string
  impact: number
  riskLevel: string
  trend: string
  status: string
  exposure: string
  latestUpdate: string
  triggers: Trigger[]
}

export interface ResponseIn {
  triggerId: string
  stance: Stance
  /** 0-100 in steps of 5, optional. */
  probability: number | null
  /** Up to 280 characters. */
  reason: string
}

export interface ResponseOut extends ResponseIn {
  id: string
  round: number
  displayName: string
  createdAt: string
  isMine: boolean
}

export interface TriggerAggregate {
  count: number
  stances: Record<Stance, number>
  probability: { median: number; min: number; max: number; n: number } | null
  split: boolean
}

/** Answer first, then see others: before responding you only get `count`. */
export type TriggerResponses =
  | { locked: true; count: number }
  | { locked: false; count: number; responses: ResponseOut[]; aggregate: TriggerAggregate }

export const STANCE_LABEL: Record<Stance, string> = {
  agree: 'Agree',
  more_severe: 'More severe',
  less_severe: 'Less severe',
  missing: 'Something is missing',
}
