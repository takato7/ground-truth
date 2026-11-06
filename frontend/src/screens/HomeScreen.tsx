import { useEffect, useState } from 'react'
import { api } from '../api/mockApi'
import type { RiskPost, Stance, Trigger, TriggerResponses, User } from '../api/types'
import { ANSWER_SHORT, RISK_COPY, TRIGGER_COPY } from '../copy'
import { ProgressMeter, Screen } from '../components'

const ORDER: Stance[] = ['more_severe', 'agree', 'less_severe', 'missing']

/** Home: the briefing is always open. Peers' answers unlock per trigger once you've answered it. */
export function HomeScreen({ user, post, justFinished, onStartSurvey }: {
  user: User; post: RiskPost; justFinished?: boolean; onStartSurvey: () => void
}) {
  const [byTrigger, setByTrigger] = useState<Record<string, TriggerResponses>>({})
  const [readMore, setReadMore] = useState(false)
  const isAcaps = user.role === 'acaps'
  const copy = RISK_COPY[post.id]

  useEffect(() => {
    Promise.all(post.triggers.map((t) => api.getResponses(user.id, t.id))).then((rs) =>
      setByTrigger(Object.fromEntries(post.triggers.map((t, i) => [t.id, rs[i]]))),
    )
  }, [user.id, post])

  const todo = post.triggers.filter((t) => byTrigger[t.id]?.locked).length

  return (
    <Screen>
      <header className="topbar">
        <span className="logo small-logo">acaps</span>
        <span className="pill">{isAcaps ? 'ACAPS' : user.displayName}</span>
      </header>

      {justFinished && <p className="thanks">Thanks. Here’s where your panel landed.</p>}

      {!isAcaps && todo > 0 && (
        <section className="card invite">
          <p>ACAPS would like your read on {copy?.short ?? post.country}.</p>
          <p className="muted small">{todo} quick {todo === 1 ? 'question' : 'questions'} · about {todo} min</p>
          <button className="primary" onClick={onStartSurvey}>Start</button>
        </section>
      )}

      <section className="card">
        <p className="eyebrow">{post.riskLevel} risk · {post.trend.toLowerCase()}</p>
        <h2>{copy?.headline ?? post.title}</h2>
        <p className={`small ${readMore ? '' : 'clamp'}`}>{post.latestUpdate.replace(/^\d{2}\/\d{2}\/\d{4}\s*/, '')}</p>
        <button className="link" onClick={() => setReadMore((v) => !v)}>{readMore ? 'Less' : 'Latest update · read more'}</button>
      </section>

      <h3>What ACAPS is watching</h3>
      {post.triggers.map((t) => <TriggerRow key={t.id} trigger={t} data={byTrigger[t.id]} isAcaps={isAcaps} />)}
    </Screen>
  )
}

function TriggerRow({ trigger, data, isAcaps }: { trigger: Trigger; data?: TriggerResponses; isAcaps: boolean }) {
  const [open, setOpen] = useState(false)
  const copy = TRIGGER_COPY[trigger.id]
  return (
    <section className="card">
      <h4>{copy?.short ?? trigger.title}</h4>
      <ProgressMeter rate={trigger.completionRate} />

      {data?.locked && (
        <p className="muted small">{data.count} {data.count === 1 ? 'peer has' : 'peers have'} answered · answer to see their view</p>
      )}

      {data && !data.locked && (
        data.count === 0 ? <p className="muted small">No answers yet</p> : (
          <>
            <p className="headline">{headline(data)}</p>
            <div className="stack-bar" aria-hidden>
              {ORDER.map((s) => data.aggregate.stances[s] > 0 && (
                <span key={s} className={`seg seg-${s}`} style={{ flex: data.aggregate.stances[s] }} />
              ))}
            </div>
            <p className="legend">
              {ORDER.filter((s) => data.aggregate.stances[s]).map((s) => (
                <span key={s}><i className={`dot seg-${s}`} />{data.aggregate.stances[s]} {ANSWER_SHORT[s]}</span>
              ))}
            </p>
            {isAcaps && (
              <p className="muted small">
                {data.aggregate.probability
                  ? `Chance of reaching 100% in 6 months: median ${data.aggregate.probability.median}% (${data.aggregate.probability.min}–${data.aggregate.probability.max}%, n=${data.aggregate.probability.n})`
                  : 'No estimates'}
              </p>
            )}
            {data.responses.some((r) => r.reason) && (
              <button className="link" onClick={() => setOpen((v) => !v)}>
                {open ? 'Hide notes' : `Read ${data.responses.filter((r) => r.reason).length} notes`}
              </button>
            )}
            {open && (
              <ul className="reasons">
                {data.responses.filter((r) => r.reason).map((r) => (
                  <li key={r.id}>
                    <span className="who">{r.displayName}</span> · {ANSWER_SHORT[r.stance]}
                    <p>{r.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )
      )}
    </section>
  )
}

function headline(d: Extract<TriggerResponses, { locked: false }>): string {
  const { stances, count, split } = d.aggregate
  if (split) return `Your panel is split (${count} answers)`
  const top = ORDER.reduce((a, b) => (stances[b] > stances[a] ? b : a))
  const lead: Record<Stance, string> = {
    more_severe: 'think it’s further along than ACAPS says',
    agree: 'think ACAPS has it about right',
    less_severe: 'think it’s not as far along',
    missing: 'think something else is going on',
  }
  return `${stances[top]} of ${count} ${lead[top]}`
}
