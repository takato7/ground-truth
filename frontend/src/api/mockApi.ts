// In-browser stand-in for the backend. Every function is async and returns the
// shapes in ./types so screens don't change when we swap to real fetch() calls.
// Rules that the server must enforce (answer-first, validation, display names
// per viewer) are mimicked here so the UI behaves like the real thing.

import r1043 from '../mocks/r1043.json'
import { TRIGGER_COPY } from '../copy'
import type {
  AnonymityLevel,
  Brief,
  ResponseIn,
  RiskPost,
  Stance,
  TriggerAggregate,
  TriggerResponses,
  User,
} from './types'

interface SeedUser {
  id: string
  role: 'acaps' | 'expert'
  realName: string
  pseudonym: string
  postAlias: string
  anonymity: AnonymityLevel
  inviteCode: string
}

// Synthetic users only. Fictional names.
export const USERS: SeedUser[] = [
  { id: 'acaps1', role: 'acaps', realName: 'Analyst (ACAPS)', pseudonym: 'ACAPS', postAlias: 'ACAPS', anonymity: 'known_to_acaps', inviteCode: 'ACAPS' },
  { id: 'e1', role: 'expert', realName: 'Mira Okonde', pseudonym: 'lemur-green-dolphin', postAlias: 'heron-17', anonymity: 'pseudonymous', inviteCode: 'CHAD-E1' },
  { id: 'e2', role: 'expert', realName: 'Tomas Hevel', pseudonym: 'quiet-amber-fox', postAlias: 'kestrel-04', anonymity: 'known_to_acaps', inviteCode: 'CHAD-E2' },
  { id: 'e3', role: 'expert', realName: 'Awa Diallo-Brandt', pseudonym: 'slate-river-owl', postAlias: 'ibis-22', anonymity: 'per_post', inviteCode: 'CHAD-E3' },
  { id: 'e4', role: 'expert', realName: 'Jonas Ferrant', pseudonym: 'copper-hill-lynx', postAlias: 'plover-09', anonymity: 'pseudonymous', inviteCode: 'CHAD-E4' },
  { id: 'e5', role: 'expert', realName: 'Halima Yusuf', pseudonym: 'ember-reed-crane', postAlias: 'egret-31', anonymity: 'known_to_acaps', inviteCode: 'CHAD-E5' },
  { id: 'e6', role: 'expert', realName: 'Pieter van Loon', pseudonym: 'mist-cedar-wren', postAlias: 'swift-12', anonymity: 'per_post', inviteCode: 'CHAD-E6' },
]

const STORE_KEY = 'gt-mock-v2'

interface Store {
  anonymity: Record<string, AnonymityLevel>
  responses: (ResponseIn & { id: string; userId: string; round: number; createdAt: string })[]
  briefs: Brief[]
}

// Peers e2-e6 have already answered, so the demo user (e1) sees "5 peers answered".
function seed(): Store {
  const r = (userId: string, triggerId: string, stance: Stance, probability: number | null, reason: string) => ({
    id: `${userId}-${triggerId}`, userId, triggerId, stance, probability, reason, round: 1, createdAt: '2026-10-02T09:00:00Z',
  })
  return {
    briefs: [
      {
        id: 'b-update-0930', kind: 'update', date: '2026-09-30',
        headline: 'Refugee arrivals up 20-fold as fighting in Darfur drives new displacement',
        body: [(r1043 as RiskPost).latestUpdate.replace(/^\d{2}\/\d{2}\/\d{4}\s*/, '')],
      },
      {
        id: 'b-panel-0915', kind: 'panel', date: '2026-09-15', panelSize: 5, demo: true,
        headline: 'Experts expect the August strikes to be repeated',
        body: [
          'Cross-border attacks: 4 of 5 experts judged them further along than ACAPS’s rating at the time.',
          'Attacks on airports and bases: most experts agreed with ACAPS’s rating.',
        ],
      },
    ],
    anonymity: Object.fromEntries(USERS.map((u) => [u.id, u.anonymity])),
    responses: [
      r('e2', 'T0618', 'more_severe', 70, 'Strikes near Tiné resumed in October; the September lull was rainy-season access, not de-escalation.'),
      r('e3', 'T0618', 'agree', 55, 'Pattern is still episodic, not sustained. 40% feels right.'),
      r('e4', 'T0618', 'more_severe', 65, 'Fuel market strike shows intent to hit civilian economic targets.'),
      r('e5', 'T0618', 'missing', null, 'Missing: Zaghawa defections inside Chadian army units around Amdjarass.'),
      r('e6', 'T0618', 'more_severe', 60, ''),
      r('e2', 'T0619', 'agree', 20, 'Threats are rhetorical so far; no capability shift observed.'),
      r('e3', 'T0619', 'less_severe', 10, 'Amdjarass is heavily defended since August.'),
      r('e4', 'T0619', 'more_severe', 35, 'The 21 Aug convoy strike 100km inside Ennedi-Est is close to infrastructure.'),
      r('e6', 'T0619', 'agree', 15, ''),
      r('e2', 'T0620', 'more_severe', 45, 'Recruitment in Ouaddaï camps reported by partners.'),
      r('e5', 'T0620', 'more_severe', 50, 'Proxy arming is the most underrated trigger here.'),
      r('e6', 'T0620', 'less_severe', 20, 'N\'Djamena is actively suppressing this; disarmament ops in Sila.'),
    ],
  }
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return seed()
}
function save(s: Store) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

