// The whole prototype's state: one expert, kept in memory and mirrored to localStorage
// so a demo survives a reload. The dev bar swaps in a scenario to jump to any situation.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"
import { CARDS, CURRENT_ROUND, MIN_SHOWN, cardById } from "./cards"
import { DEFAULT_SCENARIO, SCENARIOS, type ScenarioId } from "./scenarios"
import type { Answer, Card, Identity, PeerAnswer, State } from "./types"

const KEY = "groundline-proto-v1"

interface Saved {
  scenario: ScenarioId
  state: State
}

type Action =
  | { type: "scenario"; id: ScenarioId }
  | { type: "invite" }
  | { type: "identity"; identity: Identity; finish?: boolean }
  | { type: "answer"; answer: Omit<Answer, "at"> }
  | { type: "seen" }

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Saved
      if (saved.scenario in SCENARIOS && saved.state) return saved
    }
  } catch {
    // Private mode or bad JSON: start fresh.
  }
  return {
    scenario: DEFAULT_SCENARIO,
    state: SCENARIOS[DEFAULT_SCENARIO].state,
  }
}

function reduce(s: Saved, a: Action): Saved {
  const st = s.state
  switch (a.type) {
    case "scenario":
      return { scenario: a.id, state: SCENARIOS[a.id].state }
    case "invite":
      return { ...s, state: { ...st, onboarding: "identity" } }
    case "identity":
      return {
        ...s,
        state: {
          ...st,
          identity: a.identity,
          onboarding: a.finish ? "done" : st.onboarding,
        },
      }
    case "answer":
      return {
        ...s,
        state: {
          ...st,
          answers: {
            ...st.answers,
            [a.answer.cardId]: { ...a.answer, at: new Date().toISOString() },
          },
          lapsed: false,
          unseen: st.unseen + 1,
        },
      }
    case "seen":
      return st.unseen ? { ...s, state: { ...st, unseen: 0 } } : s
  }
}

const Ctx = createContext<{
  saved: Saved
  dispatch: (a: Action) => void
} | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [saved, dispatch] = useReducer(reduce, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(saved))
    } catch {
      // Storage unavailable: the demo still runs in memory.
    }
  }, [saved])
  return <Ctx.Provider value={{ saved, dispatch }}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useStore needs <StoreProvider>")
  const { saved, dispatch } = ctx
  const { state } = saved
  return useMemo(() => {
    const open = CARDS.filter(
      (c) => c.round === CURRENT_ROUND && !state.answers[c.id],
    )
    const answered = Object.values(state.answers)
      .sort((a, b) => b.at.localeCompare(a.at))
      .map((answer) => ({ answer, card: cardById(answer.cardId) }))
    return {
      scenario: saved.scenario,
      state,
      dispatch,
      open,
      answered,
      impacts: answered.filter((x) => x.card.impact).length,
      newsLocked: state.lapsed,
    }
  }, [saved, state, dispatch])
}

/** Everyone's answers to a card, the viewer's included, as the viewer is allowed to see them. */
export function panelFor(card: Card, mine: Answer, identity: Identity) {
  const me: PeerAnswer = {
    name: identity === "known" ? "You" : null,
    likelihood: mine.likelihood,
    stance: mine.stance,
    note: mine.note || undefined,
  }
  const all = [me, ...card.peers]
  return {
    all,
    count: all.length,
    hidden: all.length < MIN_SHOWN,
    /** Notes from named experts only; anonymous answers count but are never quoted. */
    notes: all.filter((p) => p.name && p.note) as Required<
      Pick<PeerAnswer, "name" | "note">
    >[],
    anonymous: all.filter((p) => !p.name).length,
  }
}
