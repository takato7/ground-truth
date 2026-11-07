import { useEffect, useState } from "react"
import { api } from "../api/mockApi"
import type {
  Brief,
  RiskPost,
  Stance,
  Trigger,
  TriggerResponses,
  User,
} from "../api/types"
import { ANSWER_SHORT, RISK_COPY, TRIGGER_COPY } from "../copy"
import { ProgressMeter, Screen } from "../components"
import { BriefCard, AskCard } from "./Briefs"

const ORDER: Stance[] = ["more_severe", "agree", "less_severe", "missing"]
type Unlocked = Extract<TriggerResponses, { locked: false }>

export function HomeScreen({
  user,
  post,
  justFinished,
  onStartSurvey,
  onOpenBrief,
  onPostChanged,
}: {
  user: User
  post: RiskPost
  justFinished?: boolean
  onStartSurvey: () => void
  onOpenBrief: (b: Brief, print?: boolean) => void
  onPostChanged: () => void
}) {
  const [byTrigger, setByTrigger] = useState<Record<string, TriggerResponses>>(
    {},
  )
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [publishing, setPublishing] = useState(false)
  const isAcaps = user.role === "acaps"
  const place = RISK_COPY[post.id]?.short ?? post.country

  const load = () => {
    void Promise.all(
      post.triggers.map((t) => api.getResponses(user.id, t.id)),
    ).then((rs) =>
      setByTrigger(
        Object.fromEntries(post.triggers.map((t, i) => [t.id, rs[i]])),
      ),
    )
    void api.listBriefs(user.id).then(setBriefs)
  }
  useEffect(load, [user.id, post])

  const loaded = Object.keys(byTrigger).length === post.triggers.length
  const todo = post.triggers.filter((t) => byTrigger[t.id]?.locked).length

  const publish = async () => {
    setPublishing(true)
    const b = await api.publishBrief(user.id)
    setPublishing(false)
    load()
    onOpenBrief(b)
  }

  return (
    <Screen>
      <header className="topbar">
        <span className="logo small-logo">acaps</span>
        <span className="pill">{isAcaps ? "ACAPS" : user.displayName}</span>
      </header>

      {loaded && !isAcaps && todo < post.triggers.length && (
        <YourStand
          post={post}
          byTrigger={byTrigger}
          justFinished={justFinished}
        />
      )}

      {isAcaps && loaded && (
        <>
          <h3>Panel this round</h3>
          {post.triggers.map((t) => (
            <PanelRow
              key={`${t.id}-${t.completionRate}`}
              user={user}
              trigger={t}
              data={byTrigger[t.id] as Unlocked}
              onRated={() => {
                onPostChanged()
                load()
              }}
            />
          ))}
          <button
            className="primary"
            onClick={() => void publish()}
            disabled={publishing}
          >
            Close round and publish panel brief
          </button>
          <p className="muted small">
            Publishes pooled numbers only. Triggers with fewer than 3 answers
            are left out.
          </p>
        </>
      )}

      <div className="feed">
        {loaded && !isAcaps && todo > 0 && (
          <AskCard place={place} todo={todo} onStart={onStartSurvey} />
        )}
        {briefs.map((b) => (
          <BriefCard
            key={b.id}
            brief={b}
            onOpen={() => onOpenBrief(b)}
            onDownload={() => onOpenBrief(b, true)}
          />
        ))}
        {!isAcaps &&
          loaded &&
          todo === 0 &&
          !briefs.some((b) => b.kind === "panel" && b.date >= today()) && (
            <p className="meta">
              This round’s brief comes out when ACAPS closes the round.
            </p>
          )}
      </div>
    </Screen>
  )
}

const today = () => new Date().toISOString().slice(0, 10)