let store = load()
const delay = <T,>(v: T) => new Promise<T>((res) => setTimeout(() => res(v), 120))

export class ApiError extends Error {
  status: number
  constructor(status: number, msg: string) { super(msg); this.status = status }
}

function requireUser(userId: string | null): SeedUser {
  const u = USERS.find((x) => x.id === userId)
  if (!u) throw new ApiError(401, 'No valid user')
  return u
}

/** Display name of `author` as seen by `viewer`. The server does this in the real app. */
function displayName(author: SeedUser, viewer: SeedUser): string {
  if (author.id === viewer.id) return 'You'
  if (author.role === 'acaps') return 'ACAPS'
  const level = store.anonymity[author.id]
  if (level === 'per_post') return author.postAlias
  if (level === 'known_to_acaps' && viewer.role === 'acaps') return author.realName
  return author.pseudonym
}

function aggregate(rs: { stance: Stance; probability: number | null }[]): TriggerAggregate {
  const stances: Record<Stance, number> = { agree: 0, more_severe: 0, less_severe: 0, missing: 0 }
  rs.forEach((r) => stances[r.stance]++)
  const ps = rs.map((r) => r.probability).filter((p): p is number => p !== null).sort((a, b) => a - b)
  const median = ps.length ? (ps.length % 2 ? ps[(ps.length - 1) / 2] : (ps[ps.length / 2 - 1] + ps[ps.length / 2]) / 2) : 0
  const top = Math.max(...Object.values(stances))
  return {
    count: rs.length,
    stances,
    probability: ps.length ? { median, min: ps[0], max: ps[ps.length - 1], n: ps.length } : null,
    split: rs.length >= 3 && top / rs.length <= 0.5,
  }
}

// ---- endpoints ------------------------------------------------------------

