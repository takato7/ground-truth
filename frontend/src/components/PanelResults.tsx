import { EyeOff, Lock } from "lucide-react"
import { LIKELIHOOD, STANCE_SHORT } from "../data/cards"
import { panelFor } from "../data/store"
import type { Answer, Card, Identity, Stance } from "../data/types"
import { BarList, Callout, Quote, Text, type BarRow } from "../ui"

function rowsFor(
  card: Card,
  mine: Answer,
  all: ReturnType<typeof panelFor>["all"],
): BarRow[] | null {
  if (card.kind === "risk") {
    return LIKELIHOOD.filter((l) => l.value !== null).map((l) => ({
      label: l.label,
      count: all.filter((p) => p.likelihood === l.value).length,
      mine: mine.likelihood === l.value,
    }))
  }
  if (card.kind === "trigger") {
    return (Object.keys(STANCE_SHORT) as Stance[]).map((s) => ({
      label: STANCE_SHORT[s],
      count: all.filter((p) => p.stance === s).length,
      mine: mine.stance === s,
    }))
  }
  return null
}

/** What the panel said. Only ever rendered after the expert has answered. */
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
      <Callout icon={Lock} well>
        Only {panel.count} {panel.count === 1 ? "answer" : "answers"} so far.
        Results show once three experts have answered, so nobody can be picked
        out.
      </Callout>
    )
  }

  const rows = rowsFor(card, mine, panel.all)
  return (
    <div className="stack gap-3">
      <Text role="meta">{panel.count} experts answered</Text>
      {rows && <BarList rows={rows} well />}
      {card.kind === "risk" && card.acapsProbability && (
        <Text role="meta">
          ACAPS rates this risk’s probability as {card.acapsProbability}, on its
          own scale and time frame.
        </Text>
      )}
      {panel.notes.length > 0 && (
        <ul className="stack gap-2">
          {panel.notes.map((n, i) => (
            <Quote key={i} text={n.note} author={n.name} well />
          ))}
        </ul>
      )}
      {panel.anonymous > 0 && (
        <Text role="meta" className="row gap-1">
          <EyeOff size={14} aria-hidden /> {panel.anonymous} anonymous{" "}
          {panel.anonymous === 1 ? "answer" : "answers"} counted, never quoted.
        </Text>
      )}
    </div>
  )
}