/** The personal bit: what you said, and how many peers said the same. */
function YourStand({
  post,
  byTrigger,
  justFinished,
}: {
  post: RiskPost
  byTrigger: Record<string, TriggerResponses>
  justFinished?: boolean
}) {
  const [open, setOpen] = useState(false)
  const rows = post.triggers.flatMap((t) => {
    const d = byTrigger[t.id]
    if (!d || d.locked) return []
    const mine = d.responses.find((r) => r.isMine)
    if (!mine) return []
    const peers = d.responses.filter((r) => !r.isMine)
    const same = peers.filter((r) => r.stance === mine.stance).length
    return [{ t, d, mine, peers, same }]
  })
  if (!rows.length) return null
  const line = (r: (typeof rows)[number]) => {
    const short = (TRIGGER_COPY[r.t.id]?.short ?? r.t.title).toLowerCase()
    const said =
      r.mine.stance === "agree"
        ? `ACAPS has ${short} about right`
        : r.mine.stance === "missing"
          ? `something else is going on with ${short}`
          : `${short} ${r.mine.stance === "more_severe" ? "are further along" : "aren’t as far along"}`
    return {
      said: `You said ${said}.`,
      peers: `${r.same} of your ${r.peers.length} peers said the same.`,
    }
  }
  const first = line(rows[0])

  return (
    <section className="stand">
      {justFinished && <p className="meta">Thanks, your answers are in.</p>}
      <p className="stand-line">
        {first.said} {first.peers}
      </p>
      <button className="link" onClick={() => setOpen((v) => !v)}>
        {open
          ? "Hide"
          : rows.length > 1
            ? `See all ${rows.length} ›`
            : "See your peers’ notes ›"}
      </button>
      {open &&
        rows.map((r) => {
          const l = line(r)
          return (
            <div key={r.t.id} className="card">
              <h4>{TRIGGER_COPY[r.t.id]?.short ?? r.t.title}</h4>
              <p className="small">
                {l.said} {l.peers}
              </p>
              {!r.d.aggregate.split || (
                <p className="muted small">
                  Your panel was divided on this one.
                </p>
              )}
              <ul className="reasons">
                {r.peers
                  .filter((p) => p.reason)
                  .map((p) => (
                    <li key={p.id}>
                      <span className="who">{p.displayName}</span> ·{" "}
                      {ANSWER_SHORT[p.stance]}
                      <p>{p.reason}</p>
                    </li>
                  ))}
              </ul>
            </div>
          )
        })}
    </section>
  )
}

/** ACAPS-only: the analyst's numbers. */
function PanelRow({
  user,
  trigger,
  data,
  onRated,
}: {
  user: User
  trigger: Trigger
  data: Unlocked
  onRated: () => void
}) {
  const [open, setOpen] = useState(false)
  const current = trigger.completionRate ?? 0
  const [rate, setRate] = useState(current)
  const [informed, setInformed] = useState(true)
  const save = async () => {
    await api.updateRating(user.id, trigger.id, rate, informed)
    onRated()
  }
  const agg = data.aggregate
  return (
    <section className="card">
      <h4>
        {TRIGGER_COPY[trigger.id]?.short ?? trigger.title}{" "}
        {agg.split && <span className="badge">split</span>}
      </h4>
      <ProgressMeter rate={trigger.completionRate} />
      <div className="rate-row">
        <button
          className="pill-btn"
          onClick={() => setRate((r) => Math.max(0, r - 5))}
          aria-label="Lower rating"
        >
          −
        </button>
        <strong className="rate-val">{rate}%</strong>
        <button
          className="pill-btn"
          onClick={() => setRate((r) => Math.min(100, r + 5))}
          aria-label="Raise rating"
        >
          +
        </button>
        <label className="meta rate-check">
          <input
            type="checkbox"
            checked={informed}
            onChange={(e) => setInformed(e.target.checked)}
          />{" "}
          Informed by panel
        </label>
        {rate !== current && (
          <button className="pill-btn" onClick={() => void save()}>
            Update rating
          </button>
        )}
      </div>
      {data.count === 0 ? (
        <p className="muted small">No answers yet</p>
      ) : (
        <>
          <div className="stack-bar" aria-hidden>
            {ORDER.map(
              (s) =>
                agg.stances[s] > 0 && (
                  <span
                    key={s}
                    className={`seg seg-${s}`}
                    style={{ flex: agg.stances[s] }}
                  />
                ),
            )}
          </div>
          <p className="legend">
            {ORDER.filter((s) => agg.stances[s]).map((s) => (
              <span key={s}>
                <i className={`dot seg-${s}`} />
                {agg.stances[s]} {ANSWER_SHORT[s]}
              </span>
            ))}
          </p>
          <p className="muted small">
            {agg.probability
              ? `Chance of reaching 100% in 6 months: median ${agg.probability.median}% (${agg.probability.min}–${agg.probability.max}%, n=${agg.probability.n})`
              : "No estimates"}
          </p>
          <button className="link" onClick={() => setOpen((v) => !v)}>
            {open ? "Hide answers" : `All ${data.count} answers`}
          </button>
          {open && (
            <ul className="reasons">
              {data.responses.map((r) => (
                <li key={r.id}>
                  <span className="who">{r.displayName}</span> ·{" "}
                  {ANSWER_SHORT[r.stance]}
                  {r.probability !== null && ` · ${r.probability}%`}
                  {r.reason && <p>{r.reason}</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
