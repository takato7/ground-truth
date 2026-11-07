import { EyeOff, Lock } from "lucide-react"
import { LIKELIHOOD, STANCE_SHORT, likelihoodLabel } from "../data/cards"
import { panelFor } from "../data/store"
import type { Answer, Card, Identity, Stance } from "../data/types"

function Bars({
  rows,
}: {
  rows: { label: string; n: number; mine: boolean; tag?: string }[]
}) {
  const max = Math.max(1, ...rows.map((r) => r.n))
  return (
    <ul className="bars">
      {rows.map((r) => (
        <li key={r.label} className={r.mine ? "mine" : ""}>
          <span className="bar-label">
            {r.label}
            {r.mine && <em>you</em>}
            {r.tag && <em className="tag">{r.tag}</em>}
          </span>
          <span className="bar-track">
            <span
              className="bar-fill"
              style={{ width: `${(r.n / max) * 100}%` }}
            />
          </span>
          <span className="bar-n">{r.n}</span>
        </li>
      ))}
    </ul>
  )
}

/** What the panel said, shown only after the expert has answered. */
export function PanelResults({
  card,
  mine,
  identity,
}: {
  card: Card
  mine: Answer
  identity: Identity
}) {
  const panel = panelFor(card, mine, identity)

  if (panel.hidden) {
    return (
      <div className="results-hidden">
        <Lock size={18} aria-hidden />
        <p>
          Only {panel.count} {panel.count === 1 ? "answer" : "answers"} so far.
          Results show once three experts have answered, so nobody can be picked
          out.
        </p>
      </div>
    )
  }

  let bars = null
  if (card.kind === "risk") {
    bars = (
      <Bars
        rows={LIKELIHOOD.filter((l) => l.value !== null).map((l) => ({
          label: l.label,
          n: panel.all.filter((p) => p.likelihood === l.value).length,
          mine: mine.likelihood === l.value,
          tag: card.acapsLikelihood === l.value ? "ACAPS" : undefined,
        }))}
      />
    )
  } else if (card.kind === "trigger") {
    bars = (
      <Bars
        rows={(Object.keys(STANCE_SHORT) as Stance[]).map((s) => ({
          label: STANCE_SHORT[s],
          n: panel.all.filter((p) => p.stance === s).length,
          mine: mine.stance === s,
        }))}
      />
    )
  }

  return (
    <div className="results">
      <p className="results-count">{panel.count} experts answered</p>
      {bars}
      {card.kind === "risk" && card.acapsLikelihood !== undefined && (
        <p className="muted small">
          ACAPS currently rates this as{" "}
          {likelihoodLabel(card.acapsLikelihood).toLowerCase()}.
        </p>
      )}
      {panel.notes.length > 0 && (
        <ul className="notes">
          {panel.notes.map((n, i) => (
            <li key={i}>
              <p>{n.note}</p>
              <span>{n.name}</span>
            </li>
          ))}
        </ul>
      )}
      {panel.anonymous > 0 && (
        <p className="muted small anon-line">
          <EyeOff size={14} aria-hidden /> {panel.anonymous} anonymous{" "}
          {panel.anonymous === 1 ? "answer" : "answers"} counted, never quoted.
        </p>
      )}
    </div>
  )
}