export const api = {
  /** POST /session — invite code stands in for login during the hackathon. */
  async redeemInvite(code: string): Promise<User> {
    const u = USERS.find((x) => x.inviteCode.toLowerCase() === code.trim().toLowerCase())
    if (!u) throw new ApiError(404, 'That invite code was not recognised.')
    return delay(this.me(u.id))
  },

  me(userId: string): User {
    const u = requireUser(userId)
    return { id: u.id, role: u.role, displayName: u.role === 'acaps' ? u.realName : u.pseudonym, anonymity: store.anonymity[u.id] }
  },

  /** PUT /me/anonymity */
  async setAnonymity(userId: string, level: AnonymityLevel): Promise<User> {
    requireUser(userId)
    store.anonymity[userId] = level
    save(store)
    return delay(this.me(userId))
  },

  /** GET /posts/R1043 */
  async getPost(userId: string): Promise<RiskPost> {
    requireUser(userId)
    return delay(r1043 as RiskPost)
  },

  /** GET /triggers/:id/responses — enforces answer-first. */
  async getResponses(userId: string, triggerId: string): Promise<TriggerResponses> {
    const viewer = requireUser(userId)
    const rs = store.responses.filter((r) => r.triggerId === triggerId)
    const answered = rs.some((r) => r.userId === viewer.id)
    if (viewer.role !== 'acaps' && !answered) return delay({ locked: true, count: rs.length })
    return delay({
      locked: false,
      count: rs.length,
      aggregate: aggregate(rs),
      responses: rs.map((r) => {
        const author = USERS.find((u) => u.id === r.userId)!
        return { id: r.id, triggerId: r.triggerId, stance: r.stance, probability: r.probability, reason: r.reason, round: r.round, createdAt: r.createdAt, displayName: displayName(author, viewer), isMine: author.id === viewer.id }
      }),
    })
  },

  /** POST /triggers/:id/responses */
  async submitResponse(userId: string, body: ResponseIn): Promise<void> {
    const u = requireUser(userId)
    if (u.role !== 'expert') throw new ApiError(403, 'Only experts respond')
    if (!['agree', 'more_severe', 'less_severe', 'missing'].includes(body.stance)) throw new ApiError(422, 'Unknown stance')
    if (body.probability !== null && (body.probability < 0 || body.probability > 100 || body.probability % 5)) throw new ApiError(422, 'Probability must be 0-100 in steps of 5')
    if (body.reason.length > 280) throw new ApiError(422, 'Reason is over 280 characters')
    if (store.responses.some((r) => r.userId === u.id && r.triggerId === body.triggerId && r.round === 1)) throw new ApiError(422, 'Already responded this round')
    store.responses.push({ ...body, id: `${u.id}-${body.triggerId}`, userId: u.id, round: 1, createdAt: new Date().toISOString() })
    save(store)
    await delay(null)
  },

  /** GET /briefs — newest first. Everyone sees the same feed. */
  async listBriefs(userId: string): Promise<Brief[]> {
    requireUser(userId)
    return delay([...store.briefs].sort((a, b) => b.date.localeCompare(a.date)))
  },

  /**
   * POST /briefs — ACAPS closes the round and publishes a panel brief.
   * Deterministic template over pooled numbers only. Triggers with fewer than
   * 3 answers are left out so nobody's answer can be singled out.
   */
  async publishBrief(userId: string): Promise<Brief> {
    const u = requireUser(userId)
    if (u.role !== 'acaps') throw new ApiError(403, 'Only ACAPS can publish')
    const post = r1043 as RiskPost
    const lines: string[] = []
    let best: { short: string; stance: Stance; share: number } | null = null
    let divided: string | null = null
    for (const t of post.triggers) {
      const rs = store.responses.filter((r) => r.triggerId === t.id)
      const short = TRIGGER_COPY[t.id]?.short ?? t.title
      if (rs.length < 3) { lines.push(`${short}: too few answers to report.`); continue }
      const agg = aggregate(rs)
      const top = (Object.keys(agg.stances) as Stance[]).reduce((a, b) => (agg.stances[b] > agg.stances[a] ? b : a))
      const n = agg.stances[top]
      const phrase: Record<Stance, string> = {
        agree: 'agreed with ACAPS’s rating',
        more_severe: 'judged this further along than ACAPS’s rating',
        less_severe: 'judged this less far along than ACAPS’s rating',
        missing: 'pointed to factors the analysis is missing',
      }
      if (agg.split && !divided) divided = short
      lines.push(agg.split ? `${short}: experts were divided.` : `${short}: ${n} of ${rs.length} experts ${phrase[top]}.`)
      const share = top === 'agree' || agg.split ? 0 : n / rs.length
      if (!best || share > best.share) best = { short, stance: top, share }
    }
    const headline = best && best.share > 0
      ? best.stance === 'more_severe' ? `Experts see ${best.short.toLowerCase()} as further along than ACAPS’s rating`
        : best.stance === 'less_severe' ? `Experts see ${best.short.toLowerCase()} as less advanced than ACAPS’s rating`
        : `Experts flag gaps in the analysis of ${best.short.toLowerCase()}`
      : divided ? `Experts are divided on ${divided.toLowerCase()}`
      : 'Experts broadly agree with ACAPS’s current ratings'
    const panelSize = new Set(store.responses.map((r) => r.userId)).size
    lines.push('ACAPS will review its trigger ratings in light of this round.')
    const brief: Brief = { id: `b-panel-${Date.now()}`, kind: 'panel', date: new Date().toISOString().slice(0, 10), headline, body: lines, panelSize }
    store.briefs.push(brief)
    save(store)
    return delay(brief)
  },

  /** Dev only: wipe local state back to the seed. */
  reset() {
    store = seed()
    save(store)
  },
}
