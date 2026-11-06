import { useEffect, useState } from 'react'
import { api, ApiError } from '../api/mockApi'
import { STANCE_LABEL, type RiskPost, type Stance, type TriggerResponses, type User } from '../api/types'
import { NextButton, ProgressMeter, Screen, StanceBars } from '../components'

const STANCES: Stance[] = ['agree', 'more_severe', 'less_severe', 'missing']

/** One trigger per screen: ACAPS's call → your stance (+ optional estimate) → peers revealed. */
export function TriggerScreen({ user, post, index, onNext }: { user: User; post: RiskPost; index: number; onNext: () => void }) {
  const trigger = post.triggers[index]
  const [data, setData] = useState<TriggerResponses | null>(null)
  const [stance, setStance] = useState<Stance | null>(null)
  const [prob, setProb] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    setStance(null); setProb(null); setReason(''); setError(''); setShowMore(false)
    api.getResponses(user.id, trigger.id).then(setData)
  }, [user.id, trigger.id])

  const submit = async () => {
    if (!stance) return
    try {
      await api.submitResponse(user.id, { triggerId: trigger.id, stance, probability: prob, reason })
      setData(await api.getResponses(user.id, trigger.id))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not submit')
    }
  }

  const answered = data && !data.locked
  const mine = answered ? data.responses.find((r) => r.isMine) : undefined
  const peers = data ? data.count - (mine ? 1 : 0) : 0

  return (
    <Screen>
      <header className="topbar">
        <span className="muted small">{post.country} · {post.id}</span>
        <span className="muted small">Trigger {index + 1} of {post.triggers.length}</span>
      </header>

      <section className="card">
        <p className="eyebrow">ACAPS says this could push the risk higher</p>
        <h2>{trigger.title}</h2>
        <ProgressMeter rate={trigger.completionRate} />
        <button className="link" onClick={() => setShowMore((v) => !v)}>{showMore ? 'Less' : 'What counts as 100%?'}</button>
        {showMore && (
          <div className="small">
            <p>{trigger.quantitativeObjective}</p>
            <p className="muted">{trigger.description}</p>
          </div>
        )}
      </section>

      {!answered && (
        <section className="stack">
          <h3>Is ACAPS's read on this right?</h3>
          <div className="choices">
            {STANCES.map((s) => (
              <button key={s} className={`choice ${stance === s ? 'selected' : ''}`} onClick={() => setStance(s)}>
                {STANCE_LABEL[s]}
              </button>
            ))}
          </div>

          {stance && (
            <>
              <label className="small">
                Chance this reaches 100% within 6 months <span className="muted">(optional)</span>
                <div className="slider-row">
                  <input type="range" min={0} max={100} step={5} value={prob ?? 50} onChange={(e) => setProb(+e.target.value)} />
                  <strong className="slider-val">{prob === null ? '—' : `${prob}%`}</strong>
                </div>
                {prob !== null && <button className="link" onClick={() => setProb(null)}>skip estimate</button>}
              </label>
              <label className="small">
                {stance === 'missing' ? 'What are we missing?' : 'Why?'} <span className="muted">(optional)</span>
                <textarea className="field" maxLength={280} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
                <span className="muted small">{280 - reason.length} left</span>
              </label>
            </>
          )}
          {error && <p className="error">{error}</p>}
          <p className="muted small">
            {peers > 0 ? `${peers} ${peers === 1 ? 'peer has' : 'peers have'} answered. Add yours to see where they landed.` : 'Be the first to answer.'}
          </p>
          <div className="row-end"><NextButton onClick={submit} disabled={!stance} label="Submit" /></div>
        </section>
      )}

      {answered && (
        <section className="stack">
          <h3>Where your panel landed</h3>
          <StanceBars agg={data.aggregate} mine={mine?.stance} />
          <ul className="reasons">
            {data.responses.filter((r) => r.reason).map((r) => (
              <li key={r.id}>
                <span className="who">{r.displayName}</span> · {STANCE_LABEL[r.stance]}
                <p>{r.reason}</p>
              </li>
            ))}
          </ul>
          <div className="row-end"><NextButton onClick={onNext} /></div>
        </section>
      )}
    </Screen>
  )
}
