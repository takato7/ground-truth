import { useEffect, useState } from 'react'
import { api } from '../api/mockApi'
import { STANCE_LABEL, type RiskPost, type TriggerResponses, type User } from '../api/types'
import { ProgressMeter, Screen, StanceBars } from '../components'

/** Expert: "your cohort" summary after answering. ACAPS: the panel view with names + split flags. */
export function HomeScreen({ user, post, onAnswer }: { user: User; post: RiskPost; onAnswer: (i: number) => void }) {
  const [byTrigger, setByTrigger] = useState<Record<string, TriggerResponses>>({})
  const isAcaps = user.role === 'acaps'

  useEffect(() => {
    Promise.all(post.triggers.map((t) => api.getResponses(user.id, t.id))).then((rs) =>
      setByTrigger(Object.fromEntries(post.triggers.map((t, i) => [t.id, rs[i]]))),
    )
  }, [user.id, post])

  return (
    <Screen>
      <header className="topbar">
        <span className="logo small-logo">acaps</span>
        <span className="pill">{user.displayName}</span>
      </header>

      <section className="card">
        <p className="eyebrow">{post.country} · {post.riskLevel} risk · {post.trend}</p>
        <h2>{post.title}</h2>
        <p className="muted small clamp">{post.latestUpdate}</p>
      </section>

      <h3>{isAcaps ? 'Panel view' : 'Your cohort'}</h3>
      {post.triggers.map((t, i) => {
        const d = byTrigger[t.id]
        return (
          <section key={t.id} className="card">
            <p className="eyebrow">{t.id}</p>
            <h4>{t.title}</h4>
            <ProgressMeter rate={t.completionRate} />
            {!d && <p className="muted small">Loading…</p>}
            {d?.locked && (
              <button className="choice" onClick={() => onAnswer(i)}>
                Answer to see {d.count} {d.count === 1 ? 'response' : 'responses'}
              </button>
            )}
            {d && !d.locked && (
              <>
                <StanceBars agg={d.aggregate} mine={d.responses.find((r) => r.isMine)?.stance} />
                {isAcaps && (
                  <ul className="reasons">
                    {d.responses.map((r) => (
                      <li key={r.id}>
                        <span className="who">{r.displayName}</span> · {STANCE_LABEL[r.stance]}
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
      })}
    </Screen>
  )
}
